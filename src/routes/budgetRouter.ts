import { Router } from "express";
import { body } from "express-validator";
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
router.get("/:id", BudgetController.getById);
router.patch("/:id", BudgetController.update);
router.delete("/:id", BudgetController.delete);

export default router;
