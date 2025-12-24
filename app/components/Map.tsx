import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MapProps {
  listings?: Array<{
    id: string;
    title: string;
    price: number;
    location: string;
    latitude: number | null;
    longitude: number | null;
  }>;
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (listingId: string) => void;
}

// FIX: Dynamic import mapbox-gl to prevent SSR issues on Vercel
// This library uses browser-only APIs that fail during build/SSR
const Map = ({ listings = [], center = [14.5146, 35.8989], zoom = 11, onMarkerClick }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [mapboxLoaded, setMapboxLoaded] = useState(false);
  const [mapboxgl, setMapboxgl] = useState<typeof import('mapbox-gl') | null>(null);

  // Load mapbox-gl dynamically on client side only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadMapbox = async () => {
      try {
        const mb = await import('mapbox-gl');
        await import('mapbox-gl/dist/mapbox-gl.css');
        setMapboxgl(mb.default as unknown as typeof import('mapbox-gl'));
        setMapboxLoaded(true);
      } catch (error) {
        console.error('Failed to load mapbox-gl:', error);
      }
    };
    
    loadMapbox();
  }, []);

  // Fetch Mapbox token from Supabase Edge Function
  useEffect(() => {
    const fetchToken = async (retryCount = 0) => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          // Retry up to 3 times with exponential backoff
          if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000;
            setTimeout(() => fetchToken(retryCount + 1), delay);
            return;
          }
          throw error;
        }
        
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          // Retry if no token received
          if (retryCount < 3) {
            setTimeout(() => fetchToken(retryCount + 1), 2000);
            return;
          }
        }
      } catch {
        // Silent fail - map will show loading state
      }
    };
    
    fetchToken();
  }, []);

  // Initialize map when both mapbox and token are ready
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !mapboxLoaded || !mapboxgl) {
      return;
    }

    try {
      (mapboxgl as any).accessToken = mapboxToken;
      
      map.current = new (mapboxgl as any).Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: zoom,
      });

      // Disable scroll zoom to prevent interfering with page scroll
      map.current.scrollZoom.disable();
      
      // Enable scroll zoom only when Ctrl/Cmd key is pressed
      map.current.on('wheel', (e: any) => {
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
          e.originalEvent.preventDefault();
          map.current?.scrollZoom.enable();
        }
      });

      map.current.addControl(
        new (mapboxgl as any).NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );
    } catch {
      // Silent fail - map will show loading state
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken, mapboxLoaded, mapboxgl, center, zoom]);

  // Update markers when listings change
  useEffect(() => {
    if (!map.current || !mapboxgl) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers for listings with coordinates
    listings.forEach(listing => {
      if (listing.latitude && listing.longitude) {
        const el = document.createElement('div');
        el.className = 'marker-price-badge';
        el.textContent = '€' + Math.round(listing.price);
        
        const popup = new (mapboxgl as any).Popup({ offset: 25 }).setHTML(
          `<div class="p-3 min-w-[200px]">
            <h3 class="font-semibold text-base mb-2">${listing.title}</h3>
            <p class="text-sm text-gray-600 mb-1">${listing.location}</p>
            <p class="text-base font-bold text-primary mt-2">€${listing.price}/month</p>
          </div>`
        );

        const marker = new (mapboxgl as any).Marker(el)
          .setLngLat([listing.longitude, listing.latitude])
          .setPopup(popup)
          .addTo(map.current!);

        el.addEventListener('click', () => {
          onMarkerClick?.(listing.id);
        });

        markers.current.push(marker);
      }
    });

    // Fit bounds to show all markers if there are any
    if (listings.length > 0 && listings.some(l => l.latitude && l.longitude)) {
      const bounds = new (mapboxgl as any).LngLatBounds();
      listings.forEach(listing => {
        if (listing.latitude && listing.longitude) {
          bounds.extend([listing.longitude, listing.latitude]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  }, [listings, onMarkerClick, mapboxgl]);

  // Show loading state while mapbox or token is loading
  if (!mapboxToken || !mapboxLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 rounded-lg p-8 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-foreground">Loading map...</p>
          <p className="text-sm text-muted-foreground">Connecting to mapping service</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group bg-muted/20 rounded-lg">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" style={{ minHeight: '400px' }} />
      {/* Hint overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/95 backdrop-blur-sm px-4 py-2 rounded-full text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg border border-border">
        Hold Ctrl/Cmd + scroll to zoom
      </div>
      {/* No coordinates warning */}
      {listings.length > 0 && listings.filter(l => l.latitude && l.longitude).length === 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-destructive/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-destructive-foreground shadow-lg border border-destructive">
          ⚠️ No listings with location coordinates available
        </div>
      )}
    </div>
  );
};

export default Map;
