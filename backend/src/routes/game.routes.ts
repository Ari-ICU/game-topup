import { Router } from "express";
import * as gameController from "../controllers/game.controller";

const router = Router();

router.get("/", gameController.getGames);
router.get("/:slug", gameController.getGameBySlug);

export default router;
