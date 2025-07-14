import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { appConfig } from "./config";
import urlRoutes from "./routes/urlRoutes";
import { UrlController } from "./controllers/urlController";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export async function createApp(): Promise<express.Application> {
  try {
    const app = express();
    app.use(helmet());
    app.use(
      cors({
        origin: true,
        credentials: true,
      })
    );
    app.use(compression());
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));
    app.set("trust proxy", true);
    app.use("/", urlRoutes);
    app.get("/:shortcode", (req, res) => {
      const urlController = new UrlController();
      return urlController.redirectToOriginalUrl(req, res);
    });
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
  } catch (error) {
    console.error("Failed to create application:", error);
    throw error;
  }
}

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
    process.on("SIGTERM", async () => {
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
    process.on("SIGINT", async () => {
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
