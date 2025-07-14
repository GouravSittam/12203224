/**
 * URL Controller - Handles HTTP requests and responses
 */

import { Request, Response } from "express";
import { UrlService } from "../services/urlService";
import {
  validateCreateShortUrlRequest,
  extractClientInfo,
} from "../utils/validation";
import { ERROR_MESSAGES } from "../config";

export class UrlController {
  private urlService: UrlService;

  constructor() {
    this.urlService = new UrlService();
  }

  /**
   * Creates a new short URL
   * POST /shorturls
   */
  async createShortUrl(req: Request, res: Response): Promise<void> {
    try {
      // await Log(
      //   "backend",
      //   "info",
      //   "controller",
      //   "Create short URL request received"
      // );

      const request = req.body;

      // Validate request
      const validation = validateCreateShortUrlRequest(request);
      if (!validation.isValid) {
        // await Log(
        //   "backend",
        //   "error",
        //   "controller",
        //   `Validation failed: ${validation.errors.join(", ")}`
        // );
        res.status(400).json({
          error: "Validation Error",
          message: validation.errors.join(", "),
          statusCode: 400,
        });
        return;
      }

      // Check if custom shortcode already exists
      if (request.shortcode) {
        const exists = await this.urlService.shortcodeExists(request.shortcode);
        if (exists) {
          // await Log(
          //   "backend",
          //   "error",
          //   "controller",
          //   `Shortcode already exists: ${request.shortcode}`
          // );
          res.status(409).json({
            error: "Conflict",
            message: ERROR_MESSAGES.SHORTCODE_ALREADY_EXISTS,
            statusCode: 409,
          });
          return;
        }
      }

      // Create short URL
      const result = await this.urlService.createShortUrl(request);

      // await Log(
      //   "backend",
      //   "info",
      //   "controller",
      //   `Short URL created successfully: ${result.shortLink}`
      // );

      res.status(201).json(result);
    } catch (error) {
      // await Log(
      //   "backend",
      //   "error",
      //   "controller",
      //   `Failed to create short URL: ${
      //     error instanceof Error ? error.message : String(error)
      //   }`
      // );

      if (
        error instanceof Error &&
        error.message === "Shortcode already exists"
      ) {
        res.status(409).json({
          error: "Conflict",
          message: ERROR_MESSAGES.SHORTCODE_ALREADY_EXISTS,
          statusCode: 409,
        });
      } else {
        res.status(500).json({
          error: "Internal Server Error",
          message: ERROR_MESSAGES.INTERNAL_ERROR,
          statusCode: 500,
        });
      }
    }
  }

  /**
   * Redirects to original URL
   * GET /:shortcode
   */
  async redirectToOriginalUrl(req: Request, res: Response): Promise<void> {
    try {
      const { shortcode } = req.params;

      // await Log(
      //   "backend",
      //   "info",
      //   "controller",
      //   `Redirect request for shortcode: ${shortcode}`
      // );

      // Get original URL
      const originalUrl = await this.urlService.getOriginalUrl(shortcode);

      if (!originalUrl) {
        // await Log(
        //   "backend",
        //   "warn",
        //   "controller",
        //   `Shortcode not found or expired: ${shortcode}`
        // );
        res.status(404).json({
          error: "Not Found",
          message: ERROR_MESSAGES.URL_NOT_FOUND,
          statusCode: 404,
        });
        return;
      }

      // Extract client information for analytics
      const clientInfo = extractClientInfo(req);

      // Record click asynchronously (don't wait for it)
      this.urlService.recordClick(shortcode, clientInfo).catch((error) => {
        // Log(
        //   "backend",
        //   "error",
        //   "controller",
        //   `Failed to record click: ${
        //     error instanceof Error ? error.message : String(error)
        //   }`
        // );
      });

      // await Log(
      //   "backend",
      //   "info",
      //   "controller",
      //   `Redirecting to: ${originalUrl}`
      // );

      // Redirect to original URL
      res.redirect(originalUrl);
    } catch (error) {
      // await Log(
      //   "backend",
      //   "error",
      //   "controller",
      //   `Failed to redirect: ${
      //     error instanceof Error ? error.message : String(error)
      //   }`
      // );
      res.status(500).json({
        error: "Internal Server Error",
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        statusCode: 500,
      });
    }
  }

  /**
   * Gets statistics for a shortcode
   * GET /shorturls/:shortcode
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { shortcode } = req.params;

      // await Log(
      //   "backend",
      //   "info",
      //   "controller",
      //   `Statistics request for shortcode: ${shortcode}`
      // );

      // Get statistics
      const statistics = await this.urlService.getStatistics(shortcode);

      if (!statistics) {
        // await Log(
        //   "backend",
        //   "warn",
        //   "controller",
        //   `Statistics not found for shortcode: ${shortcode}`
        // );
        res.status(404).json({
          error: "Not Found",
          message: ERROR_MESSAGES.URL_NOT_FOUND,
          statusCode: 404,
        });
        return;
      }

      // await Log(
      //   "backend",
      //   "info",
      //   "controller",
      //   `Statistics retrieved for shortcode: ${shortcode}`
      // );

      res.status(200).json(statistics);
    } catch (error) {
      // await Log(
      //   "backend",
      //   "error",
      //   "controller",
      //   `Failed to get statistics: ${
      //     error instanceof Error ? error.message : String(error)
      //   }`
      // );
      res.status(500).json({
        error: "Internal Server Error",
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        statusCode: 500,
      });
    }
  }

  /**
   * Health check endpoint
   * GET /health
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      // await Log(
      //   "backend",
      //   "info",
      //   "controller",
      //   "Health check request received"
      // );

      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        service: "URL Shortener Microservice",
      });
    } catch (error) {
      // await Log(
      //   "backend",
      //   "error",
      //   "controller",
      //   `Health check failed: ${
      //     error instanceof Error ? error.message : String(error)
      //   }`
      // );
      res.status(500).json({
        status: "ERROR",
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      });
    }
  }

  /**
   * Receives logs from the frontend and forwards them to the Logging Middleware
   * POST /log
   */
  async logFromFrontend(req: Request, res: Response): Promise<void> {
    try {
      const { package: pkg, level, stack, message } = req.body;
      if (!pkg || !level || !stack || !message) {
        // await Log(
        //   "backend",
        //   "error",
        //   "controller",
        //   "Invalid log payload from frontend"
        // );
        res.status(400).json({ error: "Invalid log payload" });
        return;
      }
      // await Log(pkg, level, stack, message);
      res.status(200).json({ status: "ok" });
    } catch (error) {
      // await Log(
      //   "backend",
      //   "error",
      //   "controller",
      //   `Failed to process frontend log: ${
      //     error instanceof Error ? error.message : String(error)
      //   }`
      // );
      res.status(500).json({ error: "Failed to process log" });
    }
  }
}
