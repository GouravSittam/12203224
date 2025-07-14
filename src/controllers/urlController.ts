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

  async createShortUrl(req: Request, res: Response): Promise<void> {
    try {
      const request = req.body;
      const validation = validateCreateShortUrlRequest(request);
      if (!validation.isValid) {
        res.status(400).json({
          error: "Validation Error",
          message: validation.errors.join(", "),
          statusCode: 400,
        });
        return;
      }
      if (request.shortcode) {
        const exists = await this.urlService.shortcodeExists(request.shortcode);
        if (exists) {
          res.status(409).json({
            error: "Conflict",
            message: ERROR_MESSAGES.SHORTCODE_ALREADY_EXISTS,
            statusCode: 409,
          });
          return;
        }
      }
      const result = await this.urlService.createShortUrl(request);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        statusCode: 500,
      });
    }
  }

  async getShortUrlStats(req: Request, res: Response): Promise<void> {
    try {
      const { shortcode } = req.params;
      const stats = await this.urlService.getShortUrlStats(shortcode);
      if (!stats) {
        res.status(404).json({
          error: "Not Found",
          message: ERROR_MESSAGES.URL_NOT_FOUND,
          statusCode: 404,
        });
        return;
      }
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        statusCode: 500,
      });
    }
  }

  async redirectToOriginalUrl(req: Request, res: Response): Promise<void> {
    try {
      const { shortcode } = req.params;
      const originalUrl = await this.urlService.getOriginalUrl(shortcode);
      if (!originalUrl) {
        res.status(404).json({
          error: "Not Found",
          message: ERROR_MESSAGES.URL_NOT_FOUND,
          statusCode: 404,
        });
        return;
      }
      const clientInfo = extractClientInfo(req);
      this.urlService.recordClick(shortcode, clientInfo).catch(() => {});
      res.redirect(originalUrl);
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        statusCode: 500,
      });
    }
  }
}
