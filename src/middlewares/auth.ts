import { decodedToken } from "../helpers/jwt";
import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import { body } from "express-validator";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const [, token] = bearer.split(" ");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = decodedToken(token);

    // Un token firmado pero sin userId no identifica a nadie.
    if (typeof decoded !== "object" || !decoded.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findByPk(decoded.userId, {
      attributes: ["id", "name", "email"],
    });

    // El token es válido pero la cuenta ya no existe.
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;

    next();
  } catch (error) {
    // Token inválido, manipulado o expirado.
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const validatePasswordBody = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  (await body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .run(req),
    next());
};

export const validateEmailBody = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  (await body("email")
    .isEmail()
    .withMessage("Invalid email address")
    .notEmpty()
    .withMessage("Please provide a valid email")
    .run(req),
    next());
};

export const validateTokenBody = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  (await body("token")
    .isLength({ min: 6, max: 6 })
    .withMessage("Token is not valid")
    .run(req),
    next());
};
