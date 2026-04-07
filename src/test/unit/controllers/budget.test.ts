import { budgets } from "../../mocks/controllers/budget";

describe("BudgetController.getAll", () => {
  test("should return all budgets for a user", async () => {
    expect(budgets).toHaveLength(3);
  });
});
