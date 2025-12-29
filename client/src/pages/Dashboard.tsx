import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, ArrowUpRight, DollarSign, ShieldCheck, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_METHODOLOGY_BREAKDOWN, MOCK_VALUATION_HISTORY, MOCK_MILESTONES } from "@/lib/constants";
import { SimulationSheet } from "@/components/dashboard/SimulationSheet";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <SimulationSheet />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Valuation Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time valuation intelligence for your startup.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <ArrowUpRight className="size-4" /> Export Report
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2">
            <TrendingUp className="size-4" /> Update Metrics
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-sm hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blended Valuation</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">$12.5M</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-500 flex items-center">
                +15% <ArrowUpRight className="size-3" />
              </span>
              vs last quarter
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-sm hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confidence Score</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">82/100</div>
            <div className="w-full bg-secondary h-1.5 mt-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: "82%" }} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-sm hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Runway</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">14 Months</div>
            <p className="text-xs text-muted-foreground mt-1">Based on current burn</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-sm hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Market Sentiment</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">Bullish</div>
            <p className="text-xs text-muted-foreground mt-1">Sector activity high</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        <Card className="col-span-4 bg-card/50 backdrop-blur-sm border-primary/10">
          <CardHeader>
            <CardTitle>Valuation Trajectory</CardTitle>
            <CardDescription>Historical valuation growth vs projected milestones</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_VALUATION_HISTORY} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValuation" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value / 1000000}M`} 
                  />
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [`$${(value / 1000000).toFixed(1)}M`, "Valuation"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="valuation" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorValuation)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Methodology Breakdown - Pie Chart */}
        <Card className="col-span-3 bg-card/50 backdrop-blur-sm border-primary/10">
          <CardHeader>
            <CardTitle>Methodology Breakdown</CardTitle>
            <CardDescription>Weighted impact of different valuation models</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Pie
                      data={MOCK_METHODOLOGY_BREAKDOWN}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {MOCK_METHODOLOGY_BREAKDOWN.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: number) => [`$${(value / 1000000).toFixed(1)}M`, "Valuation"]}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span className="text-xs text-muted-foreground ml-1">{value}</span>}
                    />
                 </PieChart>
               </ResponsiveContainer>
               {/* Center Text */}
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                  <span className="text-xs text-muted-foreground">Blended</span>
                  <span className="text-xl font-bold font-heading">$12.5M</span>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 col-span-2">
            <CardHeader>
                <CardTitle>Recent Milestones</CardTitle>
                <CardDescription>Key achievements impacting your valuation score</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {MOCK_MILESTONES.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50">
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">{item.title}</span>
                                <span className="text-xs text-muted-foreground">{item.date}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-xs bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                                    {item.impact} Impact
                                </Badge>
                                <span className="text-sm font-bold text-emerald-500">{item.score}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-indigo-900/40 to-background border-primary/20">
            <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>Generated by Valuation Intelligence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground leading-relaxed">
                    Based on your recent growth of <span className="text-foreground font-medium">15% MoM</span>, your valuation is trending towards the upper quartile of Series A SaaS companies. 
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                    Increasing your <span className="text-foreground font-medium">LTV/CAC ratio</span> from 3.5 to 4.0 could add an estimated <span className="text-emerald-500 font-bold">$1.8M</span> to your pre-money valuation.
                </div>
                <Button variant="secondary" className="w-full mt-2">View Full Report</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
