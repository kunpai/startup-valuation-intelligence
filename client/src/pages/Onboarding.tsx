import { useState } from "react";
import { useValuation } from "@/context/ValuationContext";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SECTORS, STAGES, REGIONS } from "@/lib/constants";
import { ArrowRight, Check, Sparkles, Building2, TrendingUp, Users, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Onboarding() {
  const { updateProfile, updateFinancials, updateQualitative, completeOnboarding, setDemoMode } = useValuation();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);

  // Temporary local state for inputs before committing to context
  const [formData, setFormData] = useState({
    name: "",
    sector: SECTORS[0],
    stage: STAGES[1],
    region: REGIONS[0],
    revenue: 0,
    growthRate: 10,
    lastRoundValuation: 0,
    teamScore: 50,
    productScore: 50,
    marketScore: 50
  });

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleDemoMode = () => {
    setDemoMode(true);
    setLocation("/");
  };

  const handleComplete = () => {
    // Save all data to context
    updateProfile({
      name: formData.name,
      sector: formData.sector,
      stage: formData.stage,
      region: formData.region,
    });
    updateFinancials({
      revenue: formData.revenue,
      growthRate: formData.growthRate,
      lastRoundValuation: formData.lastRoundValuation,
    });
    updateQualitative({
      team: formData.teamScore,
      product: formData.productScore,
      market: formData.marketScore
    });
    
    completeOnboarding();
    setLocation("/");
  };

  const steps = [
    // Step 0: Welcome
    {
      id: "welcome",
      content: (
        <div className="text-center space-y-6 py-8">
            <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Sparkles className="size-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold font-heading">Valuation Intelligence</h1>
            <p className="text-xl text-muted-foreground max-w-md mx-auto">
                Get a data-driven valuation for your startup in minutes. We combine market comps, VC math, and qualitative scoring.
            </p>
            <div className="flex flex-col gap-4 max-w-sm mx-auto pt-4">
                <Button size="lg" className="w-full text-lg h-12 gap-2 shadow-xl shadow-primary/20" onClick={handleNext}>
                    Start Valuation <ArrowRight className="size-5" />
                </Button>
                <Button variant="ghost" className="w-full" onClick={handleDemoMode}>
                    View Sample Data
                </Button>
            </div>
        </div>
      )
    },
    // Step 1: Basics
    {
        id: "basics",
        title: "Company Basics",
        description: "Let's start with the fundamentals.",
        icon: <Building2 className="size-6 text-primary" />,
        content: (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input 
                        placeholder="e.g. Acme Inc." 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        autoFocus
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Sector</Label>
                        <Select value={formData.sector} onValueChange={(v) => setFormData({...formData, sector: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Region</Label>
                        <Select value={formData.region} onValueChange={(v) => setFormData({...formData, region: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Current Stage</Label>
                    <Select value={formData.stage} onValueChange={(v) => setFormData({...formData, stage: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        )
    },
    // Step 2: Financials
    {
        id: "financials",
        title: "Key Metrics",
        description: "Rough estimates are fine for now.",
        icon: <TrendingUp className="size-6 text-emerald-500" />,
        content: (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label>Annual Revenue (ARR)</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input 
                            type="number" 
                            className="pl-7" 
                            placeholder="0"
                            value={formData.revenue || ""}
                            onChange={(e) => setFormData({...formData, revenue: Number(e.target.value)})}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">If pre-revenue, enter 0.</p>
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label>Monthly Growth Rate</Label>
                        <span className="font-mono font-bold text-primary">+{formData.growthRate}%</span>
                    </div>
                    <Slider 
                        min={0} 
                        max={100} 
                        step={1} 
                        value={[formData.growthRate]} 
                        onValueChange={(v) => setFormData({...formData, growthRate: v[0]})}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Last Round Post-Money Valuation (if any)</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input 
                            type="number" 
                            className="pl-7" 
                            placeholder="0"
                            value={formData.lastRoundValuation || ""}
                            onChange={(e) => setFormData({...formData, lastRoundValuation: Number(e.target.value)})}
                        />
                    </div>
                </div>
            </div>
        )
    },
    // Step 3: Qualitative
    {
        id: "qualitative",
        title: "Secret Sauce",
        description: "Rate your startup's core strengths relative to peers.",
        icon: <Users className="size-6 text-blue-500" />,
        content: (
            <div className="space-y-8 py-2">
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <Label className="text-base">Team Strength</Label>
                        <span className={`text-sm font-bold ${formData.teamScore > 70 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                            {formData.teamScore > 80 ? "World Class" : formData.teamScore > 60 ? "Strong" : "Developing"}
                        </span>
                    </div>
                    <Slider 
                        min={0} max={100} step={5}
                        value={[formData.teamScore]}
                        onValueChange={(v) => setFormData({...formData, teamScore: v[0]})}
                    />
                    <p className="text-xs text-muted-foreground">Experience, technical capability, and completeness.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <Label className="text-base">Market Size</Label>
                        <span className={`text-sm font-bold ${formData.marketScore > 70 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                            {formData.marketScore > 80 ? "Massive" : formData.marketScore > 60 ? "Large" : "Niche"}
                        </span>
                    </div>
                    <Slider 
                        min={0} max={100} step={5}
                        value={[formData.marketScore]}
                        onValueChange={(v) => setFormData({...formData, marketScore: v[0]})}
                    />
                    <p className="text-xs text-muted-foreground">TAM, growth rate of market, and timing.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <Label className="text-base">Product Moat</Label>
                        <span className={`text-sm font-bold ${formData.productScore > 70 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                            {formData.productScore > 80 ? "Defensible" : formData.productScore > 60 ? "Solid" : "Early"}
                        </span>
                    </div>
                    <Slider 
                        min={0} max={100} step={5}
                        value={[formData.productScore]}
                        onValueChange={(v) => setFormData({...formData, productScore: v[0]})}
                    />
                    <p className="text-xs text-muted-foreground">IP, technology advantage, and stickiness.</p>
                </div>
            </div>
        )
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px]" />

        <Card className="w-full max-w-lg shadow-2xl border-primary/10 bg-card/80 backdrop-blur-md relative z-10">
            {step > 0 && (
                <CardHeader>
                    <div className="flex items-center gap-4 mb-2">
                         <div className="p-2 bg-secondary rounded-lg">
                            {currentStep.icon}
                         </div>
                         <div>
                             <CardTitle>{currentStep.title}</CardTitle>
                             <CardDescription>{currentStep.description}</CardDescription>
                         </div>
                    </div>
                    <div className="w-full bg-secondary h-1 rounded-full overflow-hidden mt-4">
                        <div 
                            className="bg-primary h-full transition-all duration-500 ease-out" 
                            style={{ width: `${(step / (steps.length - 1)) * 100}%` }} 
                        />
                    </div>
                </CardHeader>
            )}
            
            <CardContent className={step === 0 ? "pt-6" : ""}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentStep.content}
                    </motion.div>
                </AnimatePresence>
            </CardContent>

            {step > 0 && (
                <CardFooter className="flex justify-between gap-4">
                    <Button variant="ghost" onClick={handleBack}>
                        Back
                    </Button>
                    <Button className="flex-1 gap-2" onClick={step === steps.length - 1 ? handleComplete : handleNext}>
                        {step === steps.length - 1 ? (
                            <>Generate Valuation <Rocket className="size-4" /></>
                        ) : (
                            <>Next Step <ArrowRight className="size-4" /></>
                        )}
                    </Button>
                </CardFooter>
            )}
        </Card>
        
        {step > 0 && (
            <div className="mt-8 text-center">
                 <Button variant="link" className="text-muted-foreground" onClick={handleDemoMode}>
                    Skip to Demo Data
                 </Button>
            </div>
        )}
    </div>
  );
}
