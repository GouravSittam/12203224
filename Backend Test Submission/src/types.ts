/**
 * Type definitions for URL Shortener Microservice
 */

// Request types
export interface CreateShortUrlRequest {
  url: string;
  validity?: number;
  shortcode?: string;
}

// Response types
export interface CreateShortUrlResponse {
  shortLink: string;
  expiry: string;
}

export interface ClickData {
  timestamp: string;
  referrer?: string;
  location?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface ShortUrlStatistics {
  shortcode: string;
  originalUrl: string;
  totalClicks: number;
  createdAt: string;
  expiryDate: string;
  clicks: ClickData[];
}

// Database models
export interface ShortUrl {
  id: string;
  shortcode: string;
  originalUrl: string;
  createdAt: Date;
  expiryDate: Date;
  isActive: boolean;
}

export interface Click {
  id: string;
  shortcode: string;
  timestamp: Date;
  referrer?: string;
  location?: string;
  userAgent?: string;
  ipAddress?: string;
}

// Configuration
export interface AppConfig {
  port: number;
  host: string;
  defaultValidity: number; // in minutes
  shortcodeLength: number;
  maxCustomShortcodeLength: number;
  allowedShortcodeChars: string;
}

// Error types
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Logger configuration
export interface LoggerConfig {
  baseURL: string;
  authToken?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface AuthCredentials {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
  mobileNo: string;
  githubUsername: string;
}
