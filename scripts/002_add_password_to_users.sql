-- Add password column to users table for credentials authentication
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
