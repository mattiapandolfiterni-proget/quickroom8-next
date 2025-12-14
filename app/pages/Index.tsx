import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoomCard } from "@/components/RoomCard";
import { Header } from "@/components/Header";
import SEO from "@/components/SEO";
import { Search, Home, Users, Heart, Sparkles, Filter, Shield, CreditCard, HeadphonesIcon, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import room1 from "../assets/room-1.jpg";
import room2 from "../assets/room-2.jpg";
import room3 from "../assets/room-3.jpg";
import heroBG from "../assets/hero-bg.jpg";


interface Flatmate {
  id: string;
  name: string;
  age: number;
  nationality: string;
  occupation: string;
  traits: string[];
}

interface RoomListing {
  id: string;
  title: string;
  price: number;
  location: string;
  room_type: string;
  available_from: string;
  total_bedrooms: number;
  total_bathrooms: number;
  amenities: string[];
  flatmates: Flatmate[];
}

const Index = () => {
  const { t } = useLanguage();
  const [featuredRooms, setFeaturedRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback images
  const roomImages = [room1, room2, room3];

  useEffect(() => {
    fetchFeaturedRooms();
  }, []);

  const fetchFeaturedRooms = async () => {
    try {
      // Fetch active listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('room_listings')
        .select(`
          *,
          flatmates(id, name, age, nationality, occupation, traits)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (listingsError) throw listingsError;

      // Fetch active boosts
      const { data: boostsData, error: boostsError } = await supabase
        .from('listing_boosts')
        .select('listing_id')
        .eq('payment_status', 'completed')
        .gt('expires_at', new Date().toISOString());

      if (boostsError) throw boostsError;

      const boostedListingIds = new Set(boostsData?.map(b => b.listing_id) || []);

      // Sort: boosted first, then by created_at
      const sortedListings = (listingsData || []).sort((a, b) => {
        const aIsBoosted = boostedListingIds.has(a.id);
        const bIsBoosted = boostedListingIds.has(b.id);
        
        if (aIsBoosted && !bIsBoosted) return -1;
        if (!aIsBoosted && bIsBoosted) return 1;
        
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }).slice(0, 3);

      if (sortedListings) {
        const formattedRooms = sortedListings.map((room: any, index: number) => ({
          id: room.id,
          image: roomImages[index] || room1,
          price: room.price,
          location: room.location,
          roomType: room.room_type === 'private' ? 'Private Room' : room.room_type === 'ensuite' ? 'Ensuite Room' : 'Shared Room',
          availableFrom: new Date(room.available_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          bedrooms: room.total_bedrooms,
          bathrooms: room.total_bathrooms,
          amenities: room.amenities || [],
          compatibilityScore: Math.floor(Math.random() * 30) + 70,
          featured: true,
          flatmates: room.flatmates || []
        }));
        setFeaturedRooms(formattedRooms);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  // FAQPage structured data
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I find a room in Malta?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Browse our verified room listings, use filters to find your perfect match, and contact owners directly through our platform. Our AI-powered compatibility score helps you find the best fit.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the compatibility matching work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our algorithm considers lifestyle preferences, budget, location, work schedule, cleanliness level, and social preferences to calculate a compatibility score between you and potential flatmates.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is QuickRoom8 free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, browsing listings and contacting owners is free. Listing owners can optionally boost their listings for increased visibility.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO 
        title="Find Rooms & Flatmates in Malta"
        description="Find your perfect room and flatmate in Malta. Browse verified listings, connect with potential flatmates, and use our AI-powered compatibility matching. 10,000+ listings available."
        keywords="rooms Malta, flatmates Malta, room rental Malta, shared accommodation Malta, find flatmate Malta, rent room Malta, coliving Malta, student accommodation Malta, expat housing Malta"
        url="https://www.quickroom8.com"
        structuredData={faqStructuredData}
      />
      <Header />

      {/* Hero Section */}
      <section 
        className="relative py-6 md:py-10 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(188 95% 36% / 0.95), hsl(188 75% 50% / 0.9)), url(${heroBG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">{t('home.hero.badge')}</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-display font-bold text-white leading-tight">
              {t('home.hero.title')}
            </h1>
            
            <p className="text-sm md:text-base text-white/90 max-w-2xl mx-auto">
              {t('home.hero.subtitle')}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-3 px-4">
              <div className="bg-white rounded-2xl p-3 shadow-elevated flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 px-3 min-h-[48px]">
                  <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <Input 
                    placeholder={t('home.hero.searchPlaceholder')}
                    className="border-0 focus-visible:ring-0 text-base"
                  />
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 font-semibold whitespace-nowrap w-full sm:w-auto" asChild>
                  <Link to="/browse">{t('common.search')} {t('room.type')}</Link>
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <div className="text-center">
                <div className="text-xl font-bold text-white">10,000+</div>
                <div className="text-xs text-white/80">{t('home.hero.stats.listings')}</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">95%</div>
                <div className="text-xs text-white/80">{t('home.hero.stats.success')}</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">50,000+</div>
                <div className="text-xs text-white/80">{t('home.hero.stats.roommates')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-4 md:py-6 bg-muted/30">
        <div className="container">
          <div className="text-center mb-3">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
              {t('home.howItWorks.title')}
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              {t('home.howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-display font-semibold">{t('home.howItWorks.step1.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('home.howItWorks.step1.desc')}
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-display font-semibold">{t('home.howItWorks.step2.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('home.howItWorks.step2.desc')}
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-display font-semibold">{t('home.howItWorks.step3.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('home.howItWorks.step3.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-4 md:py-6">
        <div className="container">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                {t('home.featured.title')}
              </h2>
              <p className="text-muted-foreground">
                {t('home.featured.subtitle')}
              </p>
            </div>
            <Button variant="outline" className="hidden md:flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {t('common.filters')}
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                {t('home.featured.loading')}
              </div>
            ) : featuredRooms.length > 0 ? (
              featuredRooms.map(room => (
                <RoomCard key={room.id} {...room} />
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                {t('home.featured.noRooms')}
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" asChild>
              <Link to="/browse">{t('home.featured.viewAll')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              {t('home.cta.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('home.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 px-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold min-h-[56px] px-8 w-full sm:w-auto" asChild>
                <Link to="/auth">{t('home.cta.listRoom')}</Link>
              </Button>
              <Button size="lg" variant="outline" className="font-semibold min-h-[56px] px-8 w-full sm:w-auto" asChild>
                <Link to="/browse">{t('home.cta.findRoom')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-8 bg-muted/30">
        <div className="container">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-1">
              {t('home.trust.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('home.trust.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="text-center space-y-2 p-4 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CreditCard className="w-5 h-5 text-success" />
              </div>
              <h3 className="text-sm font-semibold">{t('home.trust.payments')}</h3>
              <p className="text-xs text-muted-foreground">
                {t('home.trust.paymentsDesc')}
              </p>
            </div>

            <div className="text-center space-y-2 p-4 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <HeadphonesIcon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-sm font-semibold">{t('home.trust.support')}</h3>
              <p className="text-xs text-muted-foreground">
                {t('home.trust.supportDesc')}
              </p>
            </div>

            <div className="text-center space-y-2 p-4 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center mx-auto">
                <Star className="w-5 h-5 text-warning" />
              </div>
              <h3 className="text-sm font-semibold">{t('home.trust.reviews')}</h3>
              <p className="text-xs text-muted-foreground">
                {t('home.trust.reviewsDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg">QuickRoom8</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <a href="/browse" className="hover:text-foreground transition-colors">{t('footer.browse')}</a>
              <a href="/list-room" className="hover:text-foreground transition-colors">{t('footer.listRoom')}</a>
              <a href="/contact" className="hover:text-foreground transition-colors">{t('footer.contact')}</a>
              <a href="/safety-tips" className="hover:text-foreground transition-colors">{t('footer.safety')}</a>
              <a href="/privacy-policy" className="hover:text-foreground transition-colors">{t('footer.privacy')}</a>
              <a href="/terms-of-service" className="hover:text-foreground transition-colors">{t('footer.terms')}</a>
            </div>
            
            <p className="text-sm text-muted-foreground">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
