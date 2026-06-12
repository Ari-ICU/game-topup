import { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import logger from "../utils/logger";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TopUpPay Gaming Portal API Documentation",
      version: "1.0.0",
      description: "Interactive Swagger documentation for the digital gaming top-up backend services.",
    },
    servers: [
      {
        url: "http://localhost:5001",
        description: "Development Backend Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your short-lived access JWT token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "60c72b2f9b1d8e2354c25603" },
            email: { type: "string", example: "gamer@example.com" },
            name: { type: "string", example: "Pro Gamer" },
            role: { type: "string", enum: ["ADMIN", "STAFF", "USER"], example: "USER" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Transaction: {
          type: "object",
          properties: {
            id: { type: "string", example: "60c72b2f9b1d8e2354c25604" },
            userId: { type: "string", nullable: true, example: "60c72b2f9b1d8e2354c25603" },
            packageId: { type: "string", example: "60c72b2f9b1d8e2354c25605" },
            status: { type: "string", enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "EXPIRED"], example: "PENDING" },
            paymentMethod: { type: "string", example: "KHQR" },
            totalAmount: { type: "number", example: 10.50 },
            qrCode: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // scan paths
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info("📖 Swagger UI mounted at http://localhost:5001/api-docs");
};
