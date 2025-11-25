import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
}

interface UserBadge {
  id: string;
  badge_id: string;
  unlocked_at: string;
  badges: Badge;
}

export const useBadges = () => {
  const { user } = useAuth();
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      setLoading(true);

      // Fetch all badges
      const { data: badgesData, error: badgesError } = await supabase
        .from("badges")
        .select("*")
        .order("requirement_value", { ascending: true });

      if (badgesError) {
        console.error("Error fetching badges:", badgesError);
      } else {
        setAllBadges(badgesData || []);
      }

      // Fetch user's unlocked badges if logged in
      if (user) {
        const { data: userBadgesData, error: userBadgesError } = await supabase
          .from("user_badges")
          .select("*, badges(*)")
          .eq("user_id", user.id);

        if (userBadgesError) {
          console.error("Error fetching user badges:", userBadgesError);
        } else {
          setUserBadges(userBadgesData || []);
        }
      }

      setLoading(false);
    };

    fetchBadges();
  }, [user]);

  const isUnlocked = (badgeId: string) => {
    return userBadges.some((ub) => ub.badge_id === badgeId);
  };

  return { allBadges, userBadges, loading, isUnlocked };
};
