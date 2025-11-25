-- Add privacy consent field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN share_stats_consent BOOLEAN NOT NULL DEFAULT false;

-- Update existing users to have consent as false by default
UPDATE public.profiles 
SET share_stats_consent = false 
WHERE share_stats_consent IS NULL;