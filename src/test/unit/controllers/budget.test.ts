import { createResponse, createRequest } from "node-mocks-http";
import { budgets } from "../../mocks/controllers/budget";
import { BudgetController } from "../../../controllers/BudgetController";
import Budget from "../../../models/Budget";
import { create } from "domain";
import { error } from "console";

jest.mock("../../../models/Budget.ts", () => ({
  findAll: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn(),
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

describe("BudgetController.create", () => {
  test("should create a new budget entry", async () => {
    const mockBudgetData = {
      id: 3,
      name: "Nuevo Presupuesto",
      amount: 500,
      userId: 1,
      createdAt: Date.now().toString(),
      updatedAt: Date.now().toString(),
    };

    const mockBudgetInstance = {
      ...mockBudgetData,
      save: jest.fn().mockResolvedValue(true),
    };

    (Budget.create as jest.Mock).mockResolvedValue(mockBudgetInstance);

    const req = createRequest({
      method: "POST",
      url: "/api/budgets",
      user: { id: 1 },
      body: {
        name: "Nuevo Presupuesto",
        amount: 500,
      },
    });

    const res = createResponse();

    await BudgetController.create(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(data).toEqual({
      message: "Budget entry created successfully",
      budget: mockBudgetData,
    });
    expect(Budget.create).toHaveBeenCalledWith(req.body);
    expect(mockBudgetInstance.save).toHaveBeenCalledTimes(1);
  });

  test("should return 500 if there is an error", async () => {
    const mockError = new Error("DB error");

    const mockBudgetInstance = {
      save: jest.fn(),
    };

    (Budget.create as jest.Mock).mockRejectedValue(mockError);

    const req = createRequest({
      method: "POST",
      url: "/api/budgets",
      user: { id: 1 },
      body: {
        name: "Nuevo Presupuesto",
        amount: 500,
      },
    });
    const res = createResponse();

    await BudgetController.create(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toStrictEqual({
      error: mockError.message,
      message: "Error creating budget entries",
    });
    expect(Budget.create).toHaveBeenCalledWith(req.body);
    expect(mockBudgetInstance.save).toHaveBeenCalledTimes(0);
  });
});

describe("BudgetController.getById", () => {
  beforeEach(() => {
    (Budget.findByPk as jest.Mock).mockImplementation((id, include) => {
      const budget = budgets.find((b) => b.id === id);
      return Promise.resolve(budget);
    });
  });

  test("should return a budget entry by ID", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets/1",
      budget: {
        id: 1,
      },
    });

    const res = createResponse();
    await BudgetController.getById(req, res);

    const data = res._getJSONData();

    console.log(data);

    expect(res.statusCode).toBe(200);
    expect(data).toEqual(budgets[0]);
    expect(Budget.findByPk).toHaveBeenCalledWith(req.budget.id, {
      include: expect.any(Array),
    });
    expect(data.expenses).toHaveLength(3);
  });
});
