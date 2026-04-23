import { createRequest, createResponse } from "node-mocks-http";
import { ExpenseController } from "../../../controllers/ExpenseController";
import Expense from "../../../models/Expense";

jest.mock("../../../models/Expense", () => ({
  create: jest.fn(),
}));

describe("Expense Controller Create", () => {
  test("should create an expense successfully", async () => {
    const expenseMock = {
      save: jest.fn().mockResolvedValue(true),
    };

    (Expense.create as jest.Mock).mockResolvedValue(expenseMock);

    const req = createRequest({
      method: "POST",
      url: "/api/budget/:budgetId/expenses",
      budget: { id: 1 },
      body: {
        amount: 100,
        description: "Office supplies",
      },
    });
    const res = createResponse();

    await ExpenseController.create(req, res);

    expect(Expense.create).toHaveBeenCalledWith(req.body);
    expect(expenseMock.save).toHaveBeenCalled();
    expect(expenseMock.save).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(201);
  });

  test("should return 500 if there is an error", async () => {
    const mockError = new Error("DB error");
    const expenseMock = {
      save: jest.fn().mockResolvedValue(true),
    };
    (Expense.create as jest.Mock).mockRejectedValue(mockError);

    const req = createRequest({
      method: "POST",
      url: "/api/budget/:budgetId/expenses",
      budget: { id: 1 },
      body: {
        amount: 100,
        description: "Office supplies",
      },
    });
    const res = createResponse();

    await ExpenseController.create(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toStrictEqual({
      error: mockError.message,
      message: "Error creating expense entry",
    });
    expect(Expense.create).toHaveBeenCalledWith(req.body);
    expect(expenseMock.save).not.toHaveBeenCalled();
  });
});
