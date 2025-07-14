/**
 * Example usage of the Logging Middleware
 * Demonstrates various scenarios for Affordmed evaluation
 */

import {
  initializeLogger,
  Log,
  logDebug,
  logInfo,
  logWarn,
  logError,
  logFatal,
  createRegistrationRequest,
  createAuthCredentials,
  AuthService,
} from "./src";

// Example configuration
const config = {
  baseURL: "http://20.244.56.144",
  retryAttempts: 3,
  retryDelay: 1000,
};

// Example credentials (replace with your actual values)
const credentials = {
  email: "your.email@university.edu",
  name: "Your Name",
  rollNo: "your_roll_number",
  accessCode: "your_access_code",
  clientID: "your_client_id",
  clientSecret: "your_client_secret",
};

/**
 * Example 1: Basic initialization and logging
 */
async function basicExample() {
  try {
    // Initialize the logger
    await initializeLogger(config, credentials);
    console.log("Logger initialized successfully");

    // Basic logging examples
    await Log("backend", "info", "handler", "Application started successfully");
    await Log(
      "frontend",
      "debug",
      "component",
      "UserProfile component rendered"
    );
    await Log("backend", "warn", "service", "Rate limit approaching threshold");
  } catch (error) {
    console.error("Basic example failed:", error);
  }
}

/**
 * Example 2: Backend application logging
 */
async function backendExample() {
  try {
    // Simulate a backend request handler
    await Log(
      "backend",
      "info",
      "handler",
      "Processing user authentication request"
    );

    // Simulate database operation
    try {
      // Simulate successful database connection
      await Log("backend", "info", "db", "Database connection established");

      // Simulate data retrieval
      await Log(
        "backend",
        "debug",
        "repository",
        "Fetching user data from database"
      );

      // Simulate successful operation
      await Log(
        "backend",
        "info",
        "service",
        "User authentication completed successfully"
      );
    } catch (dbError) {
      // Simulate database error
      await Log(
        "backend",
        "error",
        "db",
        "Database connection failed: timeout"
      );
      await Log(
        "backend",
        "fatal",
        "db",
        "Critical database connection failure"
      );
      throw dbError;
    }
  } catch (error) {
    await Log(
      "backend",
      "error",
      "handler",
      `Request processing failed: ${error.message}`
    );
  }
}

/**
 * Example 3: Frontend application logging
 */
async function frontendExample() {
  try {
    // Simulate React component lifecycle
    await Log("frontend", "info", "component", "UserProfile component mounted");

    // Simulate API call
    try {
      await Log(
        "frontend",
        "debug",
        "api",
        "Initiating user data fetch request"
      );

      // Simulate successful API response
      await Log("frontend", "info", "api", "User data fetched successfully");

      // Simulate state update
      await Log(
        "frontend",
        "debug",
        "state",
        "User profile state updated with new data"
      );
    } catch (apiError) {
      await Log(
        "frontend",
        "error",
        "api",
        `API request failed: ${apiError.message}`
      );
    }

    // Simulate component unmount
    await Log(
      "frontend",
      "info",
      "component",
      "UserProfile component unmounted"
    );
  } catch (error) {
    await Log(
      "frontend",
      "error",
      "component",
      `Component error: ${error.message}`
    );
  }
}

/**
 * Example 4: Using convenience functions
 */
async function convenienceExample() {
  try {
    // Using convenience functions for different log levels
    await logDebug("backend", "handler", "Processing request parameters");
    await logInfo("frontend", "page", "Home page loaded successfully");
    await logWarn("backend", "service", "High memory usage detected");
    await logError("backend", "db", "Database query timeout");
    await logFatal("backend", "db", "Database connection pool exhausted");
  } catch (error) {
    console.error("Convenience example failed:", error);
  }
}

/**
 * Example 5: Error handling and validation
 */
async function errorHandlingExample() {
  try {
    // This will throw a validation error (invalid package for frontend)
    await Log("frontend", "error", "db", "This should fail validation");
  } catch (error) {
    console.log("Expected validation error:", error.message);
  }

  try {
    // This will throw a validation error (invalid level)
    await Log("backend", "critical", "handler", "This should fail validation");
  } catch (error) {
    console.log("Expected validation error:", error.message);
  }

  try {
    // This will throw a validation error (invalid stack)
    await Log("mobile", "error", "handler", "This should fail validation");
  } catch (error) {
    console.log("Expected validation error:", error.message);
  }
}

/**
 * Example 6: Registration and authentication flow
 */
async function registrationExample() {
  try {
    const authService = new AuthService(config);

    // Create registration request
    const registrationData = createRegistrationRequest(
      "student@university.edu",
      "Student Name",
      "9999999999",
      "githubusername",
      "roll123",
      "accessCode123"
    );

    console.log("Registration data:", registrationData);

    // Note: In real usage, you would call authService.register(registrationData)
    // and then use the returned clientID and clientSecret for authentication

    // Create auth credentials (using example values)
    const authData = createAuthCredentials(
      "student@university.edu",
      "Student Name",
      "roll123",
      "accessCode123",
      "example-client-id",
      "example-client-secret"
    );

    console.log("Auth data:", authData);
  } catch (error) {
    console.error("Registration example failed:", error);
  }
}

/**
 * Main function to run all examples
 */
async function runExamples() {
  console.log("=== Logging Middleware Examples ===\n");

  console.log("1. Basic Example:");
  await basicExample();
  console.log();

  console.log("2. Backend Example:");
  await backendExample();
  console.log();

  console.log("3. Frontend Example:");
  await frontendExample();
  console.log();

  console.log("4. Convenience Functions Example:");
  await convenienceExample();
  console.log();

  console.log("5. Error Handling Example:");
  await errorHandlingExample();
  console.log();

  console.log("6. Registration Example:");
  await registrationExample();
  console.log();

  console.log("All examples completed!");
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

export {
  basicExample,
  backendExample,
  frontendExample,
  convenienceExample,
  errorHandlingExample,
  registrationExample,
  runExamples,
};
