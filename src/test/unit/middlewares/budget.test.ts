import { createResponse, createRequest } from "node-mocks-http";
import { validateBudgetExists } from "../../../middlewares/budget";
import Budget from "../../../models/Budget";
import { budgets } from "../../mocks/controllers/budget";

jest.mock("../../../models/Budget.ts", () => ({
  findByPk: jest.fn(),
}));

describe("validateBudgetExists", () => {
  test("should return 404 if budget does not exist", async () => {
    (Budget.findByPk as jest.Mock).mockResolvedValue(null);
    const req = createRequest({
      params: { budgetId: "999" },
    });

    const res = createResponse();
    const next = jest.fn();

    await validateBudgetExists(req, res, next);

    expect(res.statusCode).toBe(404);
    const data = res._getJSONData();
    expect(data).toEqual({ message: "Budget entry not found" });
    expect(next).not.toHaveBeenCalled();
  });

  test("should attach budget to req if it exists", async () => {
    (Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0]);
    const req = createRequest({
      params: { budgetId: "1" },
    });
    const res = createResponse();
    const next = jest.fn();

    await validateBudgetExists(req, res, next);

    expect(req.budget).toEqual(budgets[0]);
    expect(next).toHaveBeenCalled();
  });

  test("should return 500 if error on budgetExist", async () => {
    const error = new Error("DB error");
    (Budget.findByPk as jest.Mock).mockRejectedValue(error);
    const req = createRequest({
      params: { budgetId: "999" },
    });

    const res = createResponse();
    const next = jest.fn();

    await validateBudgetExists(req, res, next);

    expect(res.statusCode).toBe(500);
    const data = res._getJSONData();
    expect(data).toEqual({
      message: "Error fetching budget entry",
      error: error.message,
    });
    expect(next).not.toHaveBeenCalled();
  });
});
