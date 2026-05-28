-- GitHub Profile Analyzer Database Schema

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS `github_analyzer`;

-- Select the Database
USE `github_analyzer`;

-- Create Profiles table if not exists
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
