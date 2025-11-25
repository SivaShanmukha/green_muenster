import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface TransportModeCardProps {
  icon: LucideIcon;
  label: string;
  co2Value: string;
  emissions: "low" | "medium" | "high";
  isSelected?: boolean;
  onClick?: () => void;
}

const TransportModeCard = ({
  icon: Icon,
  label,
  co2Value,
  emissions,
  isSelected = false,
  onClick,
}: TransportModeCardProps) => {
  const emissionColors = {
    low: "border-success text-success",
    medium: "border-warning text-warning",
    high: "border-danger text-danger",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all duration-300 hover:scale-105",
        "bg-card hover:bg-accent/5",
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-border",
        "focus:outline-none focus:ring-2 focus:ring-primary/20"
      )}
    >
      <Icon className={cn("h-12 w-12 mb-3", isSelected ? "text-primary" : "text-foreground")} />
      <span className={cn("font-semibold text-lg mb-2", isSelected ? "text-primary" : "text-foreground")}>
        {label}
      </span>
      <div className="flex items-center space-x-1">
        <span className={cn("text-sm font-medium", emissionColors[emissions])}>
          {co2Value} CO₂
        </span>
      </div>
      {isSelected && (
        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
          <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
};

export default TransportModeCard;
