import { Router } from "express";
import { body, param } from "express-validator";
import { BudgetController } from "../controllers/BudgetController";
import { handleInputErrors } from "../middlewares/validation";
import { validateBudgetId, validationBody } from "../middlewares/Budget";

const router: Router = Router();

router.get("/", BudgetController.getAll);
router.post("/", validationBody, handleInputErrors, BudgetController.create);
router.get(
  "/:id",
  validateBudgetId,
  handleInputErrors,
  BudgetController.getById,
);
router.patch(
  "/:id",
  validateBudgetId,
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
  validateBudgetId,
  handleInputErrors,
  BudgetController.delete,
);

export default router;
