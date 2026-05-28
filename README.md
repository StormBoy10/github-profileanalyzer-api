# 📊 GitHub Profile Analyzer

An advanced, premium Express-based REST API that extracts public data from any GitHub profile, computes deep analytical insights, and archives them in a MySQL database.

---

## 🌟 Key Features

1. **Profile Data Extraction**: Fetches public profile details (bio, follower count, repository totals, etc.) in real-time from the GitHub API.
2. **Proprietary Insight Generation**: 
   * **Total Stars**: Aggregated star counts across all public repos.
   * **Total Forks**: Aggregated fork counts across all public repos.
   * **Top Programming Languages**: Analyzes repo composition to discover the user's primary languages.
   * **Repo Standouts**: Automatically identifies the user's most starred and most forked repositories.
   * **Popularity Score**: A weighted metric combining follower reach and repository appreciation `(followers * 3) + total_stars`.
   * **Activity Score**: A metric reflecting total repositories, weighted gists, and fork activity `public_repos + (public_gists * 0.5) + (total_forks * 0.1)`.
3. **Smart Database Integration**: Uses MySQL with automatic database/table creations and upsert operations, allowing seamless profile refreshes without duplicates.
4. **Clean API Architecture**: Strictly designed REST architecture segmented into configuration, routing, and controller layers.

---

## 📁 Project Directory Structure

```text
github-profile-analyzer/
├── server.js               # Express server entry point & startup controller
├── .env                    # Environment variables configuration (Port, Database, API Token)
├── package.json            # Node project dependency manager
│
├── config/
│   ├── db.js               # MySQL database adapter, pools & auto-initializer
│   └── schema.sql          # Declarative database table schema (SQL export)
│
├── routes/
│   └── githubRoutes.js     # API Route mapping endpoints to controllers
│
├── controllers/
│   └── githubController.js # Core business logic and analytical insights engine
│
└── README.md               # Setup, setup instructions & API specifications
```

---

## ⚙️ Prerequisites

- **Node.js** (v16.0.0 or higher recommended)
- **MySQL Server** (running locally or in the cloud)

---

## 🚀 Setup & Installation Instructions

### 1. Database Setup
Ensure that your MySQL Server is running. The application's `config/db.js` automatically attempts to create the database (`github_analyzer`) and the table (`profiles`) on startup.

If you prefer to manually run the creation query, you can use the SQL script located in `config/schema.sql`:

```sql
CREATE DATABASE IF NOT EXISTS `github_analyzer`;
USE `github_analyzer`;

CREATE TABLE IF NOT EXISTS `profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(150) NOT NULL UNIQUE,
  `name` VARCHAR(255),
  `avatar_url` VARCHAR(500),
  `profile_url` VARCHAR(500),
  `bio` TEXT,
  `public_repos` INT DEFAULT 0,
  `public_gists` INT DEFAULT 0,
  `followers` INT DEFAULT 0,
  `following` INT DEFAULT 0,
  `account_created_at` DATETIME,
  `total_stars` INT DEFAULT 0,
  `total_forks` INT DEFAULT 0,
  `top_languages` VARCHAR(255),
  `most_starred_repo` VARCHAR(255),
  `most_starred_stars` INT DEFAULT 0,
  `most_forked_repo` VARCHAR(255),
  `most_forked_forks` INT DEFAULT 0,
  `popularity_score` INT DEFAULT 0,
  `activity_score` DECIMAL(10, 2) DEFAULT 0.00,
  `analyzed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Project Installation
Configure and launch the project via the terminal:

```bash
# Navigate to the project root
cd github-profile-analyzer

# Install required dependencies
npm install
```

### 3. Environment Variables Configuration
Open the `.env` file in the project root and configure your credentials:

```ini
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=github_analyzer

# Optional: Add a GitHub Personal Access Token to increase API limits (from 60 to 5000 per hr)
GITHUB_TOKEN=your_personal_access_token_here
```

### 4. Running the Server

#### Development Mode (with Nodemon hot-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

Once started, the API will be available at: **`http://localhost:5000`**

---

## 📡 API Documentation & Endpoints

