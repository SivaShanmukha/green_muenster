import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface EmissionProgressProps {
  current: number;
  target: number;
  level: "low" | "medium" | "high";
}

const EmissionProgress = ({ current, target, level }: EmissionProgressProps) => {
  const percentage = Math.min((current / target) * 100, 100);
  
  const levelColors = {
    low: "bg-success",
    medium: "bg-warning",
    high: "bg-danger",
  };

  const levelText = {
    low: "Excellent! Low emissions",
    medium: "Good! Moderate emissions",
    high: "High emissions - consider alternatives",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">CO₂ Emissions</span>
        <span className={cn("text-sm font-bold", levelColors[level].replace("bg-", "text-"))}>
          {current}g / {target}g
        </span>
      </div>
      
      <div className="relative">
        <Progress value={percentage} className="h-3" />
        <div 
          className={cn("absolute top-0 left-0 h-3 rounded-full transition-all duration-500", levelColors[level])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <p className={cn("text-xs font-medium", levelColors[level].replace("bg-", "text-"))}>
        {levelText[level]}
      </p>
    </div>
  );
};

export default EmissionProgress;
