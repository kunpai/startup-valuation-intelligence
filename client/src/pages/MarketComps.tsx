import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SECTORS, STAGES, REGIONS, INDUSTRY_TAGS, TECHNOLOGY_TAGS, HARMONIC_FUNDING_STAGES, COUNTRIES } from "@/lib/constants";
import { Search, Filter, Download, Plus, Sparkles, Building2, TrendingUp, DollarSign, X, Loader2, Trash2, RefreshCw } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Legend } from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useValuation } from "@/context/ValuationContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Comparable } from "@shared/schema";

interface HarmonicCompany {
  id: string;
  name: string;
  description: string;
  sector: string;
  stage: string;
  region: string;
  valuation: number;
  revenue: number;
  growth: number;
  fundingTotal: number;
  website: string;
  tags: string[];
}

export default function MarketComps() {
  const { currentCompanyId, companyProfile, financials } = useValuation();
  const queryClient = useQueryClient();
  
  // Filters - initialized from company profile
  const [selectedIndustryTags, setSelectedIndustryTags] = useState<string[]>([]);
  const [selectedTechTags, setSelectedTechTags] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState("all-stages");
  const [selectedCountry, setSelectedCountry] = useState("all-countries");
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  
  // Initialize filters from company profile
  useEffect(() => {
    if (!filtersInitialized && companyProfile) {
      if (companyProfile.industryTags && companyProfile.industryTags.length > 0) {
        setSelectedIndustryTags(companyProfile.industryTags);
      }
      if (companyProfile.technologyTags && companyProfile.technologyTags.length > 0) {
        setSelectedTechTags(companyProfile.technologyTags);
      }
      if (companyProfile.stage) {
        const stageMapping = HARMONIC_FUNDING_STAGES.find(s => s.label === companyProfile.stage || s.value === companyProfile.stage);
        if (stageMapping) {
          setSelectedStage(stageMapping.value);
        }
      }
      if (companyProfile.country) {
        setSelectedCountry(companyProfile.country);
      }
      setFiltersInitialized(true);
    }
  }, [companyProfile, filtersInitialized]);

  // Fetch user's saved comparables from database (scoped to current company)
  const { data: savedComps = [], isLoading } = useQuery<Comparable[]>({
    queryKey: ['/api/comparables', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const res = await fetch(`/api/companies/${currentCompanyId}/comparables`);
      if (!res.ok) throw new Error('Failed to fetch comparables');
      return res.json();
    },
    enabled: !!currentCompanyId
  });

  // Fetch real Harmonic companies based on current filters
  const { data: harmonicComps = [], isLoading: isLoadingHarmonic, refetch: refetchHarmonic } = useQuery<HarmonicCompany[]>({
    queryKey: ['/api/harmonic/search', selectedIndustryTags, selectedTechTags, selectedStage, selectedCountry],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50" });
      if (selectedIndustryTags.length > 0) params.set("industryTags", selectedIndustryTags.join(','));
      if (selectedTechTags.length > 0) params.set("technologyTags", selectedTechTags.join(','));
      if (selectedStage && selectedStage !== "all-stages") {
        const stageMapping = HARMONIC_FUNDING_STAGES.find(s => s.value === selectedStage);
        if (stageMapping) params.set("stage", stageMapping.label);
      }
      if (selectedCountry && selectedCountry !== "all-countries") params.set("country", selectedCountry);
      
      const res = await fetch(`/api/harmonic/search?${params}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch companies');
      }
      return res.json();
    },
    enabled: filtersInitialized,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Create comparable mutation
  const createCompMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!currentCompanyId) {
        throw new Error('No company selected');
      }
      const res = await fetch(`/api/companies/${currentCompanyId}/comparables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create comparable');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comparables', currentCompanyId] });
      toast.success("Comparable added", { description: "Saved to your analysis set." });
    },
    onError: (error) => {
      toast.error("Failed to add comparable", { description: error.message });
    }
  });

  // Delete comparable mutation
  const deleteCompMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentCompanyId) {
        throw new Error('No company selected');
      }
      const res = await fetch(`/api/companies/${currentCompanyId}/comparables/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete comparable');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comparables', currentCompanyId] });
      toast.success("Comparable removed");
    },
    onError: (error) => {
      toast.error("Failed to remove comparable", { description: error.message });
    }
  });

  // New Comp Dialog State
  const [newCompOpen, setNewCompOpen] = useState(false);
  const [newCompData, setNewCompData] = useState({
    companyName: "",
    sector: SECTORS[0],
    stage: STAGES[1],
    valuation: 0,
    revenue: 0,
    growthRate: 0,
    region: REGIONS[0],
    fundingRound: "Seed",
    source: "Manual Entry"
  });

  // Filter Logic - use real Harmonic data
  const filteredComps = useMemo(() => {
    return harmonicComps.filter(comp => {
      // Filter by search query
      const matchesSearch = !searchQuery || comp.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter out comps already saved
      const isNotSelected = !savedComps.some((myComp: Comparable) => myComp.companyName === comp.name);

      return matchesSearch && isNotSelected;
    });
  }, [harmonicComps, searchQuery, savedComps]);

  const addToMyComps = (comp: HarmonicCompany) => {
    if (!currentCompanyId) {
      toast.error("No company selected", { description: "Please complete onboarding first." });
      return;
    }
    createCompMutation.mutate({
      companyName: comp.name,
      sector: comp.sector,
      stage: comp.stage,
      valuation: comp.valuation,
      revenue: comp.revenue,
      growthRate: comp.growth,
      region: comp.region,
      fundingRound: comp.stage,
      source: "Harmonic"
    });
  };

  const removeFromMyComps = (id: string) => {
    deleteCompMutation.mutate(id);
  };

  const handleCreateComp = () => {
    if (!currentCompanyId) {
      toast.error("No company selected", { description: "Please complete onboarding first." });
      return;
    }
    createCompMutation.mutate({
      ...newCompData,
      isUserAdded: 1
    });
    setNewCompOpen(false);
    setNewCompData({
        companyName: "",
        sector: SECTORS[0],
        stage: STAGES[1],
        valuation: 0,
        revenue: 0,
        growthRate: 0,
        region: REGIONS[0],
        fundingRound: "Seed",
        source: "Manual Entry"
    });
  };

  const calculateMedian = (data: any[], key: string) => {
    if (data.length === 0) return 0;
    const sorted = [...data].sort((a, b) => a[key] - b[key]);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid][key] : (sorted[mid - 1][key] + sorted[mid][key]) / 2;
  };

  const medianValuation = calculateMedian(savedComps.length > 0 ? savedComps : filteredComps, 'valuation');
  const medianMultiple = savedComps.length > 0 
    ? calculateMedian(savedComps.map((c: Comparable) => ({...c, multiple: (c.valuation || 0)/(c.revenue || 1)})), 'multiple')
    : 0;

  return (
    <div className="space-y-4 md:space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-heading">Market Comparables</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Discover and manage peer benchmarks for your valuation.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={() => toast.success("Analysis Exported", { description: "Market data added to Deal Room report." })} className="w-full md:w-auto">
                <Download className="size-4 mr-2" /> Export Analysis
            </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Column: Discovery Engine */}
        <div className="lg:col-span-1 space-y-6" data-tour="comps-filter">
            <Card className="bg-card/50 border-primary/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="size-4 text-primary" />
                        Comp Discovery Engine
                    </CardTitle>
                    <CardDescription>
                        {companyProfile.name ? `Finding peers for ${companyProfile.name}` : "Define your profile to find matching peers."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Industry Tags</Label>
                        <Select 
                          value={selectedIndustryTags[0] || "all-industries"} 
                          onValueChange={(v) => setSelectedIndustryTags(v === "all-industries" ? [] : [v])}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Industry" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all-industries">All Industries</SelectItem>
                                {INDUSTRY_TAGS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {selectedIndustryTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedIndustryTags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                                <button 
                                  onClick={() => setSelectedIndustryTags(selectedIndustryTags.filter(t => t !== tag))}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="size-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Stage</Label>
                            <Select value={selectedStage} onValueChange={setSelectedStage}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Stage" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-stages">All Stages</SelectItem>
                                    {HARMONIC_FUNDING_STAGES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Country</Label>
                            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-countries">All Countries</SelectItem>
                                    {COUNTRIES.map(c => <SelectItem key={c.value} value={c.value}>{c.value}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Search by Name</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="E.g. Stripe, Airbnb..." 
                                className="pl-9" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                         <div className="text-xs text-muted-foreground mb-2 flex justify-between">
                            <span>Available Matches:</span>
                            <span className="font-mono font-bold text-foreground">
                              {isLoadingHarmonic ? <Loader2 className="size-3 animate-spin inline" /> : filteredComps.length}
                            </span>
                         </div>
                        <Button 
                          className="w-full gap-2" 
                          variant="secondary" 
                          onClick={() => refetchHarmonic()}
                          disabled={isLoadingHarmonic}
                        >
                            {isLoadingHarmonic ? (
                              <><Loader2 className="size-4 animate-spin" /> Searching...</>
                            ) : (
                              <><RefreshCw className="size-4" /> Refresh Results</>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground border-none shadow-xl shadow-primary/10">
                <CardHeader>
                    <CardTitle className="text-lg">My Analysis Set</CardTitle>
                    <CardDescription className="text-primary-foreground/70">
                        {savedComps.length} companies selected
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs opacity-70 mb-1">Median Valuation</div>
                            <div className="text-2xl font-bold font-mono">
                                {savedComps.length > 0 ? `$${(medianValuation/1000000).toFixed(1)}M` : "—"}
                            </div>
                        </div>
                         <div>
                            <div className="text-xs opacity-70 mb-1">Implied Multiple</div>
                            <div className="text-2xl font-bold font-mono">
                                {savedComps.length > 0 ? `${medianMultiple.toFixed(1)}x` : "—"}
                            </div>
                        </div>
                    </div>

                    <Dialog open={newCompOpen} onOpenChange={setNewCompOpen}>
                        <DialogTrigger asChild>
                            <Button variant="secondary" className="w-full gap-2 text-primary font-bold bg-white hover:bg-white/90">
                                <Plus className="size-4" /> Add Manual Comp
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Add Custom Comparable</DialogTitle>
                                <DialogDescription>
                                    Manually input a company's data to include in your analysis.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Company</Label>
                                    <Input 
                                        className="col-span-3" 
                                        value={newCompData.companyName} 
                                        onChange={(e) => setNewCompData({...newCompData, companyName: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Sector</Label>
                                    <Select 
                                        value={newCompData.sector} 
                                        onValueChange={(v) => setNewCompData({...newCompData, sector: v})}
                                    >
                                        <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Valuation ($)</Label>
                                    <Input 
                                        type="number" 
                                        className="col-span-3"
                                        value={newCompData.valuation}
                                        onChange={(e) => setNewCompData({...newCompData, valuation: Number(e.target.value)})} 
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Revenue ($)</Label>
                                    <Input 
                                        type="number" 
                                        className="col-span-3"
                                        value={newCompData.revenue}
                                        onChange={(e) => setNewCompData({...newCompData, revenue: Number(e.target.value)})} 
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" onClick={handleCreateComp}>Add Company</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Visualization & Lists */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Scatter Plot */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader>
                    <CardTitle>Market Landscape</CardTitle>
                    <CardDescription>Visualizing your selected comps vs. the broader market.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis 
                                    type="number" 
                                    dataKey="revenue" 
                                    name="Revenue" 
                                    unit="$" 
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickFormatter={(value) => `${value/1000}k`}
                                />
                                <YAxis 
                                    type="number" 
                                    dataKey="valuation" 
                                    name="Valuation" 
                                    unit="$" 
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickFormatter={(value) => `${value/1000000}M`}
                                />
                                <ZAxis type="number" dataKey="growth" range={[50, 400]} name="Growth" />
                                <Tooltip 
                                    cursor={{ strokeDasharray: '3 3' }} 
                                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    formatter={(value: any, name: any) => [
                                        name === 'Valuation' ? `$${value/1000000}M` : name === 'Revenue' ? `$${value/1000}k` : `${value}%`, 
                                        name
                                    ]}
                                />
                                <Legend />
                                <Scatter name="Market Matches" data={filteredComps} fill="hsl(var(--muted-foreground))" fillOpacity={0.4} />
                                <Scatter name="Selected Comps" data={savedComps} fill="hsl(var(--primary))" shape="circle" />
                                <Scatter 
                                    name="Your Company" 
                                    data={[{ revenue: financials.revenue || 600000, valuation: financials.lastRoundValuation || 12500000, growth: financials.growthRate || 15 }]} 
                                    fill="hsl(var(--chart-2))" 
                                    shape="star" 
                                />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="recommended" className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                      <TabsList className="bg-card/50 border border-primary/10 inline-flex w-max sm:w-auto">
                          <TabsTrigger value="recommended" className="text-xs sm:text-sm px-2 sm:px-4">Matches ({filteredComps.length})</TabsTrigger>
                          <TabsTrigger value="selected" className="text-xs sm:text-sm px-2 sm:px-4">Selected ({savedComps.length})</TabsTrigger>
                      </TabsList>
                    </div>
                </div>

                <TabsContent value="recommended" className="mt-0">
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-secondary/50">
                                <TableRow>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Metrics</TableHead>
                                    <TableHead className="text-right">Valuation</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredComps.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No matches found for your criteria. Try adjusting filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredComps.map((comp) => (
                                        <TableRow key={comp.id} className="hover:bg-secondary/30 transition-colors">
                                            <TableCell>
                                                <div className="font-medium text-foreground">{comp.name}</div>
                                                <div className="flex gap-2 mt-1 flex-wrap">
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">{comp.sector || 'Tech'}</Badge>
                                                    <span className="text-xs text-muted-foreground">{comp.region}</span>
                                                </div>
                                                {comp.tags && comp.tags.length > 0 && (
                                                  <div className="flex gap-1 mt-1 flex-wrap">
                                                    {comp.tags.slice(0, 2).map((tag, idx) => (
                                                      <Badge key={idx} variant="secondary" className="text-[9px] h-4 px-1">{tag}</Badge>
                                                    ))}
                                                  </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs space-y-1">
                                                    <div className="flex justify-between w-32">
                                                        <span className="text-muted-foreground">Funding:</span>
                                                        <span className="font-mono">${((comp.fundingTotal || 0)/1000000).toFixed(1)}M</span>
                                                    </div>
                                                    <div className="flex justify-between w-32">
                                                        <span className="text-muted-foreground">Stage:</span>
                                                        <span className="font-mono">{comp.stage}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="font-mono font-medium">${((comp.valuation || 0) / 1000000).toFixed(1)}M</div>
                                                <div className="text-xs text-muted-foreground">{comp.stage}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="secondary" onClick={() => addToMyComps(comp)}>
                                                    <Plus className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                      </div>
                    </Card>
                </TabsContent>

                <TabsContent value="selected" className="mt-0">
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-secondary/50">
                                <TableRow>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Metrics</TableHead>
                                    <TableHead className="text-right">Valuation</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {savedComps.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            You haven't added any comps yet. Select from matches or add manually.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    savedComps.map((comp: Comparable) => (
                                        <TableRow key={comp.id} className="hover:bg-secondary/30 transition-colors bg-primary/5">
                                            <TableCell>
                                                <div className="font-medium text-foreground flex items-center gap-2">
                                                    {comp.companyName}
                                                    <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/20 text-[10px] h-5 px-1.5">Selected</Badge>
                                                </div>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">{comp.sector}</Badge>
                                                    <span className="text-xs text-muted-foreground">{comp.region}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs space-y-1">
                                                    <div className="flex justify-between w-32">
                                                        <span className="text-muted-foreground">Rev:</span>
                                                        <span className="font-mono">${((comp.revenue || 0)/1000).toFixed(0)}k</span>
                                                    </div>
                                                    <div className="flex justify-between w-32">
                                                        <span className="text-muted-foreground">Growth:</span>
                                                        <span className="font-mono text-emerald-500">{comp.growthRate || 0}%</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="font-mono font-medium">${((comp.valuation || 0) / 1000000).toFixed(1)}M</div>
                                                <div className="text-xs text-muted-foreground">{comp.stage}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" onClick={() => removeFromMyComps(comp.id)} className="text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                      </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}
