import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// This component handles the price simulation logic
// It runs in the background and updates asset prices periodically
export const PriceSimulator: React.FC = () => {
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (!user || isSimulating) return;

    setIsSimulating(true);

    const simulatePriceChanges = async () => {
      try {
        const { data: assets, error } = await supabase
          .from('assets')
          .select('id, current_price, price_change_24h')
          .eq('is_active', true);

        if (error || !assets) return;

        // Update each asset with a small random price change
        const updates = assets.map(async (asset) => {
          // Random price change between -1.5% and +1.5%
          const changePercent = (Math.random() - 0.5) * 3;
          const currentPrice = Number(asset.current_price);
          const newPrice = currentPrice * (1 + changePercent / 100);
          
          // Smoothly adjust the 24h change
          const current24hChange = Number(asset.price_change_24h || 0);
          const new24hChange = current24hChange * 0.95 + changePercent * 0.5;

          return supabase
            .from('assets')
            .update({
              current_price: Math.max(0.01, parseFloat(newPrice.toFixed(2))),
              price_change_24h: parseFloat(new24hChange.toFixed(2)),
            })
            .eq('id', asset.id);
        });

        await Promise.all(updates);
      } catch (err) {
        console.error('Price simulation error:', err);
      }
    };

    // Update prices every 5 seconds
    intervalRef.current = setInterval(simulatePriceChanges, 5000);

    // Initial update
    simulatePriceChanges();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsSimulating(false);
    };
  }, [user, isSimulating]);

  // This component doesn't render anything visible
  return null;
};
