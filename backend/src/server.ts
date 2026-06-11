import app from "./app";
import logger from "./utils/logger";

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  logger.info(`🚀 Server running at http://localhost:${PORT}`);
});
