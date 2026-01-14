import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, Shield, Zap, PieChart, ArrowRight } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl">InvestLite</span>
            <span className="demo-badge">DEMO</span>
          </div>
          <Link to="/auth">
            <Button variant="hero">Get Started <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </Link>
        </div>
      </header>

      <main className="pt-24">
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="demo-badge mb-6">🎓 Demo Investment Platform</div>
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 leading-tight">
              Learn to Invest<br />
              <span className="gradient-primary bg-clip-text text-transparent">Risk-Free</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
              Practice investing with simulated funds. Build your portfolio, track performance, and learn financial literacy without any real money.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="hero" size="xl">Start Investing <ArrowRight className="w-5 h-5 ml-2" /></Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">✨ Start with $10,000 demo funds</p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="stat-card text-center">
              <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">100% Risk-Free</h3>
              <p className="text-muted-foreground">All funds are simulated. Learn without fear of losing real money.</p>
            </div>
            <div className="stat-card text-center">
              <div className="w-14 h-14 gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Real-Time Learning</h3>
              <p className="text-muted-foreground">Watch your investments grow or shrink with simulated market movements.</p>
            </div>
            <div className="stat-card text-center">
              <div className="w-14 h-14 gradient-success rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PieChart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Portfolio Insights</h3>
              <p className="text-muted-foreground">Track diversification, gains, and learn portfolio management.</p>
            </div>
          </div>
        </section>

        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>InvestLite is a demo platform for educational purposes only. No real money is involved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;