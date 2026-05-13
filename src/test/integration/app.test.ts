import request from "supertest";
import server from "../../server";

import { AuthController } from "../../controllers/AuthController";

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
