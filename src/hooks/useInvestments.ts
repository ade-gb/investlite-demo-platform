import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from './useWallet';

export interface Investment {
  id: string;
  asset_id: string;
  quantity: number;
  purchase_price: number;
  created_at: string;
  asset?: {
    name: string;
    symbol: string;
    current_price: number;
    price_change_24h: number | null;
  };
}

export const useInvestments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { wallet, refetch: refetchWallet } = useWallet();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestments = async () => {
    if (!user) {
      setInvestments([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('investments')
      .select(`
        *,
        asset:assets(name, symbol, current_price, price_change_24h)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching investments:', error);
    } else {
      setInvestments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvestments();
  }, [user]);

  const invest = async (assetId: string, amount: number, currentPrice: number) => {
    if (!user || !wallet) return false;

    if (Number(wallet.balance) < amount) {
      toast({
        title: 'Insufficient Funds',
        description: 'Please fund your wallet first',
        variant: 'destructive',
      });
      return false;
    }

    const quantity = amount / currentPrice;
    const newBalance = Number(wallet.balance) - amount;

    // Update wallet
    const { error: walletError } = await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('user_id', user.id);

    if (walletError) {
      toast({
        title: 'Error',
        description: 'Failed to process investment',
        variant: 'destructive',
      });
      return false;
    }

    // Check if user already has this investment
    const { data: existingInvestment } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', user.id)
      .eq('asset_id', assetId)
      .maybeSingle();

    if (existingInvestment) {
      // Update existing investment
      const newQuantity = Number(existingInvestment.quantity) + quantity;
      const avgPrice = (Number(existingInvestment.purchase_price) * Number(existingInvestment.quantity) + amount) / newQuantity;
      
      await supabase
        .from('investments')
        .update({ 
          quantity: newQuantity,
          purchase_price: avgPrice
        })
        .eq('id', existingInvestment.id);
    } else {
      // Create new investment
      await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          asset_id: assetId,
          quantity,
          purchase_price: currentPrice,
        });
    }

    // Log transaction
    await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'investment',
        amount: -amount,
        asset_id: assetId,
        quantity,
        description: `Investment purchase`,
      });

    await fetchInvestments();
    await refetchWallet();
    
    toast({
      title: 'Investment Successful! 📈',
      description: `Invested $${amount.toLocaleString()}`,
    });
    
    return true;
  };

  const sell = async (investmentId: string, quantity: number, currentPrice: number) => {
    if (!user || !wallet) return false;

    const investment = investments.find(i => i.id === investmentId);
    if (!investment) return false;

    if (Number(investment.quantity) < quantity) {
      toast({
        title: 'Insufficient Holdings',
        description: 'You don\'t have enough shares to sell',
        variant: 'destructive',
      });
      return false;
    }

    const saleAmount = quantity * currentPrice;
    const newBalance = Number(wallet.balance) + saleAmount;
    const remainingQuantity = Number(investment.quantity) - quantity;

    // Update wallet
    await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('user_id', user.id);

    if (remainingQuantity > 0) {
      // Update investment
      await supabase
        .from('investments')
        .update({ quantity: remainingQuantity })
        .eq('id', investmentId);
    } else {
      // Delete investment
      await supabase
        .from('investments')
        .delete()
        .eq('id', investmentId);
    }

    // Log transaction
    await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'sale',
        amount: saleAmount,
        asset_id: investment.asset_id,
        quantity: -quantity,
        description: `Investment sale`,
      });

    await fetchInvestments();
    await refetchWallet();
    
    toast({
      title: 'Sale Successful! 💰',
      description: `Sold for $${saleAmount.toLocaleString()}`,
    });
    
    return true;
  };

  return { investments, loading, invest, sell, refetch: fetchInvestments };
};