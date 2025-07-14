# Logging Middleware for Affordmed Evaluation

A reusable logging middleware package that implements the required `Log(stack, level, package, message)` function for the Afford Medical Technologies Private Limited campus hiring evaluation.

## Features

- ✅ **Strict Validation**: Enforces all constraints specified in the evaluation requirements
- ✅ **Authentication**: Handles registration and token management for the test server
- ✅ **Retry Logic**: Implements exponential backoff for failed API calls
- ✅ **TypeScript Support**: Full type safety with comprehensive type definitions
- ✅ **Production Ready**: Error handling, logging, and best practices
- ✅ **Reusable**: Can be used in both backend and frontend applications

## Installation

```bash
npm install
npm run build
```

## Quick Start

### 1. Initialize the Logger

```typescript
import { initializeLogger, Log } from "./dist";

// Initialize with your credentials
await initializeLogger(
  {
    baseURL: "http://20.244.56.144",
    retryAttempts: 3,
    retryDelay: 1000,
  },
  {
    email: "your.email@university.edu",
    name: "Your Name",
    rollNo: "your_roll_number",
    accessCode: "your_access_code",
    clientID: "your_client_id",
    clientSecret: "your_client_secret",
  }
);
```

### 2. Use the Log Function

```typescript
// Basic usage
await Log("backend", "info", "handler", "User authentication successful");

// Error logging
await Log("backend", "error", "db", "Database connection failed");

// Debug logging
await Log("frontend", "debug", "component", "Component state updated");
```

## API Reference

### Main Functions

#### `Log(stack, level, package, message)`

The main logging function as specified in the requirements.

**Parameters:**

- `stack` (string): Must be 'backend' or 'frontend'
- `level` (string): Must be 'debug', 'info', 'warn', 'error', or 'fatal'
- `package` (string): Must be a valid package for the specified stack
- `message` (string): The log message (max 1000 characters)

**Returns:** Promise<LogResponse>

#### `initializeLogger(config, credentials)`

Initializes the global logger instance.

**Parameters:**

- `config` (LoggerConfig): Configuration object
- `credentials` (object): Authentication credentials

### Convenience Functions

```typescript
import { logDebug, logInfo, logWarn, logError, logFatal } from "./dist";

// Convenience functions for each log level
await logDebug("backend", "handler", "Processing request");
await logInfo("frontend", "component", "Component mounted");
await logWarn("backend", "service", "Rate limit approaching");
await logError("backend", "db", "Connection timeout");
await logFatal("backend", "db", "Critical database failure");
```

## Package Constraints

### Valid Stack Values

- `backend`
- `frontend`

### Valid Level Values

- `debug`
- `info`
- `warn`
- `error`
- `fatal`

### Valid Package Values

#### Backend Only

- `cache`
- `controller`
- `cron_job`
- `db`
- `domain`
- `handler`
- `repository`
- `route`
- `service`

#### Frontend Only

- `api`
- `component`
- `hook`
- `page`
- `state`
- `style`

#### Shared (Both Backend and Frontend)

- `auth`
- `config`
- `middleware`
- `utils`

## Usage Examples

### Backend Application

```typescript
import { Log } from "./logging-middleware";

// In your request handler
try {
  const result = await processRequest(data);
  await Log(
    "backend",
    "info",
    "handler",
    `Request processed successfully: ${result.id}`
  );
  return result;
} catch (error) {
  await Log("backend", "error", "handler", `Request failed: ${error.message}`);
  throw error;
}

// In your database layer
try {
  const connection = await db.connect();
  await Log("backend", "info", "db", "Database connection established");
} catch (error) {
  await Log("backend", "fatal", "db", "Critical database connection failure");
  throw error;
}
```

### Frontend Application

```typescript
import { Log } from "./logging-middleware";

// In your React component
useEffect(() => {
  Log("frontend", "info", "component", "UserProfile component mounted");
}, []);

// In your API service
try {
  const response = await api.getUserData();
  await Log("frontend", "info", "api", "User data fetched successfully");
  return response;
} catch (error) {
  await Log(
    "frontend",
    "error",
    "api",
    `Failed to fetch user data: ${error.message}`
  );
  throw error;
}
```

## Error Handling

The middleware includes comprehensive error handling:

- **Validation Errors**: Thrown when parameters don't meet requirements
- **Authentication Errors**: Thrown when credentials are invalid
- **Network Errors**: Handled with retry logic
- **API Errors**: Proper error messages from the test server

## Configuration

```typescript
interface LoggerConfig {
  baseURL: string; // Test server base URL
  authToken?: string; // Optional initial auth token
  retryAttempts?: number; // Number of retry attempts (default: 3)
  retryDelay?: number; // Base delay between retries in ms (default: 1000)
}
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run in development mode
npm run dev

# Run tests
npm test
```

## Testing

The package includes comprehensive validation and error handling. All parameters are validated according to the strict requirements:

- Stack values must be 'backend' or 'frontend'
- Level values must be one of the five specified levels
- Package values must be valid for the specified stack
- Messages must be non-empty strings under 1000 characters

## Notes

- All string values are automatically normalized to lowercase as per requirements
- The middleware implements exponential backoff for retry attempts
- Authentication tokens are automatically managed and refreshed
- The package is designed to be production-ready with proper error handling
- All API calls to the test server are authenticated and protected

## License

MIT License - See package.json for details.
