-- Substrate Database Schema
-- Publishing platform for posthuman thought

-- Users (writers)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Publications (like a Substack)
CREATE TABLE publications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  header_image VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  publication_id INTEGER REFERENCES publications(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  is_published BOOLEAN DEFAULT false,
  is_paid BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(publication_id, slug)
);

-- Subscriptions
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  publication_id INTEGER REFERENCES publications(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- active, cancelled, expired
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(publication_id, email)
);

-- Create indexes for performance
CREATE INDEX idx_posts_publication ON posts(publication_id);
CREATE INDEX idx_posts_published ON posts(is_published, published_at);
CREATE INDEX idx_subscriptions_publication ON subscriptions(publication_id);
CREATE INDEX idx_subscriptions_email ON subscriptions(email);
CREATE INDEX idx_publications_slug ON publications(slug);
