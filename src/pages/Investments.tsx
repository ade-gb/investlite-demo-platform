import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAssets } from '@/hooks/useAssets';
import { useInvestments } from '@/hooks/useInvestments';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const Investments: React.FC = () => {
  const { assets, loading } = useAssets();
  const { invest } = useInvestments();
  const { wallet } = useWallet();
  const [selectedAsset, setSelectedAsset] = useState<typeof assets[0] | null>(null);
  const [investAmount, setInvestAmount] = useState('');

  const handleInvest = async () => {
    if (!selectedAsset || !investAmount) return;
    const amount = parseFloat(investAmount);
    if (amount < Number(selectedAsset.min_investment)) return;
    await invest(selectedAsset.id, amount, Number(selectedAsset.current_price));
    setSelectedAsset(null);
    setInvestAmount('');
  };

  const getRiskColor = (risk: string | null) => {
    if (risk === 'low') return 'bg-success/10 text-success';
    if (risk === 'high') return 'bg-destructive/10 text-destructive';
    return 'bg-accent/10 text-accent';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Investment Options</h1>
          <p className="text-muted-foreground">Browse demo assets and start investing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => <Card key={i} className="animate-pulse h-64 bg-muted" />)
          ) : (
            assets.map(asset => (
              <Card key={asset.id} className="stat-card hover:shadow-lg cursor-pointer transition-all" onClick={() => setSelectedAsset(asset)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{asset.symbol}</Badge>
                    <Badge className={getRiskColor(asset.risk_level)}>{asset.risk_level} risk</Badge>
                  </div>
                  <CardTitle className="mt-2">{asset.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{asset.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold font-display">${Number(asset.current_price).toFixed(2)}</p>
                      <div className={`flex items-center text-sm ${Number(asset.price_change_24h) >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {Number(asset.price_change_24h) >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                        {Number(asset.price_change_24h) >= 0 ? '+' : ''}{Number(asset.price_change_24h).toFixed(2)}%
                      </div>
                    </div>
                    <Button size="sm">Invest</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invest in {selectedAsset?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Price</span>
                <span className="font-semibold">${Number(selectedAsset?.current_price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Min Investment</span>
                <span>${Number(selectedAsset?.min_investment).toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Your Balance</span>
                <span className="font-semibold">${Number(wallet?.balance || 0).toLocaleString()}</span>
              </div>
              <div>
                <label className="text-sm font-medium">Investment Amount ($)</label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    value={investAmount} 
                    onChange={(e) => setInvestAmount(e.target.value)}
                    className="pl-9"
                    placeholder={`Min $${selectedAsset?.min_investment}`}
                  />
                </div>
              </div>
              {investAmount && (
                <p className="text-sm text-muted-foreground">
                  You'll receive ~{(parseFloat(investAmount) / Number(selectedAsset?.current_price)).toFixed(4)} shares
                </p>
              )}
              <Button className="w-full" onClick={handleInvest} disabled={!investAmount || parseFloat(investAmount) < Number(selectedAsset?.min_investment)}>
                Confirm Investment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Investments;