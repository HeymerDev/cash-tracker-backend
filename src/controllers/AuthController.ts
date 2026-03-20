import { Request, Response } from "express";
import User from "../models/User";
import { hashPassword } from "../helpers/auth";
import { generateToken } from "../helpers/token";
import { AuthEmail } from "../Emails/AuthEmail";

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
      user.token = generateToken();
      await user.save();

      await AuthEmail.sendVerificationEmail({
        email: user.email,
        name: user.name,
        token: user.token,
      });

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      //console.log(error);
      res.status(500).json({ message: "Error registering user", error });
    }
  };

  static login = async (req: Request, res: Response) => {};
}
