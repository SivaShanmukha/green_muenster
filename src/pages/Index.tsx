import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { Bike, Bus, Car, Leaf, TrendingDown, Trophy, Cloud } from "lucide-react";
import Header from "@/components/Header";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import { useWeather } from "@/hooks/useWeather";
import { Card, CardContent } from "@/components/ui/card";
import heroBackground from "@/assets/hero-background.jpg";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { weather, loading: weatherLoading } = useWeather();

  useEffect(() => {
    if (searchParams.get("onboarding") === "true") {
      setShowOnboarding(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <OnboardingTutorial open={showOnboarding} onClose={() => setShowOnboarding(false)} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Leaf className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Sustainable Navigation for Münster</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Navigate Greener,
              <br />
              <span className="text-primary">Live Better</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Reduce your carbon footprint with real-time CO₂ estimates, sustainable route optimization, 
              and gamified tracking of your eco-friendly travel choices.
            </p>
            
            {/* Weather Quick View */}
            {weather && (
              <Card className="max-w-md mx-auto bg-card/50 backdrop-blur">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                        alt={weather.description}
                        className="w-12 h-12"
                      />
                      <div>
                        <p className="text-2xl font-bold">{weather.temperature}°C</p>
                        <p className="text-sm text-muted-foreground capitalize">{weather.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">{weather.recommendation}</p>
                      <p className="text-xs text-muted-foreground">{weather.transportSuggestion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/planner">
                <Button size="lg" variant="hero" className="text-lg px-8">
                  Plan Your Route
                </Button>
              </Link>
              <Link to="/progress">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Track Progress
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Green Münster?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your partner in sustainable commuting with powerful features to help reduce your environmental impact.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card rounded-lg p-8 border border-border hover:border-primary transition-all duration-300 hover:shadow-lg">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <TrendingDown className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">CO₂ Tracking</h3>
              <p className="text-muted-foreground">
                Real-time emissions estimates for all transportation modes, helping you make informed sustainable choices.
              </p>
            </div>

            <div className="bg-card rounded-lg p-8 border border-border hover:border-primary transition-all duration-300 hover:shadow-lg">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Cloud className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Weather Integration</h3>
              <p className="text-muted-foreground">
                Smart recommendations based on current weather conditions to keep your journey comfortable and sustainable.
              </p>
            </div>

            <div className="bg-card rounded-lg p-8 border border-border hover:border-primary transition-all duration-300 hover:shadow-lg">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Trophy className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Gamification</h3>
              <p className="text-muted-foreground">
                Earn badges, compete on leaderboards, and track your cumulative CO₂ savings over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transport Modes Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Sustainable Mode
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compare emissions across different transportation options and make the eco-friendly choice.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center space-y-3 p-6 rounded-lg border border-border hover:border-success transition-all duration-300 bg-card">
              <Bike className="h-12 w-12 text-success" />
              <span className="font-semibold text-foreground">Bicycle</span>
              <span className="text-sm text-success font-medium">0g CO₂</span>
            </div>

            <div className="flex flex-col items-center space-y-3 p-6 rounded-lg border border-border hover:border-success transition-all duration-300 bg-card">
              <Bus className="h-12 w-12 text-success" />
              <span className="font-semibold text-foreground">Public Transit</span>
              <span className="text-sm text-success font-medium">20g CO₂</span>
            </div>

            <div className="flex flex-col items-center space-y-3 p-6 rounded-lg border border-border hover:border-warning transition-all duration-300 bg-card">
              <Car className="h-12 w-12 text-warning" />
              <span className="font-semibold text-foreground">Electric Car</span>
              <span className="text-sm text-warning font-medium">50g CO₂</span>
            </div>

            <div className="flex flex-col items-center space-y-3 p-6 rounded-lg border border-border hover:border-danger transition-all duration-300 bg-card">
              <Car className="h-12 w-12 text-danger" />
              <span className="font-semibold text-foreground">Petrol Car</span>
              <span className="text-sm text-danger font-medium">120g CO₂</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Ready to Make Every Trip Count?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join the green movement and start tracking your sustainable journey today.
            </p>
            <Link to="/planner">
              <Button size="lg" variant="hero" className="text-lg px-12">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
