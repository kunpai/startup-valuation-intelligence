import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SECTORS, STAGES } from "@/lib/constants";
import { Check, Info, ArrowRight, HelpCircle, Calculator, Brain, Briefcase, BarChart3, LineChart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function ValuationEngine() {
  const [activeTab, setActiveTab] = useState("overview");

  // State for VC Method
  const [vcExitYear, setVcExitYear] = useState(5);
  const [vcExitRevenue, setVcExitRevenue] = useState(50000000);
  const [vcMultiple, setVcMultiple] = useState(10);
  const [vcTargetRoi, setVcTargetRoi] = useState(20); // 20x ROI
  const [vcPostMoney, setVcPostMoney] = useState(0);

  // State for Scorecard
  const [scorecardBenchmark, setScorecardBenchmark] = useState(8000000); // $8M benchmark
  const [factors, setFactors] = useState([
    { name: "Team Strength", weight: 30, score: 125 }, // 125% = 25% better than avg
    { name: "Market Size", weight: 25, score: 110 },
    { name: "Product/Tech", weight: 15, score: 100 },
    { name: "Competitive Environment", weight: 10, score: 90 },
    { name: "Marketing/Sales", weight: 10, score: 80 },
    { name: "Need for Additional Investment", weight: 5, score: 100 },
    { name: "Other", weight: 5, score: 100 },
  ]);

  // Calculate VC Method
  useEffect(() => {
    // Formula: (Exit Revenue * Multiple) / ROI
    const exitValuation = vcExitRevenue * vcMultiple;
    const postMoney = exitValuation / vcTargetRoi;
    setVcPostMoney(postMoney);
  }, [vcExitRevenue, vcMultiple, vcTargetRoi]);

  // Calculate Scorecard Method
  const calculateScorecard = () => {
    let totalFactor = 0;
    factors.forEach(f => {
      // contribution = weight * (score / 100)
      // Actually standard method: Factor * Weight. Sum of (Weight * Factor).
      // If score is 1.25 (125%), and weight is 0.30. Contribution is 0.30 * 1.25 = 0.375
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
                    <BarChart3 className="size-4" /> Scorecard
                </TabsTrigger>
                <TabsTrigger value="market-comps" className="gap-2 px-4">
                    <Briefcase className="size-4" /> Comps
                </TabsTrigger>
                <TabsTrigger value="dcf" className="gap-2 px-4">
                    <LineChart className="size-4" /> DCF
                </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
                 <Button variant="outline" size="sm" className="gap-2">
                    <HelpCircle className="size-4" /> Method Guide
                 </Button>
            </div>
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
                                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                                    <div className="text-xs text-muted-foreground mb-1">VC Method</div>
                                    <div className="text-lg font-bold font-mono">${(vcPostMoney/1000000).toFixed(1)}M</div>
                                    <div className="text-xs text-emerald-500 mt-1">Active</div>
                                </div>
                                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                                    <div className="text-xs text-muted-foreground mb-1">Scorecard</div>
                                    <div className="text-lg font-bold font-mono">${(calculateScorecard()/1000000).toFixed(1)}M</div>
                                    <div className="text-xs text-emerald-500 mt-1">Active</div>
                                </div>
                                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                                    <div className="text-xs text-muted-foreground mb-1">Market Comps</div>
                                    <div className="text-lg font-bold font-mono">$12.5M</div>
                                    <div className="text-xs text-emerald-500 mt-1">Active</div>
                                </div>
                                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                                    <div className="text-xs text-muted-foreground mb-1">DCF Model</div>
                                    <div className="text-lg font-bold font-mono">$10.5M</div>
                                    <div className="text-xs text-muted-foreground mt-1">Low Weight</div>
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
                        <CardHeader>
                            <CardTitle>Venture Capital Method</CardTitle>
                            <CardDescription>Work backwards from a future exit to determine current value.</CardDescription>
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
                        <CardHeader>
                            <CardTitle>Scorecard Method</CardTitle>
                            <CardDescription>Adjust valuation based on qualitative strengths vs. average startups.</CardDescription>
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
                
                <TabsContent value="market-comps">
                     <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                        <div className="bg-secondary/50 p-6 rounded-full">
                            <Briefcase className="size-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">Market Comparables Module</h3>
                        <p className="text-muted-foreground max-w-md">
                            Detailed comparative analysis is available in the dedicated Comps Dashboard. 
                            Use the engine here to input specific multiple adjustments.
                        </p>
                        <Button variant="outline" className="mt-4">Go to Market Comps</Button>
                     </div>
                </TabsContent>

                <TabsContent value="dcf">
                     <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                        <div className="bg-secondary/50 p-6 rounded-full">
                            <LineChart className="size-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">DCF Model Coming Soon</h3>
                        <p className="text-muted-foreground max-w-md">
                           Discounted Cash Flow modeling for early-stage startups is highly speculative. 
                           We are building a simplified "Venture DCF" that focuses on terminal value probability.
                        </p>
                     </div>
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
                                 'Blended Valuation'}
                            </CardDescription>
                            <CardTitle className="text-4xl font-heading font-bold">
                                {activeTab === 'vc-method' ? `$${(vcPostMoney/1000000).toFixed(2)}M` : 
                                 activeTab === 'scorecard' ? `$${(calculateScorecard()/1000000).toFixed(2)}M` : 
                                 '$12.5M'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-primary-foreground/80 mb-4">
                                Pre-Money Valuation
                            </div>
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
