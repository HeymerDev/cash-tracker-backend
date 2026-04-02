import { decodedToken } from "../helpers/jwt";
import { NextFunction, Request, Response } from "express";
import User from "../models/User";

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
