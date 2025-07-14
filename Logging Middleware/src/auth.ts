/**
 * Authentication module for logging middleware
 * Handles registration and token management for Affordmed test server
 */

import axios, { AxiosInstance } from "axios";
import {
  AuthCredentials,
  AuthResponse,
  RegistrationRequest,
  RegistrationResponse,
  LoggerConfig,
} from "./types";

/**
 * Authentication service for managing test server credentials
 */
export class AuthService {
  private readonly baseURL: string;
  private readonly axiosInstance: AxiosInstance;
  private authToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(config: LoggerConfig) {
    this.baseURL = config.baseURL;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Set initial auth token if provided
    if (config.authToken) {
      this.authToken = config.authToken;
    }
  }

  /**
   * Registers with the test server to obtain client credentials
   * @param registrationData - Registration information
   * @returns Promise with client credentials
   */
  async register(
    registrationData: RegistrationRequest
  ): Promise<RegistrationResponse> {
    try {
      console.log("Registering with test server...");

      const response = await this.axiosInstance.post<RegistrationResponse>(
        "/register",
        registrationData
      );

      console.log("Registration successful");
      return response.data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw new Error(`Registration failed: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Authenticates with the test server to obtain access token
   * @param credentials - Authentication credentials
   * @returns Promise with authentication response
   */
  async authenticate(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      console.log("Authenticating with test server...");

      const response = await this.axiosInstance.post<AuthResponse>(
        "/auth",
        credentials
      );

      const authData = response.data;

      // Store token and calculate expiry
      this.authToken = authData.access_token;
      this.tokenExpiry = Date.now() + authData.expires_in * 1000;

      console.log("Authentication successful");
      return authData;
    } catch (error) {
      console.error("Authentication failed:", error);
      throw new Error(`Authentication failed: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Gets the current authentication token
   * @returns Current auth token or null if not available
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Checks if the current token is valid and not expired
   * @returns True if token is valid, false otherwise
   */
  isTokenValid(): boolean {
    if (!this.authToken || !this.tokenExpiry) {
      return false;
    }

    // Add 5 minute buffer before expiry
    return Date.now() < this.tokenExpiry - 300000;
  }

  /**
   * Refreshes the authentication token if needed
   * @param credentials - Authentication credentials for refresh
   * @returns Promise that resolves when token is refreshed
   */
  async refreshTokenIfNeeded(credentials: AuthCredentials): Promise<void> {
    if (!this.isTokenValid()) {
      console.log("Token expired or invalid, refreshing...");
      await this.authenticate(credentials);
    }
  }

  /**
   * Clears the current authentication token
   */
  clearToken(): void {
    this.authToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Gets authorization header for API requests
   * @returns Authorization header string or null if no token
   */
  getAuthorizationHeader(): string | null {
    if (!this.authToken) {
      return null;
    }
    return `Bearer ${this.authToken}`;
  }

  /**
   * Extracts error message from axios error
   * @param error - The error object
   * @returns Formatted error message
   */
  private getErrorMessage(error: any): string {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      if (data && data.message) {
        return `Status ${status}: ${data.message}`;
      }

      return `Status ${status}: ${error.response.statusText}`;
    } else if (error.request) {
      // Request was made but no response received
      return "No response received from server";
    } else {
      // Something else happened
      return error.message || "Unknown error occurred";
    }
  }
}

/**
 * Helper function to create registration request
 * @param email - User email
 * @param name - User name
 * @param mobileNo - Mobile number
 * @param githubUsername - GitHub username
 * @param rollNo - Roll number
 * @param accessCode - Access code from email
 * @returns Registration request object
 */
export function createRegistrationRequest(
  email: string,
  name: string,
  mobileNo: string,
  githubUsername: string,
  rollNo: string,
  accessCode: string
): RegistrationRequest {
  return {
    email: email.toLowerCase().trim(),
    name: name.trim(),
    mobileNo: mobileNo.trim(),
    githubUsername: githubUsername.toLowerCase().trim(),
    rollNo: rollNo.toLowerCase().trim(),
    accessCode: accessCode.trim(),
  };
}

/**
 * Helper function to create auth credentials
 * @param email - User email
 * @param name - User name
 * @param rollNo - Roll number
 * @param accessCode - Access code
 * @param clientID - Client ID from registration
 * @param clientSecret - Client secret from registration
 * @returns Auth credentials object
 */
export function createAuthCredentials(
  email: string,
  name: string,
  rollNo: string,
  accessCode: string,
  clientID: string,
  clientSecret: string
): AuthCredentials {
  return {
    email: email.toLowerCase().trim(),
    name: name.trim(),
    rollNo: rollNo.toLowerCase().trim(),
    accessCode: accessCode.trim(),
    clientID: clientID.trim(),
    clientSecret: clientSecret.trim(),
  };
}
