import { Request, Response } from "express";
import User from "../models/User";

export class AuthController {
  static register = async (req: Request, res: Response) => {
    try {
      const userExists = await User.findOne({
        where: { email: req.body.email },
      });
      if (userExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      const user = new User(req.body);
      await user.save();
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      //console.log(error);
      res.status(500).json({ message: "Error registering user", error });
    }
  };

  static login = async (req: Request, res: Response) => {};
}
