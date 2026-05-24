-- Migration: Create users table for subscription tier management
-- Run this in your Supabase SQL editor or via `supabase db push`

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'business')),
  lemon_squeezy_subscription_id TEXT,
  lemon_squeezy_variant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast email lookups (used by webhook handler)
CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email);

-- RLS: users can only read their own row
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own record"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Service role can manage all users"
  ON users FOR ALL
  USING (auth.role() = 'service_role');

-- Note: The webhook handler uses serviceRoleClient directly (bypasses RLS)
-- so it can update any user's subscription_tier by email.
