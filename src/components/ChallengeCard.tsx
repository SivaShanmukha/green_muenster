import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, CheckCircle2 } from "lucide-react";

interface ChallengeCardProps {
  title: string;
  description: string;
  currentProgress: number;
  targetValue: number;
  completed: boolean;
  reward?: string | null;
}

const ChallengeCard = ({
  title,
  description,
  currentProgress,
  targetValue,
  completed,
  reward,
}: ChallengeCardProps) => {
  const progressPercentage = Math.min((currentProgress / targetValue) * 100, 100);

  return (
    <Card className="p-6 relative overflow-hidden">
      {completed && (
        <div className="absolute top-4 right-4">
          <CheckCircle2 className="h-6 w-6 text-success" />
        </div>
      )}
      
      <div className="flex items-start space-x-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Trophy className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-bold text-foreground">
                {currentProgress.toFixed(1)} / {targetValue}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {reward && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Reward:</span> {reward}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ChallengeCard;
