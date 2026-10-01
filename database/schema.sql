CREATE DATABASE IF NOT EXISTS casefile_db;
USE casefile_db;

DROP TABLE IF EXISTS case_results;
DROP TABLE IF EXISTS accusations;
DROP TABLE IF EXISTS deductions;
DROP TABLE IF EXISTS witness_interviews;
DROP TABLE IF EXISTS collected_evidence;
DROP TABLE IF EXISTS discovered_clues;
DROP TABLE IF EXISTS investigations;
DROP TABLE IF EXISTS timeline_events;
DROP TABLE IF EXISTS clues;
DROP TABLE IF EXISTS evidence;
DROP TABLE IF EXISTS witnesses;
DROP TABLE IF EXISTS suspects;
DROP TABLE IF EXISTS victims;
DROP TABLE IF EXISTS cases;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    `rank` VARCHAR(80) NOT NULL DEFAULT 'Rookie',
    xp INT NOT NULL DEFAULT 0,
    cases_attempted INT NOT NULL DEFAULT 0,
    cases_solved INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_username (username),
    INDEX idx_users_email (email)
);

CREATE TABLE cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_number VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(40) NOT NULL,
    location VARCHAR(150) NOT NULL,
    incident_date VARCHAR(80) NOT NULL,
    incident_time VARCHAR(80) NOT NULL,
    victim_name VARCHAR(150) NOT NULL,
    crime_type VARCHAR(120) NOT NULL,
    briefing TEXT NOT NULL,
    known_facts TEXT NOT NULL,
    witness_availability VARCHAR(120) DEFAULT 'Available',
    clue_count INT DEFAULT 0,
    suspect_count INT DEFAULT 0,
    status VARCHAR(40) DEFAULT 'open',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cases_difficulty (difficulty),
    INDEX idx_cases_status (status)
);

CREATE TABLE victims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    age INT,
    occupation VARCHAR(120),
    summary TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id),
    INDEX idx_victims_case_id (case_id)
);

CREATE TABLE suspects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    name VARCHAR(120) NOT NULL,
    age INT NOT NULL,
    occupation VARCHAR(120) NOT NULL,
    relationship_to_victim VARCHAR(120) NOT NULL,
    possible_motive TEXT NOT NULL,
    alibi TEXT NOT NULL,
    known_information TEXT NOT NULL,
    is_culprit BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id),
    INDEX idx_suspects_case_id (case_id)
);

CREATE TABLE witnesses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    name VARCHAR(120) NOT NULL,
    age INT NOT NULL,
    occupation VARCHAR(120) NOT NULL,
    relationship_to_victim VARCHAR(120) NOT NULL,
    location VARCHAR(150) NOT NULL,
    interview_status VARCHAR(40) DEFAULT 'pending',
    reliability VARCHAR(40) DEFAULT 'truthful',
    statement TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id),
    INDEX idx_witnesses_case_id (case_id)
);

CREATE TABLE clues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    clue_type VARCHAR(60) NOT NULL,
    location VARCHAR(150) NOT NULL,
    importance VARCHAR(60) DEFAULT 'medium',
    discovery_condition VARCHAR(80) DEFAULT 'visible',
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id),
    INDEX idx_clues_case_id (case_id)
);

CREATE TABLE evidence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    evidence_type VARCHAR(60) NOT NULL,
    location VARCHAR(150) NOT NULL,
    related_info TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id),
    INDEX idx_evidence_case_id (case_id)
);

CREATE TABLE timeline_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    event_time VARCHAR(30) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id),
    INDEX idx_timeline_case_id (case_id)
);

CREATE TABLE investigations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    case_id INT NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'active',
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    score INT NOT NULL DEFAULT 0,
    xp INT NOT NULL DEFAULT 0,
    current_stage VARCHAR(40) NOT NULL DEFAULT 'briefing',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (case_id) REFERENCES cases(id),
    INDEX idx_investigations_user (user_id),
    INDEX idx_investigations_case (case_id)
);

CREATE TABLE discovered_clues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    investigation_id INT NOT NULL,
    clue_id INT NOT NULL,
    discovered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investigation_id) REFERENCES investigations(id),
    FOREIGN KEY (clue_id) REFERENCES clues(id),
    UNIQUE (investigation_id, clue_id)
);

CREATE TABLE collected_evidence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    investigation_id INT NOT NULL,
    evidence_id INT NOT NULL,
    collected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investigation_id) REFERENCES investigations(id),
    FOREIGN KEY (evidence_id) REFERENCES evidence(id),
    UNIQUE (investigation_id, evidence_id)
);

CREATE TABLE witness_interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    investigation_id INT NOT NULL,
    witness_id INT NOT NULL,
    question VARCHAR(200) NOT NULL,
    answer TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investigation_id) REFERENCES investigations(id),
    FOREIGN KEY (witness_id) REFERENCES witnesses(id),
    INDEX idx_witness_interviews_investigation (investigation_id)
);

CREATE TABLE deductions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    investigation_id INT NOT NULL,
    item_a VARCHAR(120) NOT NULL,
    item_b VARCHAR(120) NOT NULL,
    reasoning TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (investigation_id) REFERENCES investigations(id)
);

CREATE TABLE accusations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    investigation_id INT NOT NULL,
    culprit VARCHAR(120) NOT NULL,
    motive VARCHAR(120) NOT NULL,
    method VARCHAR(120) NOT NULL,
    evidence VARCHAR(120) NOT NULL,
    explanation TEXT NOT NULL,
    correct BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investigation_id) REFERENCES investigations(id)
);

CREATE TABLE case_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    investigation_id INT NOT NULL,
    solved BOOLEAN NOT NULL DEFAULT FALSE,
    score INT NOT NULL DEFAULT 0,
    xp INT NOT NULL DEFAULT 0,
    accuracy FLOAT NOT NULL DEFAULT 0,
    feedback TEXT NOT NULL,
    correct_clues INT NOT NULL DEFAULT 0,
    correct_deductions INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investigation_id) REFERENCES investigations(id)
);

CREATE TABLE user_statistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_investigations INT NOT NULL DEFAULT 0,
    cases_solved INT NOT NULL DEFAULT 0,
    cases_failed INT NOT NULL DEFAULT 0,
    average_score FLOAT NOT NULL DEFAULT 0,
    total_xp INT NOT NULL DEFAULT 0,
    current_rank VARCHAR(80) NOT NULL DEFAULT 'Rookie',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE (user_id)
);
