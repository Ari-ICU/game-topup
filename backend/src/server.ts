import app from "./app";
import logger from "./utils/logger";
import { startFulfillmentWorker } from "./workers/fulfillment.worker";

const PORT = process.env.PORT || 5001;

// Start background worker queue processing
try {
  startFulfillmentWorker();
} catch (err: any) {
  logger.error(`Failed to initialize BullMQ worker: ${err.message}`);
}

app.listen(PORT, () => {
  logger.info(`🚀 Server running at http://localhost:${PORT}`);
});
