import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client.ts';

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

const Map = ({ listings = [], center = [14.5146, 35.8989], zoom = 11, onMarkerClick }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    const fetchToken = async (retryCount = 0) => {
      try {
        console.log('Fetching Mapbox token...', retryCount > 0 ? `(Retry ${retryCount})` : '');
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Error from edge function:', error);
          
          // Retry up to 3 times with exponential backoff
          if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000;
            console.log(`Retrying in ${delay}ms...`);
            setTimeout(() => fetchToken(retryCount + 1), delay);
            return;
          }
          throw error;
        }
        
        console.log('Edge function response:', data);
        
        if (data?.token) {
          console.log('✓ Mapbox token received successfully');
          setMapboxToken(data.token);
        } else {
          console.error('✗ No token in response:', data);
          
          // Retry if no token received
          if (retryCount < 3) {
            setTimeout(() => fetchToken(retryCount + 1), 2000);
            return;
          }
        }
      } catch (error) {
        console.error('✗ Fatal error fetching Mapbox token:', error);
      }
    };
    
    fetchToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current) {
      console.log('Map container not ready');
      return;
    }
    
    if (!mapboxToken) {
      console.log('Waiting for Mapbox token...');
      return;
    }

    console.log('Initializing Mapbox map...');
    
    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: zoom,
      });

      map.current.on('load', () => {
        console.log('✓ Mapbox map loaded successfully');
      });

      map.current.on('error', (e) => {
        console.error('✗ Mapbox error:', e);
      });

      // Disable scroll zoom to prevent interfering with page scroll
      map.current.scrollZoom.disable();
      
      // Enable scroll zoom only when Ctrl/Cmd key is pressed
      map.current.on('wheel', (e) => {
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
          e.originalEvent.preventDefault();
          map.current?.scrollZoom.enable();
        }
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      console.log('✓ Map initialized with', listings.length, 'listings');
    } catch (error) {
      console.error('✗ Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        console.log('Cleaning up map...');
        map.current.remove();
      }
    };
  }, [mapboxToken, center, zoom]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers for listings with coordinates
    console.log(`Processing ${listings.length} listings for map markers`);
    const listingsWithCoords = listings.filter(l => l.latitude && l.longitude);
    console.log(`Found ${listingsWithCoords.length} listings with valid coordinates`);
    
    listings.forEach(listing => {
      if (listing.latitude && listing.longitude) {
        const el = document.createElement('div');
        el.className = 'marker-price-badge';
        el.textContent = '€' + Math.round(listing.price);
        
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="p-3 min-w-[200px]">
            <h3 class="font-semibold text-base mb-2">${listing.title}</h3>
            <p class="text-sm text-gray-600 mb-1">${listing.location}</p>
            <p class="text-base font-bold text-primary mt-2">€${listing.price}/month</p>
          </div>`
        );

        const marker = new mapboxgl.Marker(el)
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
      const bounds = new mapboxgl.LngLatBounds();
      listings.forEach(listing => {
        if (listing.latitude && listing.longitude) {
          bounds.extend([listing.longitude, listing.latitude]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  }, [listings, onMarkerClick]);

  if (!mapboxToken) {
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
