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
  AlertTriangle,
  ExternalLink,
  Plus,
  Table as TableIcon
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
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const [location, setLocation] = useLocation();

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

  // State for DCF
  const [dcfDiscountRate, setDcfDiscountRate] = useState(25);
  const [dcfTerminalGrowth, setDcfTerminalGrowth] = useState(3);
  const [dcfFile, setDcfFile] = useState<File | null>(null);
  const [analyzingDcf, setAnalyzingDcf] = useState(false);
  const [dcfResult, setDcfResult] = useState<null | { valuation: number, confidence: number, insights: string[] }>(null);

  // State for Market Comps Scatter
  const [compMetricX, setCompMetricX] = useState<'growth' | 'revenue'>('growth');
  const [compMetricY, setCompMetricY] = useState<'valuation' | 'multiple'>('multiple');

  // Mock Comps Scatter Data
  const scatterData = MOCK_COMPS.map(c => ({
    x: c.growth, // Growth Rate
    y: c.valuation / c.revenue, // Revenue Multiple
    z: c.revenue, // Bubble Size (Revenue)
    name: c.company,
    isUser: c.company === "Acme AI"
  }));

  // Add user company to scatter data if not present (mocking dynamic user data)
  const userScatterPoint = { x: 120, y: 20, z: 600000, name: "You", isUser: true };
  const finalScatterData = [...scatterData.filter(c => c.name !== "Acme AI"), userScatterPoint];


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

  const handleSaveReport = () => {
    toast.success("Report Saved", {
        description: "Valuation report has been saved to your dashboard.",
        action: {
            label: "View",
            onClick: () => setLocation("/reports")
        }
    });
  };

  // Sensitivity Matrix for VC Method
  const sensitivityMultiples = [vcMultiple - 2, vcMultiple - 1, vcMultiple, vcMultiple + 1, vcMultiple + 2];
  const sensitivityRois = [vcTargetRoi - 5, vcTargetRoi, vcTargetRoi + 5, vcTargetRoi + 10];

  // Sensitivity Matrix for DCF (Mock)
  const dcfRates = [dcfDiscountRate - 5, dcfDiscountRate, dcfDiscountRate + 5];
  const dcfGrowths = [dcfTerminalGrowth - 1, dcfTerminalGrowth, dcfTerminalGrowth + 1];

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-start animate-in slide-in-from-top-4 duration-500">
          <div>
              <h1 className="text-3xl font-bold font-heading">Valuation Engine</h1>
              <p className="text-muted-foreground mt-2">Deep-dive valuation workspace with methodology-specific frameworks.</p>
          </div>
          <Button onClick={handleSaveReport} className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
            <Plus className="size-4" /> Save as Report
          </Button>
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
                
                <TabsContent value="overview" className="mt-0 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <Card className="bg-card/50 border-primary/10">
                        <CardHeader>
                            <CardTitle>Blended Valuation Summary</CardTitle>
                            <CardDescription>Weighted average of all enabled methodologies</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50 relative overflow-hidden group hover:bg-secondary/50 transition-colors">
                                    <div className="text-xs text-muted-foreground mb-1">VC Method</div>
                                    <div className="text-lg font-bold font-mono">${(vcPostMoney/1000000).toFixed(1)}M</div>
                                    <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-500 group-hover:h-1.5" style={{ width: '75%' }} />
                                </div>
                                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50 relative overflow-hidden group hover:bg-secondary/50 transition-colors">
                                    <div className="text-xs text-muted-foreground mb-1">Scorecard</div>
                                    <div className="text-lg font-bold font-mono">${(calculateScorecard()/1000000).toFixed(1)}M</div>
                                    <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-500 group-hover:h-1.5" style={{ width: '85%' }} />
                                </div>
                                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50 relative overflow-hidden group hover:bg-secondary/50 transition-colors">
                                    <div className="text-xs text-muted-foreground mb-1">Market Comps</div>
                                    <div className="text-lg font-bold font-mono">$12.5M</div>
                                    <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-500 group-hover:h-1.5" style={{ width: '90%' }} />
                                </div>
                                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50 relative overflow-hidden group hover:bg-secondary/50 transition-colors">
                                    <div className="text-xs text-muted-foreground mb-1">DCF Model</div>
                                    <div className="text-lg font-bold font-mono">$10.5M</div>
                                    <div className="absolute bottom-0 left-0 h-1 bg-yellow-500 transition-all duration-500 group-hover:h-1.5" style={{ width: '40%' }} />
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
                                <Link href="/scenarios">
                                    <Button className="w-full mt-4 gap-2" variant="outline">
                                        Model Future Scenarios <ArrowRight className="size-4" />
                                    </Button>
                                </Link>
                             </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="vc-method" className="mt-0 space-y-6 animate-in fade-in zoom-in-95 duration-300">
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
                            
                            {/* Sensitivity Matrix */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium flex items-center gap-2">
                                    <TableIcon className="size-4 text-primary" /> Sensitivity Analysis: Valuation (in Millions)
                                </h3>
                                <div className="overflow-x-auto border border-border rounded-lg">
                                    <Table>
                                        <TableHeader className="bg-secondary/30">
                                            <TableRow>
                                                <TableHead className="text-xs text-center w-24">ROI \ Mult</TableHead>
                                                {sensitivityMultiples.map(m => (
                                                    <TableHead key={m} className={`text-xs text-center ${m === vcMultiple ? 'text-primary font-bold' : ''}`}>
                                                        {m}x
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sensitivityRois.map(roi => (
                                                <TableRow key={roi}>
                                                    <TableCell className={`text-xs font-medium text-center bg-secondary/10 ${roi === vcTargetRoi ? 'text-primary font-bold' : ''}`}>
                                                        {roi}x
                                                    </TableCell>
                                                    {sensitivityMultiples.map(m => {
                                                        const val = (vcExitRevenue * m) / roi / 1000000;
                                                        const isSelected = roi === vcTargetRoi && m === vcMultiple;
                                                        return (
                                                            <TableCell 
                                                                key={`${roi}-${m}`} 
                                                                className={`text-xs text-center font-mono ${isSelected ? 'bg-primary/10 font-bold border-2 border-primary/20' : ''}`}
                                                            >
                                                                ${val.toFixed(1)}M
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <p className="text-xs text-muted-foreground">Matrix shows Pre-Money Valuation based on different Exit Multiples (columns) and Target ROIs (rows).</p>
                            </div>

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

                <TabsContent value="scorecard" className="mt-0 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <Card className="bg-card/50 border-primary/10">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Scorecard Method</CardTitle>
                                <CardDescription>Adjust base valuation with qualitative factors.</CardDescription>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-muted-foreground mb-1">Confidence Score</span>
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                    Very High (85%)
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4 mb-8">
                                <Label>Base Valuation (Regional Average)</Label>
                                <div className="flex items-center gap-4">
                                    <Input 
                                        type="number" 
                                        value={scorecardBenchmark} 
                                        onChange={(e) => setScorecardBenchmark(Number(e.target.value))} 
                                        className="font-mono"
                                    />
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">for Pre-Seed in North America</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {factors.map((factor, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{factor.name}</span>
                                            <span className="text-muted-foreground">{factor.score}% ({factor.weight}% weight)</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-muted-foreground w-8">Low</span>
                                            <Slider 
                                                value={[factor.score]} 
                                                min={50}
                                                max={150}
                                                step={5}
                                                onValueChange={(v) => updateFactor(idx, v[0])}
                                                className="flex-1"
                                            />
                                            <span className="text-xs text-muted-foreground w-8 text-right">High</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="market-comps" className="mt-0 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <Card className="bg-card/50 border-primary/10">
                        <CardHeader>
                            <CardTitle>Market Comparables</CardTitle>
                            <CardDescription>Benchmark against peer performance.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] w-full mt-4">
                                <h3 className="text-sm font-medium mb-4 text-center">Growth Rate vs. Revenue Multiple</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis type="number" dataKey="x" name="Growth" unit="%" stroke="hsl(var(--muted-foreground))" label={{ value: 'Growth Rate (%)', position: 'bottom', offset: 0 }} />
                                        <YAxis type="number" dataKey="y" name="Multiple" unit="x" stroke="hsl(var(--muted-foreground))" label={{ value: 'Revenue Multiple (x)', angle: -90, position: 'left' }} />
                                        <ZAxis type="number" dataKey="z" range={[50, 400]} name="Revenue" />
                                        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                                        <Scatter name="Peers" data={finalScatterData} fill="hsl(var(--primary))">
                                            {finalScatterData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.isUser ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} fillOpacity={entry.isUser ? 1 : 0.5} />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                                <p className="text-xs text-center text-muted-foreground mt-4">
                                    Bubble size represents Annual Revenue. <span className="text-primary font-bold">Blue dot</span> is you.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="dcf" className="mt-0 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <Card className="bg-card/50 border-primary/10">
                        <CardHeader>
                            <CardTitle>Discounted Cash Flow</CardTitle>
                            <CardDescription>Sensitivity analysis for future cash flows.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label>Discount Rate (WACC)</Label>
                                    <div className="flex items-center gap-4">
                                        <Slider 
                                            value={[dcfDiscountRate]} 
                                            min={10} max={50} step={1}
                                            onValueChange={(v) => setDcfDiscountRate(v[0])}
                                            className="flex-1"
                                        />
                                        <span className="font-mono w-12 text-right">{dcfDiscountRate}%</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Higher for early stage (higher risk).</p>
                                </div>
                                <div className="space-y-4">
                                    <Label>Terminal Growth Rate</Label>
                                    <div className="flex items-center gap-4">
                                        <Slider 
                                            value={[dcfTerminalGrowth]} 
                                            min={1} max={10} step={0.5}
                                            onValueChange={(v) => setDcfTerminalGrowth(v[0])}
                                            className="flex-1"
                                        />
                                        <span className="font-mono w-12 text-right">{dcfTerminalGrowth}%</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Long-term steady state growth.</p>
                                </div>
                            </div>

                            <Separator className="bg-border/50" />

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium flex items-center gap-2">
                                    <TableIcon className="size-4 text-primary" /> DCF Sensitivity Matrix (Valuation in $M)
                                </h3>
                                <div className="overflow-x-auto border border-border rounded-lg">
                                    <Table>
                                        <TableHeader className="bg-secondary/30">
                                            <TableRow>
                                                <TableHead className="text-xs text-center w-24">Disc \ Growth</TableHead>
                                                {dcfGrowths.map(g => (
                                                    <TableHead key={g} className={`text-xs text-center ${g === dcfTerminalGrowth ? 'text-primary font-bold' : ''}`}>
                                                        {g}%
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dcfRates.map(rate => (
                                                <TableRow key={rate}>
                                                    <TableCell className={`text-xs font-medium text-center bg-secondary/10 ${rate === dcfDiscountRate ? 'text-primary font-bold' : ''}`}>
                                                        {rate}%
                                                    </TableCell>
                                                    {dcfGrowths.map(g => {
                                                        // Mock DCF Calc: Base $10M +/- sensitivity
                                                        const sensitivity = (rate - 25) * -0.5 + (g - 3) * 1.5; 
                                                        const val = 10.5 + sensitivity;
                                                        const isSelected = rate === dcfDiscountRate && g === dcfTerminalGrowth;
                                                        return (
                                                            <TableCell 
                                                                key={`${rate}-${g}`} 
                                                                className={`text-xs text-center font-mono ${isSelected ? 'bg-primary/10 font-bold border-2 border-primary/20' : ''}`}
                                                            >
                                                                ${val.toFixed(1)}M
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <div className="bg-secondary/20 border border-border rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <FileSpreadsheet className="size-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-medium">Upload Detailed Financials</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                        For a precise DCF, upload your 5-year financial projection model (Excel/CSV).
                                    </p>
                                </div>
                                <Button variant="outline" className="gap-2" onClick={handleDcfUpload} disabled={analyzingDcf}>
                                    {analyzingDcf ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" /> Analyzing Model...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="size-4" /> Upload Model
                                        </>
                                    )}
                                </Button>
                                {dcfResult && (
                                    <div className="w-full text-left mt-4 border-t pt-4 animate-in fade-in slide-in-from-bottom-2">
                                        <h4 className="text-sm font-semibold mb-2 text-emerald-500 flex items-center gap-2">
                                            <Check className="size-4" /> Analysis Complete
                                        </h4>
                                        <ul className="space-y-2">
                                            {dcfResult.insights.map((insight, i) => (
                                                <li key={i} className="text-xs text-muted-foreground flex gap-2">
                                                    <span className="text-primary">•</span> {insight}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </div>

            {/* Sidebar for Methodology Selection/Weights */}
            <div className="space-y-6">
                <Card className="bg-card/50 border-primary/10 h-full">
                    <CardHeader>
                        <CardTitle className="text-sm">Methodology Weights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            {[
                                { name: "VC Method", weight: 40, active: true },
                                { name: "Scorecard", weight: 30, active: true },
                                { name: "Market Comps", weight: 20, active: true },
                                { name: "DCF", weight: 10, active: true },
                            ].map((m, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-medium">{m.name}</span>
                                        <span className="text-muted-foreground">{m.weight}%</span>
                                    </div>
                                    <Progress value={m.weight} className="h-2" />
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 border-t border-border/50">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                <Info className="size-3 inline mr-1" />
                                Weights are automatically adjusted based on your startup stage (Seed) and available data.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </Tabs>
    </div>
  );
}
