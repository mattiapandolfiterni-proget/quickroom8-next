import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
}

const SEO = ({
  title = 'QuickRoom8 - Find Rooms & Flatmates in Malta',
  description = 'Find your perfect room and flatmate in Malta. Browse verified listings, connect with potential flatmates, and use our AI-powered compatibility matching to find your ideal living situation.',
  keywords = 'rooms Malta, flatmates Malta, room rental Malta, shared accommodation Malta, find flatmate Malta, rent room Malta, coliving Malta, student accommodation Malta',
  image = 'https://www.quickroom8.com/og-image.png',
  url = 'https://www.quickroom8.com',
  type = 'website',
  structuredData,
}: SEOProps) => {
  const fullTitle = title.includes('QuickRoom8') ? title : `${title} | QuickRoom8`;

  // Default organization structured data
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'QuickRoom8',
    url: 'https://www.quickroom8.com',
    logo: 'https://www.quickroom8.com/favicon.png',
    description: 'Room and flatmate matching platform in Malta',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'MT',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+356 9930 1803',
      contactType: 'customer service',
      availableLanguage: ['English', 'Maltese', 'Italian', 'French', 'Spanish', 'German', 'Russian'],
    },
    sameAs: [
      'https://www.facebook.com/quickroom8',
      'https://www.instagram.com/quickroom8',
    ],
  };

  // Website structured data for search
  const websiteStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'QuickRoom8',
    url: 'https://www.quickroom8.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.quickroom8.com/browse?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="QuickRoom8" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="QuickRoom8" />
      <meta property="og:locale" content="en_MT" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="geo.region" content="MT" />
      <meta name="geo.placename" content="Malta" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="1 days" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(defaultStructuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteStructuredData)}
      </script>
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
