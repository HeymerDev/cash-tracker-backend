import { Request, Response } from "express";

export class BudgetController {
  static getAll = async (req: Request, res: Response) => {
    res.status(200).json({ message: "Get all budget entries" });
  };

  static create = async (req: Request, res: Response) => {
    res.status(201).json({ message: "Create a new budget entry" });
  };

  static getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    res.status(200).json({ message: `Get budget entry with ID: ${id}` });
  };

  static update = async (req: Request, res: Response) => {
    const { id } = req.params;
    res.status(200).json({ message: `Update budget entry with ID: ${id}` });
  };

  static delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    res.status(200).json({ message: `Delete budget entry with ID: ${id}` });
  };
}
