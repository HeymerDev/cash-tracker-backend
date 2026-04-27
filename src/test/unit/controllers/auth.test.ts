import { createRequest, createResponse } from "node-mocks-http";
import { AuthController } from "../../../controllers/AuthController";
import User from "../../../models/User";
import { hashPassword } from "../../../helpers/auth";
import { generateToken } from "../../../helpers/token";
import { AuthEmail } from "../../../Emails/AuthEmail";

jest.mock("../../../models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../../../helpers/auth");
jest.mock("../../../helpers/token");

describe(" AutthController.register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 409 if email is already in use", async () => {
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

  test("should return 201 if user is registered successfully", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

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

    const userMock = {
      ...req.body,
      save: jest.fn(),
    };
    (User.create as jest.Mock).mockResolvedValue(userMock);
    (hashPassword as jest.Mock).mockResolvedValue("hashedPassword");
    (generateToken as jest.Mock).mockReturnValue("123456");
    jest
      .spyOn(AuthEmail, "sendVerificationEmail")
      .mockImplementation(() => Promise.resolve());

    await AuthController.register(req, res);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual({
      message: "User registered successfully",
    });
    expect(User.create).toHaveBeenCalledTimes(1);
    expect(hashPassword).toHaveBeenCalledWith("password123");
    expect(generateToken).toHaveBeenCalledTimes(1);
    expect(AuthEmail.sendVerificationEmail).toHaveBeenCalledTimes(1);
  });
});
