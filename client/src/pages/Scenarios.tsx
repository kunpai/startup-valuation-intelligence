import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, History, TrendingUp, AlertTriangle, Save, PlayCircle } from "lucide-react";
import { useState } from "react";

const SCENARIO_DATA = [
  { date: '2025-Q1', baseline: 12.5, optimistic: 12.5, conservative: 12.5 },
  { date: '2025-Q2', baseline: 13.2, optimistic: 14.0, conservative: 12.8 },
  { date: '2025-Q3', baseline: 14.1, optimistic: 15.8, conservative: 13.0 },
  { date: '2025-Q4', baseline: 15.5, optimistic: 18.2, conservative: 13.2 },
  { date: '2026-Q1', baseline: 17.0, optimistic: 21.0, conservative: 13.5 },
  { date: '2026-Q2', baseline: 18.8, optimistic: 24.5, conservative: 13.8 },
  { date: '2026-Q3', baseline: 21.0, optimistic: 28.0, conservative: 14.0 },
  { date: '2026-Q4', baseline: 24.5, optimistic: 33.0, conservative: 14.2 },
];

export default function Scenarios() {
  const [growthRate, setGrowthRate] = useState(25);
  const [marketConditions, setMarketConditions] = useState("neutral");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">History & Scenarios</h1>
          <p className="text-muted-foreground mt-1">Manage valuation history and model future outcomes.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2">
             <Save className="size-4" /> Save Scenario
           </Button>
           <Button className="gap-2">
             <Plus className="size-4" /> Add Historical Round
           </Button>
        </div>
      </div>

      <Tabs defaultValue="projection" className="space-y-4">
        <TabsList className="bg-card/50 border border-primary/10">
          <TabsTrigger value="projection" className="gap-2"><TrendingUp className="size-4" /> Future Projections</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><History className="size-4" /> Round History</TabsTrigger>
        </TabsList>

        <TabsContent value="projection" className="space-y-4">
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Controls */}
                <Card className="bg-card/50 backdrop-blur-sm border-primary/10 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Simulation Variables</CardTitle>
                        <CardDescription>Adjust drivers to forecast valuation bands</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label>Projected Growth (MoM)</Label>
                                <span className="text-primary font-mono">{growthRate}%</span>
                            </div>
                            <Slider 
                                defaultValue={[25]} 
                                max={100} 
                                step={1} 
                                onValueChange={(v) => setGrowthRate(v[0])}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Market Sentiment</Label>
                            <Select value={marketConditions} onValueChange={setMarketConditions}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bullish">Bullish (High Multiples)</SelectItem>
                                    <SelectItem value="neutral">Neutral (Avg Multiples)</SelectItem>
                                    <SelectItem value="bearish">Bearish (Compressed)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4">
                             <Label>Upcoming Milestones</Label>
                             <div className="space-y-2">
                                <div className="flex items-center space-x-2 border border-border/50 rounded p-2 bg-secondary/30">
                                    <Input type="checkbox" className="size-4" defaultChecked />
                                    <span className="text-sm">Series A Fundraise</span>
                                </div>
                                <div className="flex items-center space-x-2 border border-border/50 rounded p-2 bg-secondary/30">
                                    <Input type="checkbox" className="size-4" />
                                    <span className="text-sm">Strategic Partnership</span>
                                </div>
                                <div className="flex items-center space-x-2 border border-border/50 rounded p-2 bg-secondary/30">
                                    <Input type="checkbox" className="size-4" />
                                    <span className="text-sm">Regulatory Approval</span>
                                </div>
                             </div>
                        </div>

                        <Button className="w-full gap-2">
                            <PlayCircle className="size-4" /> Run Simulation
                        </Button>
                    </CardContent>
                </Card>

                {/* Chart */}
                <Card className="bg-card/50 backdrop-blur-sm border-primary/10 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Valuation Forecast</CardTitle>
                        <CardDescription>Baseline vs Optimistic vs Conservative scenarios (USD Millions)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={SCENARIO_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                                        formatter={(value) => [`$${value}M`, "Valuation"]}
                                    />
                                    <Legend />
                                    <Area type="monotone" dataKey="optimistic" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorOptimistic)" name="Optimistic" strokeWidth={2} />
                                    <Area type="monotone" dataKey="baseline" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorBaseline)" name="Baseline" strokeWidth={2} />
                                    <Area type="monotone" dataKey="conservative" stroke="hsl(var(--muted-foreground))" fill="transparent" strokeDasharray="5 5" name="Conservative" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="history">
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
