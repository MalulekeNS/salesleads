import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, TrendingUp, Filter, Shield, Zap, BarChart3, CheckCircle } from 'lucide-react';
import heroImage from '@/assets/hero-sales.jpg';
import greenBackground from '@/assets/green-background.webp';
import { ChatBot } from '@/components/chat/ChatBot';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Users, title: 'Create & Manage', desc: 'Add new leads and update their information anytime.' },
    { icon: Filter, title: 'Filter & Search', desc: 'Find leads by status, name, email, or date range.' },
    { icon: TrendingUp, title: 'Track Progress', desc: 'Monitor leads through your sales pipeline stages.' },
    { icon: Shield, title: 'Secure Access', desc: 'JWT authentication keeps your data protected.' },
    { icon: Zap, title: 'Fast Performance', desc: 'Server-side pagination for smooth experience.' },
    { icon: BarChart3, title: 'Analytics', desc: 'Real-time insights into your conversion rates.' },
  ];

  const benefits = [
    'Unlimited leads storage',
    'Real-time status updates',
    'Advanced search & filters',
    'Secure authentication',
    'Mobile responsive design',
    'Export capabilities',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Background Image */}
      <section 
        className="relative min-h-[600px] flex items-center justify-center"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for text readability */}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(1, 70, 24, 0.75)' }}
        />
        
        {/* Login & Download buttons */}
        <div className="absolute top-6 right-6 z-20 flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/auth')}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            Login
          </Button>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Welcome to LeadsHub
          </h1>
          <p className="text-xl text-white/90 mb-8">
            All in one Lead Management Business platform.
          </p>
          
          {/* Search Bar */}
          <div className="flex max-w-2xl mx-auto gap-2 mb-10">
            <Input 
              placeholder="Search..." 
              className="bg-white/90 border-0 h-12 text-foreground placeholder:text-muted-foreground"
            />
            <Button className="h-12 px-6 bg-white text-foreground hover:bg-white/90">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">10K+</p>
              <p className="text-sm text-white/70">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">50M+</p>
              <p className="text-sm text-white/70">Leads Managed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">99.9%</p>
              <p className="text-sm text-white/70">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main 
        className="px-6 py-12 space-y-6"
        style={{ 
          backgroundImage: `url(${greenBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Features Section */}
        <section 
          className="max-w-7xl mx-auto rounded-lg p-6 lg:p-8"
          style={{ backgroundColor: 'rgba(1, 70, 24, 0.7)' }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Features</h2>
          <p className="text-primary-light font-semibold mb-6">What You Can Do</p>
          
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="rounded-lg p-5 group hover:scale-105 transition-transform"
                style={{ backgroundColor: 'rgba(124, 182, 132, 0.3)' }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/80 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section 
          className="max-w-7xl mx-auto rounded-lg p-6 lg:p-8"
          style={{ backgroundColor: 'rgba(1, 70, 24, 0.7)' }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Why Choose LeadsHub?</h2>
          <p className="text-primary-light font-semibold mb-6">Built for Sales Teams</p>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-white">{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section 
          className="max-w-7xl mx-auto rounded-lg p-6 lg:p-8"
          style={{ backgroundColor: 'rgba(1, 70, 24, 0.7)' }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-primary-light font-semibold mb-6">Get Started in 3 Steps</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Sign Up', desc: 'Create your free account with just an email address.' },
              { step: '2', title: 'Add Leads', desc: 'Import or manually add leads to your pipeline.' },
              { step: '3', title: 'Track & Convert', desc: 'Move leads through stages and close more deals.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold text-white"
                  style={{ backgroundColor: 'rgba(64, 170, 73, 0.5)' }}
                >
                  {item.step}
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-white/80">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer 
        className="py-6 px-6"
        style={{ backgroundColor: 'rgba(1, 70, 24, 0.9)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/70">
            © 2026 LeadsHub. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Chat Bot */}
      <ChatBot />
    </div>
  );
};

export default Index;