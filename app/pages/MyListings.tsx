import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Home, Edit, Trash2, Eye, EyeOff, Plus, Rocket, BarChart3 } from 'lucide-react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { BoostListingDialog } from '@/components/BoostListingDialog';
import { useListingBoost } from '@/hooks/useListingBoost';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { logSecurityEvent } from '@/lib/security';

const MyListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [boostDialogOpen, setBoostDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyListings();
    }
  }, [user]);

  useEffect(() => {
    if (searchParams.get('boost_success') === 'true') {
      // Show verification prompt
      setVerificationPrompt(true);
    }
  }, [searchParams]);

  const [verificationPrompt, setVerificationPrompt] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState<string | null>(null);

  const handleVerifyBoost = async () => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      toast({
        title: 'Error',
        description: 'No session ID found',
        variant: 'destructive',
      });
      return;
    }

    setVerifyingSession(sessionId);
    try {
      const { data, error } = await supabase.functions.invoke('verify-boost-payment', {
        body: { session_id: sessionId },
      });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Your listing has been boosted successfully!',
      });
      
      setVerificationPrompt(false);
      navigate('/my-listings', { replace: true });
      fetchMyListings();
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to verify payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setVerifyingSession(null);
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchMyListings = async () => {
    try {
      const { data, error } = await supabase
        .from('room_listings')
        .select(`
          *,
          flatmates (
            id, name, age, gender, nationality, occupation, traits, avatar_url,
            profile_id
          )
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      // SECURITY: Enforce ownership - users can only toggle their own listings
      const { data, error } = await supabase
        .from('room_listings')
        .update({ is_active: !currentStatus })
        .eq('id', id)
        .eq('owner_id', user.id) // CRITICAL: Ownership check
        .select('id')
        .single();

      if (error) throw error;
      
      // SECURITY: Verify update actually happened
      if (!data) {
        logSecurityEvent('LISTING_TOGGLE_UNAUTHORIZED', user.id, { listingId: id });
        throw new Error('Listing not found or you do not have permission');
      }

      toast({
        title: 'Success',
        description: `Listing ${!currentStatus ? 'activated' : 'deactivated'}`,
      });
      fetchMyListings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteListing = async () => {
    if (!deleteId) return;

    try {
      // SECURITY: Enforce ownership - users can only delete their own listings
      // First verify ownership to provide clear error message
      const { data: listing, error: fetchError } = await supabase
        .from('room_listings')
        .select('id, owner_id')
        .eq('id', deleteId)
        .eq('owner_id', user.id) // CRITICAL: Ownership check
        .single();

      if (fetchError || !listing) {
        logSecurityEvent('LISTING_DELETE_UNAUTHORIZED', user.id, { listingId: deleteId });
        throw new Error('Listing not found or you do not have permission to delete it');
      }

      // Now delete with ownership verification (defense in depth)
      const { error } = await supabase
        .from('room_listings')
        .delete()
        .eq('id', deleteId)
        .eq('owner_id', user.id); // CRITICAL: Double-check ownership on delete

      if (error) throw error;

      logSecurityEvent('LISTING_DELETED', user.id, { listingId: deleteId });

      toast({
        title: 'Success',
        description: 'Listing deleted successfully',
      });
      fetchMyListings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        {verificationPrompt && (
          <Card className="mb-6 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Payment Successful!</h3>
                    <p className="text-sm text-muted-foreground">Click verify to activate your listing boost</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setVerificationPrompt(false)}>
                    Later
                  </Button>
                  <Button onClick={handleVerifyBoost} disabled={!!verifyingSession}>
                    {verifyingSession ? 'Verifying...' : 'Verify Boost'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">My Listings</h1>
              <p className="text-muted-foreground">Manage your room listings</p>
            </div>
          </div>
          <Button onClick={() => navigate('/list-room')}>
            <Plus className="w-4 h-4 mr-2" />
            New Listing
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : listings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
              <p className="text-muted-foreground mb-4">Create your first room listing to get started</p>
              <Button onClick={() => navigate('/list-room')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Listing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-64 h-48 md:h-auto relative">
                    <img
                      src={listing.images?.[0] || '/placeholder.svg'}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    {!listing.is_active && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge variant="secondary">Inactive</Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{listing.title}</h3>
                        <p className="text-2xl font-bold text-primary">€{listing.price}/month</p>
                        <p className="text-sm text-muted-foreground">{listing.location}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/listing-stats/${listing.id}`)}
                            className="gap-2"
                          >
                            <BarChart3 className="w-4 h-4" />
                            Stats
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedListing({ id: listing.id, title: listing.title });
                              setBoostDialogOpen(true);
                            }}
                            className="gap-2"
                          >
                            <Rocket className="w-4 h-4" />
                            Boost
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/list-room?edit=${listing.id}`)}
                            className="gap-2 w-full"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleActive(listing.id, listing.is_active)}
                            >
                              {listing.is_active ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(listing.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">{listing.room_type}</Badge>
                      <Badge variant="outline">{listing.contract_type}</Badge>
                      {listing.flatmates && listing.flatmates.length > 0 && (
                        <Badge variant="secondary">
                          {listing.flatmates.length} flatmate{listing.flatmates.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      {listing.amenities && listing.amenities.length > 0 && (
                        listing.amenities.slice(0, 3).map((amenity: string) => (
                          <Badge key={amenity} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))
                      )}
                      {listing.amenities && listing.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{listing.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Views: {listing.views_count}</span>
                      <span>Created: {new Date(listing.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteListing}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedListing && (
        <BoostListingDialog
          open={boostDialogOpen}
          onOpenChange={setBoostDialogOpen}
          listingId={selectedListing.id}
          listingTitle={selectedListing.title}
        />
      )}

      <AlertDialog open={verificationPrompt} onOpenChange={setVerificationPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Your Boost</AlertDialogTitle>
            <AlertDialogDescription>
              Your payment was successful! Click the button below to activate your listing boost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setVerificationPrompt(false);
              navigate('/my-listings', { replace: true });
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleVerifyBoost}
              disabled={!!verifyingSession}
            >
              {verifyingSession ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                'Activate Boost'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyListings;
