import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Log } from './logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use(async (req, res, next) => {
  await Log('backend', 'info', 'route', `${req.method} ${req.url}`);
  next();
});

// Registration API (POST)
app.post('/evaluation-service/register', async (req, res) => {
  try {
    const { email, name, mobileNo, githubUsername, rollNo, accessCode } = req.body;

    // Validation
    if (!email || !name || !mobileNo || !githubUsername || !rollNo || !accessCode) {
      await Log('backend', 'warn', 'handler', 'Missing required fields in registration');
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Log successful registration
    await Log('backend', 'info', 'service', 
      `User registered: ${email} (${githubUsername})`);

    // Store user data
    const userData = {
      email,
      name,
      mobileNo,
      githubUsername,
      rollNo,
      timestamp: new Date(),
      status: 'registered'
    };

    console.log('✅ Registration Data:', userData);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        email,
        name,
        githubUsername,
        rollNo,
        registeredAt: new Date().toISOString()
      }
    });
  } catch (error) {
    await Log('backend', 'error', 'handler', 
      `Registration failed: ${error.message}`);
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Health check
app.get('/health', async (req, res) => {
  await Log('backend', 'debug', 'route', 'Health check performed');
  
  res.json({ 
    status: 'Backend is running',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, async () => {
  await Log('backend', 'info', 'service', 
    `Backend server started on http://localhost:${PORT}`);
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
