-- WPoets Full Stack Test Database
CREATE DATABASE IF NOT EXISTS wpoets_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wpoets_db;

-- Categories (Tabs)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Slides
CREATE TABLE IF NOT EXISTS slides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    slide_image VARCHAR(255),
    thumbnail_image VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Seed data
INSERT INTO categories (name, slug, sort_order) VALUES
('Architecture', 'architecture', 1),
('Interior Design', 'interior-design', 2),
('Landscape', 'landscape', 3),
('Urban Planning', 'urban-planning', 4);

INSERT INTO slides (category_id, title, description, slide_image, thumbnail_image, sort_order) VALUES
(1, 'Modern Villa', 'A stunning contemporary villa with clean lines and open spaces.', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&h=500&fit=crop', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=600&fit=crop', 1),
(1, 'Glass Tower', 'Cutting-edge glass skyscraper reflecting the city skyline.', 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&h=500&fit=crop', 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=600&fit=crop', 2),
(1, 'Wooden Retreat', 'Rustic wooden cabin nestled in a forested mountain setting.', 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=900&h=500&fit=crop', 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=600&h=600&fit=crop', 3),

(2, 'Minimalist Living', 'Clean, minimalist living room with warm natural tones.', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&h=500&fit=crop', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop', 1),
(2, 'Industrial Kitchen', 'Bold industrial kitchen with exposed brick and metal accents.', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&h=500&fit=crop', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop', 2),
(2, 'Cozy Bedroom', 'Warm and inviting bedroom with layered textures and soft lighting.', 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=900&h=500&fit=crop', 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&h=600&fit=crop', 3),

(3, 'Zen Garden', 'A serene Japanese-inspired garden with raked gravel and stone lanterns.', 'https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?w=900&h=500&fit=crop', 'https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?w=600&h=600&fit=crop', 1),
(3, 'Rooftop Terrace', 'Lush rooftop garden with city panorama views.', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&h=500&fit=crop', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop', 2),
(3, 'Wildflower Meadow', 'An organic wildflower landscape blending with the natural terrain.', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900&h=500&fit=crop', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&h=600&fit=crop', 3),

(4, 'City Hub', 'A vibrant mixed-use urban hub with pedestrian-first design.', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900&h=500&fit=crop', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=600&fit=crop', 1),
(4, 'Green Corridor', 'Tree-lined urban corridor reconnecting neighborhoods.', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=900&h=500&fit=crop', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=600&fit=crop', 2),
(4, 'Waterfront Plaza', 'Revitalized waterfront plaza integrating culture and commerce.', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=900&h=500&fit=crop', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=600&fit=crop', 3);
