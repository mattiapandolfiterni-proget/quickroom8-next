"use client";

import { useEffect } from 'react';

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

/**
 * Room-specific SEO component that updates document.title client-side.
 * Base meta tags are handled by Next.js layout.tsx metadata export.
 * This component only updates the browser tab title for better UX.
 */
const RoomSEO = ({ room }: RoomSEOProps) => {
  const title = `${room.title} - €${room.price}/month in ${room.location} | QuickRoom8`;

  useEffect(() => {
    document.title = title;
  }, [title]);

  // All meta tags are handled by Next.js layout.tsx
  // This component only handles dynamic title updates
  return null;
};

export default RoomSEO;
