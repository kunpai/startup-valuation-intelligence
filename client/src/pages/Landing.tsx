import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Scale, TrendingUp, BarChart3, Users, Shield, ArrowRight } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <nav className="flex justify-between items-center mb-10 md:mb-16">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 md:p-2 rounded-lg">
              <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <span className="text-lg md:text-xl font-bold font-heading">Valuation Intelligence</span>
          </div>
          <Button onClick={handleLogin} className="gap-2" size="sm" data-testid="button-login">
            Sign In <ArrowRight className="h-4 w-4" />
          </Button>
        </nav>

        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20 px-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary leading-tight">
            Build Defensible Startup Valuations
          </h1>
          <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 leading-relaxed">
            Combine VC methodologies, market comparables, and your unique growth story 
            to create investor-ready valuations in minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={handleLogin} className="gap-2 text-base md:text-lg h-11 md:h-12 px-6 md:px-8 shadow-xl shadow-primary/20 hover:shadow-primary/40" data-testid="button-get-started">
              Get Started <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto mb-12 md:mb-20">
          {[
            { 
              icon: Scale, 
              title: "Multi-Method Valuation", 
              desc: "VC Method, Scorecard, Market Comps, and DCF - all calculated and blended automatically." 
            },
            { 
              icon: BarChart3, 
              title: "Market Comparables", 
              desc: "Benchmark against real companies with automatic multiple calculations and peer analysis." 
            },
            { 
              icon: TrendingUp, 
              title: "Scenario Planning", 
              desc: "Model best-case, base-case, and downside scenarios to prepare for investor conversations." 
            }
          ].map((feature, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto mb-12 md:mb-20">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold text-xl mb-2">AI-Powered Guidance</h3>
              <p className="text-muted-foreground leading-relaxed">
                Meet Mira, your virtual CFO. Get context-aware advice on valuation strategy, 
                methodology selection, and investor presentation.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardContent className="pt-6">
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold text-xl mb-2">Investor-Ready Reports</h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate comprehensive deal room materials with valuation summaries, 
                methodology breakdowns, and supporting data.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center py-12 border-t border-border/50">
          <p className="text-muted-foreground">
            Built for founders who want to understand and communicate their startup's value
          </p>
        </div>
      </div>
    </div>
  );
}
