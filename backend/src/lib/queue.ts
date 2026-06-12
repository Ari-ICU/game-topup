import { Queue } from "bullmq";
import logger from "../utils/logger";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const connectionConfig = {
  connection: {
    url: REDIS_URL,
    maxRetriesPerRequest: null, // Required by BullMQ
  }
};

export const fulfillmentQueue = new Queue("order-fulfillment", connectionConfig);

fulfillmentQueue.on("error", (err) => {
  logger.error(`❌ BullMQ Queue Error: ${err.message}`);
});

logger.info("📦 BullMQ Fulfillment Queue initialized");
