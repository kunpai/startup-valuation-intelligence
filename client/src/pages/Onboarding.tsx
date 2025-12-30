import { useState, useEffect } from "react";
import { useValuation } from "@/context/ValuationContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
import { ArrowRight, Check, Sparkles, Building2, TrendingUp, Users, Rocket, History, Scale, Briefcase, Plus, Trash2, ArrowLeft, AlertCircle, Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";

interface HarmonicCompany {
  id: string;
  name: string;
  description: string | null;
  sector: string | null;
  stage: string | null;
  region: string | null;
  valuation: number | null;
  fundingTotal: number | null;
  lastFundingRound: string | null;
  headcount: number | null;
  website: string | null;
  logoUrl: string | null;
}

const basicsSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  sector: z.string().min(1, "Please select a sector"),
  stage: z.string().min(1, "Please select a stage"),
  region: z.string().min(1, "Please select a region"),
  foundedYear: z.number().min(1900, "Please select a founded year")
});

function CompsStep({ formData, togglePeer }: { 
  formData: { sector: string; stage: string; region: string; selectedPeers: string[] }; 
  togglePeer: (name: string) => void 
}) {
  const { data: harmonicComps, isLoading, error } = useQuery<HarmonicCompany[]>({
    queryKey: ["/api/harmonic/search", formData.sector, formData.stage, formData.region],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "15" });
      if (formData.sector) params.set("sector", formData.sector);
      if (formData.stage) params.set("stage", formData.stage);
      if (formData.region) params.set("region", formData.region);
      const res = await fetch(`/api/harmonic/search?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 60000,
    enabled: !!formData.sector,
  });

  const companies = harmonicComps && harmonicComps.length > 0 
    ? harmonicComps 
    : MOCK_COMPS.filter(c => c.sector === formData.sector).map(c => ({
        id: c.company,
        name: c.company,
        description: null,
        sector: c.sector,
        stage: c.round,
        region: c.region,
        valuation: c.valuation,
        fundingTotal: c.valuation,
        lastFundingRound: c.round,
        headcount: null,
        website: null,
        logoUrl: null,
      }));

  const formatFunding = (amount: number | null) => {
    if (!amount) return "N/A";
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="size-4 text-muted-foreground" />
          <Label>Similar Companies ({formData.sector})</Label>
        </div>
        <span className="text-xs text-muted-foreground">{formData.selectedPeers.length}/5 selected</span>
      </div>
      
      <div className="grid gap-3 h-[300px] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Searching market database...</span>
          </div>
        ) : companies.length > 0 ? (
          companies.map((company) => (
            <div 
              key={company.id} 
              onClick={() => togglePeer(company.name)}
              className={`
                cursor-pointer flex items-center justify-between p-3 rounded-lg border transition-all
                ${formData.selectedPeers.includes(company.name) 
                  ? 'bg-primary/10 border-primary shadow-sm' 
                  : 'hover:bg-secondary/50 hover:border-primary/30'}
              `}
              data-testid={`comp-${company.id}`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium flex items-center gap-2 flex-wrap">
                  {company.name}
                  {company.stage && <Badge variant="secondary" className="text-[10px] h-5">{company.stage}</Badge>}
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex gap-2 flex-wrap">
                  <span>Funding: {formatFunding(company.fundingTotal)}</span>
                  {company.headcount && <span>• {company.headcount} employees</span>}
                  {company.region && <span>• {company.region}</span>}
                </div>
                {company.description && (
                  <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">{company.description}</p>
                )}
              </div>
              <div className={`
                size-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ml-3
                ${formData.selectedPeers.includes(company.name) ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'}
              `}>
                {formData.selectedPeers.includes(company.name) && <Check className="size-3" />}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No companies found for this sector.</p>
            <p className="text-xs mt-2">Try adjusting your sector in Step 1.</p>
          </div>
        )}
      </div>
      
      {harmonicComps && harmonicComps.length > 0 ? (
        <p className="text-xs text-emerald-600 italic text-center flex items-center justify-center gap-1">
          <Check className="size-3" /> Live data from Harmonic startup database
        </p>
      ) : (
        <p className="text-xs text-muted-foreground italic text-center">
          Using sample data • Connect Harmonic API for real-time comparables
        </p>
      )}
    </div>
  );
}


export default function Onboarding() {
  const { updateProfile, updateFinancials, updateQualitative, updateHistory, setMethodology, completeOnboarding, setDemoMode } = useValuation();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateStep = (currentStep: number): boolean => {
    setErrors({});
    
    if (currentStep === 1) {
      const result = basicsSchema.safeParse({
        name: formData.name,
        sector: formData.sector,
        stage: formData.stage,
        region: formData.region,
        foundedYear: formData.foundedYear
      });
      
      if (!result.success) {
        const newErrors: Record<string, string> = {};
        result.error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleDemoMode = () => {
    setDemoMode(true);
    localStorage.setItem('start-tour', 'true');
    setLocation("/");
  };

  const handleComplete = async () => {
    // Pass all data directly to completeOnboarding to avoid state timing issues
    await completeOnboarding({
      profile: {
        name: formData.name,
        sector: formData.sector,
        stage: formData.stage,
        region: formData.region,
        foundedYear: formData.foundedYear
      },
      financials: {
        revenue: formData.revenue,
        growthRate: formData.growthRate,
        lastRoundValuation: formData.lastRoundValuation,
        burnRate: formData.burnRate,
        cashBalance: formData.cashBalance
      },
      qualitative: {
        team: formData.teamScore,
        product: formData.productScore,
        market: formData.marketScore
      },
      methodology: formData.methodology
    });
    
    updateHistory(formData.history);
    localStorage.setItem('start-tour', 'true');
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
                {Object.keys(errors).length > 0 && (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 flex items-center gap-2 text-sm">
                        <AlertCircle className="size-4 flex-shrink-0" />
                        <span>Please fill in all required fields to continue.</span>
                    </div>
                )}
                <div className="space-y-2">
                    <Label>Company Name <span className="text-destructive">*</span></Label>
                    <Input 
                        placeholder="e.g. Acme Inc." 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        autoFocus
                        className={`text-lg ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        aria-required="true"
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Founded Year <span className="text-destructive">*</span></Label>
                        <Select value={formData.foundedYear.toString()} onValueChange={(v) => setFormData({...formData, foundedYear: parseInt(v)})}>
                            <SelectTrigger className={errors.foundedYear ? 'border-destructive' : ''}><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(y => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Region <span className="text-destructive">*</span></Label>
                        <Select value={formData.region} onValueChange={(v) => setFormData({...formData, region: v})}>
                            <SelectTrigger className={errors.region ? 'border-destructive' : ''}><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Sector <span className="text-destructive">*</span></Label>
                        <Select value={formData.sector} onValueChange={(v) => setFormData({...formData, sector: v})}>
                            <SelectTrigger className={errors.sector ? 'border-destructive' : ''}><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Current Stage <span className="text-destructive">*</span></Label>
                        <Select value={formData.stage} onValueChange={(v) => setFormData({...formData, stage: v})}>
                            <SelectTrigger className={errors.stage ? 'border-destructive' : ''}><SelectValue /></SelectTrigger>
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
                            <div key={idx} className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:items-end p-3 border rounded-lg bg-card relative group">
                                <div className="sm:col-span-3 space-y-1">
                                    <Label className="text-xs">Round</Label>
                                    <Select value={item.round} onValueChange={(v) => updateHistoryItem(idx, 'round', v)}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="sm:col-span-4 space-y-1">
                                    <Label className="text-xs">Date</Label>
                                    <Input type="date" className="h-8 text-xs" value={item.date} onChange={(e) => updateHistoryItem(idx, 'date', e.target.value)} />
                                </div>
                                <div className="sm:col-span-4 space-y-1">
                                    <Label className="text-xs">Post-Money Val</Label>
                                    <Input type="number" className="h-8 text-xs" placeholder="$" value={item.valuation || ""} onChange={(e) => updateHistoryItem(idx, 'valuation', Number(e.target.value))} />
                                </div>
                                <div className="sm:col-span-1 pb-1 flex justify-end sm:justify-center">
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
        content: <CompsStep formData={formData} togglePeer={togglePeer} />
    },
    // Step 5: Financials
    {
        id: "financials",
        title: "Key Metrics",
        description: "Enter your current traction metrics.",
        icon: <TrendingUp className="size-6 text-emerald-500" />,
        content: (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
