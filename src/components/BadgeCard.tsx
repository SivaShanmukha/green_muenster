import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface BadgeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isUnlocked: boolean;
  progress?: number;
}

const BadgeCard = ({ icon: Icon, title, description, isUnlocked, progress }: BadgeCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border-2 p-6 transition-all duration-300",
        isUnlocked
          ? "border-primary bg-gradient-to-br from-primary/5 to-accent/10 shadow-md"
          : "border-border bg-card opacity-60"
      )}
    >
      <div className="flex items-start space-x-4">
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300",
            isUnlocked
              ? "bg-primary text-primary-foreground animate-pulse-glow"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-8 w-8" />
        </div>
        
        <div className="flex-1 space-y-1">
          <h3 className={cn("font-bold text-lg", isUnlocked ? "text-primary" : "text-muted-foreground")}>
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          
          {!isUnlocked && progress !== undefined && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs font-semibold text-foreground">{progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {isUnlocked && (
        <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-success flex items-center justify-center shadow-lg">
          <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default BadgeCard;
