-- Run this SQL in Supabase SQL Editor
-- Go to: Supabase Dashboard → SQL Editor → New Query

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time Capsules table
CREATE TABLE IF NOT EXISTS time_capsules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    recipient_type TEXT NOT NULL,
    recipient_email TEXT,
    open_date TIMESTAMP WITH TIME ZONE NOT NULL,
    audio_file_url TEXT,
    video_file_url TEXT,
    image_file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_sent BOOLEAN DEFAULT FALSE
);

-- Community Posts table
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_time_capsules_user_id ON time_capsules(user_id);
CREATE INDEX IF NOT EXISTS idx_time_capsules_open_date ON time_capsules(open_date);
CREATE INDEX IF NOT EXISTS idx_community_posts_year ON community_posts(year);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Allow anyone to create a user (for signup)
CREATE POLICY "Anyone can create users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (true);

-- RLS Policies for time_capsules table
CREATE POLICY "Users can view their own capsules" ON time_capsules
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own capsules" ON time_capsules
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own capsules" ON time_capsules
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own capsules" ON time_capsules
    FOR DELETE USING (true);

-- RLS Policies for community_posts table
CREATE POLICY "Anyone can view community posts" ON community_posts
    FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON community_posts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own posts" ON community_posts
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own posts" ON community_posts
    FOR DELETE USING (true);

-- Create a function to clean up old capsules (optional)
CREATE OR REPLACE FUNCTION cleanup_opened_capsules()
RETURNS void AS $$
BEGIN
    DELETE FROM time_capsules 
    WHERE open_date < NOW() - INTERVAL '30 days' 
    AND is_sent = TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE users IS 'User accounts for the Time Capsule application';
COMMENT ON TABLE time_capsules IS 'Time capsules created by users';
COMMENT ON TABLE community_posts IS 'Community posts shared by users for specific years';
