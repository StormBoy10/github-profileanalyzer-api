import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/db.js';
import githubRoutes from './routes/githubRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Apply Middlewares
app.use(cors());
app.use(express.json());

// Quick console request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/github', githubRoutes);

// Root Endpoint (Quick diagnostics and index)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the GitHub Profile Analyzer API!',
    status: 'Operational',
    endpoints: {
      analyzeProfile: {
        method: 'POST',
        path: '/api/github/analyze/:username',
        description: 'Fetch, analyze, and save/refresh public GitHub profile data'
      },
      getAllProfiles: {
        method: 'GET',
        path: '/api/github/profiles',
        description: 'Get list of all stored analyzed profiles'
      },
      getProfile: {
        method: 'GET',
        path: '/api/github/profile/:username',
        description: 'Get local analyzed profile data for a single user'
      }
    }
  });
});

// Route Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.url}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Global Exception Intercepted:', err);
  res.status(500).json({
    success: false,
    error: 'An internal server error occurred.',
    details: err.message
  });
});

/**
 * Boots the database configuration, executes standard checks, and fires Express.
 */
async function startServer() {
  try {
    console.log('Initializing database connections...');
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 GitHub Profile Analyzer API successfully started!`);
      console.log(`🔊 Listening on Port: ${PORT}`);
      console.log(`🔗 Local Address:     http://localhost:${PORT}`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error('⚡ Critical server start failure:', error.message);
    process.exit(1);
  }
}

startServer();
