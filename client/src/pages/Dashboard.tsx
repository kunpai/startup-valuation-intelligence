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
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { Activity, ArrowUpRight, DollarSign, ShieldCheck, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_METHODOLOGY_BREAKDOWN, MOCK_VALUATION_HISTORY, MOCK_MILESTONES } from "@/lib/constants";
import { SimulationSheet } from "@/components/dashboard/SimulationSheet";
import { VirtualCFO } from "@/components/dashboard/VirtualCFO";
import { Link, useLocation } from "wouter";
import { useValuation } from "@/context/ValuationContext";
import { useEffect } from "react";

export default function Dashboard() {
  const { isDemoMode, companyProfile, financials, qualitative, calculatedValuation } = useValuation();
  const [, setLocation] = useLocation();

  // Calculate dynamic blended valuation based on input
  const displayValuation = calculatedValuation 
    ? calculatedValuation 
    : isDemoMode 
      ? 12500000 
      : (financials.revenue * 15) + (financials.lastRoundValuation * 0.5);

  const displayValuationStr = `$${(displayValuation / 1000000).toFixed(1)}M`;

  // Calculate runway from user's actual burn rate and cash balance
  const runwayMonths = financials.burnRate > 0 
    ? Math.round(financials.cashBalance / financials.burnRate) 
    : 24; // Default if no burn rate

  // Dynamic methodology breakdown based on user data
  const methodologyBreakdown = [
    { name: "Venture Capital", value: displayValuation * 0.3, fill: "hsl(var(--chart-1))" },
    { name: "Scorecard", value: displayValuation * 0.25, fill: "hsl(var(--chart-2))" },
    { name: "Market Comps", value: displayValuation * 0.25, fill: "hsl(var(--chart-3))" },
    { name: "DCF", value: displayValuation * 0.2, fill: "hsl(var(--chart-5))" },
  ];

  // User's valuation history - combine last round with current
  const valuationHistory = [
    { date: "Last Round", valuation: financials.lastRoundValuation, label: "Previous" },
    { date: "Current", valuation: displayValuation, label: "Now" },
    { date: "Target", valuation: displayValuation * 1.5, label: "Series A" },
  ];

  // Dynamic qualitative data based on context
  const userRadarData = [
      { subject: 'Team', score: qualitative.team, benchmark: 70 },
      { subject: 'Market', score: qualitative.market, benchmark: 75 },
      { subject: 'Product', score: qualitative.product, benchmark: 65 },
      { subject: 'Growth', score: Math.min(financials.growthRate * 4, 100), benchmark: 50 },
      { subject: 'Runway', score: Math.min(runwayMonths * 5, 100), benchmark: 60 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner for User Mode */}
      {!isDemoMode && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
              <div>
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    Welcome, {companyProfile.name} 
                    <Badge variant="secondary" className="text-xs">Series A Track</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">We've initialized your valuation model based on your inputs. Mira, your AI CFO, is ready to help.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setLocation("/onboarding")}>Edit Profile</Button>
          </div>
      )}

      {isDemoMode && (
         <div className="bg-secondary/30 border border-secondary rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">Demo Mode</Badge>
                Viewing sample data for "Acme AI".
            </div>
            <Link href="/onboarding">
                <Button size="sm">Start Your Valuation</Button>
            </Link>
         </div>
      )}

      <SimulationSheet />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Valuation Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time valuation intelligence for your startup.</p>
        </div>
        <div className="flex items-center gap-2" data-tour="quick-actions">
          <Link href="/reports">
            <Button variant="outline" className="gap-2">
              <ArrowUpRight className="size-4" /> Export Report
            </Button>
          </Link>
          <Link href="/calculator">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2">
              <TrendingUp className="size-4" /> Update Metrics
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/calculator">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-sm hover:border-primary/20 transition-all cursor-pointer h-full animate-in zoom-in-95 duration-500 delay-100 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Blended Valuation</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading">{displayValuationStr}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-emerald-500 flex items-center">
                  +15% <ArrowUpRight className="size-3" />
                </span>
                vs last quarter
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-sm hover:border-primary/20 transition-all animate-in zoom-in-95 duration-500 delay-150">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confidence Score</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">82/100</div>
            <div className="w-full bg-secondary h-1.5 mt-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full animate-[shimmer_2s_infinite]" style={{ width: "82%" }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Data reliability high</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-sm hover:border-primary/20 transition-all animate-in zoom-in-95 duration-500 delay-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Runway</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{runwayMonths} Months</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${(financials.cashBalance / 1000).toFixed(0)}k / ${(financials.burnRate / 1000).toFixed(0)}k burn
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-sm hover:border-primary/20 transition-all animate-in zoom-in-95 duration-500 delay-250">
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
        <Card className="col-span-4 bg-card/50 backdrop-blur-sm border-primary/10 animate-in fade-in slide-in-from-left-8 duration-700 delay-300">
          <CardHeader>
            <CardTitle>Valuation Trajectory</CardTitle>
            <CardDescription>Historical valuation growth vs projected milestones</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={isDemoMode ? MOCK_VALUATION_HISTORY : valuationHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Methodology & Benchmarking (Stacked) */}
        <div className="col-span-3 grid gap-4 grid-rows-2">
            {/* Methodology Breakdown - Pie Chart */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10 animate-in fade-in slide-in-from-right-8 duration-700 delay-300" data-tour="methodology-chart">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Methodology Weights</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[140px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <Pie
                            data={isDemoMode ? MOCK_METHODOLOGY_BREAKDOWN : methodologyBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={55}
                            paddingAngle={5}
                            dataKey="value"
                            >
                            {(isDemoMode ? MOCK_METHODOLOGY_BREAKDOWN : methodologyBreakdown).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                            ))}
                            </Pie>
                            <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                            formatter={(value: number) => [`$${(value / 1000000).toFixed(1)}M`, ""]}
                            />
                            <Legend 
                                layout="vertical" 
                                verticalAlign="middle" 
                                align="right"
                                iconType="circle"
                                iconSize={8}
                                formatter={(value) => <span className="text-[10px] text-muted-foreground ml-1">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/10 animate-in fade-in slide-in-from-right-8 duration-700 delay-400">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Qualitative Benchmarking</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[140px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={userRadarData}>
                                <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                                <Radar
                                    name="You"
                                    dataKey="score"
                                    stroke="hsl(var(--primary))"
                                    fill="hsl(var(--primary))"
                                    fillOpacity={0.3}
                                />
                                <Radar
                                    name="Industry Avg"
                                    dataKey="benchmark"
                                    stroke="hsl(var(--muted-foreground))"
                                    fill="hsl(var(--muted-foreground))"
                                    fillOpacity={0.1}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 col-span-2">
            <CardHeader>
                <CardTitle>Recent Milestones</CardTitle>
                <CardDescription>Key achievements impacting your valuation score</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {MOCK_MILESTONES.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary/70 transition-colors">
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
                    Based on your recent growth of <span className="text-foreground font-medium">{isDemoMode ? "15%" : financials.growthRate + "%"} MoM</span>, your valuation is trending towards the upper quartile of {isDemoMode ? "Series A" : companyProfile.stage} companies. 
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                    Increasing your <span className="text-foreground font-medium">LTV/CAC ratio</span> from 3.5 to 4.0 could add an estimated <span className="text-emerald-500 font-bold">$1.8M</span> to your pre-money valuation.
                </div>
                <Link href="/reports/deal-room">
                  <Button variant="secondary" className="w-full mt-2">View Full Report</Button>
                </Link>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
