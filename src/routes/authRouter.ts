import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body } from "express-validator";
import { handleInputErrors } from "../middlewares/validation";

const router: Router = Router();

router.post(
  "/register",
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .notEmpty()
    .withMessage("Email is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("name").notEmpty().withMessage("Name is required"),
  handleInputErrors,
  AuthController.register,
);

router.post("/login", AuthController.login);

export default router;
