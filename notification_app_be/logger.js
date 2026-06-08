/**
 * Logging Utility - Reusable Log Function
 * Conforms to document constraints:
 * - Stack: "backend" or "frontend"
 * - Level: "debug", "info", "warn", "error", "fatal"
 * - Package: Specific packages for backend/frontend
 * 
 * Usage:
 * import { Log } from './logger.js';
 * await Log('backend', 'info', 'service', 'User registered successfully');
 */

const LOGGING_SERVER = process.env.LOGGING_SERVER || 'http://localhost:3000';

// Valid packages
const BACKEND_PACKAGES = ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'];
const SHARED_PACKAGES = ['auth', 'config', 'middleware', 'utils'];

export const Log = async (stack, level, packageName, message) => {
  // Validate inputs
  if (!['backend', 'frontend'].includes(stack)) {
    console.error(`❌ Invalid stack: ${stack}. Must be 'backend' or 'frontend'`);
    return null;
  }

  if (!['debug', 'info', 'warn', 'error', 'fatal'].includes(level)) {
    console.error(`❌ Invalid level: ${level}`);
    return null;
  }

  const allowedPackages = [...BACKEND_PACKAGES, ...SHARED_PACKAGES];
  if (!allowedPackages.includes(packageName)) {
    console.error(`❌ Invalid package: ${packageName}`);
    return null;
  }

  const timestamp = new Date().toISOString();

  // Console logging with colors
  const levelColor = {
    'debug': '\x1b[35m',    // Magenta
    'info': '\x1b[36m',     // Cyan
    'warn': '\x1b[33m',     // Yellow
    'error': '\x1b[31m',    // Red
    'fatal': '\x1b[41m'     // Red background
  };
  const reset = '\x1b[0m';
  const color = levelColor[level] || reset;

  console.log(`${color}[${timestamp}] [${level.toUpperCase()}] [${packageName}]${reset} ${message}`);

  // Send to Logging Middleware
  try {
    const response = await fetch(`${LOGGING_SERVER}/evaluation-service/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stack, level, package: packageName, message }),
      timeout: 5000
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.warn(`⚠️ Logging failed: ${data.message}`);
      return null;
    }

    return data;
  } catch (error) {
    console.warn(`⚠️ Could not reach logging server: ${error.message}`);
    return null;
  }
};

export default Log;

