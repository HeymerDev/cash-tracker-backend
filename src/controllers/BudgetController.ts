import { Request, Response } from "express";
import Budget from "../models/Budget";

export class BudgetController {
  static getAll = async (req: Request, res: Response) => {
    try {
      const budgets = await Budget.findAll({
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Error fetching budget entries", error });
    }
  };

  static create = async (req: Request, res: Response) => {
    try {
      const budget = new Budget(req.body);
      await budget.save();
      res
        .status(201)
        .json({ message: "Budget entry created successfully", budget });
    } catch (error) {
      res.status(500).json({ message: "Error fetching budget entries", error });
    }
  };

  static getById = async (req: Request, res: Response) => {
    const { budget } = req;
    res.status(200).json(budget);
  };

  static update = async (req: Request, res: Response) => {
    const { budget } = req;
    await budget.update(req.body);
    res.status(200).json({ message: "Budget entry updated successfully" });
  };

  static delete = async (req: Request, res: Response) => {
    const { budget } = req;
    await budget.destroy();
    res.status(200).json({ message: "Budget entry deleted successfully" });
  };
}
