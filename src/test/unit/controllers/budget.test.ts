import { createResponse, createRequest } from "node-mocks-http";
import { budgets } from "../../mocks/controllers/budget";
import { BudgetController } from "../../../controllers/BudgetController";
import Budget from "../../../models/Budget";

jest.mock("../../../models/Budget.ts", () => ({
  findAll: jest.fn(),
}));

describe("BudgetController.getAll", () => {
  test("should return all budgets for a user", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets",
      user: { id: 1 },
    });

    const res = createResponse();

    const filteredBudgets = budgets.filter((b) => b.userId === req.user.id);

    (Budget.findAll as jest.Mock).mockResolvedValue(filteredBudgets);
    await BudgetController.getAll(req, res);

    const data = res._getJSONData();

    console.log(data);

    expect(res.statusCode).toBe(200);
    expect(filteredBudgets).toHaveLength(2);
    expect(data).toEqual(filteredBudgets);
  });

  test("should return not all budgets for a user", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets",
      user: { id: 10 },
    });

    const res = createResponse();

    const filteredBudgets = budgets.filter((b) => b.userId === req.user.id);

    (Budget.findAll as jest.Mock).mockResolvedValue(filteredBudgets);
    await BudgetController.getAll(req, res);

    const data = res._getJSONData();

    console.log(data);

    expect(res.statusCode).toBe(200);
    expect(filteredBudgets).toHaveLength(0);
    expect(data).toEqual(filteredBudgets);
  });
});
