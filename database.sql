-- WPoets Full Stack Test – Database
-- Categories match the design: Learning, Technology, Communication

CREATE DATABASE IF NOT EXISTS wpoets_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wpoets_db;

-- Categories (Tabs)
CREATE TABLE IF NOT EXISTS categories (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    slug       VARCHAR(100) NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Slides
CREATE TABLE IF NOT EXISTS slides (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    category_id     INT NOT NULL,
    title           VARCHAR(200) NOT NULL,
    eyebrow         VARCHAR(200) DEFAULT NULL,
    description     TEXT,
    slide_image     VARCHAR(255),
    thumbnail_image VARCHAR(255),
    sort_order      INT DEFAULT 0,
    is_active       TINYINT(1) DEFAULT 1,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Seed: 3 categories matching the design
INSERT INTO categories (name, slug, sort_order) VALUES
('Learning',      'learning',      1),
('Technology',    'technology',    2),
('Communication', 'communication', 3);

-- Seed: 3 slides per category
-- NOTE: Update slide_image and thumbnail_image paths to match your server setup.
--       The image files are in files/images/ folder.
INSERT INTO slides (category_id, title, eyebrow, description, slide_image, thumbnail_image, sort_order) VALUES
(1, 'Usability enhancement and Training for Transaction Portal for Customers',
    'Digital Learning Infrastructure',
    'Comprehensive learning solutions tailored for enterprise growth.',
    'files/images/DL-Learning-1.jpg', 'files/images/DL-Learning-1.jpg', 1),

(1, 'Advanced E-Learning Platform for Corporate Training',
    'Digital Learning Infrastructure',
    'Scalable training solutions for modern enterprises.',
    'files/images/DL-Learning-1.jpg', 'files/images/DL-Learning-1.jpg', 2),

(1, 'Blended Learning Strategy for Remote Teams',
    'Digital Learning Infrastructure',
    'Connecting teams through digital-first learning experiences.',
    'files/images/DL-Learning-1.jpg', 'files/images/DL-Learning-1.jpg', 3),

(2, 'Enterprise Technology Transformation Programme',
    'Technology Solutions',
    'Modernising infrastructure for scalable digital growth.',
    'files/images/DL-Technology.jpg', 'files/images/DL-Technology.jpg', 1),

(2, 'Cloud Migration and DevOps Enablement',
    'Technology Solutions',
    'Seamless cloud transition with zero downtime.',
    'files/images/DL-Technology.jpg', 'files/images/DL-Technology.jpg', 2),

(2, 'AI Integration for Intelligent Business Automation',
    'Technology Solutions',
    'Leveraging machine learning to automate critical processes.',
    'files/images/DL-Technology.jpg', 'files/images/DL-Technology.jpg', 3),

(3, 'Omnichannel Communication Framework for Enterprises',
    'Communication Strategy',
    'Unified communication strategies across all digital touchpoints.',
    'files/images/DL-Communication.jpg', 'files/images/DL-Communication.jpg', 1),

(3, 'Internal Communication Redesign for Global Teams',
    'Communication Strategy',
    'Breaking silos with integrated communication platforms.',
    'files/images/DL-Communication.jpg', 'files/images/DL-Communication.jpg', 2),

(3, 'Customer Engagement and Feedback Loop Systems',
    'Communication Strategy',
    'Real-time feedback channels that improve customer satisfaction.',
    'files/images/DL-Communication.jpg', 'files/images/DL-Communication.jpg', 3);
