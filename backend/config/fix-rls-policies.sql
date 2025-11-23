-- Run this in Supabase SQL Editor to fix RLS policies

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own capsules" ON time_capsules;
DROP POLICY IF EXISTS "Users can create their own capsules" ON time_capsules;
DROP POLICY IF EXISTS "Users can update their own capsules" ON time_capsules;
DROP POLICY IF EXISTS "Users can delete their own capsules" ON time_capsules;
DROP POLICY IF EXISTS "Anyone can view community posts" ON community_posts;
DROP POLICY IF EXISTS "Users can create posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON community_posts;

-- Create new permissive policies for users table
CREATE POLICY "Anyone can create users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (true);

-- Create new permissive policies for time_capsules table
CREATE POLICY "Users can view their own capsules" ON time_capsules
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own capsules" ON time_capsules
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own capsules" ON time_capsules
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own capsules" ON time_capsules
    FOR DELETE USING (true);

-- Create new permissive policies for community_posts table
CREATE POLICY "Anyone can view community posts" ON community_posts
    FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON community_posts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own posts" ON community_posts
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own posts" ON community_posts
    FOR DELETE USING (true);
