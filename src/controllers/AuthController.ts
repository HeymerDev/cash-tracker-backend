import { Request, Response } from "express";
import User from "../models/User";
import { hashPassword } from "../helpers/auth";

export class AuthController {
  static register = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const userExists = await User.findOne({
      where: { email },
    });

    try {
      if (userExists) {
        return res.status(409).json({ message: "Email already in use" });
      }

      const user = new User(req.body);
      user.password = await hashPassword(password);
      await user.save();
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      //console.log(error);
      res.status(500).json({ message: "Error registering user", error });
    }
  };

  static login = async (req: Request, res: Response) => {};
}
