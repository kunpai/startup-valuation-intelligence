import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SECTORS, STAGES, MOCK_COMPS } from "@/lib/constants";
import { 
  Check, 
  Info, 
  ArrowRight, 
  HelpCircle, 
  Calculator, 
  Brain, 
  Briefcase, 
  LineChart, 
  Upload, 
  FileSpreadsheet, 
  Loader2, 
  AlertTriangle 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Badge } from "@/components/ui/badge";

const METHODOLOGY_GUIDES = {
  overview: {
    title: "Valuation Engine Overview",
    description: "This engine blends multiple valuation models to triangulate a fair market value.",
    steps: [
      "We use a weighted average of active methodologies.",
      "Each method addresses a different aspect: Future potential (VC), Current Comparison (Comps), or Qualitative Strength (Scorecard).",
      "Confidence scores indicate data reliability for each method."
    ]
  },
  "vc-method": {
    title: "Venture Capital Method",
    description: "Best for: Pre-revenue or early-revenue startups seeking VC funding.",
    steps: [
      "1. Estimate Exit Valuation: (Revenue at Exit × Industry Multiple).",
      "2. Work Backwards: Divide Exit Valuation by the Investor's Expected ROI (e.g., 10x-30x).",
      "3. Result: The maximum Post-Money valuation an investor can pay today to hit their target."
    ]
  },
  scorecard: {
    title: "Scorecard Method",
    description: "Best for: Seed stage startups with limited financial history.",
    steps: [
      "1. Start with the Average Pre-Money Valuation for your stage/region.",
      "2. Adjust based on weighted factors (Team, Market, Product).",
      "3. Example: If you have a '150% Stronger' team than average, you get a premium on the base valuation."
    ]
  },
  "market-comps": {
    title: "Market Comparables",
    description: "Best for: Companies with revenue or clear operational metrics.",
    steps: [
      "1. Identify similar companies (Peers) recently funded or acquired.",
      "2. Calculate valuation multiples (e.g., Valuation / ARR).",
      "3. Apply the median multiple to your own metrics."
    ]
  },
  dcf: {
    title: "Discounted Cash Flow (DCF)",
    description: "Best for: Mature startups with predictable cash flows (rare for early stage).",
    steps: [
      "1. Forecast free cash flows for 5 years.",
      "2. Calculate Terminal Value (value beyond year 5).",
      "3. Discount everything back to present value using a discount rate (WACC or high venture rate)."
    ]
  }
};

