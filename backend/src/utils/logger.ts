import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

// Define structured JSON format for files and production console
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define user-friendly format for development console
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level}: ${message}${stack ? `\n${stack}` : ""}`;
  })
);

const logsDir = path.join(process.cwd(), "logs");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports: [
    // Daily Rotate File for errors
    new DailyRotateFile({
      dirname: logsDir,
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "error",
    }),
    // Daily Rotate File for all combined logs
    new DailyRotateFile({
      dirname: logsDir,
      filename: "combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

// Configure Console Transport depending on environment
if (process.env.NODE_ENV === "development") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
} else {
  logger.add(
    new winston.transports.Console({
      format: logFormat,
    })
  );
}

export default logger;
