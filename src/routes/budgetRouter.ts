import { Router } from "express";
import { body, param } from "express-validator";
import { BudgetController } from "../controllers/BudgetController";
import { handleInputErrors } from "../middlewares/validation";

const router: Router = Router();

router.get("/", BudgetController.getAll);
router.post(
  "/",
  body("name").notEmpty().withMessage("Name is required"),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be a number")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number"),

  handleInputErrors,
  BudgetController.create,
);
router.get(
  "/:id",
  param("id").isInt({ gt: 0 }).withMessage("Invalid ID format"),
  handleInputErrors,
  BudgetController.getById,
);
router.patch(
  "/:id",
  param("id").isInt({ gt: 0 }).withMessage("Invalid ID format"),
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .optional()
    .notEmpty()
    .withMessage("Name cannot be empty"),
  body("amount")
    .optional()
    .notEmpty()
    .withMessage("Amount cannot be empty")
    .isNumeric()
    .withMessage("Amount must be a number")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number"),
  handleInputErrors,
  BudgetController.update,
);
router.delete(
  "/:id",
  param("id").isInt({ gt: 0 }).withMessage("Invalid ID format"),
  handleInputErrors,
  BudgetController.delete,
);

export default router;
