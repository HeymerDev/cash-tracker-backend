import { Request, Response } from "express";
import User from "../models/User";
import { comparePassword, hashPassword } from "../helpers/auth";
import { generateToken } from "../helpers/token";
import { AuthEmail } from "../Emails/AuthEmail";
import { generateJWT } from "../helpers/jwt";

export class AuthController {
  static register = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
    });

    if (user) {
      return res.status(409).json({ message: "Email already in use" });
    }

    try {
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

  static login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.confirm) {
      return res.status(403).json({ message: "Please verify your email" });
    }

    try {
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateJWT(user.id);

      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      res.status(500).json({ message: "Error logging in", error });
    }
  };

  static verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.body;

    try {
      const user = await User.findOne({ where: { token } });
      if (!user) {
        return res.status(404).json({ message: "Invalid token" });
      }

      user.confirm = true;
      user.token = null;
      await user.save();

      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error verifying email", error });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.tokenPassword = generateToken();
      await user.save();
      await AuthEmail.sendForgotPasswordEmail({
        email: user.email,
        name: user.name,
        token: user.tokenPassword,
      });
      res.status(200).json({ message: "Forgot password email sent" });
    } catch (error) {
      res.status(500).json({ message: "Error processing request", error });
    }
  };

  static verifyResetToken = async (req: Request, res: Response) => {
    const { token } = req.body;
    const tokenExist = await User.findOne({ where: { tokenPassword: token } });

    if (!tokenExist) {
      return res.status(404).json({ message: "Invalid token" });
    }

    res.status(200).json({ message: "Token is valid" });
  };

  static resetPassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    const { token } = req.params;

    const user = await User.findOne({ where: { tokenPassword: token } });

    if (!user) {
      return res.status(404).json({ message: "Invalid token" });
    }

    const passwordHash = await hashPassword(password);

    user.password = passwordHash;
    user.tokenPassword = null;
    await user.save();

    res.json({ message: "Password update succesfully" });
  };

  static getUser = async (req: Request, res: Response) => {
    res.json(req.user);
  };

  static updatePassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;

    const user = await User.findByPk(req.user?.id);

    try {
      const isPasswordValid = await comparePassword(
        current_password,
        user.password,
      );
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      const passwordHash = await hashPassword(password);

      user.password = passwordHash;
      await user.save();

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating password", error });
    }
  };
}
