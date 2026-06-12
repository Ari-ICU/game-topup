import { Worker } from "bullmq";
import { fulfillOrder } from "../services/transaction.service";
import logger from "../utils/logger";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const startFulfillmentWorker = () => {
  const worker = new Worker(
    "order-fulfillment",
    async (job) => {
      const { transactionId } = job.data;
      logger.info(`[BullMQ Worker] Processing job ${job.id} (tx: ${transactionId})`);
      
      const result = await fulfillOrder(transactionId);
      if (!result) {
        throw new Error(`Transaction ${transactionId} not found`);
      }
      
      // If the third-party API failed (and resulted in FAILED status),
      // we throw an error so BullMQ knows the job failed and can attempt retries.
      if (result.fulfillmentStatus === "FAILED") {
        throw new Error(`Fulfillment failed: ${result.fulfillmentError}`);
      }
      
      return result;
    },
    {
      connection: {
        url: REDIS_URL,
        maxRetriesPerRequest: null,
      },
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 1000,
      },
    }
  );

  worker.on("completed", (job) => {
    logger.info(`[BullMQ Worker] Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`[BullMQ Worker] Job ${job?.id} failed: ${err.message}`);
  });

  logger.info("👷 BullMQ Fulfillment Worker started and listening for jobs");
  return worker;
};
