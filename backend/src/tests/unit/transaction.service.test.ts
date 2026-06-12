import { validatePromoCode } from "../../services/transaction.service";

// Mock the prisma instance
jest.mock("../../lib/prisma", () => ({
  prisma: {
    promoCode: {
      findUnique: jest.fn(),
    },
    package: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock the BullMQ queue
jest.mock("../../lib/queue", () => ({
  fulfillmentQueue: {
    add: jest.fn(),
  },
}));

const { prisma } = require("../../lib/prisma");

describe("Transaction Service - validatePromoCode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should validate promo code and calculate discount correctly", async () => {
    // Mock promo code
    prisma.promoCode.findUnique.mockResolvedValue({
      code: "SAVE10",
      discount: 0.10, // 10%
      isActive: true,
      useCount: 5,
      maxUses: 100,
      gameId: null,
    });

    // Mock package
    prisma.package.findUnique.mockResolvedValue({
      id: "pkg-1",
      gameId: "game-1",
      price: 20.00,
    });

    const result = await validatePromoCode("SAVE10", "pkg-1");

    expect(result.valid).toBe(true);
    expect(result.code).toBe("SAVE10");
    expect(result.discountPercentage).toBe(10);
    expect(result.discountAmount).toBe(2); // 10% of 20
    expect(result.finalPrice).toBe(18); // 20 - 2
  });

  it("should throw error if promo code is inactive", async () => {
    prisma.promoCode.findUnique.mockResolvedValue({
      code: "EXPIRED",
      discount: 0.20,
      isActive: false,
      useCount: 0,
      maxUses: 10,
    });

    await expect(validatePromoCode("EXPIRED", "pkg-1")).rejects.toThrow("Invalid promo code");
  });

  it("should throw error if promo code usage limit is reached", async () => {
    prisma.promoCode.findUnique.mockResolvedValue({
      code: "LIMIT",
      discount: 0.20,
      isActive: true,
      useCount: 10,
      maxUses: 10,
    });

    await expect(validatePromoCode("LIMIT", "pkg-1")).rejects.toThrow("Promo code limit reached");
  });
});
