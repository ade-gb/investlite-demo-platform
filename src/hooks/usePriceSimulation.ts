import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePriceSimulation = () => {
  const { isAdmin } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only admins trigger price updates to avoid multiple users updating simultaneously
    // For demo purposes, we'll have the first connected user trigger updates
    const simulatePriceChanges = async () => {
      const { data: assets } = await supabase
        .from('assets')
        .select('id, current_price, price_change_24h')
        .eq('is_active', true);

      if (!assets) return;

      for (const asset of assets) {
        // Random price change between -2% and +2%
        const changePercent = (Math.random() - 0.5) * 4;
        const newPrice = Number(asset.current_price) * (1 + changePercent / 100);
        
        // Accumulate the 24h change (simplified simulation)
        const new24hChange = Number(asset.price_change_24h || 0) + changePercent * 0.1;
        
        await supabase
          .from('assets')
          .update({
            current_price: Math.max(0.01, newPrice),
            price_change_24h: Math.max(-99, Math.min(99, new24hChange)),
          })
          .eq('id', asset.id);
      }
    };

    // Start simulation - update every 5 seconds
    intervalRef.current = setInterval(simulatePriceChanges, 5000);

    // Run once immediately
    simulatePriceChanges();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};
