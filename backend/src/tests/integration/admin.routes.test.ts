import request from "supertest";
import app from "../../app";

// Mock the BullMQ queue
jest.mock("../../lib/queue", () => ({
  fulfillmentQueue: {
    add: jest.fn(),
  },
}));

// Mock the Redis client
jest.mock("../../lib/redis", () => ({
  redis: {
    status: "ready",
    get: jest.fn(),
    exec: jest.fn(),
    multi: jest.fn(() => ({
      incr: jest.fn(),
      pexpire: jest.fn(),
      exec: jest.fn(),
    })),
  },
}));

describe("Integration Tests - Health Check", () => {
  it("should return ok status on health check endpoint", async () => {
    const response = await request(app).get("/api/health");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      message: "Backend server is running smoothly",
    });
  });
});
