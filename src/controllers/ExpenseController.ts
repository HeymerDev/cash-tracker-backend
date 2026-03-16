import { Request, Response } from "express";
import Expense from "../models/Expense";

export class ExpenseController {
  static getAll = async (req: Request, res: Response) => {};

  static create = async (req: Request, res: Response) => {
    try {
      const expense = new Expense(req.body);
      expense.budgetId = req.budget.id;
      await expense.save();
      res
        .status(201)
        .json({ message: "Expense entry created successfully", expense });
    } catch (error) {
      //console.log(error);

      res.status(500).json({ message: "Error creating expense entry", error });
    }
  };

  static getById = async (req: Request, res: Response) => {
    const { expense } = req;
    res.status(200).json(expense);
  };

  static update = async (req: Request, res: Response) => {
    const { expense } = req;
    await expense.update(req.body);
    res.status(200).json({ message: "Expense entry updated successfully" });
  };

  static delete = async (req: Request, res: Response) => {
    const { expense } = req;

    await expense.destroy();
    res.status(200).json({ message: "Expense entry deleted successfully" });
  };
}
