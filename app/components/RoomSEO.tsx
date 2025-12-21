import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';

interface RoomSEOProps {
  room: {
    id: string;
    title: string;
    description?: string;
    price: number;
    location: string;
    images?: string[];
    room_type: string;
    is_furnished?: boolean;
    has_wifi?: boolean;
    available_from?: string;
  };
}

const RoomSEO = ({ room }: RoomSEOProps) => {
  // Calculate price valid date once on mount
  const priceValidUntil = useMemo(() => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    return futureDate.toISOString().split('T')[0];
  }, []);
  const title = `${room.title} - €${room.price}/month in ${room.location}`;
  const description = room.description 
    ? room.description.substring(0, 160) 
    : `${room.room_type} room available in ${room.location}, Malta for €${room.price}/month. ${room.is_furnished ? 'Furnished. ' : ''}${room.has_wifi ? 'WiFi included. ' : ''}Find your perfect room on QuickRoom8.`;
  const url = `https://www.quickroom8.com/room/${room.id}`;
  const image = room.images?.[0] || 'https://www.quickroom8.com/og-image.png';

  // Room listing structured data (Schema.org Product/Offer)
  const roomStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: room.title,
    description: description,
    image: room.images || ['https://www.quickroom8.com/og-image.png'],
    url: url,
    offers: {
      '@type': 'Offer',
      price: room.price,
      priceCurrency: 'EUR',
      priceValidUntil: priceValidUntil,
      availability: 'https://schema.org/InStock',
      url: url,
      seller: {
        '@type': 'Organization',
        name: 'QuickRoom8',
      },
    },
    brand: {
      '@type': 'Brand',
      name: 'QuickRoom8',
    },
  };

  // Place/Accommodation structured data
  const accommodationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Accommodation',
    name: room.title,
    description: description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: room.location,
      addressCountry: 'MT',
    },
    amenityFeature: [
      ...(room.is_furnished ? [{ '@type': 'LocationFeatureSpecification', name: 'Furnished', value: true }] : []),
      ...(room.has_wifi ? [{ '@type': 'LocationFeatureSpecification', name: 'WiFi', value: true }] : []),
    ],
    ...(room.available_from && { availabilityStarts: room.available_from }),
  };

  // BreadcrumbList for navigation
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.quickroom8.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Browse Rooms',
        item: 'https://www.quickroom8.com/browse',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: room.title,
        item: url,
      },
    ],
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title} | QuickRoom8</title>
      <meta name="title" content={`${title} | QuickRoom8`} />
      <meta name="description" content={description} />
      <meta name="keywords" content={`${room.location} room, rent ${room.location}, ${room.room_type} room Malta, flatmate ${room.location}, accommodation Malta`} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="product" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={`${title} | QuickRoom8`} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="QuickRoom8" />
      <meta property="product:price:amount" content={String(room.price)} />
      <meta property="product:price:currency" content="EUR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={`${title} | QuickRoom8`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(roomStructuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(accommodationStructuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbStructuredData)}
      </script>
    </Helmet>
  );
};

export default RoomSEO;
