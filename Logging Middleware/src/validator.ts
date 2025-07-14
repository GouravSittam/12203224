/**
 * Validation module for logging middleware
 * Ensures all parameters meet Affordmed evaluation constraints
 */

import { Stack, Level, Package, ValidationResult } from "./types";

/**
 * Valid stack values as per requirements
 */
const VALID_STACKS: Stack[] = ["backend", "frontend"];

/**
 * Valid level values as per requirements
 */
const VALID_LEVELS: Level[] = ["debug", "info", "warn", "error", "fatal"];

/**
 * Valid package values for Backend applications
 */
const BACKEND_PACKAGES: Package[] = [
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
];

/**
 * Valid package values for Frontend applications
 */
const FRONTEND_PACKAGES: Package[] = [
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
];

/**
 * Valid package values for both Backend and Frontend applications
 */
const SHARED_PACKAGES: Package[] = ["auth", "config", "middleware", "utils"];

/**
 * All valid packages
 */
const ALL_PACKAGES: Package[] = [
  ...BACKEND_PACKAGES,
  ...FRONTEND_PACKAGES,
  ...SHARED_PACKAGES,
];

/**
 * Validates if a stack value is valid
 * @param stack - The stack to validate
 * @returns True if valid, false otherwise
 */
export function isValidStack(stack: string): stack is Stack {
  return VALID_STACKS.includes(stack as Stack);
}

/**
 * Validates if a level value is valid
 * @param level - The level to validate
 * @returns True if valid, false otherwise
 */
export function isValidLevel(level: string): level is Level {
  return VALID_LEVELS.includes(level as Level);
}

/**
 * Validates if a package value is valid
 * @param pkg - The package to validate
 * @returns True if valid, false otherwise
 */
export function isValidPackage(pkg: string): pkg is Package {
  return ALL_PACKAGES.includes(pkg as Package);
}

/**
 * Validates if a package is valid for a specific stack
 * @param stack - The stack context
 * @param pkg - The package to validate
 * @returns True if valid for the stack, false otherwise
 */
export function isValidPackageForStack(stack: Stack, pkg: Package): boolean {
  if (SHARED_PACKAGES.includes(pkg)) {
    return true; // Shared packages are valid for both stacks
  }

  if (stack === "backend") {
    return BACKEND_PACKAGES.includes(pkg);
  }

  if (stack === "frontend") {
    return FRONTEND_PACKAGES.includes(pkg);
  }

  return false;
}

/**
 * Validates all logging parameters according to requirements
 * @param stack - The stack value
 * @param level - The level value
 * @param pkg - The package value
 * @param message - The message value
 * @returns Validation result with errors if any
 */
export function validateLogParameters(
  stack: string,
  level: string,
  pkg: string,
  message: string
): ValidationResult {
  const errors: string[] = [];

  // Validate stack
  if (!isValidStack(stack)) {
    errors.push(
      `Invalid stack: "${stack}". Must be one of: ${VALID_STACKS.join(", ")}`
    );
  }

  // Validate level
  if (!isValidLevel(level)) {
    errors.push(
      `Invalid level: "${level}". Must be one of: ${VALID_LEVELS.join(", ")}`
    );
  }

  // Validate package
  if (!isValidPackage(pkg)) {
    errors.push(
      `Invalid package: "${pkg}". Must be one of: ${ALL_PACKAGES.join(", ")}`
    );
  }

  // Validate package compatibility with stack
  if (
    isValidStack(stack) &&
    isValidPackage(pkg) &&
    !isValidPackageForStack(stack, pkg)
  ) {
    errors.push(`Package "${pkg}" is not valid for stack "${stack}"`);
  }

  // Validate message
  if (!message || typeof message !== "string") {
    errors.push("Message must be a non-empty string");
  }

  if (message.length > 1000) {
    errors.push("Message must not exceed 1000 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Normalizes string values to lowercase as per requirements
 * @param value - The value to normalize
 * @returns Normalized lowercase value
 */
export function normalizeValue(value: string): string {
  return value.toLowerCase().trim();
}
