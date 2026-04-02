import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation";
import { limiter } from "../config/limiter";
import { authenticate } from "../middlewares/auth";

const router: Router = Router();

router.use(limiter);

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

router.post(
  "/login",
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleInputErrors,
  AuthController.login,
);

router.post(
  "/verify-email",
  body("token")
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage("Token is not valid"),
  handleInputErrors,
  AuthController.verifyEmail,
);

router.post(
  "/forgot-password",
  body("email")
    .isEmail()
    .notEmpty()
    .withMessage("Please provide a valid email"),
  handleInputErrors,
  AuthController.forgotPassword,
);

router.post(
  "/validate-reset-token",
  body("token")
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage("Token is not valid"),
  handleInputErrors,
  AuthController.verifyResetToken,
);

router.post(
  "/reset-password/:token",
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  param("token")
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage("Token is not valid"),
  handleInputErrors,
  AuthController.resetPassword,
);

router.get("/user", authenticate, AuthController.getUser);

export default router;
