import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useWallet } from '@/hooks/useWallet';
import { useInvestments } from '@/hooks/useInvestments';
import { useTransactions } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wallet, TrendingUp, PieChart, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { wallet, loading: walletLoading, fundWallet } = useWallet();
  const { investments } = useInvestments();
  const { transactions } = useTransactions();
  const [fundDialogOpen, setFundDialogOpen] = useState(false);

  const totalPortfolioValue = investments.reduce((sum, inv) => {
    const currentValue = Number(inv.quantity) * Number(inv.asset?.current_price || inv.purchase_price);
    return sum + currentValue;
  }, 0);

  const totalInvested = investments.reduce((sum, inv) => {
    return sum + Number(inv.quantity) * Number(inv.purchase_price);
  }, 0);

  const totalGain = totalPortfolioValue - totalInvested;
  const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  const handleFund = async (amount: number) => {
    await fundWallet(amount);
    setFundDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your demo investment portfolio</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Wallet Balance</CardTitle>
              <Wallet className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display">
                ${walletLoading ? '...' : Number(wallet?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <Dialog open={fundDialogOpen} onOpenChange={setFundDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="accent" size="sm" className="mt-4">
                    <Plus className="w-4 h-4 mr-1" /> Fund Wallet
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Demo Funds</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground mb-4">Select an amount to add to your demo wallet. These are simulated funds only.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[1000, 5000, 10000, 25000].map(amount => (
                      <Button key={amount} variant="outline" onClick={() => handleFund(amount)}>
                        ${amount.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
              <PieChart className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display">
                ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <Link to="/portfolio">
                <Button variant="ghost" size="sm" className="mt-4 text-primary">
                  View Portfolio <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Gain/Loss</CardTitle>
              <TrendingUp className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold font-display flex items-center gap-2 ${totalGain >= 0 ? 'text-success' : 'text-destructive'}`}>
                {totalGain >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                ${Math.abs(totalGain).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className={`text-sm mt-1 ${totalGain >= 0 ? 'text-success' : 'text-destructive'}`}>
                {totalGain >= 0 ? '+' : ''}{gainPercentage.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Transactions
                <Link to="/transactions" className="text-sm text-primary font-normal hover:underline">View all</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium capitalize">{tx.transaction_type}</p>
                      <p className="text-sm text-muted-foreground">{tx.description}</p>
                    </div>
                    <span className={tx.amount >= 0 ? 'text-success font-semibold' : 'text-destructive font-semibold'}>
                      {tx.amount >= 0 ? '+' : ''}${Math.abs(Number(tx.amount)).toLocaleString()}
                    </span>
                  </div>
                ))}
                {transactions.length === 0 && <p className="text-muted-foreground text-center py-4">No transactions yet</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Your Holdings
                <Link to="/portfolio" className="text-sm text-primary font-normal hover:underline">View portfolio</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {investments.slice(0, 5).map(inv => (
                  <div key={inv.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">{inv.asset?.name}</p>
                      <p className="text-sm text-muted-foreground">{Number(inv.quantity).toFixed(4)} shares</p>
                    </div>
                    <span className="font-semibold">
                      ${(Number(inv.quantity) * Number(inv.asset?.current_price || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                {investments.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-2">No investments yet</p>
                    <Link to="/investments"><Button size="sm">Start Investing</Button></Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;