import Redis from "ioredis";
import logger from "../utils/logger";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redis: Redis;

try {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
    showFriendlyErrorStack: true,
  });

  redis.on("connect", () => {
    logger.info("🔌 Redis connected successfully");
  });

  redis.on("error", (err) => {
    logger.error(`❌ Redis connection error: ${err.message}`);
  });
} catch (err: any) {
  logger.error(`❌ Redis initialization failed: ${err.message}`);
  redis = null as any;
}

export { redis };
export default redis;
