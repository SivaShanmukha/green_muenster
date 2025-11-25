import { useState } from "react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import ShareDialog from "@/components/ShareDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, TrendingUp, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Leaderboard = () => {
  const { user } = useAuth();
  const [timePeriod, setTimePeriod] = useState<"week" | "month">("week");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareData, setShareData] = useState<{ rank: number; co2Saved: number; totalTrips: number } | null>(null);
  const { leaderboard, loading } = useLeaderboard(timePeriod);

  const handleShare = (rank: number, co2Saved: number, totalTrips: number) => {
    setShareData({ rank, co2Saved, totalTrips });
    setShareDialogOpen(true);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-700" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBgColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/10 border-yellow-500/20";
    if (rank === 2) return "bg-gray-400/10 border-gray-400/20";
    if (rank === 3) return "bg-amber-700/10 border-amber-700/20";
    return "bg-card";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {shareData && (
        <ShareDialog
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          rank={shareData.rank}
          co2Saved={shareData.co2Saved}
          totalTrips={shareData.totalTrips}
          timePeriod={timePeriod}
        />
      )}
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              Leaderboard
            </h1>
            <p className="text-muted-foreground">
              See who's saving the most CO₂ and leading the sustainability challenge
            </p>
          </div>

          <Tabs value={timePeriod} onValueChange={(v) => setTimePeriod(v as "week" | "month")} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : leaderboard.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No data yet for this period. Start tracking your trips to appear on the leaderboard!
                  </p>
                </CardContent>
              </Card>
            ) : (
              leaderboard.map((entry) => {
                const isCurrentUser = user?.id === entry.user_id;
                const rank = Number(entry.rank);
                
                return (
                  <Card 
                    key={entry.user_id} 
                    className={cn(
                      "transition-all duration-200 hover:shadow-md",
                      getRankBgColor(rank),
                      isCurrentUser && "ring-2 ring-primary"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12">
                          {getRankIcon(rank)}
                        </div>
                        
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={entry.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {entry.display_name?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-semibold text-foreground truncate",
                            isCurrentUser && "text-primary"
                          )}>
                            {entry.display_name || "Anonymous User"}
                            {isCurrentUser && " (You)"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entry.total_trips} {entry.total_trips === 1 ? "trip" : "trips"}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-bold text-success">
                              {Math.round(entry.total_co2_saved)}g
                            </p>
                            <p className="text-xs text-muted-foreground">CO₂ saved</p>
                          </div>
                          
                          {isCurrentUser && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleShare(rank, entry.total_co2_saved, entry.total_trips)}
                              className="ml-2"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
