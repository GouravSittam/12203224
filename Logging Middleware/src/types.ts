/**
 * Type definitions for the Logging Middleware
 * Based on Affordmed evaluation requirements
 */

// Valid stack values
export type Stack = "backend" | "frontend";

// Valid level values
export type Level = "debug" | "info" | "warn" | "error" | "fatal";

// Valid package values for Backend applications
export type BackendPackage =
  | "cache"
  | "controller"
  | "cron_job"
  | "db"
  | "domain"
  | "handler"
  | "repository"
  | "route"
  | "service";

// Valid package values for Frontend applications
export type FrontendPackage =
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style";

// Valid package values for both Backend and Frontend applications
export type SharedPackage = "auth" | "config" | "middleware" | "utils";

// Union type for all valid packages
export type Package = BackendPackage | FrontendPackage | SharedPackage;

// Log request interface
export interface LogRequest {
  stack: Stack;
  level: Level;
  package: Package;
  message: string;
}

// Log response interface
export interface LogResponse {
  logID: string;
  message: string;
}

// Authentication credentials interface
export interface AuthCredentials {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
  mobileNo: string; // Added for registration
  githubUsername: string; // Added for registration
}

// Authentication response interface
export interface AuthResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
}

// Registration request interface
export interface RegistrationRequest {
  email: string;
  name: string;
  mobileNo: string;
  githubUsername: string;
  rollNo: string;
  accessCode: string;
}

// Registration response interface
export interface RegistrationResponse {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
}

// Configuration interface for the logger
export interface LoggerConfig {
  baseURL: string;
  authToken?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
