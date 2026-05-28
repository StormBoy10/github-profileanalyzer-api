import axios from 'axios';
import { query } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

/**
 * Generates configuration for Axios requests, appending authorization headers 
 * if a GITHUB_TOKEN is specified in the environment variables.
 */
const getAxiosConfig = () => {
  const config = {
    headers: {
      'User-Agent': 'GitHub-Profile-Analyzer-App',
      'Accept': 'application/vnd.github+json'
    }
  };
  if (GITHUB_TOKEN) {
    config.headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }
  return config;
};

/**
 * POST /api/github/analyze/:username
 * Orchestrates the full profile extraction, analytical computation, and storage update.
 */
export async function analyzeProfile(req, res) {
  const { username } = req.params;
  
  if (!username) {
    return res.status(400).json({ error: 'Username parameter is required.' });
  }

  try {
    const axiosConfig = getAxiosConfig();
    
    // 1. Fetch core profile from GitHub API
    let profileResponse;
    try {
      profileResponse = await axios.get(`https://api.github.com/users/${username}`, axiosConfig);
    } catch (apiError) {
      if (apiError.response && apiError.response.status === 404) {
        return res.status(404).json({ error: `GitHub user "${username}" was not found.` });
      }
      throw apiError;
    }

    const u = profileResponse.data;

    // 2. Fetch public repositories to perform aggregate computations (up to 100)
    const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, axiosConfig);
    const repos = reposResponse.data || [];

    // 3. Initialize aggregate analytical counters
    let totalStars = 0;
    let totalForks = 0;
    const languagesMap = {};
    let mostStarredRepo = null;
    let mostStarredStars = 0;
    let mostForkedRepo = null;
    let mostForkedForks = 0;

    // Run computations across repositories
    repos.forEach(repo => {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;

      // Map languages
      if (repo.language) {
        languagesMap[repo.language] = (languagesMap[repo.language] || 0) + 1;
      }

      // Check most starred repo
      if (repo.stargazers_count >= mostStarredStars) {
        mostStarredStars = repo.stargazers_count;
        mostStarredRepo = repo.name;
      }

      // Check most forked repo
      if (repo.forks_count >= mostForkedForks) {
        mostForkedForks = repo.forks_count;
        mostForkedRepo = repo.name;
      }
    });

    // Form top 3 languages list
    const topLanguagesList = Object.entries(languagesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    const topLanguages = topLanguagesList.length > 0 ? topLanguagesList.join(', ') : 'None';

    // Calculate premium insights:
    // A. Popularity Score: weighted based on follower reach and stars
    const popularityScore = (u.followers * 3) + totalStars;
    
    // B. Activity Score: based on public repos count, weighted public gists, and fork contributions
    const activityScore = parseFloat((u.public_repos + (u.public_gists * 0.5) + (totalForks * 0.1)).toFixed(2));

    // Prepare ISO datetime for MySQL DATETIME compatibility
    const accountCreatedAt = u.created_at 
      ? new Date(u.created_at).toISOString().slice(0, 19).replace('T', ' ') 
      : null;

    // 4. Save or update the record in MySQL using UPSERT syntax
    const upsertSQL = `
      INSERT INTO profiles (
        username, name, avatar_url, profile_url, bio, public_repos, public_gists, 
        followers, following, account_created_at, total_stars, total_forks, 
        top_languages, most_starred_repo, most_starred_stars, most_forked_repo, 
        most_forked_forks, popularity_score, activity_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        avatar_url = VALUES(avatar_url),
        profile_url = VALUES(profile_url),
        bio = VALUES(bio),
        public_repos = VALUES(public_repos),
        public_gists = VALUES(public_gists),
        followers = VALUES(followers),
        following = VALUES(following),
        account_created_at = VALUES(account_created_at),
        total_stars = VALUES(total_stars),
        total_forks = VALUES(total_forks),
        top_languages = VALUES(top_languages),
        most_starred_repo = VALUES(most_starred_repo),
        most_starred_stars = VALUES(most_starred_stars),
        most_forked_repo = VALUES(most_forked_repo),
        most_forked_forks = VALUES(most_forked_forks),
        popularity_score = VALUES(popularity_score),
        activity_score = VALUES(activity_score);
    `;

    const params = [
      u.login,
      u.name || null,
      u.avatar_url || null,
      u.html_url || null,
      u.bio || null,
      u.public_repos || 0,
      u.public_gists || 0,
      u.followers || 0,
      u.following || 0,
      accountCreatedAt,
      totalStars,
      totalForks,
      topLanguages,
      mostStarredRepo || null,
      mostStarredStars,
      mostForkedRepo || null,
      mostForkedForks,
      popularityScore,
      activityScore
    ];

    await query(upsertSQL, params);

    // Fetch the updated entry from the database
    const updatedRows = await query('SELECT * FROM profiles WHERE username = ?', [u.login]);

    return res.status(200).json({
      success: true,
      message: `Successfully analyzed and saved profile for username: "${u.login}".`,
      data: updatedRows[0]
    });

  } catch (error) {
    console.error(`❌ Error executing analysis for "${username}":`, error);
    
    // Handle secondary rate-limit errors
    if (error.response && error.response.status === 403) {
      return res.status(403).json({
        success: false,
        error: 'GitHub API rate limit exceeded or access forbidden.',
        details: 'Consider adding a GITHUB_TOKEN in your .env file to bypass rate limits.'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while performing GitHub profile analysis.',
      details: error.message
    });
  }
}

/**
 * GET /api/github/profiles
 * Returns all stored profile records, ordered by Popularity Score.
 */
export async function getAllProfiles(req, res) {
  try {
    const profiles = await query('SELECT * FROM profiles ORDER BY popularity_score DESC, analyzed_at DESC');
    return res.status(200).json({
      success: true,
      count: profiles.length,
      data: profiles
    });
  } catch (error) {
    console.error('❌ Error retrieving profile index:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while fetching the profile list.',
      details: error.message
    });
  }
}

/**
 * GET /api/github/profile/:username
 * Returns the analytical profile data of a single user.
 */
export async function getProfile(req, res) {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ error: 'Username parameter is required.' });
  }

  try {
    const profiles = await query('SELECT * FROM profiles WHERE username = ?', [username]);

    if (!profiles || profiles.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No stored analytical profile records were found matching username "${username}".`,
        recommendation: `Try invoking POST /api/github/analyze/${username} first to fetch and store it.`
      });
    }

    return res.status(200).json({
      success: true,
      data: profiles[0]
    });
  } catch (error) {
    console.error(`❌ Error fetching details for username "${username}":`, error);
    return res.status(500).json({
      success: false,
      error: `An internal server error occurred while loading profile detail for "${username}".`,
      details: error.message
    });
  }
}
