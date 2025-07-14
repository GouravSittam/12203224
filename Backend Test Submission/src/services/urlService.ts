/**
 * URL Service - Business logic for URL shortening operations
 */

import { v4 as uuidv4 } from "uuid";
import {
  ShortUrl,
  Click,
  CreateShortUrlRequest,
  CreateShortUrlResponse,
  ShortUrlStatistics,
} from "../types";
import { appConfig } from "../config";
import { generateShortcode, isValidShortcode } from "../utils/validation";
import { getLocationFromIP } from "../utils/geoLocation";
import { Log } from "logging-middleware";

// In-memory storage (in production, this would be a database)
const shortUrls = new Map<string, ShortUrl>();
const clicks = new Map<string, Click[]>();

/**
 * URL Service class
 */
export class UrlService {
  /**
   * Creates a new short URL
   * @param request - The create short URL request
   * @returns Promise with the created short URL response
   */
  async createShortUrl(
    request: CreateShortUrlRequest
  ): Promise<CreateShortUrlResponse> {
    try {
      await Log(
        "backend",
        "info",
        "service",
        `Creating short URL for: ${request.url}`
      );

      // Generate or validate shortcode
      let shortcode: string;

      if (request.shortcode && request.shortcode.trim() !== "") {
        // Use custom shortcode
        shortcode = request.shortcode.trim();

        // Check if shortcode already exists
        if (shortUrls.has(shortcode)) {
          await Log(
            "backend",
            "error",
            "service",
            `Shortcode already exists: ${shortcode}`
          );
          throw new Error("Shortcode already exists");
        }

        await Log(
          "backend",
          "info",
          "service",
          `Using custom shortcode: ${shortcode}`
        );
      } else {
        // Generate unique shortcode
        do {
          shortcode = generateShortcode();
        } while (shortUrls.has(shortcode));

        await Log(
          "backend",
          "info",
          "service",
          `Generated shortcode: ${shortcode}`
        );
      }

      // Calculate expiry date
      const validity = request.validity || appConfig.defaultValidity;
      const expiryDate = new Date(Date.now() + validity * 60 * 1000);

      // Create short URL record
      const shortUrl: ShortUrl = {
        id: uuidv4(),
        shortcode,
        originalUrl: request.url,
        createdAt: new Date(),
        expiryDate,
        isActive: true,
      };

      // Store the short URL
      shortUrls.set(shortcode, shortUrl);
      clicks.set(shortcode, []);

      await Log(
        "backend",
        "info",
        "service",
        `Short URL created successfully: ${shortcode}`
      );

      return {
        shortLink: `http://${appConfig.host}:${appConfig.port}/${shortcode}`,
        expiry: expiryDate.toISOString(),
      };
    } catch (error) {
      await Log(
        "backend",
        "error",
        "service",
        `Failed to create short URL: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Gets the original URL for a shortcode
   * @param shortcode - The shortcode to lookup
   * @returns Promise with the original URL or null if not found
   */
  async getOriginalUrl(shortcode: string): Promise<string | null> {
    try {
      await Log(
        "backend",
        "info",
        "service",
        `Looking up original URL for shortcode: ${shortcode}`
      );

      const shortUrl = shortUrls.get(shortcode);

      if (!shortUrl) {
        await Log(
          "backend",
          "warn",
          "service",
          `Shortcode not found: ${shortcode}`
        );
        return null;
      }

      // Check if URL has expired
      if (new Date() > shortUrl.expiryDate) {
        await Log(
          "backend",
          "warn",
          "service",
          `Short URL expired: ${shortcode}`
        );
        shortUrl.isActive = false;
        return null;
      }

      await Log(
        "backend",
        "info",
        "service",
        `Original URL found for shortcode: ${shortcode}`
      );
      return shortUrl.originalUrl;
    } catch (error) {
      await Log(
        "backend",
        "error",
        "service",
        `Failed to get original URL: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Records a click for a shortcode
   * @param shortcode - The shortcode that was clicked
   * @param clientInfo - Client information
   * @returns Promise that resolves when click is recorded
   */
  async recordClick(
    shortcode: string,
    clientInfo: {
      ipAddress: string;
      userAgent: string;
      referrer?: string;
    }
  ): Promise<void> {
    try {
      await Log(
        "backend",
        "info",
        "service",
        `Recording click for shortcode: ${shortcode}`
      );

      const shortUrl = shortUrls.get(shortcode);
      if (!shortUrl) {
        await Log(
          "backend",
          "warn",
          "service",
          `Cannot record click - shortcode not found: ${shortcode}`
        );
        return;
      }

      // Get location from IP
      const location = getLocationFromIP(clientInfo.ipAddress);

      // Create click record
      const click: Click = {
        id: uuidv4(),
        shortcode,
        timestamp: new Date(),
        referrer: clientInfo.referrer,
        location: location || "Unknown",
        userAgent: clientInfo.userAgent,
        ipAddress: clientInfo.ipAddress,
      };

      // Store click
      const shortcodeClicks = clicks.get(shortcode) || [];
      shortcodeClicks.push(click);
      clicks.set(shortcode, shortcodeClicks);

      await Log(
        "backend",
        "info",
        "service",
        `Click recorded successfully for shortcode: ${shortcode}`
      );
    } catch (error) {
      await Log(
        "backend",
        "error",
        "service",
        `Failed to record click: ${error instanceof Error ? error.message : String(error)}`
      );
      // Don't throw error for click recording failures
    }
  }

  /**
   * Gets statistics for a shortcode
   * @param shortcode - The shortcode to get statistics for
   * @returns Promise with the statistics or null if not found
   */
  async getStatistics(shortcode: string): Promise<ShortUrlStatistics | null> {
    try {
      await Log(
        "backend",
        "info",
        "service",
        `Getting statistics for shortcode: ${shortcode}`
      );

      const shortUrl = shortUrls.get(shortcode);
      if (!shortUrl) {
        await Log(
          "backend",
          "warn",
          "service",
          `Statistics requested for non-existent shortcode: ${shortcode}`
        );
        return null;
      }

      const shortcodeClicks = clicks.get(shortcode) || [];

      // Convert clicks to the required format
      const clickData = shortcodeClicks.map((click) => ({
        timestamp: click.timestamp.toISOString(),
        referrer: click.referrer,
        location: click.location,
        userAgent: click.userAgent,
        ipAddress: click.ipAddress,
      }));

      const statistics: ShortUrlStatistics = {
        shortcode,
        originalUrl: shortUrl.originalUrl,
        totalClicks: shortcodeClicks.length,
        createdAt: shortUrl.createdAt.toISOString(),
        expiryDate: shortUrl.expiryDate.toISOString(),
        clicks: clickData,
      };

      await Log(
        "backend",
        "info",
        "service",
        `Statistics retrieved for shortcode: ${shortcode}, total clicks: ${shortcodeClicks.length}`
      );
      return statistics;
    } catch (error) {
      await Log(
        "backend",
        "error",
        "service",
        `Failed to get statistics: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Checks if a shortcode exists
   * @param shortcode - The shortcode to check
   * @returns True if exists, false otherwise
   */
  async shortcodeExists(shortcode: string): Promise<boolean> {
    return shortUrls.has(shortcode);
  }

  /**
   * Cleans up expired URLs (utility method)
   */
  async cleanupExpiredUrls(): Promise<void> {
    try {
      const now = new Date();
      let cleanedCount = 0;

      for (const [shortcode, shortUrl] of shortUrls.entries()) {
        if (now > shortUrl.expiryDate && shortUrl.isActive) {
          shortUrl.isActive = false;
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        await Log(
          "backend",
          "info",
          "service",
          `Cleaned up ${cleanedCount} expired URLs`
        );
      }
    } catch (error) {
      await Log(
        "backend",
        "error",
        "service",
        `Failed to cleanup expired URLs: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
