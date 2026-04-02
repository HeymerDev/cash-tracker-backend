import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation";
import { limiter } from "../config/limiter";
import {
  authenticate,
  validateEmailBody,
  validatePasswordBody,
} from "../middlewares/auth";

const router: Router = Router();

router.use(limiter);

router.post(
  "/register",
  validateEmailBody,
  validatePasswordBody,
  handleInputErrors,
  AuthController.register,
);

router.post(
  "/login",
  validateEmailBody,
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
  validateEmailBody,
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
  validatePasswordBody,
  param("token")
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage("Token is not valid"),
  handleInputErrors,
  AuthController.resetPassword,
);

router.get("/user", authenticate, AuthController.getUser);

export default router;
