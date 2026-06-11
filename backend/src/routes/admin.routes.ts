import { Router } from "express";
import express from "express";
import * as adminController from "../controllers/admin.controller";
import { adminRateLimiter, adminAuth } from "../middlewares/adminAuth";

const router = Router();

// Apply rate limiter (150 requests per minute max) globally
router.use(adminRateLimiter(150, 60 * 1000));

// Public login gateway (protected by brute-force lockout firewall)
router.post("/login", adminController.loginFirewall, adminController.login);

// Guard all administrative routes below with JWT authentication check
router.use(adminAuth);

// Admin endpoints mapping
router.get("/stats", adminController.getStats);
router.get("/settings", adminController.getSettings);
router.put("/settings", adminController.updateSettings);

router.get("/promos", adminController.getPromos);
router.post("/promos", adminController.createPromo);
router.patch("/promos/:id/toggle", adminController.togglePromo);
router.delete("/promos/:id", adminController.deletePromo);

router.get("/games", adminController.getGames);
router.post("/games", adminController.createGame);
router.put("/games/:id", adminController.updateGame);
router.delete("/games/:id", adminController.deleteGame);

router.post("/packages", adminController.createPackage);
router.put("/packages/:id", adminController.updatePackage);
router.delete("/packages/:id", adminController.deletePackage);

router.get("/transactions", adminController.getTransactions);
router.post("/transactions/:id/complete", adminController.completeTransaction);
router.post("/transactions/:id/fulfill", adminController.fulfillTransaction);

// Upload endpoint: override body limit to 10mb for base64 image uploads
router.post("/upload", express.json({ limit: "10mb" }), adminController.uploadFile);

export default router;
