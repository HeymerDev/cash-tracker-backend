import { Router } from "express";
import { body, param } from "express-validator";
import { BudgetController } from "../controllers/BudgetController";
import { handleInputErrors } from "../middlewares/validation";
import {
  validateBudgetExists,
  validateBudgetId,
  validationBody,
} from "../middlewares/budget";
import { ExpenseController } from "../controllers/ExpenseController";
import {
  validateExpenseExists,
  validateExpenseId,
  validationCreateExpense,
} from "../middlewares/expense";
import { authenticate } from "../middlewares/auth";

const router: Router = Router();

router.use(authenticate);

router.param("budgetId", validateBudgetId);
router.param("budgetId", validateBudgetExists);

router.param("expenseId", validateExpenseId);
router.param("expenseId", validateExpenseExists);

router.get("/", BudgetController.getAll);
router.post("/", validationBody, handleInputErrors, BudgetController.create);
router.get("/:budgetId", BudgetController.getById);
router.patch(
  "/:budgetId",
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
router.delete("/:budgetId", BudgetController.delete);

//router for expenses

router.get("/:budgetId/expenses", ExpenseController.getAll);
router.post(
  "/:budgetId/expenses",
  validationCreateExpense,
  handleInputErrors,
  ExpenseController.create,
);
router.get("/:budgetId/expenses/:expenseId", ExpenseController.getById);
router.patch(
  "/:budgetId/expenses/:expenseId",
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
  ExpenseController.update,
);
router.delete("/:budgetId/expenses/:expenseId", ExpenseController.delete);

export default router;
