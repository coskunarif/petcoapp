-- Create user notification settings table
CREATE TABLE IF NOT EXISTS user_notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  master_enabled BOOLEAN NOT NULL DEFAULT true,
  push_token TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Add comment to the table
COMMENT ON TABLE user_notification_settings IS 'Stores notification preferences for users';

-- Create index for efficient lookups by user_id
CREATE INDEX IF NOT EXISTS user_notification_settings_user_id_idx ON user_notification_settings(user_id);

-- Create RLS policies
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view and update their own notification settings
CREATE POLICY user_notification_settings_policy
  ON user_notification_settings
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add notification settings when a new user is created (via trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_notification_settings (user_id, settings, master_enabled)
  VALUES (
    NEW.id,
    '{
      "messages": true,
      "service_requests": true,
      "service_updates": true,
      "promotions": false,
      "payment": true,
      "system": true
    }'::jsonb,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default notification settings for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();