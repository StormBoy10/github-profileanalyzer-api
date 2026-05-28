import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { initializeDatabase } from './config/db.js';
import githubRoutes from './routes/githubRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

/**
 * =========================
 * Middleware Configuration
 * =========================
 */

// Enable CORS
app.use(cors());

// Parse JSON requests
app.use(express.json());

/**
 * Simple Request Logger
 */
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
  next();
});

/**
 * =========================
 * API Routes
 * =========================
 */

app.use('/api/github', githubRoutes);

/**
 * =========================
 * Root Route
 * =========================
 */

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the GitHub Profile Analyzer API!',
    status: 'Running Successfully',
    endpoints: {
      analyzeProfile: {
        method: 'POST',
        path: '/api/github/analyze/:username'
      },
      getAllProfiles: {
        method: 'GET',
        path: '/api/github/profiles'
      },
      getSingleProfile: {
        method: 'GET',
        path: '/api/github/profiles/:username'
      }
    }
  });
});

/**
 * =========================
 * 404 Route Handler
 * =========================
 */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

/**
 * =========================
 * Global Error Handler
 * =========================
 */

app.use((err, req, res, next) => {
  console.error('🔥 Global Error Handler:', err);

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: err.message
  });
});

/**
 * =========================
 * Start Server Function
 * =========================
 */

async function startServer() {
  try {
    console.log('🔄 Initializing database connections...');

    await initializeDatabase();

    console.log('✅ Database initialized successfully.');

    app.listen(PORT, () => {
      console.log('========================================');
      console.log('🚀 GitHub Profile Analyzer API Started');
      console.log(`🌐 Server running on port: ${PORT}`);
      console.log(`🔗 Local URL: http://localhost:${PORT}`);
      console.log('========================================');
    });

  } catch (error) {
    console.error('⚡ Critical server start failure:');
    console.error(error);

    process.exit(1);
  }
}

// Start Application
startServer();