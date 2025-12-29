import { useState } from "react";
import { useValuation } from "@/context/ValuationContext";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SECTORS, STAGES, REGIONS, METHODOLOGY_DESCRIPTIONS, MOCK_COMPS } from "@/lib/constants";
import { ArrowRight, Check, Sparkles, Building2, TrendingUp, Users, Rocket, History, Scale, Briefcase, Plus, Trash2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Onboarding() {
  const { updateProfile, updateFinancials, updateQualitative, updateHistory, setMethodology, completeOnboarding, setDemoMode } = useValuation();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);

  // Temporary local state for inputs before committing to context
  const [formData, setFormData] = useState({
    // Basics
    name: "",
    sector: SECTORS[0],
    stage: STAGES[1],
    region: REGIONS[0],
    foundedYear: new Date().getFullYear(),
    
    // History
    hasHistory: false,
    history: [] as { round: string, date: string, amount: number, valuation: number }[],
    
    // Methodology
    methodology: "blended",
    
    // Comps
    selectedPeers: [] as string[],
    
    // Financials
    revenue: 0,
    growthRate: 10,
    lastRoundValuation: 0,
    burnRate: 50000,
    cashBalance: 500000,
    
    // Qualitative
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
      foundedYear: formData.foundedYear
    });
    
    updateFinancials({
      revenue: formData.revenue,
      growthRate: formData.growthRate,
      lastRoundValuation: formData.lastRoundValuation,
      burnRate: formData.burnRate,
      cashBalance: formData.cashBalance
    });
    
    updateQualitative({
      team: formData.teamScore,
      product: formData.productScore,
      market: formData.marketScore
    });
    
    updateHistory(formData.history);
    setMethodology(formData.methodology);
    
    completeOnboarding();
    setLocation("/");
  };
  
  const addHistoryItem = () => {
    setFormData({
        ...formData,
        history: [...formData.history, { round: "Seed", date: new Date().toISOString().split('T')[0], amount: 0, valuation: 0 }]
    });
  };

  const removeHistoryItem = (index: number) => {
    const newHistory = [...formData.history];
    newHistory.splice(index, 1);
    setFormData({...formData, history: newHistory});
  };
  
  const updateHistoryItem = (index: number, field: string, value: any) => {
    const newHistory = [...formData.history];
    newHistory[index] = { ...newHistory[index], [field]: value };
    setFormData({...formData, history: newHistory});
  };

  const togglePeer = (companyName: string) => {
    if (formData.selectedPeers.includes(companyName)) {
        setFormData({
            ...formData, 
            selectedPeers: formData.selectedPeers.filter(p => p !== companyName)
        });
    } else {
        if (formData.selectedPeers.length < 5) {
            setFormData({
                ...formData, 
                selectedPeers: [...formData.selectedPeers, companyName]
            });
        }
    }
  };

  const steps = [
    // Step 0: Welcome
    {
      id: "welcome",
      content: (
        <div className="text-center space-y-6 py-8">
            <div className="mx-auto bg-primary/10 w-24 h-24 rounded-2xl flex items-center justify-center mb-6 animate-pulse ring-1 ring-primary/20">
                <Sparkles className="size-12 text-primary" />
            </div>
            <div className="space-y-2">
                <h1 className="text-4xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">Valuation Intelligence</h1>
                <p className="text-xl text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Build a defensible valuation model in minutes. Combine market data, VC methodologies, and your unique growth story.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8 text-left">
                {[
                    { icon: Scale, title: "Multi-Method", desc: "Blended VC & Market models" },
                    { icon: Briefcase, title: "Comps Analysis", desc: "Real-time market benchmarking" },
                    { icon: History, title: "Scenario Planning", desc: "Future fundraising modeling" }
                ].map((feature, i) => (
                    <div key={i} className="bg-card/50 border p-4 rounded-xl backdrop-blur-sm">
                        <feature.icon className="size-5 text-primary mb-2" />
                        <h3 className="font-semibold text-sm">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-4 max-w-sm mx-auto pt-8">
                <Button size="lg" className="w-full text-lg h-12 gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all" onClick={handleNext}>
                    Start Valuation <ArrowRight className="size-5" />
                </Button>
                <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground" onClick={handleDemoMode}>
                    View Sample Dashboard
                </Button>
            </div>
        </div>
      )
    },
    // Step 1: Basics
    {
        id: "basics",
        title: "Company Basics",
        description: "Let's establish your company profile.",
        icon: <Building2 className="size-6 text-primary" />,
        content: (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input 
                        placeholder="e.g. Acme Inc." 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        autoFocus
                        className="text-lg"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Founded Year</Label>
                        <Select value={formData.foundedYear.toString()} onValueChange={(v) => setFormData({...formData, foundedYear: parseInt(v)})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(y => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
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
                        <Label>Current Stage</Label>
                        <Select value={formData.stage} onValueChange={(v) => setFormData({...formData, stage: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        )
    },
    // Step 2: History
    {
        id: "history",
        title: "Funding History",
        description: "Previous rounds help anchor your current valuation.",
        icon: <History className="size-6 text-purple-500" />,
        content: (
            <div className="space-y-6">
                 <div className="flex items-center space-x-2 border p-4 rounded-lg bg-secondary/20">
                    <Checkbox 
                        id="hasHistory" 
                        checked={formData.hasHistory}
                        onCheckedChange={(c) => setFormData({...formData, hasHistory: c === true})}
                    />
                    <label
                        htmlFor="hasHistory"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        We have raised capital before
                    </label>
                </div>

                {formData.hasHistory && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        {formData.history.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg bg-card relative group">
                                <div className="col-span-3 space-y-1">
                                    <Label className="text-xs">Round</Label>
                                    <Select value={item.round} onValueChange={(v) => updateHistoryItem(idx, 'round', v)}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-4 space-y-1">
                                    <Label className="text-xs">Date</Label>
                                    <Input type="date" className="h-8 text-xs" value={item.date} onChange={(e) => updateHistoryItem(idx, 'date', e.target.value)} />
                                </div>
                                <div className="col-span-4 space-y-1">
                                    <Label className="text-xs">Post-Money Val</Label>
                                    <Input type="number" className="h-8 text-xs" placeholder="$" value={item.valuation || ""} onChange={(e) => updateHistoryItem(idx, 'valuation', Number(e.target.value))} />
                                </div>
                                <div className="col-span-1 pb-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => removeHistoryItem(idx)}>
                                        <Trash2 className="size-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full border-dashed gap-2" onClick={addHistoryItem}>
                            <Plus className="size-4" /> Add Past Round
                        </Button>
                    </div>
                )}
            </div>
        )
    },
    // Step 3: Methodology
    {
        id: "methodology",
        title: "Valuation Approach",
        description: "Choose how you want to calculate your valuation.",
        icon: <Scale className="size-6 text-indigo-500" />,
        content: (
            <div className="space-y-4 h-[400px] overflow-y-auto pr-2">
                <RadioGroup value={formData.methodology} onValueChange={(v) => setFormData({...formData, methodology: v})} className="space-y-3">
                    {METHODOLOGY_DESCRIPTIONS.map((method) => (
                        <div key={method.id} className={`flex items-start space-x-3 space-y-0 rounded-md border p-4 transition-all hover:bg-accent/50 ${formData.methodology === method.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : ''}`}>
                             <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                             <div className="space-y-1">
                                 <Label htmlFor={method.id} className="font-semibold text-base cursor-pointer">
                                     {method.name}
                                     {method.id === 'blended' && <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/30 border-none">Recommended</Badge>}
                                 </Label>
                                 <p className="text-sm text-muted-foreground">{method.description}</p>
                                 {formData.methodology === method.id && (
                                     <motion.div 
                                        initial={{ opacity: 0, height: 0 }} 
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="pt-2 text-xs text-muted-foreground/80 border-t mt-2"
                                     >
                                         <p className="mb-1"><span className="font-medium text-foreground">How it works:</span> {method.details}</p>
                                         <p><span className="font-medium text-foreground">Best for:</span> {method.suitableFor}</p>
                                     </motion.div>
                                 )}
                             </div>
                        </div>
                    ))}
                </RadioGroup>
            </div>
        )
    },
    // Step 4: Comps Selection
    {
        id: "comps",
        title: "Market Peers",
        description: "Select up to 5 similar companies to benchmark against.",
        icon: <Briefcase className="size-6 text-blue-500" />,
        content: (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Suggested Peers ({formData.sector})</Label>
                    <span className="text-xs text-muted-foreground">{formData.selectedPeers.length}/5 selected</span>
                </div>
                
                <div className="grid gap-3 h-[300px] overflow-y-auto pr-2">
                    {MOCK_COMPS.filter(c => c.sector === formData.sector).map((company, i) => (
                        <div 
                            key={i} 
                            onClick={() => togglePeer(company.company)}
                            className={`
                                cursor-pointer flex items-center justify-between p-3 rounded-lg border transition-all
                                ${formData.selectedPeers.includes(company.company) 
                                    ? 'bg-primary/10 border-primary shadow-sm' 
                                    : 'hover:bg-secondary/50 hover:border-primary/30'}
                            `}
                        >
                            <div>
                                <div className="font-medium flex items-center gap-2">
                                    {company.company}
                                    <Badge variant="secondary" className="text-[10px] h-5">{company.round}</Badge>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Val: ${(company.valuation/1000000).toFixed(1)}M • Rev: ${(company.revenue/1000).toFixed(0)}k
                                </div>
                            </div>
                            <div className={`
                                size-5 rounded-full border flex items-center justify-center transition-colors
                                ${formData.selectedPeers.includes(company.company) ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'}
                            `}>
                                {formData.selectedPeers.includes(company.company) && <Check className="size-3" />}
                            </div>
                        </div>
                    ))}
                    {MOCK_COMPS.filter(c => c.sector === formData.sector).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No exact sector matches found in mock database.</p>
                            <p className="text-xs mt-2">Try changing sector in Step 1.</p>
                        </div>
                    )}
                </div>
                <p className="text-xs text-muted-foreground italic text-center">
                    Note: In a live app, this would search a real-time market database.
                </p>
            </div>
        )
    },
    // Step 5: Financials
    {
        id: "financials",
        title: "Key Metrics",
        description: "Enter your current traction metrics.",
        icon: <TrendingUp className="size-6 text-emerald-500" />,
        content: (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Annual Revenue (ARR)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input 
                                type="number" 
                                className="pl-7" 
                                value={formData.revenue || ""}
                                onChange={(e) => setFormData({...formData, revenue: Number(e.target.value)})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Monthly Burn</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input 
                                type="number" 
                                className="pl-7" 
                                value={formData.burnRate || ""}
                                onChange={(e) => setFormData({...formData, burnRate: Number(e.target.value)})}
                            />
                        </div>
                    </div>
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
                    <Label>Cash on Hand</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input 
                            type="number" 
                            className="pl-7" 
                            value={formData.cashBalance || ""}
                            onChange={(e) => setFormData({...formData, cashBalance: Number(e.target.value)})}
                        />
                    </div>
                </div>
            </div>
        )
    },
    // Step 6: Qualitative
    {
        id: "qualitative",
        title: "Strategic Scorecard",
        description: "Rate your startup's core strengths relative to the market.",
        icon: <Users className="size-6 text-orange-500" />,
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
                        <Label className="text-base">Market Size & Timing</Label>
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
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        <Card className="w-full max-w-2xl shadow-2xl border-primary/10 bg-card/90 backdrop-blur-md relative z-10 overflow-hidden">
            {step > 0 && (
                <div className="bg-secondary/50 border-b p-4 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                         <div className="p-2 bg-background border rounded-lg shadow-sm">
                            {currentStep.icon}
                         </div>
                         <div>
                             <CardTitle className="text-lg">{currentStep.title}</CardTitle>
                             <CardDescription className="text-xs">{currentStep.description}</CardDescription>
                         </div>
                     </div>
                     <div className="text-xs font-mono text-muted-foreground">
                        Step {step} of {steps.length - 1}
                     </div>
                </div>
            )}
            
            {step > 0 && (
                <div className="w-full bg-secondary h-1">
                    <motion.div 
                        className="bg-primary h-full"
                        initial={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                        animate={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>
            )}
            
            <CardContent className={step === 0 ? "pt-6 pb-6" : "pt-6 h-[460px] overflow-y-auto"}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {currentStep.content}
                    </motion.div>
                </AnimatePresence>
            </CardContent>

            {step > 0 && (
                <CardFooter className="flex justify-between gap-4 border-t pt-4 bg-secondary/20">
                    <Button variant="ghost" onClick={handleBack} className="gap-2">
                        <ArrowLeft className="size-4" /> Back
                    </Button>
                    <Button className="min-w-[140px] gap-2 shadow-lg shadow-primary/10" onClick={step === steps.length - 1 ? handleComplete : handleNext}>
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
            <div className="mt-8 text-center animate-in fade-in delay-500">
                 <Button variant="link" className="text-muted-foreground text-xs" onClick={handleDemoMode}>
                    Skip to Demo Data
                 </Button>
            </div>
        )}
    </div>
  );
}
