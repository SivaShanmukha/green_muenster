import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_co2_saved: number;
  total_trips: number;
  rank: number;
}

export const useLeaderboard = (timePeriod: "week" | "month" = "week") => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc("get_leaderboard", {
        time_period: timePeriod,
      });

      if (rpcError) {
        throw rpcError;
      }

      setLeaderboard(data || []);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [timePeriod]);

  return { leaderboard, loading, error, refetch: fetchLeaderboard };
};
