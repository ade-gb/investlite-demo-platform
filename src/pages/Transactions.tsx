import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const Transactions: React.FC = () => {
  const { transactions, loading } = useTransactions();

  const getIcon = (type: string) => {
    if (type === 'funding') return <Wallet className="w-5 h-5 text-primary" />;
    if (type === 'investment') return <ArrowDownRight className="w-5 h-5 text-destructive" />;
    return <ArrowUpRight className="w-5 h-5 text-success" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Transaction History</h1>
          <p className="text-muted-foreground">View all your wallet and investment activity</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-muted rounded" />)}
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        {getIcon(tx.transaction_type)}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{tx.transaction_type}</p>
                        <p className="text-sm text-muted-foreground">{tx.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${Number(tx.amount) >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {Number(tx.amount) >= 0 ? '+' : ''}${Math.abs(Number(tx.amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-muted-foreground">{format(new Date(tx.created_at), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;