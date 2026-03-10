import { NextFunction, Request, Response } from "express";
import { body, param } from "express-validator";

export const validateBudgetId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  (await param("id").isInt({ gt: 0 }).withMessage("Invalid ID format").run(req),
    next());
};

export const validationBody = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  (await body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .run(req),
    await body("amount")
      .notEmpty()
      .withMessage("Amount is required")
      .isNumeric()
      .withMessage("Amount must be a number")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be a positive number")
      .run(req),
    next());
};
