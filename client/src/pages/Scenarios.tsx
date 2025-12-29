import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Plus, History, TrendingUp, AlertTriangle, Save, PlayCircle, RefreshCcw, Flag, CheckCircle2, Clock, Circle, Trash2, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import simulationBg from '@assets/generated_images/futuristic_financial_simulation_control_panel_background.png';
import { MOCK_MILESTONES } from "@/lib/constants";
import { useValuation } from "@/context/ValuationContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scenariosApi } from "@/lib/api";
import type { Scenario } from "@shared/schema";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Scenarios() {
  const { currentCompanyId, financials, calculatedValuation } = useValuation();
  const queryClient = useQueryClient();
  
  const [growthAccel, setGrowthAccel] = useState(50);
  const [dilution, setDilution] = useState(20);
  const [exitMultiple, setExitMultiple] = useState(10);
  const [scenarioName, setScenarioName] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // Fetch saved scenarios
  const { data: savedScenarios = [], isLoading } = useQuery<Scenario[]>({
    queryKey: ['/api/scenarios', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      return scenariosApi.getByCompany(currentCompanyId);
    },
    enabled: !!currentCompanyId
  });

  // Create scenario mutation
  const createScenarioMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!currentCompanyId) throw new Error('No company selected');
      return scenariosApi.create({ ...data, companyId: currentCompanyId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios', currentCompanyId] });
      toast.success("Scenario saved");
      setSaveDialogOpen(false);
      setScenarioName("");
    },
    onError: () => {
      toast.error("Failed to save scenario");
    }
  });

  // Delete scenario mutation
  const deleteScenarioMutation = useMutation({
    mutationFn: async (id: string) => scenariosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios', currentCompanyId] });
      toast.success("Scenario deleted");
    }
  });

  // Generate projection data based on current parameters
  const projectionData = useMemo(() => {
    const baseRevenue = financials.revenue / 1000000; // Convert to millions
    const baseGrowth = financials.growthRate / 100;
    const accelFactor = 1 + (growthAccel / 100);
    
    return [
      { date: '2025', baseline: baseRevenue, optimistic: baseRevenue, conservative: baseRevenue },
      { date: '2026', baseline: baseRevenue * (1 + baseGrowth), optimistic: baseRevenue * (1 + baseGrowth * accelFactor), conservative: baseRevenue * (1 + baseGrowth * 0.7) },
      { date: '2027', baseline: baseRevenue * Math.pow(1 + baseGrowth, 2), optimistic: baseRevenue * Math.pow(1 + baseGrowth * accelFactor, 2), conservative: baseRevenue * Math.pow(1 + baseGrowth * 0.7, 2) },
      { date: '2028', baseline: baseRevenue * Math.pow(1 + baseGrowth, 3), optimistic: baseRevenue * Math.pow(1 + baseGrowth * accelFactor, 3), conservative: baseRevenue * Math.pow(1 + baseGrowth * 0.7, 3) },
      { date: '2029', baseline: baseRevenue * Math.pow(1 + baseGrowth, 4), optimistic: baseRevenue * Math.pow(1 + baseGrowth * accelFactor, 4), conservative: baseRevenue * Math.pow(1 + baseGrowth * 0.7, 4) },
    ];
  }, [financials.revenue, financials.growthRate, growthAccel]);

  const handleSaveScenario = () => {
    if (!scenarioName.trim()) {
      toast.error("Please enter a scenario name");
      return;
    }
    createScenarioMutation.mutate({
      name: scenarioName,
      description: `Growth: +${growthAccel}%, Dilution: ${dilution}%, Exit Multiple: ${exitMultiple}x`,
      revenue: financials.revenue,
      growthRate: financials.growthRate + growthAccel,
      exitValuation: (calculatedValuation || financials.revenue * 10) * exitMultiple / 10,
      exitYear: 2029,
      assumptions: { growthAccel, dilution, exitMultiple }
    });
  };

  const loadScenario = (scenario: Scenario) => {
    const assumptions = scenario.assumptions as any || {};
    setGrowthAccel(assumptions.growthAccel || 50);
    setDilution(assumptions.dilution || 20);
    setExitMultiple(assumptions.exitMultiple || 10);
    toast.success(`Loaded scenario: ${scenario.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">History & Scenarios</h1>
          <p className="text-muted-foreground mt-1">Manage valuation history and model future outcomes.</p>
        </div>
        <div className="flex gap-2">
           <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
             <DialogTrigger asChild>
               <Button variant="outline" className="gap-2" disabled={!currentCompanyId}>
                 <Save className="size-4" /> Save Scenario
               </Button>
             </DialogTrigger>
             <DialogContent>
               <DialogHeader>
                 <DialogTitle>Save Scenario</DialogTitle>
                 <DialogDescription>Give this scenario a name to save your current parameters.</DialogDescription>
               </DialogHeader>
               <div className="py-4">
                 <Label>Scenario Name</Label>
                 <Input 
                   placeholder="e.g., Optimistic Growth Case" 
                   value={scenarioName}
                   onChange={(e) => setScenarioName(e.target.value)}
                   className="mt-2"
                 />
               </div>
               <DialogFooter>
                 <Button onClick={handleSaveScenario} disabled={createScenarioMutation.isPending}>
                   {createScenarioMutation.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                   Save Scenario
                 </Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>
        </div>
      </div>

      <Tabs defaultValue="projection" className="space-y-4">
        <TabsList className="bg-card/50 border border-primary/10 animate-in fade-in duration-700">
          <TabsTrigger value="projection" className="gap-2"><TrendingUp className="size-4" /> Future Projections</TabsTrigger>
          <TabsTrigger value="milestones" className="gap-2"><Flag className="size-4" /> Milestones</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><History className="size-4" /> Round History</TabsTrigger>
        </TabsList>

        <TabsContent value="projection" className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Controls */}
                <Card className="bg-card/50 backdrop-blur-sm border-primary/10 lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Simulation Parameters</CardTitle>
                        <CardDescription>Adjust variables to forecast outcomes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label>Growth Acceleration</Label>
                                <span className="text-primary font-mono font-bold">+{growthAccel}%</span>
                            </div>
                            <Slider 
                                value={[growthAccel]} 
                                max={100} 
                                step={1} 
                                onValueChange={(v) => setGrowthAccel(v[0])}
                                className="py-2"
                            />
                            <p className="text-xs text-muted-foreground">Additional growth rate on top of baseline.</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label>Estimated Dilution</Label>
                                <span className="text-destructive font-mono font-bold">-{dilution}%</span>
                            </div>
                            <Slider 
                                value={[dilution]} 
                                max={50} 
                                step={1} 
                                onValueChange={(v) => setDilution(v[0])}
                                className="py-2"
                            />
                            <p className="text-xs text-muted-foreground">Total equity dilution from future rounds.</p>
                        </div>

                        <div className="space-y-4">
                             <div className="flex justify-between">
                                <Label>Exit Multiple</Label>
                                <span className="text-emerald-500 font-mono font-bold">{exitMultiple}x</span>
                            </div>
                            <Slider 
                                value={[exitMultiple]} 
                                max={30} 
                                step={0.5} 
                                onValueChange={(v) => setExitMultiple(v[0])}
                                className="py-2"
                            />
                            <p className="text-xs text-muted-foreground">Revenue multiple at exit event.</p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button 
                                className="flex-1 gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                                onClick={() => setSaveDialogOpen(true)}
                                disabled={!currentCompanyId}
                            >
                                <Save className="size-4" /> Save
                            </Button>
                            <Button 
                                variant="outline" 
                                className="flex-1 gap-2"
                                onClick={() => {
                                  setGrowthAccel(50);
                                  setDilution(20);
                                  setExitMultiple(10);
                                }}
                            >
                                <RefreshCcw className="size-4" /> Reset
                            </Button>
                        </div>

                        {/* Saved Scenarios */}
                        {savedScenarios.length > 0 && (
                          <div className="pt-6 border-t border-border/50">
                            <Label className="text-xs text-muted-foreground mb-3 block">Saved Scenarios</Label>
                            <div className="space-y-2">
                              {savedScenarios.map((scenario) => (
                                <div 
                                  key={scenario.id} 
                                  className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
                                  onClick={() => loadScenario(scenario)}
                                >
                                  <div>
                                    <div className="text-sm font-medium">{scenario.name}</div>
                                    <div className="text-xs text-muted-foreground">{scenario.description}</div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="size-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteScenarioMutation.mutate(scenario.id);
                                    }}
                                  >
                                    <Trash2 className="size-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-6">
                     {/* Chart */}
                    <Card className="bg-card border-primary/10 relative overflow-hidden">
                        <div 
                            className="absolute inset-0 opacity-10 pointer-events-none" 
                            style={{ backgroundImage: `url(${simulationBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} 
                        />
                        <CardHeader className="relative z-10">
                            <CardTitle>Valuation Forecast</CardTitle>
                            <CardDescription>5-Year Outlook under different conditions.</CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={projectionData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}M`} />
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} strokeOpacity={0.2} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                                            formatter={(value) => [`$${value}M`, "Valuation"]}
                                        />
                                        <Legend />
                                        
                                        {/* Milestone Annotations */}
                                        <ReferenceLine x="2026" stroke="hsl(var(--emerald-500))" strokeDasharray="3 3" label={{ position: 'top', value: 'Series A', fill: 'hsl(var(--emerald-500))', fontSize: 12 }} />
                                        <ReferenceLine x="2028" stroke="hsl(var(--blue-500))" strokeDasharray="3 3" label={{ position: 'top', value: 'Expansion', fill: 'hsl(var(--blue-500))', fontSize: 12 }} />
                                        
                                        <Area type="monotone" dataKey="optimistic" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorOptimistic)" name="Aggressive" strokeWidth={3} />
                                        <Area type="monotone" dataKey="baseline" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorBaseline)" name="Baseline" strokeWidth={3} strokeDasharray="4 4" />
                                        <Area type="monotone" dataKey="conservative" stroke="hsl(var(--destructive))" fill="transparent" strokeDasharray="2 2" name="Conservative" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                         <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Projected Exit Value</div>
                                    <div className="text-xs text-muted-foreground">Based on 2029 Aggressive scenario</div>
                                </div>
                                <div className="text-4xl font-bold font-heading text-foreground">$115M</div>
                            </div>
                         </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>

        <TabsContent value="milestones" className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                        <CardHeader>
                            <CardTitle>Milestone Timeline</CardTitle>
                            <CardDescription>Key events driving your valuation narrative.</CardDescription>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="absolute left-8 top-6 bottom-6 w-px bg-border border-l border-dashed border-primary/30" />
                            <div className="space-y-8 relative">
                                {MOCK_MILESTONES.map((milestone, i) => (
                                    <div key={i} className="flex gap-6 items-start relative group">
                                        <div className={`
                                            z-10 size-4 rounded-full border-2 mt-1.5 shrink-0 flex items-center justify-center transition-transform group-hover:scale-125 duration-300
                                            ${milestone.type === 'past' ? 'bg-primary border-primary' : 
                                              milestone.type === 'round' ? 'bg-emerald-500 border-emerald-500 ring-4 ring-emerald-500/20' : 
                                              'bg-background border-muted-foreground'}
                                        `}>
                                            {milestone.type === 'past' && <div className="size-1.5 bg-primary-foreground rounded-full" />}
                                        </div>
                                        <div className={`
                                            flex-1 p-4 rounded-lg border transition-all duration-300
                                            ${milestone.type === 'future' ? 'bg-secondary/20 border-dashed border-border/60 hover:border-primary/30 hover:bg-secondary/40' : 
                                              milestone.type === 'round' ? 'bg-emerald-500/5 border-emerald-500/30' :
                                              'bg-card/80 border-border hover:border-primary/20 hover:translate-x-1'}
                                        `}>
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold ${milestone.type === 'future' ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                        {milestone.title}
                                                    </span>
                                                    {milestone.type === 'round' && <Badge className="bg-emerald-500 hover:bg-emerald-600">Funding Event</Badge>}
                                                </div>
                                                <span className="text-xs font-mono text-muted-foreground">{milestone.date}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={`text-[10px] ${
                                                    milestone.impact === 'Critical' ? 'border-emerald-500/30 text-emerald-500' :
                                                    milestone.impact === 'High' ? 'border-blue-500/30 text-blue-500' :
                                                    'border-border text-muted-foreground'
                                                }`}>
                                                    {milestone.impact} Impact
                                                </Badge>
                                                <span className={`text-xs font-mono font-bold ${
                                                    milestone.type === 'future' ? 'text-muted-foreground' : 'text-emerald-500'
                                                }`}>
                                                    {milestone.score}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-primary/5 border-primary/10">
                        <CardHeader>
                            <CardTitle className="text-sm">Future Modeling</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Hitting your Q3 2026 milestone ("Achieve $1M ARR") is projected to unlock a <strong>$25M+ valuation</strong> band.
                            </p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Current Probability</span>
                                    <span className="font-bold text-primary">65%</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[65%] animate-pulse" />
                                </div>
                            </div>
                            <Button variant="outline" className="w-full">Adjust Probabilities</Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 border-primary/10">
                        <CardHeader>
                            <CardTitle className="text-sm">Legend</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="size-3 rounded-full bg-primary" />
                                <span>Completed Milestone</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="size-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                                <span>Funding Round</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="size-3 rounded-full border-2 border-muted-foreground" />
                                <span>Projected Event</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>

        <TabsContent value="history" className="animate-in fade-in slide-in-from-right-8 duration-500">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader>
                    <CardTitle>Historical Rounds</CardTitle>
                    <CardDescription>Previous funding events and valuations</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Round</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Post-Money Valuation</TableHead>
                                <TableHead>Capital Raised</TableHead>
                                <TableHead>Lead Investor</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Seed</TableCell>
                                <TableCell>Aug 2024</TableCell>
                                <TableCell>$8.5M</TableCell>
                                <TableCell>$1.5M</TableCell>
                                <TableCell>EarlyBird VC</TableCell>
                                <TableCell><Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">Closed</Badge></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Pre-Seed</TableCell>
                                <TableCell>Jan 2024</TableCell>
                                <TableCell>$5.0M</TableCell>
                                <TableCell>$500K</TableCell>
                                <TableCell>Angels</TableCell>
                                <TableCell><Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">Closed</Badge></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Angel</TableCell>
                                <TableCell>Jun 2023</TableCell>
                                <TableCell>$3.5M</TableCell>
                                <TableCell>$150K</TableCell>
                                <TableCell>Family & Friends</TableCell>
                                <TableCell><Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">Closed</Badge></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
