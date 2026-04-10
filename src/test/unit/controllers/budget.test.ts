import { createResponse, createRequest } from "node-mocks-http";
import { budgets } from "../../mocks/controllers/budget";
import { BudgetController } from "../../../controllers/BudgetController";
import Budget from "../../../models/Budget";

jest.mock("../../../models/Budget.ts", () => ({
  findAll: jest.fn(),
}));

describe("BudgetController.getAll", () => {
  beforeEach(() => {
    (Budget.findAll as jest.Mock).mockReset();
    (Budget.findAll as jest.Mock).mockImplementation((options) => {
      const filteredBudgets = budgets.filter(
        (b) => b.userId === options.where.userId,
      );
      return Promise.resolve(filteredBudgets);
    });
  });

  test("should return all budgets for a user by ID", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets",
      user: { id: 1 },
    });

    const res = createResponse();

    await BudgetController.getAll(req, res);

    const data = res._getJSONData();

    console.log(data);

    expect(res.statusCode).toBe(200);
    expect(data).toHaveLength(2);
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

  test("should return 500 if there is an error", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets",
      user: { id: 1 },
    });

    const res = createResponse();

    const mockError = new Error("DB error");

    (Budget.findAll as jest.Mock).mockRejectedValue(mockError);

    await BudgetController.getAll(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toStrictEqual({
      message: "Error fetching budget entries",
    });
  });
});
