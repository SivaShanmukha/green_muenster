-- Add notification and privacy settings to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS trip_reminders boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS challenge_updates boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS leaderboard_updates boolean DEFAULT true;