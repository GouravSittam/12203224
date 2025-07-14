# URL Shortener Microservice & Logging Middleware

Welcome to the **Affordmed Campus Hiring Submission** by Gourav Sittam!  
This repository contains two robust, production-ready TypeScript projects:

- **URL Shortener Microservice**: A scalable backend service for creating and tracking shortened URLs with analytics.
- **Reusable Logging Middleware**: A strict, fully-featured logging package designed for seamless integration and advanced monitoring.

---

## 🌟 Project Overview

### 1. URL Shortener Microservice

A powerful HTTP microservice for shortening URLs, tracking usage, and providing rich analytics.  
Built with security, validation, and extensibility in mind.

#### **Features**

- 🔗 **URL Shortening**: Generate short URLs (custom or auto-generated)
- 📈 **Analytics**: Track clicks, referrers, locations, and more
- 📝 **Comprehensive Logging**: Integrates the custom logging middleware
- ✅ **Strict Validation**: Ensures input correctness and uniqueness
- ⏳ **Expiration**: Configurable lifespan for each short URL
- 🛡️ **Security**: Helmet, CORS, rate limiting, and more
- 🏗️ **Production-Ready**: Structured error handling, compression, and scalable patterns

---

### 2. Logging Middleware

A reusable, strict-constraint logging package for both backend and frontend.  
Implements advanced validation, authentication, and retry logic.

#### **Features**

- 🔒 **Strict Validation**: Enforces type, stack, level, and package constraints
- 🔑 **Authentication**: Handles secure registration and token usage
- 🔁 **Retry Logic**: Exponential backoff for reliable log delivery
- 🛠️ **TypeScript Support**: Fully typed API and usage
- ♻️ **Reusable**: Easily pluggable into multiple projects

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0+
- npm or yarn

### Installation

1. **Build Logging Middleware**

    ```bash
    cd "Logging Middleware"
    npm install
    npm run build
    ```

2. **Install Microservice Dependencies**

    ```bash
    cd "../Backend Test Submission"
    npm install
    ```

3. **Configure Credentials**

    Update in `src/config.ts` or via environment variables:

    ```bash
    export AUTH_EMAIL="your.email@university.edu"
    export AUTH_NAME="Your Name"
    export AUTH_ROLL_NO="your_roll_number"
    export AUTH_ACCESS_CODE="your_access_code"
    export AUTH_CLIENT_ID="your_client_id"
    export AUTH_CLIENT_SECRET="your_client_secret"
    ```

### Usage

- **Development:**  
  `npm run dev`  
- **Production:**  
  `npm run build && npm start`  
- Default: [http://localhost:3000](http://localhost:3000)

---

## 🛤️ Architecture

<details>
<summary>Directory Structure</summary>

```
Backend Test Submission/
├── src/
│   ├── config.ts
│   ├── types.ts
│   ├── index.ts
│   ├── app.ts
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middleware/
│   └── utils/
Logging Middleware/
├── src/
│   └── ...
```
</details>

---

## 📚 API Endpoints

### URL Shortener

- **POST** `/shorturls`  
  Create a new short URL

- **GET** `/shorturls/:shortcode`  
  Get statistics for a short URL

- **GET** `/:shortcode`  
  Redirect with analytics tracking

- **GET** `/health`  
  Service health check

<details>
<summary>Example Request & Response</summary>

**Create Short URL**
```json
POST /shorturls
{
  "url": "https://very-long-url.com/page",
  "validity": 30,
  "shortcode": "abcd1"
}
```
**Response:**
```json
{
  "shortLink": "http://localhost:3000/abcd1",
  "expiry": "2025-01-01T12:30:00.000Z"
}
```
</details>

---

## 🔒 Security & Validation

- **Helmet** for HTTP headers
- **CORS** configuration
- **Rate Limiting**
- **Input Validation** (URL, shortcode, validity)
- **Comprehensive Error Handling** with descriptive messages

---

## ⚙️ Configuration

- Easily configurable via environment variables (see above)
- Default validity: 30 minutes, max: 24 hours
- Shortcodes: up to 20 characters, unique and alphanumeric

---

## 📝 Logging Middleware Usage

```typescript
import { initializeLogger, Log, logInfo, logError } from "./dist";

// Initialize
await initializeLogger(...);

// Log events
await Log("backend", "info", "handler", "User created");
await logError("backend", "db", "Database connection failed");
```

### Supported:

- Stack: `backend`, `frontend`
- Level: `debug`, `info`, `warn`, `error`, `fatal`
- Package: see README for full list

---

## 🧪 Testing

### Manual cURL

- Create, retrieve, and redirect short URLs using provided cURL examples
- Logs and errors can be monitored via the logging middleware

---

## ⚡ Performance Highlights

- In-memory storage for dev (swap with database for prod)
- Asynchronous processing for analytics
- Built-in compression and connection pooling

---

## 🏭 Production Considerations

- Replace in-memory storage with a database (e.g., MongoDB, PostgreSQL)
- Use Redis for caching frequent lookups
- Enable monitoring and HTTPS

---

## 📄 License

MIT License — see `package.json` for details.

---

> Made with ❤️ by [Gourav Sittam](https://github.com/GouravSittam)
