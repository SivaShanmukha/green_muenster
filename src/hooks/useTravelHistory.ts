import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface TravelHistoryEntry {
  id: string;
  user_id: string;
  from_location: string;
  to_location: string;
  transport_mode: string;
  distance: number;
  co2_emissions: number;
  co2_saved: number;
  trip_date: string;
  created_at: string;
}

export const useTravelHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<TravelHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("travel_history")
      .select("*")
      .eq("user_id", user.id)
      .order("trip_date", { ascending: false });

    if (error) {
      console.error("Error fetching travel history:", error);
    } else {
      setHistory(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const addTrip = async (trip: Omit<TravelHistoryEntry, "id" | "user_id" | "created_at">) => {
    if (!user) return;

    const { error } = await supabase.from("travel_history").insert({
      user_id: user.id,
      ...trip,
    });

    if (error) {
      console.error("Error adding trip:", error);
      throw error;
    }

    await fetchHistory();
  };

  return { history, loading, addTrip, refetch: fetchHistory };
};
