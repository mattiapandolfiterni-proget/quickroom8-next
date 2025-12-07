import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client.ts';
import { useAuth } from './useAuth';

export const useCompatibilityScore = (listingId: string) => {
  const { user } = useAuth();
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && listingId) {
      calculateScore();
    } else {
      setScore(0);
      setLoading(false);
    }
  }, [user, listingId]);

  const calculateScore = async () => {
    try {
      const { data, error } = await supabase
        .rpc('calculate_compatibility_score', {
          user_profile_id: user!.id,
          listing_id: listingId
        });

      if (error) throw error;
      setScore(data || 0);
    } catch (error) {
      console.error('Error calculating compatibility score:', error);
      setScore(0);
    } finally {
      setLoading(false);
    }
  };

  return { score, loading };
};
