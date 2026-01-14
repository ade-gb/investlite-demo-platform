import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  asset_type: string;
  current_price: number;
  price_change_24h: number | null;
  risk_level: string | null;
  min_investment: number | null;
  is_active: boolean | null;
}

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssets = async () => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching assets:', error);
    } else {
      setAssets(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return { assets, loading, refetch: fetchAssets };
};