import { Router } from "express";
import express from "express";
import * as adminController from "../controllers/admin.controller";
import { adminRateLimiter, adminAuth, requireRole } from "../middlewares/adminAuth";
import { validate } from "../middlewares/validation";
import { Role } from "@prisma/client";

const router = Router();

// Apply rate limiter (150 requests per minute max) globally
router.use(adminRateLimiter(150, 60 * 1000));

// Public routes
router.post("/login", adminController.loginFirewall, adminController.login);
router.post("/refresh", adminController.refresh);

// Guard all administrative routes below with JWT authentication check
router.use(adminAuth);

// Public logout (requires valid access token to log out)
router.post("/logout", adminController.logout);

// Admin & Staff access endpoints
router.use(requireRole([Role.ADMIN, Role.STAFF]));

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

router.post("/upload", express.json({ limit: "10mb" }), adminController.uploadFile);

// Strictly ADMIN-only endpoints for Database Backup and Restore
router.use(requireRole([Role.ADMIN]));

router.get("/backup/export", adminController.exportBackup);
router.post(
  "/backup/import",
  express.json({ limit: "15mb" }),
  validate(adminController.importBackupSchema),
  adminController.importBackup
);

export default router;
