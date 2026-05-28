# 📊 GitHub Profile Analyzer API

A REST API built with Node.js, Express, and MySQL that analyzes GitHub profiles and generates developer insights using the GitHub API.

---

# 🌟 Features

- Fetch GitHub public profile data
- Analyze repositories and developer activity
- Calculate total stars and forks
- Detect top programming languages
- Identify most starred and most forked repositories
- Generate popularity and activity scores
- Store analyzed data in MySQL
- Auto-update existing profiles without duplication
- RESTful API architecture
- Error handling and validation
- GitHub API token support

---

# 🛠️ Technologies Used

- Node.js
- Express.js
- MySQL
- Axios
- dotenv
- CORS
- Helmet
- express-rate-limit

---

# 📁 Project Structure

```text
github-profile-analyzer-api/
│
├── server.js
├── package.json
├── .env
├── README.md
│
├── config/
│   └── db.js
│
├── controllers/
│   └── githubController.js
│
├── routes/
│   └── githubRoutes.js
```

---

# ⚙️ Prerequisites

Make sure the following are installed:

- Node.js (v16 or higher)
- MySQL Server
- Git

---

# 🚀 Installation & Setup

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/github-profile-analyzer-api.git
```

## 2. Open Project

```bash
cd github-profile-analyzer-api
```

## 3. Install Dependencies

```bash
npm install
```

---

# 🗄️ Database Setup

Start MySQL server.

The application automatically:
- creates the database
- creates the profiles table

No manual SQL setup required.

---

# 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=github_analyzer

GITHUB_TOKEN=your_github_token
```

---

# ▶️ Running the Server

## Development Mode

```bash
npm run dev
```

## Production Mode

```bash
npm start
```

Server URL:

```text
http://localhost:5000
```

---

# 📡 API Endpoints

---

## 1. Root Endpoint

### GET

```http
GET /
```

Returns API information and available endpoints.

---

## 2. Analyze GitHub Profile

### POST

```http
POST /api/github/analyze/:username
```

### Example

```http
POST /api/github/analyze/octocat
```

### Response

```json
{
  "success": true,
  "message": "Profile analyzed successfully.",
  "data": {
    "username": "octocat",
    "followers": 3900,
    "total_stars": 150,
    "top_languages": "JavaScript, HTML, CSS"
  }
}
```

---

## 3. Get All Profiles

### GET

```http
GET /api/github/profiles
```

Returns all analyzed GitHub profiles.

---

## 4. Get Single Profile

### GET

```http
GET /api/github/profiles/:username
```

### Example

```http
GET /api/github/profiles/octocat
```

Returns stored analysis for a single GitHub user.

---

# 📈 Generated Analytics

The API calculates:

- Total Stars
- Total Forks
- Top Languages
- Most Starred Repository
- Most Forked Repository
- Popularity Score
- Activity Score

---

# 🧠 Popularity Score Formula

```text
(followers * 3) + total_stars
```

---

# 🧠 Activity Score Formula

```text
public_repos + (public_gists * 0.5) + (total_forks * 0.1)
```

---

# 🛡️ Security Features

- Helmet security middleware
- Rate limiting
- Environment variable protection
- Error handling middleware

---

# 🧪 API Testing

Recommended tools:

- Postman
- Thunder Client
- Insomnia

---

# 🌍 Deployment

Recommended platforms:

- Render
- Railway
- Cyclic

Example deployment URL:

```text
https://your-api-name.onrender.com
```

---

# 👨‍💻 Author

Developed by Rahesh Rajappan

- GitHub: https://github.com/yourusername

---

# 📄 License

This project is licensed under the MIT License.