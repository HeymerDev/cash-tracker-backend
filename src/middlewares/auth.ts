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
    const error = new Error("Unauthorized");
    return res.status(401).json({ message: error.message });
  }

  const [, token] = bearer.split(" ");

  if (!token) {
    const error = new Error("Unauthorized");
    return res.status(401).json({ message: error.message });
  }

  try {
    const decoded = decodedToken(token);
    if (typeof decoded === "object" && decoded.userId) {
      req.user = await User.findByPk(decoded.userId, {
        attributes: ["id", "name", "email"],
      });

      next();
    }
  } catch (error) {
    return res.status(500).json({ message: "Unauthorized" });
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
    .notEmpty()
    .withMessage("Please provide a valid email")
    .run(req),
    next());
};
