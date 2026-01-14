import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Wallet {
  id: string;
  balance: number;
  updated_at: string;
}

export const useWallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    if (!user) {
      setWallet(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching wallet:', error);
    } else {
      setWallet(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWallet();
  }, [user]);

  const fundWallet = async (amount: number) => {
    if (!user || !wallet) return false;

    const newBalance = Number(wallet.balance) + amount;

    const { error: walletError } = await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('user_id', user.id);

    if (walletError) {
      toast({
        title: 'Error',
        description: 'Failed to fund wallet',
        variant: 'destructive',
      });
      return false;
    }

    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'funding',
        amount,
        description: `Demo funds added: $${amount.toLocaleString()}`,
      });

    if (txError) {
      console.error('Error logging transaction:', txError);
    }

    await fetchWallet();
    
    toast({
      title: 'Wallet Funded! 🎉',
      description: `$${amount.toLocaleString()} demo funds added to your wallet`,
    });
    
    return true;
  };

  return { wallet, loading, fundWallet, refetch: fetchWallet };
};