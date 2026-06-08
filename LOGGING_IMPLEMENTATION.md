# Logging Middleware Implementation

## Overview
The Logging Middleware is a reusable logging system that captures and tracks all events in your application.

## Log Function Structure

```javascript
Log(stack, level, package, message)
```

### Parameters:
- **stack**: Stack trace or component/file name (e.g., 'user.registration', 'error.database')
- **level**: Log level - `'info'`, `'warn'`, `'error'`, `'debug'`
- **package**: Module/Package name (e.g., 'auth-service', 'backend-api', 'database')
- **message**: Descriptive log message

### Example Usage:

```javascript
import { Log } from './logger.js';

// Log successful operation
await Log('user.register', 'info', 'auth-service', 'User registered: user@example.com');

// Log warning
await Log('rate-limit', 'warn', 'api-service', 'Too many requests from IP: 192.168.1.1');

// Log error
await Log('database.error', 'error', 'db-service', 'Connection failed: ECONNREFUSED');

// Log debug info
await Log('request.processing', 'debug', 'backend-api', 'Processing request ID: abc123');
```

## How It Works

1. **Local Logging**: Logs are printed to console with color coding
2. **Remote Logging**: Logs are sent to the Logging Middleware server at `http://localhost:3000/log`
3. **Graceful Fallback**: If logging server is unavailable, app continues with warning

## Integration Points

### Backend (notification_app_be)
- ✅ Server startup
- ✅ Request handling
- ✅ User registration
- ✅ Error handling
- ✅ Health checks

### Logging Middleware (logging_middleware)
- ✅ Receives and stores logs
- ✅ Displays logs with timestamps
- ✅ Forwards logs for analysis

### Frontend (notification_app_fe)
- Can integrate logging for user interactions

## Running the System

**Terminal 1 - Logging Middleware:**
```bash
cd logging_middleware
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd notification_app_be
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd notification_app_fe
npm run dev
```

## Log Example Output

```
✅ Logging Middleware running on http://localhost:3000
🚀 Backend server running on http://localhost:5000
[2026-06-08T10:30:45.123Z] [INFO] [backend-api] POST /evaluation-service/register
[2026-06-08T10:30:46.456Z] [INFO] [auth-service] User registered: ramkrishna@abc.edu (github)
[2026-06-08T10:30:46.789Z] [DEBUG] [backend-api] GET /health
```

## Environment Variables

Set in `.env` files:
- `PORT` - Server port
- `LOGGING_SERVER` - Logging middleware URL (default: http://localhost:3000)
- `NODE_ENV` - development/production

## Key Features

✅ **Structured Logging** - Stack, level, package, message
✅ **Real-time Monitoring** - Logs sent to central server
✅ **Error Tracking** - Automatic error logging
✅ **Performance Monitoring** - Request duration tracking
✅ **Color-coded Console** - Easy visual identification
✅ **Graceful Degradation** - Works even if logging server is down
