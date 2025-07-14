/**
 * Main entry point for URL Shortener Microservice
 */

import { startServer } from "./app";

// Start the server
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
