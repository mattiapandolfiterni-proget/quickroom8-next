import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Home, Sparkles } from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";

interface FlatmateCardProps {
  name: string;
  age: number;
  nationality: string;
  occupation: string;
  traits: string[];
  avatar?: string;
  className?: string;
  isVerified?: boolean;
}

export const FlatmateCard = ({ 
  name, 
  age, 
  nationality, 
  occupation, 
  traits,
  avatar,
  className,
  isVerified
}: FlatmateCardProps) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  return (
    <div className={`bg-card rounded-2xl p-4 border border-border shadow-card hover:shadow-elevated transition-all duration-300 ${className || ''}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-semibold text-foreground text-base truncate">{name}</h4>
            <span className="text-sm text-muted-foreground whitespace-nowrap">{age}</span>
            <VerifiedBadge isVerified={isVerified} size="sm" showText={false} />
          </div>
          
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Home className="w-3.5 h-3.5" />
              <span className="truncate">{nationality}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Briefcase className="w-3.5 h-3.5" />
              <span className="truncate">{occupation}</span>
            </div>
          </div>
          
          {/* Traits */}
          <div className="flex flex-wrap gap-1.5">
            {traits.slice(0, 3).map((trait, idx) => (
              <Badge 
                key={idx} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 font-normal"
              >
                {trait}
              </Badge>
            ))}
            {traits.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{traits.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
