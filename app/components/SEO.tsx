"use client";

import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
}

/**
 * Simple SEO component that updates document.title client-side.
 * Base meta tags are handled by Next.js layout.tsx metadata export.
 * This component only updates the browser tab title for better UX.
 */
const SEO = ({
  title = 'QuickRoom8 - Find Rooms & Flatmates in Malta',
}: SEOProps) => {
  const fullTitle = title.includes('QuickRoom8') ? title : `${title} | QuickRoom8`;

  useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);

  // All meta tags are handled by Next.js layout.tsx
  // This component only handles dynamic title updates
  return null;
};

export default SEO;
