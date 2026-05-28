import express from 'express';
import { 
  analyzeProfile, 
  getAllProfiles, 
  getProfile 
} from '../controllers/githubController.js';

const router = express.Router();

/**
 * Route Mapping:
 * 
 * 1. POST /api/github/analyze/:username
 *    Fetches, analyzes, and stores profile info for the given GitHub username.
 * 
 * 2. GET /api/github/profiles
 *    Fetches all analyzed profile summaries from the database.
 * 
 * 3. GET /api/github/profile/:username
 *    Fetches details of a single profile from the database.
 */
router.post('/analyze/:username', analyzeProfile);
router.get('/profiles', getAllProfiles);
router.get('/profile/:username', getProfile);

export default router;
