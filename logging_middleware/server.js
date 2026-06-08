import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Validation Constraints
const ALLOWED_STACKS = ['backend', 'frontend'];
const ALLOWED_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const BACKEND_PACKAGES = ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'];
const FRONTEND_PACKAGES = ['api', 'component', 'hook', 'page', 'state', 'style'];
const SHARED_PACKAGES = ['auth', 'config', 'middleware', 'utils'];

// Store logs in memory (for demo)
const logStore = [];

// Log API (POST) - Protected Route
app.post('/evaluation-service/logs', (req, res) => {
  try {
    const { stack, level, package: packageName, message } = req.body;

    // Validation
    if (!stack || !level || !packageName || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: stack, level, package, message'
      });
    }

    // Validate stack
    if (!ALLOWED_STACKS.includes(stack)) {
      return res.status(400).json({
        success: false,
        message: `Invalid stack. Allowed: ${ALLOWED_STACKS.join(', ')}`
      });
    }

    // Validate level
    if (!ALLOWED_LEVELS.includes(level)) {
      return res.status(400).json({
        success: false,
        message: `Invalid level. Allowed: ${ALLOWED_LEVELS.join(', ')}`
      });
    }

    // Validate package based on stack
    const allowedPackages = stack === 'backend' ? 
      [...BACKEND_PACKAGES, ...SHARED_PACKAGES] : 
      [...FRONTEND_PACKAGES, ...SHARED_PACKAGES];

    if (!allowedPackages.includes(packageName)) {
      return res.status(400).json({
        success: false,
        message: `Invalid package for ${stack}. Allowed: ${allowedPackages.join(', ')}`
      });
    }

    // Create log entry
    const logID = uuidv4();
    const logEntry = {
      logID,
      stack,
      level,
      package: packageName,
      message,
      timestamp: new Date().toISOString()
    };

    // Store log
    logStore.push(logEntry);

    // Console output with colors
    const levelColors = {
      'debug': '\x1b[35m',    // Magenta
      'info': '\x1b[36m',     // Cyan
      'warn': '\x1b[33m',     // Yellow
      'error': '\x1b[31m',    // Red
      'fatal': '\x1b[41m'     // Red background
    };
    const reset = '\x1b[0m';
    const color = levelColors[level] || reset;

    console.log(`${color}[${logEntry.timestamp}] [${level.toUpperCase()}] [${packageName}]${reset} ${message}`);
    console.log(`  └─ Stack: ${stack} | LogID: ${logID}`);

    res.status(200).json({
      logID,
      message: 'log created successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all logs (for debugging)
app.get('/evaluation-service/logs', (req, res) => {
  res.json({
    success: true,
    totalLogs: logStore.length,
    logs: logStore
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'Logging middleware is running',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`✅ Logging Middleware running on http://localhost:${PORT}`);
  console.log(`📝 Log API: POST http://localhost:${PORT}/evaluation-service/logs`);
});
