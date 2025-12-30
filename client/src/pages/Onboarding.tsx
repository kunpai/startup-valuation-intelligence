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
import { 
  INDUSTRY_TAGS, 
  TECHNOLOGY_TAGS, 
  HARMONIC_FUNDING_STAGES, 
  CUSTOMER_TYPES, 
  REVENUE_MODELS, 
  TARGET_CUSTOMER_SIZES, 
  COUNTRIES,
  REGIONS,
  METHODOLOGY_DESCRIPTIONS, 
  MOCK_COMPS,
  STAGES
} from "@/lib/constants";
import { ArrowRight, Check, Sparkles, Building2, TrendingUp, Users, Rocket, History, Scale, Briefcase, Plus, Trash2, ArrowLeft, AlertCircle, Loader2, Search, Target, Globe, Layers } from "lucide-react";
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
  foundedYear: z.number().min(1900, "Please select a founded year")
});

const businessModelSchema = z.object({
  industryTags: z.array(z.string()).min(1, "Please select at least one industry"),
  customerType: z.string().min(1, "Please select a customer type"),
  stage: z.string().min(1, "Please select your funding stage")
});

function CompsStep({ formData, togglePeer }: { 
  formData: { 
    industryTags: string[]; 
    technologyTags: string[];
    stage: string; 
    country: string;
    selectedPeers: string[] 
  }; 
  togglePeer: (name: string) => void 
}) {
  const stageLabel = HARMONIC_FUNDING_STAGES.find(s => s.value === formData.stage)?.label || formData.stage;
  const region = COUNTRIES.find(c => c.value === formData.country)?.region;
  
  const { data: harmonicComps, isLoading, error } = useQuery<HarmonicCompany[]>({
    queryKey: ["/api/harmonic/search", formData.industryTags, formData.technologyTags, formData.stage, formData.country],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "20" });
      if (formData.industryTags.length > 0) params.set("industryTags", formData.industryTags.join(','));
      if (formData.technologyTags.length > 0) params.set("technologyTags", formData.technologyTags.join(','));
      if (formData.stage) params.set("stage", stageLabel);
      if (formData.country) params.set("country", formData.country);
      if (region) params.set("region", region);
      const res = await fetch(`/api/harmonic/search?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 60000,
    enabled: formData.industryTags.length > 0 || formData.technologyTags.length > 0,
  });

  const companies = harmonicComps && harmonicComps.length > 0 
    ? harmonicComps 
    : MOCK_COMPS.slice(0, 10).map(c => ({
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
          <Label>Similar Companies</Label>
        </div>
        <span className="text-xs text-muted-foreground">{formData.selectedPeers.length}/5 selected</span>
      </div>
      
      <div className="text-xs text-muted-foreground bg-secondary/30 rounded p-2 flex flex-wrap gap-1">
        <span>Matching:</span>
        {formData.industryTags.slice(0, 2).map(tag => (
          <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
        ))}
        {formData.technologyTags.slice(0, 2).map(tag => (
          <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
        ))}
        {stageLabel && <Badge variant="secondary" className="text-[10px]">{stageLabel}</Badge>}
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
            <p>No companies found matching your criteria.</p>
            <p className="text-xs mt-2">Try selecting different industries or stages.</p>
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Basics
    name: "",
    foundedYear: new Date().getFullYear(),
    description: "",
    
    // Business Model (Harmonic-aligned)
    industryTags: [] as string[],
    technologyTags: [] as string[],
    customerType: "",
    revenueModel: "",
    targetCustomerSize: "",
    
    // Location & Stage
    country: "United States",
    stage: "SEED",
    
    // Legacy fields (computed from new fields)
    sector: "",
    region: "North America",
    
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

  // Derive legacy fields from new fields
  useEffect(() => {
    const countryData = COUNTRIES.find(c => c.value === formData.country);
    const stageData = HARMONIC_FUNDING_STAGES.find(s => s.value === formData.stage);
    setFormData(prev => ({
      ...prev,
      region: countryData?.region || "North America",
      sector: prev.industryTags[0] || "Business Software Services"
    }));
  }, [formData.country, formData.stage, formData.industryTags]);

  const validateStep = (currentStep: number): boolean => {
    setErrors({});
    
    if (currentStep === 1) {
      const result = basicsSchema.safeParse({
        name: formData.name,
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
    
    if (currentStep === 2) {
      const result = businessModelSchema.safeParse({
        industryTags: formData.industryTags,
        customerType: formData.customerType,
        stage: formData.stage
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
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
    // Validate company name is not empty
    if (!formData.name.trim()) {
      setErrors({ name: "Company name is required" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const stageLabel = HARMONIC_FUNDING_STAGES.find(s => s.value === formData.stage)?.label || "Seed";
      
      await completeOnboarding({
        profile: {
          name: formData.name.trim(),
          sector: formData.industryTags[0] || "Business Software Services",
          stage: stageLabel,
          region: formData.region,
          foundedYear: formData.foundedYear,
          industryTags: formData.industryTags,
          technologyTags: formData.technologyTags,
          customerType: formData.customerType,
          revenueModel: formData.revenueModel,
          targetCustomerSize: formData.targetCustomerSize,
          country: formData.country,
          description: formData.description
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
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      setIsSubmitting(false);
    }
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
  
  const toggleIndustryTag = (tag: string) => {
    if (formData.industryTags.includes(tag)) {
      setFormData({...formData, industryTags: formData.industryTags.filter(t => t !== tag)});
    } else if (formData.industryTags.length < 3) {
      setFormData({...formData, industryTags: [...formData.industryTags, tag]});
    }
  };
  
  const toggleTechnologyTag = (tag: string) => {
    if (formData.technologyTags.includes(tag)) {
      setFormData({...formData, technologyTags: formData.technologyTags.filter(t => t !== tag)});
    } else if (formData.technologyTags.length < 3) {
      setFormData({...formData, technologyTags: [...formData.technologyTags, tag]});
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
                <Button size="lg" className="w-full text-lg h-12 gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all" onClick={handleNext} data-testid="button-start">
                    Start Valuation <ArrowRight className="size-5" />
                </Button>
                <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground" onClick={handleDemoMode} data-testid="button-demo">
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
        description: "Tell us about your startup.",
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
                        data-testid="input-company-name"
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                    <Label>Brief Description</Label>
                    <Input 
                        placeholder="e.g. AI-powered sales automation platform" 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="text-sm"
                        data-testid="input-description"
                    />
                    <p className="text-xs text-muted-foreground">One line about what you do</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Founded Year <span className="text-destructive">*</span></Label>
                        <Select value={formData.foundedYear.toString()} onValueChange={(v) => setFormData({...formData, foundedYear: parseInt(v)})}>
                            <SelectTrigger className={errors.foundedYear ? 'border-destructive' : ''} data-testid="select-founded-year"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Array.from({length: 15}, (_, i) => new Date().getFullYear() - i).map(y => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Country <span className="text-destructive">*</span></Label>
                        <Select value={formData.country} onValueChange={(v) => setFormData({...formData, country: v})}>
                            <SelectTrigger data-testid="select-country"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {COUNTRIES.map(c => <SelectItem key={c.value} value={c.value}>{c.value} ({c.region})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        )
    },
    // Step 2: Business Model
    {
        id: "business_model",
        title: "Business Model",
        description: "Help us find the right comparables by describing your business.",
        icon: <Target className="size-6 text-orange-500" />,
        content: (
            <div className="space-y-6">
                {Object.keys(errors).length > 0 && (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 flex items-center gap-2 text-sm">
                        <AlertCircle className="size-4 flex-shrink-0" />
                        <span>Please fill in all required fields to continue.</span>
                    </div>
                )}
                
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Layers className="size-4" />
                        Industry <span className="text-destructive">*</span>
                        <span className="text-xs text-muted-foreground ml-auto">{formData.industryTags.length}/3 selected</span>
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-secondary/20 max-h-[140px] overflow-y-auto">
                        {INDUSTRY_TAGS.map(tag => (
                            <Badge 
                                key={tag}
                                variant={formData.industryTags.includes(tag) ? "default" : "outline"}
                                className={`cursor-pointer transition-all ${formData.industryTags.includes(tag) ? 'bg-primary' : 'hover:bg-primary/10'}`}
                                onClick={() => toggleIndustryTag(tag)}
                                data-testid={`tag-industry-${tag}`}
                            >
                                {formData.industryTags.includes(tag) && <Check className="size-3 mr-1" />}
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    {errors.industryTags && <p className="text-xs text-destructive">{errors.industryTags}</p>}
                </div>
                
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Rocket className="size-4" />
                        Technology Focus
                        <span className="text-xs text-muted-foreground ml-auto">{formData.technologyTags.length}/3 selected</span>
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-secondary/20 max-h-[120px] overflow-y-auto">
                        {TECHNOLOGY_TAGS.map(tag => (
                            <Badge 
                                key={tag}
                                variant={formData.technologyTags.includes(tag) ? "default" : "outline"}
                                className={`cursor-pointer transition-all ${formData.technologyTags.includes(tag) ? 'bg-purple-600' : 'hover:bg-purple-600/10'}`}
                                onClick={() => toggleTechnologyTag(tag)}
                                data-testid={`tag-tech-${tag}`}
                            >
                                {formData.technologyTags.includes(tag) && <Check className="size-3 mr-1" />}
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Customer Type <span className="text-destructive">*</span></Label>
                        <Select value={formData.customerType} onValueChange={(v) => setFormData({...formData, customerType: v})}>
                            <SelectTrigger className={errors.customerType ? 'border-destructive' : ''} data-testid="select-customer-type"><SelectValue placeholder="Who do you sell to?" /></SelectTrigger>
                            <SelectContent>
                                {CUSTOMER_TYPES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Revenue Model</Label>
                        <Select value={formData.revenueModel} onValueChange={(v) => setFormData({...formData, revenueModel: v})}>
                            <SelectTrigger data-testid="select-revenue-model"><SelectValue placeholder="How do you make money?" /></SelectTrigger>
                            <SelectContent>
                                {REVENUE_MODELS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Target Customer Size</Label>
                        <Select value={formData.targetCustomerSize} onValueChange={(v) => setFormData({...formData, targetCustomerSize: v})}>
                            <SelectTrigger data-testid="select-target-size"><SelectValue placeholder="Your ideal customers" /></SelectTrigger>
                            <SelectContent>
                                {TARGET_CUSTOMER_SIZES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Current Stage <span className="text-destructive">*</span></Label>
                        <Select value={formData.stage} onValueChange={(v) => setFormData({...formData, stage: v})}>
                            <SelectTrigger className={errors.stage ? 'border-destructive' : ''} data-testid="select-stage"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {HARMONIC_FUNDING_STAGES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        )
    },
    // Step 3: History
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
                        data-testid="checkbox-has-history"
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
                        <Button variant="outline" size="sm" className="w-full border-dashed gap-2" onClick={addHistoryItem} data-testid="button-add-round">
                            <Plus className="size-4" /> Add Past Round
                        </Button>
                    </div>
                )}
            </div>
        )
    },
    // Step 4: Methodology
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
                             <RadioGroupItem value={method.id} id={method.id} className="mt-1" data-testid={`radio-method-${method.id}`} />
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
    // Step 5: Comps Selection
    {
        id: "comps",
        title: "Market Peers",
        description: "Select similar companies to benchmark against.",
        icon: <Users className="size-6 text-amber-500" />,
        content: <CompsStep formData={formData} togglePeer={togglePeer} />
    },
    // Step 6: Financials
    {
        id: "financials",
        title: "Key Metrics",
        description: "Enter your current traction metrics.",
        icon: <TrendingUp className="size-6 text-emerald-500" />,
        content: (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Annual Revenue ($)</Label>
                        <Input 
                            type="number" 
                            placeholder="0" 
                            value={formData.revenue || ""} 
                            onChange={(e) => setFormData({...formData, revenue: Number(e.target.value)})} 
                            data-testid="input-revenue"
                        />
                        <p className="text-xs text-muted-foreground">ARR or annualized run rate</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Last Round Valuation ($)</Label>
                        <Input 
                            type="number" 
                            placeholder="0" 
                            value={formData.lastRoundValuation || ""} 
                            onChange={(e) => setFormData({...formData, lastRoundValuation: Number(e.target.value)})} 
                            data-testid="input-last-valuation"
                        />
                        <p className="text-xs text-muted-foreground">Post-money valuation</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <Label>Revenue Growth Rate: <span className="font-bold text-primary">{formData.growthRate}%</span> YoY</Label>
                    <Slider
                        value={[formData.growthRate]}
                        onValueChange={(v) => setFormData({...formData, growthRate: v[0]})}
                        max={500}
                        min={-50}
                        step={5}
                        className="py-4"
                        data-testid="slider-growth-rate"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Monthly Burn Rate ($)</Label>
                        <Input 
                            type="number" 
                            placeholder="50000" 
                            value={formData.burnRate || ""} 
                            onChange={(e) => setFormData({...formData, burnRate: Number(e.target.value)})} 
                            data-testid="input-burn-rate"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Cash on Hand ($)</Label>
                        <Input 
                            type="number" 
                            placeholder="500000" 
                            value={formData.cashBalance || ""} 
                            onChange={(e) => setFormData({...formData, cashBalance: Number(e.target.value)})} 
                            data-testid="input-cash-balance"
                        />
                    </div>
                </div>
            </div>
        )
    },
    // Step 7: Qualitative
    {
        id: "qualitative",
        title: "Qualitative Scores",
        description: "Self-assess your startup across key dimensions.",
        icon: <Rocket className="size-6 text-pink-500" />,
        content: (
            <div className="space-y-8">
                <p className="text-sm text-muted-foreground">Rate your startup honestly. These scores influence the Scorecard valuation method.</p>
                
                {[
                    { key: "teamScore", label: "Team Strength", desc: "Experience, track record, domain expertise" },
                    { key: "productScore", label: "Product Maturity", desc: "Stage of development, traction, PMF signals" },
                    { key: "marketScore", label: "Market Opportunity", desc: "TAM size, growth rate, competitive landscape" }
                ].map(({ key, label, desc }) => (
                    <div key={key} className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <Label className="text-base">{label}</Label>
                                <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                            <Badge variant="outline" className="text-lg px-3">{formData[key as keyof typeof formData] as number}</Badge>
                        </div>
                        <Slider
                            value={[formData[key as keyof typeof formData] as number]}
                            onValueChange={(v) => setFormData({...formData, [key]: v[0]})}
                            max={100}
                            min={0}
                            step={5}
                            data-testid={`slider-${key}`}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Below Average</span>
                            <span>Average</span>
                            <span>Exceptional</span>
                        </div>
                    </div>
                ))}
            </div>
        )
    }
  ];

  const currentStep = steps[step];
  const isFirstStep = step === 0;
  const isLastStep = step === steps.length - 1;
  const progressPercentage = (step / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl border-primary/10">
            {!isFirstStep && (
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            {currentStep.icon}
                            <div>
                                <CardTitle className="text-xl">{currentStep.title}</CardTitle>
                                <CardDescription>{currentStep.description}</CardDescription>
                            </div>
                        </div>
                        <Badge variant="outline">Step {step} of {steps.length - 1}</Badge>
                    </div>
                    <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-primary" 
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </CardHeader>
            )}
            
            <CardContent className={isFirstStep ? 'pt-8' : ''}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {currentStep.content}
                    </motion.div>
                </AnimatePresence>
            </CardContent>

            {!isFirstStep && (
                <CardFooter className="flex justify-between pt-6 border-t">
                    <Button variant="ghost" onClick={handleBack} className="gap-2" data-testid="button-back">
                        <ArrowLeft className="size-4" /> Back
                    </Button>
                    {isLastStep ? (
                        <Button 
                          onClick={handleComplete} 
                          className="gap-2 shadow-lg shadow-primary/20" 
                          data-testid="button-complete"
                          disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                              <>Saving... <Loader2 className="size-4 animate-spin" /></>
                            ) : (
                              <>Complete Setup <Sparkles className="size-4" /></>
                            )}
                        </Button>
                    ) : (
                        <Button onClick={handleNext} className="gap-2" data-testid="button-next">
                            Continue <ArrowRight className="size-4" />
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    </div>
  );
}
