/**
 * Application configuration
 */

import { AppConfig, LoggerConfig, AuthCredentials } from "./types";

// Application configuration
export const appConfig: AppConfig = {
  port: parseInt(process.env.PORT || "3001", 10),
  host: process.env.HOST || "localhost",
  defaultValidity: 30, // 30 minutes as per requirements
  shortcodeLength: 6,
  maxCustomShortcodeLength: 20,
  allowedShortcodeChars:
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
};

// Logger configuration
export const loggerConfig: LoggerConfig = {
  baseURL: "http://20.244.56.144",
  retryAttempts: 3,
  retryDelay: 1000,
};

// Authentication credentials (to be replaced with actual values)
export const authCredentials: AuthCredentials = {
  email: "gourav@lpu.in",
  name: "gourav",
  rollNo: "12203224",
  accessCode: "CZypQK",
  clientID: "c5cd716f-2273-456f-b144-42036577b35b",
  clientSecret: "nPVsgzumsVSvsykP",
  mobileNo: "7018389510",
  githubUsername: "gouravsittam",
};

// Environment variables
export const isDevelopment = process.env.NODE_ENV === "development";
export const isProduction = process.env.NODE_ENV === "production";

// Validation constants
export const URL_REGEX = /^https?:\/\/.+/;
export const SHORTCODE_REGEX = /^[a-zA-Z0-9]+$/;

// Error messages
export const ERROR_MESSAGES = {
  INVALID_URL: "Invalid URL format. URL must start with http:// or https://",
  INVALID_SHORTCODE:
    "Invalid shortcode format. Only alphanumeric characters are allowed",
  SHORTCODE_TOO_LONG: "Shortcode is too long. Maximum length is 20 characters",
  SHORTCODE_ALREADY_EXISTS:
    "Shortcode already exists. Please choose a different one",
  URL_NOT_FOUND: "Short URL not found",
  URL_EXPIRED: "Short URL has expired",
  INVALID_VALIDITY: "Validity must be a positive integer",
  VALIDITY_TOO_LONG: "Validity cannot exceed 24 hours (1440 minutes)",
  MISSING_URL: "URL is required",
  INTERNAL_ERROR: "Internal server error",
} as const;
