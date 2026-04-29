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

afterEach(() => {
  jest.clearAllMocks();
});

describe(" AutthController.register", () => {
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
    expect(User.create).toHaveBeenCalledWith(req.body);
    expect(userMock.save).toHaveBeenCalledTimes(1);
    expect(userMock.password).toBe("hashedPassword");
    expect(userMock.token).toBe("123456");
    expect(hashPassword).toHaveBeenCalledWith("password123");
    expect(generateToken).toHaveBeenCalledTimes(1);
    expect(AuthEmail.sendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(AuthEmail.sendVerificationEmail).toHaveBeenCalledWith({
      email: req.body.email,
      name: req.body.name,
      token: userMock.token,
    });
  });

  test("should return 500 if there is an error during registration", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (User.create as jest.Mock).mockRejectedValue(new Error("Database error"));

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

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({
      message: "Error registering user",
      error: "Database error",
    });
  });
});

describe(" AutthController.login", () => {
  test("should return 401 if email isn't already in use", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@example.com",
        password: "password123",
      },
    });
    const res = createResponse();

    await AuthController.login(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(401);
    expect(data).toEqual({ message: "Invalid credentials" });
    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(User.findOne).toHaveBeenCalledWith({
      where: {
        email: "test@example.com",
      },
    });
  });

  test("should return 403 if email isn't verified", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      email: "test@example.com",
      password: "hashedPassword",
      confirm: false,
    });

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@example.com",
        password: "password123",
      },
    });
    const res = createResponse();

    await AuthController.login(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(403);
    expect(data).toEqual({ message: "Please verify your email" });
    expect(User.findOne).toHaveBeenCalledTimes(1);
  });
});
