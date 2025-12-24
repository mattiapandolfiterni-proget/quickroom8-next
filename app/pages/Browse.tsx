import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoomCard } from '@/components/RoomCard';
import { Header } from '@/components/Header';
import SEO from '@/components/SEO';
import { SaveSearchDialog } from '@/components/SaveSearchDialog';
import { SavedSearches } from '@/components/SavedSearches';
import Map from '@/components/Map';
import { Search, Filter, SlidersHorizontal, LayoutGrid, MapIcon, Plus } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { RoomGridSkeleton } from '@/components/LoadingState';
import { logger } from '@/lib/logger';

const log = logger.scope('Browse');

const Browse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('map');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roomType, setRoomType] = useState('all');
  const [hasPrivateBathroom, setHasPrivateBathroom] = useState<string>('all');
  const [isFurnished, setIsFurnished] = useState<string>('all');
  const [isPetFriendly, setIsPetFriendly] = useState<string>('all');
  const [billsIncluded, setBillsIncluded] = useState<string>('all');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured) {
      log.warn('Supabase not configured - skipping data fetch');
      setListings([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch only active AND verified/approved listings
      // Both conditions must be true for public visibility
      const { data: listingsData, error: listingsError } = await supabase
        .from('room_listings')
        .select(`
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
        `)
        .eq('is_active', true)
        .eq('is_verified', true) // CRITICAL: Only show admin-approved listings
        .order('created_at', { ascending: false });

      if (listingsError) {
        log.error('Error fetching listings', listingsError, {
          data: { code: listingsError.code, hint: listingsError.hint }
        });
        throw listingsError;
      }

      // Debug: Log if no listings found
      if (!listingsData || listingsData.length === 0) {
        log.debug('No approved listings found');
      }

      // Fetch active boosts (non-critical, don't fail if this errors)
      let boostedListingIds = new Set<string>();
      try {
        const { data: boostsData } = await supabase
          .from('listing_boosts')
          .select('listing_id')
          .eq('payment_status', 'completed')
          .gt('expires_at', new Date().toISOString());

        boostedListingIds = new Set(boostsData?.map(b => b.listing_id) || []);
      } catch {
        // Boosts fetch failed, continue without boost sorting
      }

      // Sort listings: boosted first, then by created_at
      const sortedListings = (listingsData || []).sort((a, b) => {
        const aIsBoosted = boostedListingIds.has(a.id);
        const bIsBoosted = boostedListingIds.has(b.id);
        
        if (aIsBoosted && !bIsBoosted) return -1;
        if (!aIsBoosted && bIsBoosted) return 1;
        
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setListings(sortedListings);
    } catch (error: any) {
      const errorMessage = error?.message || error?.error_description || 'Unknown error';
      log.error('Failed to fetch listings', new Error(errorMessage), {
        data: { code: error?.code, hint: error?.hint }
      });
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1];
    const matchesSearch = searchQuery === '' || 
      listing.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRoomType = roomType === 'all' || listing.room_type === roomType;
    const matchesBathroom = hasPrivateBathroom === 'all' || listing.has_private_bathroom === (hasPrivateBathroom === 'true');
    const matchesFurnished = isFurnished === 'all' || listing.is_furnished === (isFurnished === 'true');
    const matchesPets = isPetFriendly === 'all' || listing.is_pet_friendly === (isPetFriendly === 'true');
    const matchesBills = billsIncluded === 'all' || listing.bills_included === (billsIncluded === 'true');
    
    return matchesPrice && matchesSearch && matchesRoomType && matchesBathroom && 
           matchesFurnished && matchesPets && matchesBills;
  });

  // ItemList structured data for listings
  const listingsStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Available Rooms in Malta',
    description: 'Browse available rooms for rent in Malta',
    numberOfItems: filteredListings.length,
    itemListElement: filteredListings.slice(0, 10).map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: listing.title,
        description: `${listing.room_type} room in ${listing.location}`,
        url: `https://www.quickroom8.com/room/${listing.id}`,
        offers: {
          '@type': 'Offer',
          price: listing.price,
          priceCurrency: 'EUR',
        },
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Browse Rooms for Rent in Malta"
        description={`Find ${filteredListings.length}+ available rooms in Malta. Filter by price, location, room type, and amenities. Private rooms, shared rooms, and ensuite options available.`}
        keywords="browse rooms Malta, rooms for rent Malta, flatshare Malta, student rooms Malta, private room Malta, shared room Malta, accommodation Malta"
        url="https://www.quickroom8.com/browse"
        structuredData={listingsStructuredData}
      />
      <Header />
      {/* Search Bar */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="container py-4">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 h-12 bg-card border border-border rounded-xl">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search by location or keyword..."
                className="border-0 focus-visible:ring-0 h-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => navigate('/list-room')}
              size="lg"
              className="gap-2 hidden sm:flex"
            >
              <Plus className="w-4 h-4" />
              List Your Room
            </Button>
            {user && (
              <SaveSearchDialog
                filters={{
                  location: searchQuery,
                  minPrice: priceRange[0],
                  maxPrice: priceRange[1],
                  roomType: roomType !== 'all' ? roomType : null,
                  hasPrivateBathroom: hasPrivateBathroom !== 'all' ? hasPrivateBathroom === 'true' : null,
                  isFurnished: isFurnished !== 'all' ? isFurnished === 'true' : null,
                  isPetFriendly: isPetFriendly !== 'all' ? isPetFriendly === 'true' : null,
                  billsIncluded: billsIncluded !== 'all' ? billsIncluded === 'true' : null,
                }}
              />
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="lg" className="px-4">
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Listings</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <Label>Price Range (€{priceRange[0]} - €{priceRange[1]})</Label>
                    <Slider
                      min={0}
                      max={2000}
                      step={50}
                      value={priceRange}
                      onValueChange={setPriceRange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Room Type</Label>
                    <Select value={roomType} onValueChange={setRoomType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        <SelectItem value="private">Private Room</SelectItem>
                        <SelectItem value="shared">Shared Room</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="ensuite">Ensuite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Private Bathroom</Label>
                    <Select value={hasPrivateBathroom} onValueChange={setHasPrivateBathroom}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Furnished</Label>
                    <Select value={isFurnished} onValueChange={setIsFurnished}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Pet Friendly</Label>
                    <Select value={isPetFriendly} onValueChange={setIsPetFriendly}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Bills Included</Label>
                    <Select value={billsIncluded} onValueChange={setBillsIncluded}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setPriceRange([0, 2000]);
                      setRoomType('all');
                      setHasPrivateBathroom('all');
                      setIsFurnished('all');
                      setIsPetFriendly('all');
                      setBillsIncluded('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="container py-8">
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">Browse Listings</TabsTrigger>
            {user && <TabsTrigger value="saved">Saved Searches</TabsTrigger>}
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-display font-bold mb-2">Available Rooms</h1>
                <p className="text-muted-foreground">{filteredListings.length} listings found</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                >
                  <MapIcon className="w-4 h-4 mr-2" />
                  Map
                </Button>
              </div>
            </div>

            {loading ? (
              <RoomGridSkeleton count={6} />
            ) : viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map(listing => (
                  <RoomCard
                    key={listing.id}
                    id={listing.id}
                    image={listing.images?.[0] || '/placeholder.svg'}
                    price={listing.price || 0}
                    location={listing.location || 'Malta'}
                    address={listing.address}
                    roomType={listing.room_type}
                    availableFrom={listing.available_from ? new Date(listing.available_from).toLocaleDateString() : 'Available Now'}
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
                ))}
              </div>
            ) : (
              <div className="h-[600px] rounded-lg overflow-hidden border border-border shadow-lg">
                <Map
                  listings={filteredListings.map(listing => ({
                    id: listing.id,
                    title: listing.title,
                    price: listing.price,
                    location: listing.location,
                    latitude: listing.latitude,
                    longitude: listing.longitude,
                  }))}
                  onMarkerClick={(listingId) => navigate(`/room/${listingId}`)}
                />
              </div>
            )}
          </TabsContent>

          {user && (
            <TabsContent value="saved">
              <div className="mb-6">
                <h2 className="text-2xl font-display font-bold mb-2">Saved Searches</h2>
                <p className="text-muted-foreground">
                  Manage your saved searches and notifications
                </p>
              </div>
              <SavedSearches />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Browse;
