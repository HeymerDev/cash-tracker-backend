import request from "supertest";
import server from "../../server";

describe("GET /", () => {
  test("should return a welcome message", async () => {
    const response = await request(server).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Welcome to the Cash Tracker API");
  });
});
