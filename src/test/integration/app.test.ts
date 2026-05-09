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
});
