import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompatibilityScore } from "./CompatibilityScore";
import { FlatmateCard } from "./FlatmateCard";
import { MapPin, BedDouble, Bath, Wifi, CheckCircle2, Heart, Rocket } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client.ts";
import { toast } from "@/hooks/use-toast";
import { useCompatibilityScore } from "@/hooks/useCompatibilityScore";
import { useListingBoost } from "@/hooks/useListingBoost";

interface Flatmate {
  name: string;
  age: number;
  nationality: string;
  occupation: string;
  traits: string[];
}

interface RoomCardProps {
  id: string;
  image: string;
  price: number;
  location: string;
  address?: string;
  roomType: string;
  availableFrom: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  flatmates: Flatmate[];
  featured?: boolean;
}

export const RoomCard = ({
  id,
  image,
  price,
  location,
  address,
  roomType,
  availableFrom,
  bedrooms,
  bathrooms,
  amenities,
  flatmates,
  featured = false
}: RoomCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const { score: compatibilityScore } = useCompatibilityScore(id);
  const { isBoosted } = useListingBoost(id);

  useEffect(() => {
    if (user) {
      checkFavorite();
    }
  }, [user, id]);

  const checkFavorite = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', id)
        .single();

      setIsFavorite(!!data);
    } catch (error) {
      // Not a favorite
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', id);

        if (error) throw error;
        setIsFavorite(false);
        toast({
          title: "Removed from favorites",
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, listing_id: id }]);

        if (error) throw error;
        setIsFavorite(true);
        toast({
          title: "Added to favorites",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 border border-border group">
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={`Room in ${location}`}
          loading="lazy"
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Overlay Elements */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <div className="flex gap-2">
            {isBoosted && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-lg flex items-center gap-1">
                <Rocket className="w-3 h-3" />
                Boosted
              </Badge>
            )}
            {featured && (
              <Badge className="bg-accent text-accent-foreground font-semibold shadow-lg">
                Featured
              </Badge>
            )}
            <Badge className="bg-primary text-primary-foreground font-semibold shadow-lg">
              {roomType}
            </Badge>
          </div>
          
          <button
            onClick={toggleFavorite}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
          >
            <Heart 
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
        </div>

        {/* Compatibility Score - Bottom Right */}
        <div className="absolute bottom-4 right-4">
          <CompatibilityScore score={compatibilityScore} size="md" />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Price & Location */}
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-foreground">€{price}</span>
            <span className="text-sm text-muted-foreground">/month</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">{location}</span>
          </div>
          {address && (
            <p className="text-xs text-muted-foreground ml-5">{address}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">Available from {availableFrom}</p>
        </div>

        {/* Property Features */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <BedDouble className="w-4 h-4" />
            <span>{bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4" />
            <span>{bathrooms} bath</span>
          </div>
          {amenities.includes('WiFi') && (
            <div className="flex items-center gap-1.5">
              <Wifi className="w-4 h-4" />
              <span>WiFi</span>
            </div>
          )}
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5">
          {amenities.slice(0, 4).map((amenity, idx) => (
            <Badge key={idx} variant="outline" className="text-xs font-normal">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {amenity}
            </Badge>
          ))}
          {amenities.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{amenities.length - 4} more
            </Badge>
          )}
        </div>

        {/* Flatmates Section */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-semibold text-foreground">Current Flatmates</h4>
            <Badge variant="secondary" className="text-xs">
              {flatmates.length} {flatmates.length === 1 ? 'person' : 'people'}
            </Badge>
          </div>
          <div className="space-y-2">
            {flatmates.map((flatmate, idx) => (
              <FlatmateCard key={idx} {...flatmate} />
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={() => navigate(`/room/${id}`)}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg h-12 text-base"
        >
          View Details & Message
        </Button>
      </div>
    </div>
  );
};
