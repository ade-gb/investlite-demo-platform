import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useInvestments } from '@/hooks/useInvestments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const COLORS = ['hsl(168, 65%, 28%)', 'hsl(38, 92%, 50%)', 'hsl(142, 76%, 36%)', 'hsl(220, 70%, 50%)', 'hsl(340, 75%, 55%)'];

const Portfolio: React.FC = () => {
  const { investments, loading } = useInvestments();

  const portfolioData = investments.map((inv, i) => ({
    name: inv.asset?.symbol || 'Unknown',
    value: Number(inv.quantity) * Number(inv.asset?.current_price || 0),
    color: COLORS[i % COLORS.length],
  }));

  const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0);
  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.quantity) * Number(inv.purchase_price), 0);
  const totalGain = totalValue - totalInvested;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Portfolio</h1>
          <p className="text-muted-foreground">View your investment holdings</p>
        </div>

        {investments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">You don't have any investments yet</p>
              <Link to="/investments"><Button>Browse Investments</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={portfolioData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {portfolioData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-center gap-4 flex-wrap">
                  {portfolioData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Total Invested</span>
                  <span className="font-semibold">${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Current Value</span>
                  <span className="font-semibold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Total Gain/Loss</span>
                  <span className={`font-semibold flex items-center gap-1 ${totalGain >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {totalGain >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    ${Math.abs(totalGain).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3">Asset</th>
                        <th className="pb-3">Shares</th>
                        <th className="pb-3">Avg Price</th>
                        <th className="pb-3">Current Price</th>
                        <th className="pb-3">Value</th>
                        <th className="pb-3">Gain/Loss</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investments.map(inv => {
                        const currentValue = Number(inv.quantity) * Number(inv.asset?.current_price || 0);
                        const costBasis = Number(inv.quantity) * Number(inv.purchase_price);
                        const gain = currentValue - costBasis;
                        return (
                          <tr key={inv.id} className="border-b last:border-0">
                            <td className="py-3 font-medium">{inv.asset?.name}</td>
                            <td className="py-3">{Number(inv.quantity).toFixed(4)}</td>
                            <td className="py-3">${Number(inv.purchase_price).toFixed(2)}</td>
                            <td className="py-3">${Number(inv.asset?.current_price).toFixed(2)}</td>
                            <td className="py-3 font-semibold">${currentValue.toFixed(2)}</td>
                            <td className={`py-3 font-semibold ${gain >= 0 ? 'text-success' : 'text-destructive'}`}>
                              {gain >= 0 ? '+' : ''}${gain.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;