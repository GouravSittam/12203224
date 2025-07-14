/**
 * Main Express application
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { appConfig } from "./config";
import { initializeLogger, Log } from "logging-middleware";
import { authCredentials, loggerConfig } from "./config";
import urlRoutes from "./routes/urlRoutes";
import { UrlController } from "./controllers/urlController";
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
} from "./middleware/errorHandler";

/**
 * Creates and configures the Express application
 */
export async function createApp(): Promise<express.Application> {
  try {
    // Initialize logging middleware
    await initializeLogger(loggerConfig, authCredentials);
    await Log("backend", "info", "config", "Initializing Express application");

    const app = express();

    // Security middleware
    app.use(helmet());

    // CORS middleware
    app.use(
      cors({
        origin: true,
        credentials: true,
      })
    );

    // Compression middleware
    app.use(compression());

    // Body parsing middleware
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Request logging middleware
    app.use(requestLogger);

    // Trust proxy for accurate IP addresses
    app.set("trust proxy", true);

    // API routes
    app.use("/", urlRoutes);

    // Redirect route (must be after API routes)
    app.get("/:shortcode", (req, res) => {
      const urlController = new UrlController();
      return urlController.redirectToOriginalUrl(req, res);
    });

    // 404 handler
    app.use(notFoundHandler);

    // Global error handler
    app.use(errorHandler);

    await Log(
      "backend",
      "info",
      "config",
      "Express application configured successfully"
    );

    return app;
  } catch (error) {
    console.error("Failed to create application:", error);
    throw error;
  }
}

/**
 * Starts the Express server
 */
export async function startServer(): Promise<void> {
  try {
    const app = await createApp();

    const server = app.listen(appConfig.port, appConfig.host, () => {
      console.log(
        `🚀 URL Shortener Microservice running on http://${appConfig.host}:${appConfig.port}`
      );
      console.log(
        `📊 Health check: http://${appConfig.host}:${appConfig.port}/health`
      );
      console.log(`🔗 API Documentation:`);
      console.log(`   POST /shorturls - Create short URL`);
      console.log(`   GET /shorturls/:shortcode - Get statistics`);
      console.log(`   GET /:shortcode - Redirect to original URL`);
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      await Log(
        "backend",
        "info",
        "config",
        "SIGTERM received, shutting down gracefully"
      );
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", async () => {
      await Log(
        "backend",
        "info",
        "config",
        "SIGINT received, shutting down gracefully"
      );
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}
