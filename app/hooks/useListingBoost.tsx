import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BoostStatus {
  isBoosted: boolean;
  expiresAt: string | null;
  loading: boolean;
}

export const useListingBoost = (listingId: string) => {
  const [boostStatus, setBoostStatus] = useState<BoostStatus>({
    isBoosted: false,
    expiresAt: null,
    loading: true,
  });

  useEffect(() => {
    if (!listingId) {
      setBoostStatus({ isBoosted: false, expiresAt: null, loading: false });
      return;
    }

    checkBoostStatus();
  }, [listingId]);

  const checkBoostStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('listing_boosts')
        .select('expires_at')
        .eq('listing_id', listingId)
        .eq('payment_status', 'completed')
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      setBoostStatus({
        isBoosted: !!data,
        expiresAt: data?.expires_at || null,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking boost status:', error);
      setBoostStatus({ isBoosted: false, expiresAt: null, loading: false });
    }
  };

  return { ...boostStatus, refresh: checkBoostStatus };
};
