import { NextFunction, Request, Response } from "express";
import { param } from "express-validator";

export const validateBudgetId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  (await param("id").isInt({ gt: 0 }).withMessage("Invalid ID format").run(req),
    next());
};
