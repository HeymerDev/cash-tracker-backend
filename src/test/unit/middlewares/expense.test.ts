import { createRequest, createResponse } from "node-mocks-http";
import { validateExpenseExists } from "../../../middlewares/expense";
import Expense from "../../../models/Expense";
import { expenses } from "../../mocks/controllers/expense";

jest.mock("../../../models/Expense", () => ({
  findByPk: jest.fn(),
}));

describe("Expense Middleware validateExpenseExists", () => {
  beforeEach(() => {
    (Expense.findByPk as jest.Mock).mockImplementation((id) => {
      const expense = expenses.find((e) => e.id === parseInt(id)) ?? null;
      return Promise.resolve(expense);
    });
  });

  test("should return 404 if expense does not exist", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budget/:budgetId/expenses/:expenseId",
      params: { expenseId: "999" },
    });
    const res = createResponse();
    const next = jest.fn();
    await validateExpenseExists(req, res, next);

    expect(Expense.findByPk).toHaveBeenCalledWith("999");
    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toStrictEqual({
      message: "Expense entry not found",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should call next if expense exists", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budget/:budgetId/expenses/:expenseId",
      params: { expenseId: "1" },
    });
    const res = createResponse();
    const next = jest.fn();
    await validateExpenseExists(req, res, next);

    expect(Expense.findByPk).toHaveBeenCalledWith("1");
    expect(next).toHaveBeenCalled();
    expect(req.expense).toEqual(expenses[0]);
  });
});
