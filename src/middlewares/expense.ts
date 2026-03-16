import { NextFunction, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";

export const validationCreateExpense = async (
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

export const validateExpenseId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await param("expenseId")
    .isInt({ gt: 0 })
    .withMessage("Invalid ID format")
    .run(req);

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};
