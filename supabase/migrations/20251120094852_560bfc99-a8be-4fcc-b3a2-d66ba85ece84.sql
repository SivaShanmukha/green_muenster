-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  reward_description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_challenges table
CREATE TABLE public.user_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  current_progress NUMERIC NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges (public read)
CREATE POLICY "Badges are viewable by everyone"
ON public.badges FOR SELECT
USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges"
ON public.user_badges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
ON public.user_badges FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for challenges (public read)
CREATE POLICY "Challenges are viewable by everyone"
ON public.challenges FOR SELECT
USING (true);

-- RLS Policies for user_challenges
CREATE POLICY "Users can view their own challenges"
ON public.user_challenges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges"
ON public.user_challenges FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
ON public.user_challenges FOR UPDATE
USING (auth.uid() = user_id);

-- Insert initial badges
INSERT INTO public.badges (name, description, icon, requirement_type, requirement_value) VALUES
('First Trip', 'Complete your first eco-friendly journey', 'Footprints', 'trip_count', 1),
('Getting Started', 'Complete 5 trips', 'MapPin', 'trip_count', 5),
('Eco Warrior', 'Complete 10 trips', 'Shield', 'trip_count', 10),
('Century Club', 'Complete 100 trips', 'Trophy', 'trip_count', 100),
('Carbon Saver', 'Save 1kg of CO₂', 'Leaf', 'co2_saved', 1),
('Climate Champion', 'Save 10kg of CO₂', 'Award', 'co2_saved', 10),
('Bike Enthusiast', 'Take 10 bike trips', 'Bike', 'bike_trips', 10),
('7-Day Streak', 'Travel sustainably for 7 consecutive days', 'Flame', 'streak', 7),
('30-Day Streak', 'Travel sustainably for 30 consecutive days', 'Star', 'streak', 30);

-- Insert weekly challenges
INSERT INTO public.challenges (title, description, challenge_type, target_value, reward_description, start_date, end_date) VALUES
('Bike Week Challenge', 'Take 5 bike trips this week', 'bike_trips', 5, 'Unlock "Bike Enthusiast" badge', date_trunc('week', now()), date_trunc('week', now()) + interval '1 week'),
('CO₂ Saver', 'Save 500g of CO₂ this week', 'co2_saved', 0.5, 'Earn 50 eco points', date_trunc('week', now()), date_trunc('week', now()) + interval '1 week'),
('Public Transport Champion', 'Use public transport 7 times this week', 'public_transport_trips', 7, 'Unlock special badge', date_trunc('week', now()), date_trunc('week', now()) + interval '1 week');

-- Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_trip_count INTEGER;
  user_co2_saved NUMERIC;
  user_bike_trips INTEGER;
  badge_record RECORD;
BEGIN
  -- Get user statistics
  SELECT 
    COUNT(*) as trip_count,
    COALESCE(SUM(co2_saved), 0) as total_co2,
    COUNT(*) FILTER (WHERE transport_mode = 'bike') as bike_count
  INTO user_trip_count, user_co2_saved, user_bike_trips
  FROM public.travel_history
  WHERE user_id = NEW.user_id;

  -- Check each badge
  FOR badge_record IN SELECT * FROM public.badges LOOP
    -- Check if user already has this badge
    IF NOT EXISTS (
      SELECT 1 FROM public.user_badges 
      WHERE user_id = NEW.user_id AND badge_id = badge_record.id
    ) THEN
      -- Award badge based on requirement type
      IF (badge_record.requirement_type = 'trip_count' AND user_trip_count >= badge_record.requirement_value) OR
         (badge_record.requirement_type = 'co2_saved' AND user_co2_saved >= badge_record.requirement_value) OR
         (badge_record.requirement_type = 'bike_trips' AND user_bike_trips >= badge_record.requirement_value) THEN
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (NEW.user_id, badge_record.id);
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Function to update challenge progress
CREATE OR REPLACE FUNCTION public.update_challenge_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  challenge_record RECORD;
  user_progress NUMERIC;
BEGIN
  -- Update progress for each active challenge
  FOR challenge_record IN 
    SELECT * FROM public.challenges 
    WHERE now() BETWEEN start_date AND end_date
  LOOP
    -- Calculate progress based on challenge type
    IF challenge_record.challenge_type = 'bike_trips' THEN
      SELECT COUNT(*) INTO user_progress
      FROM public.travel_history
      WHERE user_id = NEW.user_id 
        AND transport_mode = 'bike'
        AND trip_date >= challenge_record.start_date;
    ELSIF challenge_record.challenge_type = 'co2_saved' THEN
      SELECT COALESCE(SUM(co2_saved), 0) INTO user_progress
      FROM public.travel_history
      WHERE user_id = NEW.user_id 
        AND trip_date >= challenge_record.start_date;
    ELSIF challenge_record.challenge_type = 'public_transport_trips' THEN
      SELECT COUNT(*) INTO user_progress
      FROM public.travel_history
      WHERE user_id = NEW.user_id 
        AND transport_mode IN ('bus', 'train', 'tram')
        AND trip_date >= challenge_record.start_date;
    END IF;

    -- Insert or update user challenge progress
    INSERT INTO public.user_challenges (user_id, challenge_id, current_progress, completed)
    VALUES (
      NEW.user_id, 
      challenge_record.id, 
      user_progress,
      user_progress >= challenge_record.target_value
    )
    ON CONFLICT (user_id, challenge_id) 
    DO UPDATE SET 
      current_progress = user_progress,
      completed = user_progress >= challenge_record.target_value,
      completed_at = CASE 
        WHEN user_progress >= challenge_record.target_value AND user_challenges.completed = false 
        THEN now() 
        ELSE user_challenges.completed_at 
      END;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER award_badges_on_trip
AFTER INSERT ON public.travel_history
FOR EACH ROW
EXECUTE FUNCTION public.check_and_award_badges();

CREATE TRIGGER update_challenges_on_trip
AFTER INSERT ON public.travel_history
FOR EACH ROW
EXECUTE FUNCTION public.update_challenge_progress();