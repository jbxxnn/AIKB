-- Create calendar_settings table to store OAuth tokens and configuration
CREATE TABLE IF NOT EXISTS calendar_settings (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(50) NOT NULL DEFAULT 'google',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  calendar_id VARCHAR(255),
  connected_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS calendar_settings_provider_idx ON calendar_settings(provider);
CREATE INDEX IF NOT EXISTS calendar_settings_active_idx ON calendar_settings(is_active);
CREATE INDEX IF NOT EXISTS calendar_settings_user_idx ON calendar_settings(connected_by_user_id);

-- Ensure only one active calendar connection at a time
CREATE UNIQUE INDEX IF NOT EXISTS calendar_settings_active_unique 
ON calendar_settings(provider) 
WHERE is_active = true;
