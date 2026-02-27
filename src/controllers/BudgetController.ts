import { Request, Response } from "express";

export class BudgetController {
  static getAll = async (req: Request, res: Response) => {
    res.status(200).json({ message: "Get all budget entries" });
  };
}
