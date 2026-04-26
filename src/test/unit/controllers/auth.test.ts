import { createRequest, createResponse } from "node-mocks-http";
import { AuthController } from "../../../controllers/AuthController";
import User from "../../../models/User";

jest.mock("../../../models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

describe(" AutthController.register", () => {
  it("should return 409 if email is already in use", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(true);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/register",
      body: {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      },
    });
    const res = createResponse();

    await AuthController.register(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(409);
    expect(data).toEqual({ message: "Email already in use" });
    expect(User.findOne).toHaveBeenCalledTimes(1);
  });
});
