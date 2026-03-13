import { Request, Response } from "express";

export class ExpenseController {
  static getAll = async (req: Request, res: Response) => {};

  static create = async (req: Request, res: Response) => {};

  static getById = async (req: Request, res: Response) => {
    const { budget } = req;
    res.status(200).json(budget);
  };

  static update = async (req: Request, res: Response) => {};

  static delete = async (req: Request, res: Response) => {};
}
