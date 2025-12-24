import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import RoomSEO from '@/components/RoomSEO';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FlatmateCard } from '@/components/FlatmateCard';
import { CompatibilityScore } from '@/components/CompatibilityScore';
import { AddReview } from '@/components/AddReview';
import { ReviewsList } from '@/components/ReviewsList';
import { ReportDialog } from '@/components/ReportDialog';
import { RequestAppointmentDialog } from '@/components/RequestAppointmentDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useCompatibilityScore } from '@/hooks/useCompatibilityScore';
import { PageLoading, Skeleton } from '@/components/LoadingState';
import { logger } from '@/lib/logger';
import {
  MapPin, Calendar, BedDouble, Bath, Home, Wifi, Wind, Zap, Car,
  PawPrint, Euro, MessageCircle, Heart, Share2, ChevronLeft, CheckCircle2, AlertTriangle, Plus, Loader2
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const log = logger.scope('RoomDetails');

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [messagingLoading, setMessagingLoading] = useState(false);
  const { score: compatibilityScore } = useCompatibilityScore(id || '');

  useEffect(() => {
    if (id) {
      fetchListing();
      if (user) checkFavorite();
    }
  }, [id, user]);

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from('room_listings')
        .select(`
          *,
          flatmates (
            id, name, age, gender, nationality, occupation, traits, avatar_url,
            profile_id
          ),
          profiles!room_listings_owner_id_fkey (
            full_name, avatar_url, bio
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Check if listing is approved for public viewing
      // Allow owner to view their own listing regardless of status
      if (data && !data.is_active && data.owner_id !== user?.id) {
        toast({
          title: "Listing Unavailable",
          description: "This listing is no longer available",
          variant: "destructive",
        });
        setListing(null);
        return;
      }

      // For non-owners, also check verification status
      if (data && !data.is_verified && data.owner_id !== user?.id) {
        toast({
          title: "Listing Pending Approval",
          description: "This listing is awaiting approval",
          variant: "destructive",
        });
        setListing(null);
        return;
      }

      setListing(data);
    } catch (error) {
      log.error('Error fetching listing', error);
      toast({
        title: "Error",
        description: "Could not load listing details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    if (!user || !id) return;
    
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

  const toggleFavorite = async () => {
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

  const handleStartConversation = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!listing?.owner_id) {
      toast({
        title: "Error",
        description: "Unable to contact owner. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Prevent messaging yourself
    if (user.id === listing.owner_id) {
      toast({
        title: "Notice",
        description: "This is your own listing.",
      });
      return;
    }

    setMessagingLoading(true);
    log.debug('Starting conversation', { data: { userId: user.id, ownerId: listing.owner_id, listingId: id } });

    try {
      // First, check if a conversation already exists between these users for this listing
      const { data: existingConversations, error: fetchError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (fetchError) {
        log.error('Error fetching conversations', fetchError);
        throw new Error('Failed to check existing conversations');
      }

      let existingConversationId: string | null = null;

      if (existingConversations && existingConversations.length > 0) {
        // Check if any of these conversations include the owner and are for this listing
        for (const conv of existingConversations) {
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.conversation_id);
          
          const { data: convDetails } = await supabase
            .from('conversations')
            .select('listing_id')
            .eq('id', conv.conversation_id)
            .single();

          if (
            participants?.some(p => p.user_id === listing.owner_id) &&
            convDetails?.listing_id === id
          ) {
            existingConversationId = conv.conversation_id;
            break;
          }
        }
      }

      if (existingConversationId) {
        log.debug('Found existing conversation', { data: { conversationId: existingConversationId } });
        toast({
          title: "Opening conversation",
          description: "You already have a conversation with this owner",
        });
        navigate('/messages');
        return;
      }

      // Create new conversation
      log.debug('Creating new conversation', { data: { listingId: id } });
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({ listing_id: id })
        .select('*')
        .single();

      if (convError) {
        log.error('Error creating conversation', convError);
        throw new Error(convError.message || 'Failed to create conversation');
      }

      if (!conversation || !conversation.id) {
        log.error('Conversation insert returned no data');
        throw new Error('Conversation was not created - no confirmation received');
      }

      log.debug('Conversation created', { data: { conversationId: conversation.id } });

      // Add current user as participant first - with select to verify
      const { data: myParticipant, error: myParticipantError } = await supabase
        .from('conversation_participants')
        .insert({ conversation_id: conversation.id, user_id: user.id })
        .select('*')
        .single();

      if (myParticipantError || !myParticipant) {
        log.error('Error adding user as participant', myParticipantError);
        // Rollback: delete the conversation
        await supabase.from('conversations').delete().eq('id', conversation.id);
        throw new Error(myParticipantError?.message || 'Failed to join conversation');
      }

      log.debug('Added user as participant', { data: { participantId: myParticipant.id } });

      // Add owner as participant - with select to verify
      const { data: ownerParticipant, error: ownerParticipantError } = await supabase
        .from('conversation_participants')
        .insert({ conversation_id: conversation.id, user_id: listing.owner_id })
        .select('*')
        .single();

      if (ownerParticipantError || !ownerParticipant) {
        log.error('Error adding owner as participant', ownerParticipantError);
        // Rollback: delete participants and conversation
        await supabase.from('conversation_participants').delete().eq('conversation_id', conversation.id);
        await supabase.from('conversations').delete().eq('id', conversation.id);
        throw new Error(ownerParticipantError?.message || 'Failed to add owner to conversation');
      }

      log.debug('Added owner as participant', { data: { participantId: ownerParticipant.id } });

      // Create notification for the owner (non-blocking but logged)
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: listing.owner_id,
        title: 'New Message',
        content: `Someone is interested in your listing: ${listing.title}`,
        type: 'message',
        link: '/messages'
      });

      if (notifError) {
        log.warn('Notification failed (non-critical)', { data: { error: notifError.message } });
      }

      log.info('Conversation setup complete');

      toast({
        title: "Conversation started",
        description: "You can now message the owner",
      });
      
      navigate('/messages');
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString?.() || "Failed to start conversation. Please try again.";
      log.error('Error starting conversation', error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setMessagingLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = listing.title;
    const shareText = `Check out this room: ${listing.title} - €${listing.price}/month in ${listing.location}`;

    // Try native Web Share API first (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast({
          title: "Shared successfully",
        });
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          log.warn('Error sharing', error);
        }
      }
    } else {
      // Fallback: Copy link and show social share options
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "You can now share it on your favorite platform",
        });
        
        // Open share menu with common platforms
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        const emailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        
        // Show options via confirm dialog (simple fallback)
        const choice = confirm(
          "Link copied! Choose a platform to share:\n\n" +
          "OK - WhatsApp\n" +
          "Cancel - Just use the copied link"
        );
        
        if (choice) {
          window.open(whatsappUrl, '_blank');
        }
      } catch (error) {
        toast({
          title: "Could not copy link",
          description: "Please copy the URL manually",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <PageLoading message="Loading room details..." />
      </div>
    );
  }

  if (!listing) {
    return <Navigate to="/browse" replace />;
  }

  const owner = listing.profiles;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <RoomSEO room={listing} />
      
      <div className="container py-8 max-w-6xl">
        {/* Back Button and List Your Room */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={() => navigate('/list-room')} className="gap-2">
            <Plus className="w-4 h-4" />
            List Your Room
          </Button>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <Carousel className="w-full">
            <CarouselContent>
              {(listing.images && listing.images.length > 0 ? listing.images : ['/placeholder.svg']).map((image: string, index: number) => (
                <CarouselItem key={index}>
                  <img
                    src={image}
                    alt={`${listing.title} - Image ${index + 1}`}
                    className="w-full h-96 object-cover rounded-3xl"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {listing.images && listing.images.length > 1 && (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </>
            )}
          </Carousel>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Price */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-display font-bold mb-2">{listing.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg">{listing.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-primary">€{listing.price}</div>
                  <div className="text-sm text-muted-foreground">/month</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge className="bg-primary text-primary-foreground">
                  {listing.room_type}
                </Badge>
                <Badge variant="outline">
                  {listing.contract_type}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Key Features */}
            <div>
              <h2 className="text-2xl font-display font-bold mb-4">Key Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border">
                  <BedDouble className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-semibold">{listing.total_bedrooms}</div>
                    <div className="text-xs text-muted-foreground">Bedrooms</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border">
                  <Bath className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-semibold">{listing.total_bathrooms}</div>
                    <div className="text-xs text-muted-foreground">Bathrooms</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border">
                  <Calendar className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-semibold text-sm">{new Date(listing.available_from).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">Available</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border">
                  <Euro className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-semibold text-sm">{listing.bills_included ? 'Included' : 'Extra'}</div>
                    <div className="text-xs text-muted-foreground">Bills</div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-2xl font-display font-bold mb-4">About this room</h2>
              <p className="text-muted-foreground leading-relaxed">
                {listing.description || 'No description available.'}
              </p>
            </div>

            <Separator />

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-display font-bold mb-4">Amenities</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {listing.has_wifi && (
                  <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                    <Wifi className="w-5 h-5 text-primary" />
                    <span>WiFi</span>
                  </div>
                )}
                {listing.has_ac && (
                  <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                    <Wind className="w-5 h-5 text-primary" />
                    <span>Air Conditioning</span>
                  </div>
                )}
                {listing.has_heating && (
                  <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                    <Zap className="w-5 h-5 text-primary" />
                    <span>Heating</span>
                  </div>
                )}
                {listing.has_parking && (
                  <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                    <Car className="w-5 h-5 text-primary" />
                    <span>Parking</span>
                  </div>
                )}
                {listing.is_pet_friendly && (
                  <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                    <PawPrint className="w-5 h-5 text-primary" />
                    <span>Pet Friendly</span>
                  </div>
                )}
                {listing.is_furnished && (
                  <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                    <Home className="w-5 h-5 text-primary" />
                    <span>Furnished</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Flatmates */}
            {listing.flatmates && listing.flatmates.length > 0 && (
              <div>
                <h2 className="text-2xl font-display font-bold mb-4">Current Flatmates</h2>
                <div className="space-y-3">
                  {listing.flatmates.map((flatmate: any) => (
                    <FlatmateCard
                      key={flatmate.id}
                      name={flatmate.name || 'Anonymous'}
                      age={flatmate.age || 25}
                      nationality={flatmate.nationality || 'Unknown'}
                      occupation={flatmate.occupation || 'Professional'}
                      traits={flatmate.traits || []}
                      avatar={flatmate.avatar_url}
                      isVerified={flatmate.profiles?.is_id_verified}
                    />
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Reviews Section */}
            <div>
              <h2 className="text-2xl font-display font-bold mb-6">Reviews</h2>
              
              {user && (
                <div className="mb-6">
                  <AddReview
                    listingId={id}
                    reviewedId={listing.owner_id}
                    onReviewAdded={fetchListing}
                  />
                </div>
              )}

              <ReviewsList listingId={id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Compatibility Score */}
            <Card>
              <CardHeader>
                <CardTitle>Compatibility Score</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <CompatibilityScore score={compatibilityScore} size="lg" />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <Button
                  onClick={handleStartConversation}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                  disabled={messagingLoading}
                >
                  {messagingLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Starting Chat...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Message Owner
                    </>
                  )}
                </Button>
                <Button
                  onClick={toggleFavorite}
                  variant="outline"
                  className="w-full h-12"
                  size="lg"
                >
                  <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorite ? 'Saved' : 'Save'}
                </Button>
                <Button 
                  onClick={handleShare}
                  variant="outline" 
                  className="w-full h-12" 
                  size="lg"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
                
                {user && listing.owner_id !== user.id && (
                  <RequestAppointmentDialog 
                    listingId={id!} 
                    ownerId={listing.owner_id}
                  />
                )}
                
                <ReportDialog
                  type="listing"
                  targetId={id!}
                  triggerButton={
                    <Button variant="outline" className="w-full h-12" size="lg">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Report Listing
                    </Button>
                  }
                />
              </CardContent>
            </Card>

            {/* Owner Info */}
            {owner && (
              <Card>
                <CardHeader>
                  <CardTitle>Listed by</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                      {owner.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{owner.full_name || 'User'}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Property Owner</div>
                    </div>
                  </div>
                  {owner.bio && (
                    <p className="mt-3 text-sm text-muted-foreground">{owner.bio}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
