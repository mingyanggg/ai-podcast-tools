-- Migration: Create usage_records table for transcription quota tracking
-- Run this in your Supabase SQL editor or via `supabase db push`

-- Create usage_records table
CREATE TABLE IF NOT EXISTS usage_records (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  month TEXT NOT NULL, -- Format: 'YYYY-MM-01'
  total_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint so we can upsert by user+month
CREATE UNIQUE INDEX IF NOT EXISTS usage_records_user_month_idx ON usage_records (user_id, month);

-- RLS: users can only read/write their own usage
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage records"
  ON usage_records FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage all usage records"
  ON usage_records FOR ALL
  USING (auth.role() = 'service_role');
