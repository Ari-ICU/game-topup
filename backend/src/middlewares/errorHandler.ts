import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export interface CustomError extends Error {
  status?: number;
  statusCode?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  // Log error stack for debugging via Winston
  logger.error(`[Error] ${req.method} ${req.path}: ${message}`, err);

  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    },
  });
};
