import { cn } from "@/lib/utils";

interface CompatibilityScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export const CompatibilityScore = ({ 
  score, 
  size = "md", 
  showLabel = true,
  className 
}: CompatibilityScoreProps) => {
  const getScoreColor = () => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-warning";
    return "text-muted-foreground";
  };

  const getScoreBg = () => {
    if (score >= 80) return "bg-success/10";
    if (score >= 60) return "bg-primary/10";
    if (score >= 40) return "bg-warning/10";
    return "bg-muted";
  };

  const sizeClasses = {
    sm: "w-12 h-12 text-sm",
    md: "w-16 h-16 text-lg",
    lg: "w-24 h-24 text-2xl"
  };

  const labelSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div 
        className={cn(
          "rounded-full flex items-center justify-center font-bold transition-all duration-300",
          sizeClasses[size],
          getScoreBg(),
          getScoreColor()
        )}
        style={{
          boxShadow: score >= 80 ? '0 0 20px hsl(var(--success) / 0.3)' : undefined
        }}
      >
        {score}%
      </div>
      {showLabel && (
        <span className={cn("text-muted-foreground font-medium", labelSizes[size])}>
          Match
        </span>
      )}
    </div>
  );
};
