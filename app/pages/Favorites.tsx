import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { RoomCard } from '@/components/RoomCard';
import { supabase } from '@/integrations/supabase/client';
import { Heart } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          listing_id,
          room_listings (
            *,
            flatmates (
              id,
              name,
              age,
              gender,
              nationality,
              occupation,
              traits,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      const listings = data?.map(f => f.room_listings).filter(Boolean) || [];
      setFavorites(listings);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = () => {
    // Refresh favorites when a favorite is toggled
    fetchFavorites();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-display font-bold">My Favorites</h1>
          </div>
          <p className="text-muted-foreground">
            {favorites.length} saved {favorites.length === 1 ? 'listing' : 'listings'}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No favorites yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((listing: any) => (
              <div key={listing.id}>
                <RoomCard
                  id={listing.id}
                  image={listing.images?.[0] || '/placeholder.svg'}
                  price={listing.price}
                  location={listing.location}
                  roomType={listing.room_type}
                  availableFrom={new Date(listing.available_from).toLocaleDateString()}
                  bedrooms={listing.total_bedrooms || 1}
                  bathrooms={listing.total_bathrooms || 1}
                  amenities={listing.amenities || []}
                  flatmates={listing.flatmates?.map((f: any) => ({
                    name: f.name || 'Anonymous',
                    age: f.age || 25,
                    nationality: f.nationality || 'Unknown',
                    occupation: f.occupation || 'Professional',
                    traits: f.traits || []
                  })) || []}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
