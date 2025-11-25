import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  reward_description: string | null;
  start_date: string;
  end_date: string;
}

interface UserChallenge {
  id: string;
  challenge_id: string;
  current_progress: number;
  completed: boolean;
  completed_at: string | null;
  challenges: Challenge;
}

export const useChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = async () => {
    if (!user) {
      setChallenges([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Get active challenges
    const { data: activeChallenges, error: challengesError } = await supabase
      .from("challenges")
      .select("*")
      .lte("start_date", new Date().toISOString())
      .gte("end_date", new Date().toISOString());

    if (challengesError) {
      console.error("Error fetching challenges:", challengesError);
      setLoading(false);
      return;
    }

    // Get user's progress on these challenges
    const { data: userChallenges, error: userChallengesError } = await supabase
      .from("user_challenges")
      .select("*, challenges(*)")
      .eq("user_id", user.id)
      .in(
        "challenge_id",
        activeChallenges.map((c) => c.id)
      );

    if (userChallengesError) {
      console.error("Error fetching user challenges:", userChallengesError);
    } else {
      setChallenges(userChallenges || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchChallenges();
  }, [user]);

  return { challenges, loading, refetch: fetchChallenges };
};
