-- Create a function to get leaderboard data
CREATE OR REPLACE FUNCTION public.get_leaderboard(time_period text DEFAULT 'week')
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  total_co2_saved numeric,
  total_trips bigint,
  rank bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  start_date timestamp with time zone;
BEGIN
  -- Calculate start date based on time period
  IF time_period = 'week' THEN
    start_date := date_trunc('week', now());
  ELSIF time_period = 'month' THEN
    start_date := date_trunc('month', now());
  ELSE
    start_date := date_trunc('week', now());
  END IF;

  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.display_name,
    p.avatar_url,
    COALESCE(SUM(th.co2_saved), 0) as total_co2_saved,
    COUNT(th.id) as total_trips,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(th.co2_saved), 0) DESC) as rank
  FROM public.profiles p
  LEFT JOIN public.travel_history th ON p.id = th.user_id 
    AND th.trip_date >= start_date
  GROUP BY p.id, p.display_name, p.avatar_url
  HAVING COALESCE(SUM(th.co2_saved), 0) > 0
  ORDER BY total_co2_saved DESC
  LIMIT 100;
END;
$$;