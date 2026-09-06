import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Sparkles, Heart, TrendingUp, Shield, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero min-h-[90vh] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Nutrition Analysis</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Transform Your Health
              <br />
              <span className="text-primary">One Meal at a Time</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Get instant, personalized nutritional insights from any food photo using advanced AI technology
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="gradient-primary hover:shadow-glow transition-smooth text-lg px-8 py-6"
              >
                <Camera className="mr-2 h-5 w-5" />
                {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="text-lg px-8 py-6"
              >
                <a href="#features">Learn More</a>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-3xl mx-auto">
              <Card className="border-primary/20 shadow-soft">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">AI</div>
                  <div className="text-sm text-muted-foreground">Powered Analysis</div>
                </CardContent>
              </Card>
              <Card className="border-primary/20 shadow-soft">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">Instant</div>
                  <div className="text-sm text-muted-foreground">Results</div>
                </CardContent>
              </Card>
              <Card className="border-primary/20 shadow-soft">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">Personal</div>
                  <div className="text-sm text-muted-foreground">Recommendations</div>
                </CardContent>
              </Card>
              <Card className="border-primary/20 shadow-soft">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">100%</div>
                  <div className="text-sm text-muted-foreground">Free to Start</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need for
              <span className="text-primary"> Healthy Living</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powered by advanced AI to give you accurate, personalized nutritional insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="shadow-soft hover:shadow-glow transition-smooth gradient-card">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Analysis</h3>
                <p className="text-muted-foreground">
                  Simply snap a photo of your meal and get comprehensive nutritional breakdown in seconds
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-glow transition-smooth gradient-card">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Personalized Advice</h3>
                <p className="text-muted-foreground">
                  Get recommendations tailored to your health goals, dietary needs, and medical conditions
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-glow transition-smooth gradient-card">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                <p className="text-muted-foreground">
                  Keep a history of your meals and monitor your nutritional patterns over time
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-glow transition-smooth gradient-card">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Health Profiles</h3>
                <p className="text-muted-foreground">
                  Create detailed health profiles with allergies, restrictions, and medical information
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-glow transition-smooth gradient-card">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
                <p className="text-muted-foreground">
                  Leveraging Google's advanced Gemini AI for accurate food recognition and analysis
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-glow transition-smooth gradient-card">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Get detailed nutritional insights in seconds, right when you need them most
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 gradient-hero">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Transform Your Nutrition?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of users making smarter food choices with AI-powered insights
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="gradient-primary hover:shadow-glow transition-smooth text-lg px-8 py-6"
            >
              <Camera className="mr-2 h-5 w-5" />
              Start Analyzing Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-card">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 NutriVision AI. Powered by Lovable Cloud & AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;