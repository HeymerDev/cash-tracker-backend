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
});
