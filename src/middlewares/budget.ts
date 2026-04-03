import { NextFunction, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import Budget from "../models/Budget";
import { handleInputErrors } from "./validation";

declare global {
  namespace Express {
    interface Request {
      budget?: Budget;
    }
  }
}

export const validateBudgetId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await param("budgetId")
    .isInt({ gt: 0 })
    .withMessage("Invalid ID format")
    .run(req);

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
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

export const validateBudgetExists = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { budgetId } = req.params;
    const budget = await Budget.findByPk(budgetId.toString());
    if (!budget) {
      return res.status(404).json({ message: "Budget entry not found" });
    }
    req.budget = budget;
  } catch (error) {
    res.status(500).json({ message: "Error fetching budget entry", error });
  }

  next();
};

export const hasAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.budget.userId !== req.user.id) {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
};