### 1. Root / Diagnostic Check
* **Method**: `GET`
* **URL**: `http://localhost:5000/`
* **Response Payload (JSON)**:
```json
{
  "success": true,
  "message": "Welcome to the GitHub Profile Analyzer API!",
  "status": "Operational",
  "endpoints": {
    "analyzeProfile": {
      "method": "POST",
      "path": "/api/github/analyze/:username",
      "description": "Fetch, analyze, and save/refresh public GitHub profile data"
    },
    "getAllProfiles": {
      "method": "GET",
      "path": "/api/github/profiles",
      "description": "Get list of all stored analyzed profiles"
    },
    "getProfile": {
      "method": "GET",
      "path": "/api/github/profile/:username",
      "description": "Get local analyzed profile data for a single user"
    }
  }
}
```

---

### 2. Analyze Profile
Fetches raw data from GitHub, aggregates repository insights, stores them in the database (or updates them if they already exist), and returns the results.
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/github/analyze/:username`
* **Response Payload (JSON)**:
```json
{
  "success": true,
  "message": "Successfully analyzed and saved profile for username: \"octocat\".",
  "data": {
    "id": 1,
    "username": "octocat",
    "name": "The Octocat",
    "avatar_url": "https://avatars.githubusercontent.com/u/5832347?v=4",
    "profile_url": "https://github.com/octocat",
    "bio": "Testing branch merge conflicts",
    "public_repos": 8,
    "public_gists": 8,
    "followers": 3900,
    "following": 9,
    "account_created_at": "2011-01-25T18:44:36.000Z",
    "total_stars": 150,
    "total_forks": 85,
    "top_languages": "HTML, CSS, JavaScript",
    "most_starred_repo": "Spoon-Knife",
    "most_starred_stars": 120,
    "most_forked_repo": "Spoon-Knife",
    "most_forked_forks": 75,
    "popularity_score": 11850,
    "activity_score": 20.50,
    "analyzed_at": "2026-05-28T09:40:00.000Z"
  }
}
```

---

### 3. Fetch All Stored Profiles
Fetches all profile records stored in the MySQL database, ordered from highest Popularity Score downwards.
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/github/profiles`
* **Response Payload (JSON)**:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "username": "octocat",
      "name": "The Octocat",
      "avatar_url": "https://avatars.githubusercontent.com/u/5832347?v=4",
      "profile_url": "https://github.com/octocat",
      "bio": "Testing branch merge conflicts",
      "public_repos": 8,
      "public_gists": 8,
      "followers": 3900,
      "following": 9,
      "account_created_at": "2011-01-25T18:44:36.000Z",
      "total_stars": 150,
      "total_forks": 85,
      "top_languages": "HTML, CSS, JavaScript",
      "most_starred_repo": "Spoon-Knife",
      "most_starred_stars": 120,
      "most_forked_repo": "Spoon-Knife",
      "most_forked_forks": 75,
      "popularity_score": 11850,
      "activity_score": 20.50,
      "analyzed_at": "2026-05-28T09:40:00.000Z"
    }
  ]
}
```

---

### 4. Fetch Stored Profile Details
Fetches the analytical profile data of a single user stored in the database.
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/github/profile/:username`
* **Response Payload (JSON)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "octocat",
    "name": "The Octocat",
    "avatar_url": "https://avatars.githubusercontent.com/u/5832347?v=4",
    "profile_url": "https://github.com/octocat",
    "bio": "Testing branch merge conflicts",
    "public_repos": 8,
    "public_gists": 8,
    "followers": 3900,
    "following": 9,
    "account_created_at": "2011-01-25T18:44:36.000Z",
    "total_stars": 150,
    "total_forks": 85,
    "top_languages": "HTML, CSS, JavaScript",
    "most_starred_repo": "Spoon-Knife",
    "most_starred_stars": 120,
    "most_forked_repo": "Spoon-Knife",
    "most_forked_forks": 75,
    "popularity_score": 11850,
    "activity_score": 20.50,
    "analyzed_at": "2026-05-28T09:40:00.000Z"
  }
}
```
