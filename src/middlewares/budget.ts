import { NextFunction, Request, Response } from "express";
import { body, param } from "express-validator";
import Budget from "../models/Budget";

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

export const validateBudgetExists = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const budget = await Budget.findByPk(id.toString());
    if (!budget) {
      return res.status(404).json({ message: "Budget entry not found" });
    }
    req.budget = budget;
  } catch (error) {
    res.status(500).json({ message: "Error fetching budget entry", error });
  }

  next();
};
