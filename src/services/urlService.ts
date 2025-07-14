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

const shortUrls = new Map<string, ShortUrl>();
const clicks = new Map<string, Click[]>();

export class UrlService {
  async createShortUrl(
    request: CreateShortUrlRequest
  ): Promise<CreateShortUrlResponse> {
    let shortcode: string;
    if (request.shortcode && request.shortcode.trim() !== "") {
      shortcode = request.shortcode.trim();
      if (shortUrls.has(shortcode)) {
        throw new Error("Shortcode already exists");
      }
    } else {
      do {
        shortcode = generateShortcode();
      } while (shortUrls.has(shortcode));
    }
    const validity = request.validity || appConfig.defaultValidity;
    const expiryDate = new Date(Date.now() + validity * 60 * 1000);
    const shortUrl: ShortUrl = {
      id: uuidv4(),
      shortcode,
      originalUrl: request.url,
      createdAt: new Date(),
      expiryDate,
      isActive: true,
    };
    shortUrls.set(shortcode, shortUrl);
    clicks.set(shortcode, []);
    return {
      shortLink: `http://${appConfig.host}:${appConfig.port}/${shortcode}`,
      expiry: expiryDate.toISOString(),
    };
  }

  async getShortUrlStats(
    shortcode: string
  ): Promise<ShortUrlStatistics | null> {
    const shortUrl = shortUrls.get(shortcode);
    if (!shortUrl) return null;
    const clickList = clicks.get(shortcode) || [];
    return {
      shortcode: shortUrl.shortcode,
      originalUrl: shortUrl.originalUrl,
      totalClicks: clickList.length,
      createdAt: shortUrl.createdAt,
      expiryDate: shortUrl.expiryDate,
      clicks: clickList,
    };
  }

  async getOriginalUrl(shortcode: string): Promise<string | null> {
    const shortUrl = shortUrls.get(shortcode);
    if (!shortUrl || !shortUrl.isActive || shortUrl.expiryDate < new Date()) {
      return null;
    }
    return shortUrl.originalUrl;
  }

  async recordClick(shortcode: string, clientInfo: any): Promise<void> {
    const shortUrl = shortUrls.get(shortcode);
    if (!shortUrl) return;
    const click: Click = {
      timestamp: new Date(),
      referrer: clientInfo.referrer || "",
      location: getLocationFromIP(clientInfo.ipAddress),
      userAgent: clientInfo.userAgent,
      ipAddress: clientInfo.ipAddress,
    };
    const clickList = clicks.get(shortcode) || [];
    clickList.push(click);
    clicks.set(shortcode, clickList);
  }
}
