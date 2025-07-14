/**
 * Test file for validation functionality
 * Demonstrates all the validation constraints for the logging middleware
 */

import {
  validateLogParameters,
  normalizeValue,
  isValidStack,
  isValidLevel,
  isValidPackage,
  isValidPackageForStack,
} from "./validator";

/**
 * Test validation functions
 */
function runValidationTests() {
  console.log("=== Validation Tests ===\n");

  // Test 1: Valid parameters
  console.log("Test 1: Valid parameters");
  const validResult = validateLogParameters(
    "backend",
    "info",
    "handler",
    "Valid log message"
  );
  console.log("Result:", validResult);
  console.log("Is valid:", validResult.isValid);
  console.log();

  // Test 2: Invalid stack
  console.log("Test 2: Invalid stack");
  const invalidStackResult = validateLogParameters(
    "mobile",
    "info",
    "handler",
    "Invalid stack"
  );
  console.log("Result:", invalidStackResult);
  console.log("Is valid:", invalidStackResult.isValid);
  console.log("Errors:", invalidStackResult.errors);
  console.log();

  // Test 3: Invalid level
  console.log("Test 3: Invalid level");
  const invalidLevelResult = validateLogParameters(
    "backend",
    "critical",
    "handler",
    "Invalid level"
  );
  console.log("Result:", invalidLevelResult);
  console.log("Is valid:", invalidLevelResult.isValid);
  console.log("Errors:", invalidLevelResult.errors);
  console.log();

  // Test 4: Invalid package for stack
  console.log("Test 4: Invalid package for stack");
  const invalidPackageResult = validateLogParameters(
    "frontend",
    "error",
    "db",
    "Invalid package for frontend"
  );
  console.log("Result:", invalidPackageResult);
  console.log("Is valid:", invalidPackageResult.isValid);
  console.log("Errors:", invalidPackageResult.errors);
  console.log();

  // Test 5: Empty message
  console.log("Test 5: Empty message");
  const emptyMessageResult = validateLogParameters(
    "backend",
    "info",
    "handler",
    ""
  );
  console.log("Result:", emptyMessageResult);
  console.log("Is valid:", emptyMessageResult.isValid);
  console.log("Errors:", emptyMessageResult.errors);
  console.log();

  // Test 6: Case sensitivity (should be normalized)
  console.log("Test 6: Case sensitivity");
  const caseResult = validateLogParameters(
    "BACKEND",
    "INFO",
    "HANDLER",
    "Uppercase parameters"
  );
  console.log("Result:", caseResult);
  console.log("Is valid:", caseResult.isValid);
  console.log();

  // Test 7: Shared packages
  console.log("Test 7: Shared packages");
  const sharedBackendResult = validateLogParameters(
    "backend",
    "info",
    "utils",
    "Shared package in backend"
  );
  const sharedFrontendResult = validateLogParameters(
    "frontend",
    "info",
    "utils",
    "Shared package in frontend"
  );
  console.log("Backend with utils:", sharedBackendResult.isValid);
  console.log("Frontend with utils:", sharedFrontendResult.isValid);
  console.log();

  // Test 8: Individual validation functions
  console.log("Test 8: Individual validation functions");
  console.log('isValidStack("backend"):', isValidStack("backend"));
  console.log('isValidStack("mobile"):', isValidStack("mobile"));
  console.log('isValidLevel("info"):', isValidLevel("info"));
  console.log('isValidLevel("critical"):', isValidLevel("critical"));
  console.log('isValidPackage("handler"):', isValidPackage("handler"));
  console.log('isValidPackage("invalid"):', isValidPackage("invalid"));
  console.log();

  // Test 9: Package compatibility
  console.log("Test 9: Package compatibility");
  console.log(
    'isValidPackageForStack("backend", "db"):',
    isValidPackageForStack("backend", "db")
  );
  console.log(
    'isValidPackageForStack("frontend", "db"):',
    isValidPackageForStack("frontend", "db")
  );
  console.log(
    'isValidPackageForStack("backend", "component"):',
    isValidPackageForStack("backend", "component")
  );
  console.log(
    'isValidPackageForStack("frontend", "component"):',
    isValidPackageForStack("frontend", "component")
  );
  console.log(
    'isValidPackageForStack("backend", "utils"):',
    isValidPackageForStack("backend", "utils")
  );
  console.log(
    'isValidPackageForStack("frontend", "utils"):',
    isValidPackageForStack("frontend", "utils")
  );
  console.log();

  // Test 10: Normalization
  console.log("Test 10: Normalization");
  console.log(
    'normalizeValue("  BACKEND  "):',
    `"${normalizeValue("  BACKEND  ")}"`
  );
  console.log('normalizeValue("  INFO  "):', `"${normalizeValue("  INFO  ")}"`);
  console.log(
    'normalizeValue("  HANDLER  "):',
    `"${normalizeValue("  HANDLER  ")}"`
  );
  console.log();

  console.log("=== All validation tests completed ===");
}

/**
 * Test all valid combinations
 */
function testValidCombinations() {
  console.log("=== Testing Valid Combinations ===\n");

  const validStacks = ["backend", "frontend"];
  const validLevels = ["debug", "info", "warn", "error", "fatal"];
  const validBackendPackages = [
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
  const validFrontendPackages = [
    "api",
    "component",
    "hook",
    "page",
    "state",
    "style",
  ];
  const validSharedPackages = ["auth", "config", "middleware", "utils"];

  let totalTests = 0;
  let passedTests = 0;

  // Test backend packages
  for (const stack of validStacks) {
    for (const level of validLevels) {
      if (stack === "backend") {
        for (const pkg of [...validBackendPackages, ...validSharedPackages]) {
          totalTests++;
          const result = validateLogParameters(
            stack,
            level,
            pkg,
            "Test message"
          );
          if (result.isValid) {
            passedTests++;
          } else {
            console.log(
              `Failed: ${stack}, ${level}, ${pkg} - ${result.errors.join(", ")}`
            );
          }
        }
      } else {
        for (const pkg of [...validFrontendPackages, ...validSharedPackages]) {
          totalTests++;
          const result = validateLogParameters(
            stack,
            level,
            pkg,
            "Test message"
          );
          if (result.isValid) {
            passedTests++;
          } else {
            console.log(
              `Failed: ${stack}, ${level}, ${pkg} - ${result.errors.join(", ")}`
            );
          }
        }
      }
    }
  }

  console.log(`\nResults: ${passedTests}/${totalTests} tests passed`);
  console.log(
    `Success rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`
  );
}

// Run tests if this file is executed directly
if (require.main === module) {
  runValidationTests();
  console.log("\n" + "=".repeat(50) + "\n");
  testValidCombinations();
}

export { runValidationTests, testValidCombinations };
