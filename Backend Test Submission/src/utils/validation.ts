/**
 * Validation utilities for URL Shortener Microservice
 */

import { CreateShortUrlRequest, ValidationResult } from "../types";
import {
  URL_REGEX,
  SHORTCODE_REGEX,
  ERROR_MESSAGES,
  appConfig,
} from "../config";

/**
 * Validates a URL format
 * @param url - The URL to validate
 * @returns True if valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    new URL(url);
    return URL_REGEX.test(url);
  } catch {
    return false;
  }
}

/**
 * Validates a shortcode format
 * @param shortcode - The shortcode to validate
 * @returns True if valid, false otherwise
 */
export function isValidShortcode(shortcode: string): boolean {
  if (!shortcode || typeof shortcode !== "string") {
    return false;
  }

  return (
    SHORTCODE_REGEX.test(shortcode) &&
    shortcode.length <= appConfig.maxCustomShortcodeLength
  );
}

/**
 * Validates validity duration
 * @param validity - The validity in minutes
 * @returns True if valid, false otherwise
 */
export function isValidValidity(validity: number): boolean {
  return typeof validity === "number" && validity > 0 && validity <= 1440; // 24 hours max
}

/**
 * Validates the complete create short URL request
 * @param request - The request object to validate
 * @returns Validation result with errors if any
 */
export function validateCreateShortUrlRequest(
  request: CreateShortUrlRequest
): ValidationResult {
  const errors: string[] = [];

  // Validate URL
  if (!request.url) {
    errors.push(ERROR_MESSAGES.MISSING_URL);
  } else if (!isValidUrl(request.url)) {
    errors.push(ERROR_MESSAGES.INVALID_URL);
  }

  // Validate validity if provided
  if (request.validity !== undefined) {
    if (!isValidValidity(request.validity)) {
      if (request.validity <= 0) {
        errors.push(ERROR_MESSAGES.INVALID_VALIDITY);
      } else {
        errors.push(ERROR_MESSAGES.VALIDITY_TOO_LONG);
      }
    }
  }

  // Validate shortcode if provided
  if (request.shortcode !== undefined && request.shortcode !== "") {
    if (!isValidShortcode(request.shortcode)) {
      if (request.shortcode.length > appConfig.maxCustomShortcodeLength) {
        errors.push(ERROR_MESSAGES.SHORTCODE_TOO_LONG);
      } else {
        errors.push(ERROR_MESSAGES.INVALID_SHORTCODE);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generates a random shortcode
 * @param length - The length of the shortcode to generate
 * @returns A random shortcode
 */
export function generateShortcode(
  length: number = appConfig.shortcodeLength
): string {
  const chars = appConfig.allowedShortcodeChars;
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Extracts client information from request
 * @param req - Express request object
 * @returns Object with client information
 */
export function extractClientInfo(req: any): {
  ipAddress: string;
  userAgent: string;
  referrer?: string;
} {
  return {
    ipAddress:
      req.ip ||
      req.connection.remoteAddress ||
      req.headers["x-forwarded-for"] ||
      "unknown",
    userAgent: req.headers["user-agent"] || "unknown",
    referrer: req.headers.referer || req.headers.referrer,
  };
}
