import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client.ts';
import { toast } from '@/hooks/use-toast';
import { useListingBoost } from '@/hooks/useListingBoost';
import { BoostListingDialog } from '@/components/BoostListingDialog';
import {
  Eye, Heart, MessageCircle, TrendingUp, ChevronLeft, Calendar,
  Zap, MapPin, Euro, Edit
} from 'lucide-react';
import { format, subDays } from 'date-fns';

const ListingStats = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [stats, setStats] = useState({
    totalViews: 0,
    viewsLast7Days: 0,
    viewsLast30Days: 0,
    totalFavorites: 0,
    totalMessages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [boostDialogOpen, setBoostDialogOpen] = useState(false);
  const { isBoosted, expiresAt } = useListingBoost(id || '');

  useEffect(() => {
    if (id && user) {
      fetchListingAndStats();
    }
  }, [id, user]);

  const fetchListingAndStats = async () => {
    try {
      // Fetch listing
      const { data: listingData, error: listingError } = await supabase
        .from('room_listings')
        .select('*')
        .eq('id', id)
        .single();

      if (listingError) throw listingError;

      if (listingData.owner_id !== user?.id) {
        toast({
          title: 'Access Denied',
          description: 'You can only view stats for your own listings',
          variant: 'destructive',
        });
        navigate('/my-listings');
        return;
      }

      setListing(listingData);

      // Fetch total views
      const { count: totalViews } = await supabase
        .from('listing_views')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', id);

      // Fetch views last 7 days
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const { count: viewsLast7Days } = await supabase
        .from('listing_views')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', id)
        .gte('viewed_at', sevenDaysAgo);

      // Fetch views last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { count: viewsLast30Days } = await supabase
        .from('listing_views')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', id)
        .gte('viewed_at', thirtyDaysAgo);

      // Fetch favorites
      const { count: totalFavorites } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', id);

      // Fetch messages related to this listing
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', id);

      let totalMessages = 0;
      if (conversations) {
        for (const conv of conversations) {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id);
          totalMessages += count || 0;
        }
      }

      setStats({
        totalViews: totalViews || 0,
        viewsLast7Days: viewsLast7Days || 0,
        viewsLast30Days: viewsLast30Days || 0,
        totalFavorites: totalFavorites || 0,
        totalMessages,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load listing statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12 text-center">Loading...</div>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate('/my-listings')} className="mb-6">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to My Listings
        </Button>

        {/* Listing Info */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-display font-bold mb-2">{listing.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Euro className="w-4 h-4" />
                    <span>€{listing.price}/month</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={listing.is_active ? 'default' : 'secondary'}>
                    {listing.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {isBoosted && (
                    <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                      <Zap className="w-3 h-3 mr-1" />
                      Boosted until {format(new Date(expiresAt!), 'MMM d, yyyy')}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate(`/room/${listing.id}`)}>
                  View Listing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Views Last 7 Days</CardTitle>
              <TrendingUp className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.viewsLast7Days}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Recent activity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Views Last 30 Days</CardTitle>
              <Calendar className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.viewsLast30Days}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Monthly performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Heart className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalFavorites}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Users interested
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageCircle className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalMessages}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total inquiries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Zap className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {isBoosted ? 'Boosted' : 'Standard'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isBoosted ? `Until ${format(new Date(expiresAt!), 'MMM d')}` : 'Regular visibility'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Tips</CardTitle>
            <CardDescription>
              Improve your listing's visibility and engagement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Boost Your Listing</p>
                <p className="text-sm text-muted-foreground">
                  Get more visibility by boosting your listing to appear at the top of search results
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Eye className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="font-medium">Add Quality Photos</p>
                <p className="text-sm text-muted-foreground">
                  Listings with 5+ photos get 3x more views on average
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <MessageCircle className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="font-medium">Respond Quickly</p>
                <p className="text-sm text-muted-foreground">
                  Fast responses lead to higher engagement and more successful matches
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button 
              onClick={() => setBoostDialogOpen(true)}
              className="w-full justify-start gap-2"
              variant="default"
            >
              <Zap className="w-4 h-4" />
              Boost Listing
            </Button>
            <Button 
              onClick={() => navigate(`/list-room?edit=${listing.id}`)}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <Edit className="w-4 h-4" />
              Edit Listing
            </Button>
          </CardContent>
        </Card>
      </div>

      <BoostListingDialog
        open={boostDialogOpen}
        onOpenChange={setBoostDialogOpen}
        listingId={listing.id}
        listingTitle={listing.title}
      />
    </div>
  );
};

export default ListingStats;
