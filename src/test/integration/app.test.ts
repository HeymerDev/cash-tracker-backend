import request from "supertest";
import server from "../../server";

import { AuthController } from "../../controllers/AuthController";
import User from "../../models/User";
import * as jwtUtils from "../../helpers/jwt";
import * as authUtils from "../../helpers/auth";

describe("Authentication - Register Account", () => {
  test("should validation errors form is not empty", async () => {
    const response = await request(server).post("/api/auth/register").send({});

    const createAccountMock = jest.spyOn(AuthController, "register");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(4);
    expect(createAccountMock).not.toHaveBeenCalled();
  });

  test("should validation email error if email is invalid", async () => {
    const response = await request(server).post("/api/auth/register").send({
      name: "John Doe",
      email: "invalid-email",
      password: "password123",
    });

    const createAccountMock = jest.spyOn(AuthController, "register");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe("Invalid email address");
    expect(createAccountMock).not.toHaveBeenCalled();
  });

  test("should validation password error if password is too short", async () => {
    const response = await request(server).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "short",
    });

    const createAccountMock = jest.spyOn(AuthController, "register");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe(
      "Password must be at least 8 characters long",
    );
    expect(createAccountMock).not.toHaveBeenCalled();
  });

  test("should validation password & email errors if both are invalid", async () => {
    const response = await request(server).post("/api/auth/register").send({
      name: "John Doe",
      email: "invalid-email",
      password: "short",
    });

    const createAccountMock = jest.spyOn(AuthController, "register");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(2);
    expect(response.body.errors[0].msg).toBe("Invalid email address");
    expect(response.body.errors[1].msg).toBe(
      "Password must be at least 8 characters long",
    );
    expect(createAccountMock).not.toHaveBeenCalled();
  });

  test("should status 201 for create account if all validations pass", async () => {
    const response = await request(server).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("User registered successfully");
  });

  test("should status 409 for create account if email already exists", async () => {
    const response = await request(server).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("message");
    expect(response.body).not.toHaveProperty("errors");
    expect(response.body.message).toBe("Email already in use");
  });
});

describe("Authentication - Confirmation Token Account", () => {
  test("should display error if token is empty or not valid", async () => {
    const respose = await request(server)
      .post("/api/auth/verify-email")
      .send({});

    expect(respose.status).toBe(400);
    expect(respose.body).toHaveProperty("errors");
    expect(respose.body.errors).toHaveLength(1);
    expect(respose.body.errors[0].msg).toEqual("Token is not valid");
  });

  test("should display error if token not exists", async () => {
    const respose = await request(server).post("/api/auth/verify-email").send({
      token: "123456",
    });

    expect(respose.status).toBe(404);
    expect(respose.body).toHaveProperty("message");
    expect(respose.body.message).toEqual("Invalid token");
  });

  test("should display succes messagge if verify email correct", async () => {
    const respose = await request(server).post("/api/auth/verify-email").send({
      token: globalThis.cashTrackerConfirmationToken,
    });

    expect(respose.status).toBe(200);
    expect(respose.body).toHaveProperty("message");
    expect(respose.body.message).toEqual("Email verified successfully");
  });
});

describe("Authentication - Login", () => {
  test("Should display validation errors if body is empty", async () => {
    const response = await request(server).post("/api/auth/login").send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(3);
  });

  test("Should return 400 for email no valid format", async () => {
    const response = await request(server).post("/api/auth/login").send({
      email: "heymertest.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe("Invalid email address");
  });

  test("Should return 401 for invalid credentials", async () => {
    const response = await request(server).post("/api/auth/login").send({
      email: "john@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Invalid credentials");
  });

  test("Should return 403 for user email not confirmed", async () => {
    (jest.spyOn(User, "findOne") as jest.Mock).mockResolvedValue({
      id: 1,
      confirm: false,
      email: "jhon@example.com",
      password: "hashedpassword",
    });

    const response = await request(server).post("/api/auth/login").send({
      email: "john@example.com",
      password: "password123",
    });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Please verify your email");
  });

  test("Should return 200 and jwt if login is successful", async () => {
    (jest.spyOn(User, "findOne") as jest.Mock).mockResolvedValue({
      id: 1,
      confirm: true,
      email: "john@example.com",
      password: "hashedpassword",
    });

    jest.spyOn(authUtils, "comparePassword").mockResolvedValue(true);

    jest.spyOn(jwtUtils, "generateJWT").mockReturnValue("fake-jwt-token");

    const response = await request(server).post("/api/auth/login").send({
      email: "john@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("token");
    expect(response.body.message).toBe("Login successful");
    expect(response.body.token).toBe("fake-jwt-token");
  });
});
