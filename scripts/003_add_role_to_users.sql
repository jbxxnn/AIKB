-- Add role column to users table for agent selection
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Update existing users to have 'user' role (you can manually change specific users to 'admin' as needed)
UPDATE users SET role = 'user' WHERE role IS NULL;





