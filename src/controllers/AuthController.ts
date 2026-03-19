import { Request, Response } from "express";
import User from "../models/User";

export class AuthController {
  static register = async (req: Request, res: Response) => {
    console.log("Desde register");
  };

  static login = async (req: Request, res: Response) => {};
}
