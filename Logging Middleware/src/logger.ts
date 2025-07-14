/**
 * Main logging module for Affordmed evaluation
 * Implements the Log function that calls the test server API
 */

import axios, { AxiosInstance } from "axios";
import {
  Stack,
  Level,
  Package,
  LogRequest,
  LogResponse,
  LoggerConfig,
} from "./types";
import { validateLogParameters, normalizeValue } from "./validator";
import { AuthService } from "./auth";

/**
 * Main Logger class that handles all logging operations
 */
export class Logger {
  private readonly baseURL: string;
  private readonly axiosInstance: AxiosInstance;
  private readonly authService: AuthService;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;
  private isInitialized: boolean = false;

  constructor(config: LoggerConfig) {
    this.baseURL = config.baseURL;
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.authService = new AuthService(config);
  }

  /**
   * Initializes the logger with authentication credentials
   * @param credentials - Authentication credentials
   */
  async initialize(credentials: {
    email: string;
    name: string;
    rollNo: string;
    accessCode: string;
    clientID: string;
    clientSecret: string;
  }): Promise<void> {
    try {
      await this.authService.authenticate(credentials);
      this.isInitialized = true;
      console.log("Logger initialized successfully");
    } catch (error) {
      console.error("Failed to initialize logger:", error);
      throw error;
    }
  }

  /**
   * Main logging function as per requirements
   * Log(stack, level, package, message)
   * @param stack - The stack (backend/frontend)
   * @param level - The log level (debug/info/warn/error/fatal)
   * @param pkg - The package name
   * @param message - The log message
   * @returns Promise with log response
   */
  async Log(
    stack: string,
    level: string,
    pkg: string,
    message: string
  ): Promise<LogResponse> {
    // Normalize inputs to lowercase as per requirements
    const normalizedStack = normalizeValue(stack);
    const normalizedLevel = normalizeValue(level);
    const normalizedPackage = normalizeValue(pkg);

    // Validate parameters
    const validation = validateLogParameters(
      normalizedStack,
      normalizedLevel,
      normalizedPackage,
      message
    );

    if (!validation.isValid) {
      const errorMessage = `Logging validation failed: ${validation.errors.join(
        ", "
      )}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Ensure logger is initialized
    if (!this.isInitialized) {
      throw new Error("Logger not initialized. Call initialize() first.");
    }

    // Create log request
    const logRequest: LogRequest = {
      stack: normalizedStack as Stack,
      level: normalizedLevel as Level,
      package: normalizedPackage as Package,
      message: message.trim(),
    };

    // Send log to test server with retry logic
    return this.sendLogWithRetry(logRequest);
  }

  /**
   * Sends log request to test server with retry logic
   * @param logRequest - The log request to send
   * @returns Promise with log response
   */
  private async sendLogWithRetry(logRequest: LogRequest): Promise<LogResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        // Refresh token if needed
        if (!this.authService.isTokenValid()) {
          console.warn("Token expired, attempting to refresh...");
          // Note: In a real implementation, you'd need to store credentials
          // For now, we'll just try with the current token
        }

        // Get authorization header
        const authHeader = this.authService.getAuthorizationHeader();
        if (!authHeader) {
          throw new Error("No valid authentication token available");
        }

        // Make API call
        const response = await this.axiosInstance.post<LogResponse>(
          "/evaluation-service/logs",
          logRequest,
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );

        console.log(`Log sent successfully (attempt ${attempt}):`, {
          logID: response.data.logID,
          stack: logRequest.stack,
          level: logRequest.level,
          package: logRequest.package,
        });

        return response.data;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Log attempt ${attempt} failed:`, error);

        // Don't retry on validation errors
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          (error as any).response?.status === 400
        ) {
          throw error;
        }

        // Wait before retry (except on last attempt)
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt); // Exponential backoff
        }
      }
    }

    // All retries failed
    throw new Error(
      `Failed to send log after ${this.retryAttempts} attempts. Last error: ${lastError?.message}`
    );
  }

  /**
   * Utility function to delay execution
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Gets the current authentication status
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return this.isInitialized && this.authService.isTokenValid();
  }

  /**
   * Clears authentication and resets logger state
   */
  logout(): void {
    this.authService.clearToken();
    this.isInitialized = false;
    console.log("Logger logged out");
  }
}

/**
 * Global logger instance
 */
let globalLogger: Logger | null = null;

/**
 * Initialize the global logger
 * @param config - Logger configuration
 * @param credentials - Authentication credentials
 */
export async function initializeLogger(
  config: LoggerConfig,
  credentials: {
    email: string;
    name: string;
    rollNo: string;
    accessCode: string;
    clientID: string;
    clientSecret: string;
  }
): Promise<void> {
  globalLogger = new Logger(config);
  await globalLogger.initialize(credentials);
}

/**
 * Main Log function as specified in requirements
 * @param stack - The stack (backend/frontend)
 * @param level - The log level (debug/info/warn/error/fatal)
 * @param pkg - The package name
 * @param message - The log message
 * @returns Promise with log response
 */
export async function Log(
  stack: string,
  level: string,
  pkg: string,
  message: string
): Promise<LogResponse> {
  if (!globalLogger) {
    throw new Error("Logger not initialized. Call initializeLogger() first.");
  }

  return globalLogger.Log(stack, level, pkg, message);
}

/**
 * Gets the global logger instance
 * @returns Logger instance or null if not initialized
 */
export function getLogger(): Logger | null {
  return globalLogger;
}

/**
 * Logs a debug message
 * @param stack - The stack
 * @param pkg - The package
 * @param message - The message
 */
export async function logDebug(
  stack: string,
  pkg: string,
  message: string
): Promise<void> {
  try {
    await Log(stack, "debug", pkg, message);
  } catch (error) {
    console.error("Failed to log debug message:", error);
  }
}

/**
 * Logs an info message
 * @param stack - The stack
 * @param pkg - The package
 * @param message - The message
 */
export async function logInfo(
  stack: string,
  pkg: string,
  message: string
): Promise<void> {
  try {
    await Log(stack, "info", pkg, message);
  } catch (error) {
    console.error("Failed to log info message:", error);
  }
}

/**
 * Logs a warning message
 * @param stack - The stack
 * @param pkg - The package
 * @param message - The message
 */
export async function logWarn(
  stack: string,
  pkg: string,
  message: string
): Promise<void> {
  try {
    await Log(stack, "warn", pkg, message);
  } catch (error) {
    console.error("Failed to log warning message:", error);
  }
}

/**
 * Logs an error message
 * @param stack - The stack
 * @param pkg - The package
 * @param message - The message
 */
export async function logError(
  stack: string,
  pkg: string,
  message: string
): Promise<void> {
  try {
    await Log(stack, "error", pkg, message);
  } catch (error) {
    console.error("Failed to log error message:", error);
  }
}

/**
 * Logs a fatal message
 * @param stack - The stack
 * @param pkg - The package
 * @param message - The message
 */
export async function logFatal(
  stack: string,
  pkg: string,
  message: string
): Promise<void> {
  try {
    await Log(stack, "fatal", pkg, message);
  } catch (error) {
    console.error("Failed to log fatal message:", error);
  }
}
