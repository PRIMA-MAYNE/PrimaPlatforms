-- Disable email confirmation requirement in Supabase
-- Run this in your Supabase SQL Editor to allow automatic confirmation

-- Update auth settings to disable email confirmation
UPDATE auth.config 
SET email_confirm = false 
WHERE TRUE;

-- Alternative: Update user email_confirmed_at for existing users
-- (Run this if you want to confirm existing users automatically)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Create function to auto-confirm new users
CREATE OR REPLACE FUNCTION auto_confirm_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically confirm email for new users
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-confirm users on signup
DROP TRIGGER IF EXISTS auto_confirm_trigger ON auth.users;
CREATE TRIGGER auto_confirm_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auto_confirm_users();

-- Note: This disables email confirmation entirely for all new users
-- They will be able to sign in immediately after account creation
