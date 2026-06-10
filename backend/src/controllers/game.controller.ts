import { Request, Response, NextFunction } from "express";
import * as gameService from "../services/game.service";

/**
 * Handle listing all active games
 */
export const getGames = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const games = await gameService.getAllActiveGames();
    res.json(games);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle fetching a specific game by slug
 */
export const getGameBySlug = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { slug } = req.params;
  try {
    const game = await gameService.getGameBySlugDetails(slug as string);
    res.json(game);
  } catch (error: any) {
    if (error.message === "Game not found") {
      return res.status(404).json({
        error: {
          message: error.message,
          status: 404,
        },
      });
    }
    next(error);
  }
};
