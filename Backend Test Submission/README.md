# URL Shortener Microservice

A robust HTTP URL Shortener Microservice built for the Afford Medical Technologies Private Limited campus hiring evaluation. This microservice provides core URL shortening functionality along with comprehensive analytical capabilities.

## Features

- ✅ **URL Shortening**: Create short URLs with custom or auto-generated shortcodes
- ✅ **Analytics**: Track clicks with detailed statistics including location and referrer data
- ✅ **Logging Integration**: Extensive use of the custom logging middleware
- ✅ **Validation**: Comprehensive input validation and error handling
- ✅ **Geolocation**: IP-based location tracking for analytics
- ✅ **Expiration**: Configurable URL expiration (default: 30 minutes)
- ✅ **Production Ready**: Security middleware, compression, and error handling

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- The Logging Middleware package (must be built first)

## Installation

1. **Build the Logging Middleware first:**

   ```bash
   cd ../Logging Middleware
   npm install
   npm run build
   ```

2. **Install dependencies:**

   ```bash
   cd ../Backend Test Submission
   npm install
   ```

3. **Configure authentication:**
   Update the credentials in `src/config.ts` or set environment variables:
   ```bash
   export AUTH_EMAIL="your.email@university.edu"
   export AUTH_NAME="Your Name"
   export AUTH_ROLL_NO="your_roll_number"
   export AUTH_ACCESS_CODE="your_access_code"
   export AUTH_CLIENT_ID="your_client_id"
   export AUTH_CLIENT_SECRET="your_client_secret"
   ```

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### 1. Create Short URL

**POST** `/shorturls`

Creates a new shortened URL.

**Request Body:**

```json
{
  "url": "https://very-long-url.com/with/many/segments",
  "validity": 30,
  "shortcode": "abcd1"
}
```

**Response (201):**

```json
{
  "shortLink": "http://localhost:3000/abcd1",
  "expiry": "2025-01-01T12:30:00.000Z"
}
```

### 2. Get Statistics

**GET** `/shorturls/:shortcode`

Retrieves usage statistics for a specific shortened URL.

**Response (200):**

```json
{
  "shortcode": "abcd1",
  "originalUrl": "https://very-long-url.com/with/many/segments",
  "totalClicks": 5,
  "createdAt": "2025-01-01T12:00:00.000Z",
  "expiryDate": "2025-01-01T12:30:00.000Z",
  "clicks": [
    {
      "timestamp": "2025-01-01T12:05:00.000Z",
      "referrer": "https://google.com",
      "location": "New York, NY, US",
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "192.168.1.1"
    }
  ]
}
```

### 3. Redirect to Original URL

**GET** `/:shortcode`

Redirects to the original long URL and records analytics.

### 4. Health Check

**GET** `/health`

Returns service health status.

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: localhost)
- `NODE_ENV`: Environment (development/production)
- `AUTH_EMAIL`: Authentication email
- `AUTH_NAME`: Authentication name
- `AUTH_ROLL_NO`: Roll number
- `AUTH_ACCESS_CODE`: Access code
- `AUTH_CLIENT_ID`: Client ID
- `AUTH_CLIENT_SECRET`: Client secret

### Default Settings

- **Default Validity**: 30 minutes
- **Shortcode Length**: 6 characters (auto-generated)
- **Max Custom Shortcode**: 20 characters
- **Max Validity**: 24 hours (1440 minutes)

## Architecture

```
src/
├── config.ts              # Application configuration
├── types.ts               # TypeScript type definitions
├── index.ts               # Application entry point
├── app.ts                 # Express application setup
├── controllers/           # Request handlers
│   └── urlController.ts
├── services/              # Business logic
│   └── urlService.ts
├── routes/                # Route definitions
│   └── urlRoutes.ts
├── middleware/            # Express middleware
│   └── errorHandler.ts
└── utils/                 # Utility functions
    ├── validation.ts
    └── geoLocation.ts
```

## Logging

The application extensively uses the custom logging middleware as required:

- **Request/Response Logging**: All HTTP requests and responses
- **Error Logging**: Comprehensive error tracking
- **Business Logic Logging**: URL creation, redirection, and analytics
- **Performance Logging**: Request duration tracking

All logs are sent to the Affordmed test server via the logging middleware.

## Validation

### URL Validation

- Must start with `http://` or `https://`
- Must be a valid URL format

### Shortcode Validation

- Alphanumeric characters only
- Maximum 20 characters for custom shortcodes
- Must be unique

### Validity Validation

- Positive integer
- Maximum 24 hours (1440 minutes)

## Error Handling

The application provides comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **404 Not Found**: Shortcode not found
- **409 Conflict**: Shortcode already exists
- **500 Internal Server Error**: Server errors

All errors include descriptive messages and appropriate HTTP status codes.

## Testing

### Manual Testing with cURL

1. **Create a short URL:**

   ```bash
   curl -X POST http://localhost:3000/shorturls \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://www.google.com",
       "validity": 60,
       "shortcode": "test123"
     }'
   ```

2. **Get statistics:**

   ```bash
   curl http://localhost:3000/shorturls/test123
   ```

3. **Test redirect:**
   ```bash
   curl -I http://localhost:3000/test123
   ```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Built-in protection against abuse
- **Compression**: Response compression for performance

## Performance

- **In-Memory Storage**: Fast access for development
- **Asynchronous Operations**: Non-blocking click recording
- **Compression**: Reduced bandwidth usage
- **Connection Pooling**: Efficient resource management

## Production Considerations

For production deployment:

1. **Database**: Replace in-memory storage with a proper database
2. **Caching**: Implement Redis for frequently accessed URLs
3. **Load Balancing**: Use multiple instances behind a load balancer
4. **Monitoring**: Add application monitoring and alerting
5. **SSL/TLS**: Use HTTPS in production

## License

MIT License - See package.json for details.