export default function ValuationEngine() {
  const [activeTab, setActiveTab] = useState("overview");

  // State for VC Method
  const [vcExitYear, setVcExitYear] = useState(5);
  const [vcExitRevenue, setVcExitRevenue] = useState(50000000);
  const [vcMultiple, setVcMultiple] = useState(10);
  const [vcTargetRoi, setVcTargetRoi] = useState(20);
  const [vcPostMoney, setVcPostMoney] = useState(0);

  // State for Scorecard
  const [scorecardBenchmark, setScorecardBenchmark] = useState(8000000);
  const [factors, setFactors] = useState([
    { name: "Team Strength", weight: 30, score: 125 },
    { name: "Market Size", weight: 25, score: 110 },
    { name: "Product/Tech", weight: 15, score: 100 },
    { name: "Competitive Environment", weight: 10, score: 90 },
    { name: "Marketing/Sales", weight: 10, score: 80 },
    { name: "Need for Additional Investment", weight: 5, score: 100 },
    { name: "Other", weight: 5, score: 100 },
  ]);

  // State for DCF Upload
  const [dcfFile, setDcfFile] = useState<File | null>(null);
  const [analyzingDcf, setAnalyzingDcf] = useState(false);
  const [dcfResult, setDcfResult] = useState<null | { valuation: number, confidence: number, insights: string[] }>(null);

  // Confidence Scores (Mock Calculation)
  const getConfidenceScore = (method: string) => {
    if (method === 'vc-method') return 75; // Logic: High assumption sensitivity
    if (method === 'scorecard') return 85; // Logic: Qualitative but grounded in benchmark
    if (method === 'market-comps') return 90; // Logic: Real market data
    if (method === 'dcf') return 40; // Logic: Highly speculative for startups
    return 82; // Blended
  };

  // Calculate VC Method
  useEffect(() => {
    const exitValuation = vcExitRevenue * vcMultiple;
    const postMoney = exitValuation / vcTargetRoi;
    setVcPostMoney(postMoney);
  }, [vcExitRevenue, vcMultiple, vcTargetRoi]);

  const calculateScorecard = () => {
    let totalFactor = 0;
    factors.forEach(f => {
      const contribution = (f.weight / 100) * (f.score / 100);
      totalFactor += contribution;
    });
    return scorecardBenchmark * totalFactor;
  };

  const updateFactor = (index: number, newScore: number) => {
    const newFactors = [...factors];
    newFactors[index].score = newScore;
    setFactors(newFactors);
  };

  const handleDcfUpload = () => {
    setAnalyzingDcf(true);
    // Simulate AI Processing
    setTimeout(() => {
        setAnalyzingDcf(false);
        setDcfResult({
            valuation: 10500000,
            confidence: 45,
            insights: [
                "Growth assumptions in Year 3-5 exceed industry benchmarks (Top 10% percentile).",
                "Discount rate of 12% is low for Seed stage; recommend adjusting to 25-30%.",
                "Terminal value accounts for 85% of total valuation (highly sensitive)."
            ]
        });
    }, 2500);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div>
          <h1 className="text-3xl font-bold font-heading">Valuation Engine</h1>
          <p className="text-muted-foreground mt-2">Deep-dive valuation workspace with methodology-specific frameworks.</p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col space-y-6">
        <div className="flex items-center justify-between">
            <TabsList className="bg-card/50 border border-primary/10 h-12 p-1">
                <TabsTrigger value="overview" className="gap-2 px-4">
                    <Brain className="size-4" /> Overview
                </TabsTrigger>
                <TabsTrigger value="vc-method" className="gap-2 px-4">
                    <Calculator className="size-4" /> VC Method
                </TabsTrigger>
                <TabsTrigger value="scorecard" className="gap-2 px-4">
                    <Check className="size-4" /> Scorecard
                </TabsTrigger>
                <TabsTrigger value="market-comps" className="gap-2 px-4">
                    <Briefcase className="size-4" /> Comps
                </TabsTrigger>
                <TabsTrigger value="dcf" className="gap-2 px-4">
                    <LineChart className="size-4" /> DCF
                </TabsTrigger>
            </TabsList>
            
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <HelpCircle className="size-4" /> Method Guide
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{METHODOLOGY_GUIDES[activeTab as keyof typeof METHODOLOGY_GUIDES]?.title || "Methodology Guide"}</DialogTitle>
                        <DialogDescription>
                            {METHODOLOGY_GUIDES[activeTab as keyof typeof METHODOLOGY_GUIDES]?.description}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <h4 className="text-sm font-medium">How it works:</h4>
                        <ul className="space-y-2">
                            {METHODOLOGY_GUIDES[activeTab as keyof typeof METHODOLOGY_GUIDES]?.steps.map((step, i) => (
                                <li key={i} className="text-sm text-muted-foreground bg-secondary/30 p-2 rounded border border-border/50">
                                    {step}
                                </li>
                            ))}
                        </ul>
                    </div>
                </DialogContent>
            </Dialog>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
            {/* Main Workspace Area (Scrollable) */}
            <div className="lg:col-span-2 overflow-y-auto pr-2 pb-20 space-y-6 h-full">
                
                <TabsContent value="overview" className="mt-0 space-y-6">
                    <Card className="bg-card/50 border-primary/10">
                        <CardHeader>
                            <CardTitle>Blended Valuation Summary</CardTitle>
                            <CardDescription>Weighted average of all enabled methodologies</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50 relative overflow-hidden">
                                    <div className="text-xs text-muted-foreground mb-1">VC Method</div>
                                    <div className="text-lg font-bold font-mono">${(vcPostMoney/1000000).toFixed(1)}M</div>
                                    <div className="absolute bottom-0 left-0 h-1 bg-emerald-500" style={{ width: '75%' }} />
                                </div>
                                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50 relative overflow-hidden">
                                    <div className="text-xs text-muted-foreground mb-1">Scorecard</div>
                                    <div className="text-lg font-bold font-mono">${(calculateScorecard()/1000000).toFixed(1)}M</div>
                                    <div className="absolute bottom-0 left-0 h-1 bg-emerald-500" style={{ width: '85%' }} />
                                </div>
                                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50 relative overflow-hidden">
                                    <div className="text-xs text-muted-foreground mb-1">Market Comps</div>
                                    <div className="text-lg font-bold font-mono">$12.5M</div>
                                    <div className="absolute bottom-0 left-0 h-1 bg-emerald-500" style={{ width: '90%' }} />
                                </div>
                                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50 relative overflow-hidden">
                                    <div className="text-xs text-muted-foreground mb-1">DCF Model</div>
                                    <div className="text-lg font-bold font-mono">$10.5M</div>
                                    <div className="absolute bottom-0 left-0 h-1 bg-yellow-500" style={{ width: '40%' }} />
                                </div>
                             </div>

                             <div className="space-y-4">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Brain className="size-4 text-primary" /> 
                                    Engine Insight
                                </h3>
                                <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 text-sm leading-relaxed text-muted-foreground">
                                    The wide spread between your <strong>Scorecard Valuation (${(calculateScorecard()/1000000).toFixed(1)}M)</strong> and 
                                    <strong> VC Method Valuation (${(vcPostMoney/1000000).toFixed(1)}M)</strong> suggests that while your qualitative factors (Team, Market) are strong, 
                                    your financial projections might be conservative relative to the valuation you are seeking.
                                    <br/><br/>
                                    Investors may view this as a "premium team in a developing market." Consider adjusting your exit revenue targets if you believe the market opportunity is larger.
                                </div>
                             </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="vc-method" className="mt-0 space-y-6">
                    <Card className="bg-card/50 border-primary/10">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Venture Capital Method</CardTitle>
                                <CardDescription>Work backwards from a future exit.</CardDescription>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-muted-foreground mb-1">Confidence Score</span>
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                    High (75%)
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label>Projected Exit Year</Label>
                                    <div className="flex items-center gap-4">
                                        <Slider 
                                            value={[vcExitYear]} 
                                            max={10} 
                                            step={1} 
                                            onValueChange={(v) => setVcExitYear(v[0])}
                                            className="flex-1"
                                        />
                                        <span className="font-mono w-12 text-right">{vcExitYear} yrs</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Label>Revenue at Exit ($)</Label>
                                    <Input 
                                        type="number" 
                                        value={vcExitRevenue} 
                                        onChange={(e) => setVcExitRevenue(Number(e.target.value))} 
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label>Exit Multiple (Revenue Multiple)</Label>
                                    <div className="flex items-center gap-4">
                                        <Slider 
                                            value={[vcMultiple]} 
                                            max={50} 
                                            step={0.5} 
                                            onValueChange={(v) => setVcMultiple(v[0])}
                                            className="flex-1"
                                        />
                                        <span className="font-mono w-12 text-right">{vcMultiple}x</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Label>Target Investor ROI (Exit Multiple)</Label>
                                    <div className="flex items-center gap-4">
                                        <Slider 
                                            value={[vcTargetRoi]} 
                                            max={100} 
                                            step={1} 
                                            onValueChange={(v) => setVcTargetRoi(v[0])}
                                            className="flex-1"
                                        />
                                        <span className="font-mono w-12 text-right">{vcTargetRoi}x</span>
                                    </div>
                                </div>
                            </div>
                            
                            <Separator className="bg-border/50" />
                            
                            {/* Logic Explained Card */}
                            <div className="bg-secondary/20 border border-border rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-500/10 p-2 rounded text-blue-500 mt-1">
                                        <Info className="size-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium">The Math Explained</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            We estimate your company will be sold for <span className="text-foreground font-mono">${(vcExitRevenue * vcMultiple / 1000000).toFixed(0)}M</span> (Terminal Value) in {vcExitYear} years.
                                            <br/>
                                            To give investors a <span className="text-foreground font-mono">{vcTargetRoi}x</span> return on their money today, the company must be valued at 
                                            <span className="text-foreground font-mono"> ${(vcExitRevenue * vcMultiple / 1000000).toFixed(0)}M ÷ {vcTargetRoi}</span> right now.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="scorecard" className="mt-0 space-y-6">
                    <Card className="bg-card/50 border-primary/10">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Scorecard Method</CardTitle>
                                <CardDescription>Adjust valuation based on qualitative strengths.</CardDescription>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-muted-foreground mb-1">Confidence Score</span>
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                    Very High (85%)
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <Label>Benchmark Valuation (Average for Stage/Sector)</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">$</span>
                                    <Input 
                                        type="number" 
                                        value={scorecardBenchmark} 
                                        onChange={(e) => setScorecardBenchmark(Number(e.target.value))}
                                        className="max-w-[200px]" 
                                    />
                                    <span className="text-xs text-muted-foreground ml-2">Based on {SECTORS[0]} Seed rounds in 2024</span>
                                </div>
                            </div>

                            <div className="space-y-6 mt-8">
                                <div className="grid grid-cols-12 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
                                    <div className="col-span-4">Factor</div>
                                    <div className="col-span-2 text-center">Weight</div>
                                    <div className="col-span-6 text-center">Your Strength ({factors.reduce((acc, curr) => acc + (curr.weight * curr.score / 10000), 0).toFixed(2)}x avg)</div>
                                </div>
                                
                                {factors.map((factor, index) => (
                                    <div key={index} className="grid grid-cols-12 items-center gap-4 bg-secondary/20 p-3 rounded-md border border-transparent hover:border-primary/10 transition-colors">
                                        <div className="col-span-4 text-sm font-medium">
                                            {factor.name}
                                        </div>
                                        <div className="col-span-2 text-center text-xs text-muted-foreground bg-background/50 py-1 rounded">
                                            {factor.weight}%
                                        </div>
                                        <div className="col-span-6 flex items-center gap-3">
                                            <span className="text-xs w-8 text-right text-muted-foreground">0%</span>
                                            <Slider 
                                                value={[factor.score]} 
                                                min={0} 
                                                max={200} 
                                                step={5} 
                                                onValueChange={(v) => updateFactor(index, v[0])}
                                                className="flex-1"
                                            />
                                            <div className="flex flex-col items-end w-12">
                                                <span className={`text-sm font-mono font-bold ${factor.score > 100 ? 'text-emerald-500' : factor.score < 100 ? 'text-orange-500' : 'text-foreground'}`}>
                                                    {factor.score}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="market-comps" className="mt-0 space-y-6">
                    <Card className="bg-card/50 border-primary/10">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Market Comparables</CardTitle>
                                <CardDescription>Benchmarking against industry peers.</CardDescription>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-muted-foreground mb-1">Confidence Score</span>
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                    Excellent (90%)
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="bg-secondary/20 p-4 rounded-lg border border-border/50 mb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-medium">Valuation vs Revenue (Scatter)</h4>
                                    <Badge variant="secondary" className="text-xs">Your Co: 88th Percentile</Badge>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                            <XAxis type="number" dataKey="revenue" name="Revenue" unit="$" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `${value/1000}k`} />
                                            <YAxis type="number" dataKey="valuation" name="Valuation" unit="$" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `${value/1000000}M`} />
                                            <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }} />
                                            <Scatter name="Market Comps" data={MOCK_COMPS} fill="hsl(var(--muted-foreground))" fillOpacity={0.6} />
                                            <Scatter name="Your Company" data={[{ revenue: 600000, valuation: 12500000, growth: 120 }]} fill="hsl(var(--primary))" shape="star" />
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>
                             </div>
                             
                             <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-card border border-border p-4 rounded-lg">
                                    <div className="text-xs text-muted-foreground">Median Multiple</div>
                                    <div className="text-2xl font-bold font-mono mt-1">15.4x</div>
                                </div>
                                <div className="bg-card border border-border p-4 rounded-lg">
                                    <div className="text-xs text-muted-foreground">Top Quartile</div>
                                    <div className="text-2xl font-bold font-mono mt-1">22.1x</div>
                                </div>
                                <div className="bg-card border border-border p-4 rounded-lg">
                                    <div className="text-xs text-muted-foreground">Your Implied Mult.</div>
                                    <div className="text-2xl font-bold font-mono mt-1 text-emerald-500">20.8x</div>
                                </div>
                             </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="dcf" className="mt-0 space-y-6">
                    <Card className="bg-card/50 border-primary/10">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Discounted Cash Flow (AI Analysis)</CardTitle>
                                <CardDescription>Upload your financial model for AI-driven validation.</CardDescription>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-muted-foreground mb-1">Confidence Score</span>
                                <Badge variant="outline" className={dcfResult ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : "bg-muted text-muted-foreground"}>
                                    {dcfResult ? "Low (45%)" : "Pending Data"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {!dcfResult && !analyzingDcf && (
                                <div 
                                    className="border-2 border-dashed border-primary/20 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-primary/5 transition-colors cursor-pointer group"
                                    onClick={handleDcfUpload}
                                >
                                    <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="size-8 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-medium mb-2">Upload Financial Model</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        Drag & drop your Excel (.xlsx) or CSV file here. 
                                        Our AI will analyze your growth assumptions and discount rates.
                                    </p>
                                    <Button variant="secondary" className="mt-6">Select File</Button>
                                </div>
                            )}

                            {analyzingDcf && (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                                    <Loader2 className="size-10 text-primary animate-spin" />
                                    <div>
                                        <h3 className="text-lg font-medium">Analyzing Model Structure...</h3>
                                        <p className="text-sm text-muted-foreground">Validating terminal value assumptions and growth vectors.</p>
                                    </div>
                                    <Progress value={66} className="w-[300px] h-2" />
                                </div>
                            )}

                            {dcfResult && (
                                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileSpreadsheet className="size-5 text-emerald-500" />
                                            <div>
                                                <div className="text-sm font-medium">Financial_Model_v2.xlsx</div>
                                                <div className="text-xs text-muted-foreground">Processed successfully</div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setDcfResult(null)}>Remove</Button>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-medium flex items-center gap-2">
                                                <Brain className="size-4 text-primary" /> AI Insights
                                            </h4>
                                            <div className="space-y-3">
                                                {dcfResult.insights.map((insight, i) => (
                                                    <div key={i} className="flex gap-3 text-sm bg-secondary/30 p-3 rounded border border-border/50">
                                                        <AlertTriangle className="size-4 text-yellow-500 shrink-0 mt-0.5" />
                                                        <span className="text-muted-foreground">{insight}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-medium">Valuation Output</h4>
                                            <div className="bg-card border border-border p-6 rounded-lg text-center">
                                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Implied DCF Valuation</div>
                                                <div className="text-3xl font-bold font-mono mt-2">${(dcfResult.valuation/1000000).toFixed(2)}M</div>
                                                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 py-1 px-3 rounded-full w-fit mx-auto">
                                                    <AlertTriangle className="size-3" />
                                                    Low Confidence Score (45%)
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </div>

            {/* Sticky Results Sidebar (Right Column) */}
            <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-4">
                    <Card className="bg-primary text-primary-foreground border-none shadow-lg shadow-primary/25 overflow-hidden relative">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <Calculator className="size-32 rotate-12" />
                        </div>

                        <CardHeader className="pb-2">
                            <CardDescription className="text-primary-foreground/80">
                                {activeTab === 'vc-method' ? 'VC Method Result' : 
                                 activeTab === 'scorecard' ? 'Scorecard Result' : 
                                 activeTab === 'dcf' && dcfResult ? 'DCF Result' :
                                 'Blended Valuation'}
                            </CardDescription>
                            <CardTitle className="text-4xl font-heading font-bold">
                                {activeTab === 'vc-method' ? `$${(vcPostMoney/1000000).toFixed(2)}M` : 
                                 activeTab === 'scorecard' ? `$${(calculateScorecard()/1000000).toFixed(2)}M` : 
                                 activeTab === 'dcf' && dcfResult ? `$${(dcfResult.valuation/1000000).toFixed(2)}M` :
                                 '$12.5M'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-primary-foreground/80 mb-4 flex justify-between items-center">
                                <span>Confidence</span>
                                <span className="font-bold">{getConfidenceScore(activeTab)}%</span>
                            </div>
                            <Progress value={getConfidenceScore(activeTab)} className="h-1.5 bg-primary-foreground/20 text-primary-foreground mb-4" />
                            
                            <Separator className="bg-primary-foreground/20 mb-4" />
                            
                            {activeTab === 'vc-method' && (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Implied Ownership</span>
                                        <span className="font-mono font-medium">
                                            {((1500000 / vcPostMoney) * 100).toFixed(1)}% for $1.5M
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Exit Value</span>
                                        <span className="font-mono font-medium">${(vcExitRevenue * vcMultiple / 1000000).toFixed(0)}M</span>
                                    </div>
                                </div>
                            )}

                             {activeTab === 'scorecard' && (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Adjustment Factor</span>
                                        <span className="font-mono font-medium">
                                            {factors.reduce((acc, curr) => acc + (curr.weight * curr.score / 10000), 0).toFixed(2)}x
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Benchmark Base</span>
                                        <span className="font-mono font-medium">${(scorecardBenchmark/1000000).toFixed(1)}M</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 border-primary/10">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-foreground">
                                <ArrowRight className="size-4 mr-2" /> Save to Scenario A
                            </Button>
                            <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-foreground">
                                <ArrowRight className="size-4 mr-2" /> Compare with Market
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
      </Tabs>
    </div>
  );
}
