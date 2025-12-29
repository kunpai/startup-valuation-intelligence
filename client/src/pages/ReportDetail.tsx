import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Share2, 
  Printer, 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  PieChart as PieChartIcon,
  ShieldCheck
} from "lucide-react";
import { Link } from "wouter";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

const MOCK_VALUATION_HISTORY = [
  { date: "Q1", valuation: 8000000 },
  { date: "Q2", valuation: 9500000 },
  { date: "Q3", valuation: 11000000 },
  { date: "Q4", valuation: 12500000 },
];

const METHODOLOGY_DATA = [
  { name: "VC Method", value: 11000000 },
  { name: "Scorecard", value: 13000000 },
  { name: "Market Comps", value: 12500000 },
  { name: "DCF Model", value: 10500000 },
];

export default function ReportDetail() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b border-border/40 -mx-6 px-6 md:mx-0 md:px-0">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
             <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-heading">Series A Valuation Audit</h1>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Finalized</Badge>
             </div>
             <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <Calendar className="size-3" /> Prepared on Nov 15, 2025
                <span>•</span>
                <span>Ref: VA-2025-004</span>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
                <Printer className="size-4" /> Print
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="size-4" /> Share
            </Button>
            <Button size="sm" className="gap-2 shadow-lg shadow-primary/20">
                <Download className="size-4" /> Download PDF
            </Button>
        </div>
      </div>

      {/* Report Content Container - Styled like a physical page/doc */}
      <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden min-h-[1000px]">
        
        {/* Report Header */}
        <div className="bg-secondary/20 border-b border-border/50 p-8 md:p-12">
            <div className="flex justify-between items-start">
                <div>
                    <div className="size-12 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl mb-6">
                        SVI
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight mb-2">Valuation Audit Report</h1>
                    <p className="text-xl text-muted-foreground">Comprehensive analysis for Series A Readiness</p>
                </div>
                <div className="text-right hidden md:block">
                    <div className="font-bold text-lg">Founder Ace Inc.</div>
                    <div className="text-muted-foreground text-sm">123 Innovation Dr.<br/>San Francisco, CA 94107</div>
                </div>
            </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
            
            {/* Executive Summary */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
                    <CheckCircle2 className="size-4" /> Executive Summary
                </div>
                <h3 className="text-2xl font-bold font-heading">Strong Fundamentals Drive Premium Valuation</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                    Based on our comprehensive analysis of Founder Ace Inc.'s financial performance, market position, and qualitative strengths, 
                    we have determined a blended fair market valuation of <span className="font-bold text-foreground">$12.5M</span>. 
                    This represents a <span className="font-bold text-foreground">15% increase</span> quarter-over-quarter, driven primarily by 
                    exceeding growth benchmarks and the successful launch of the v2.0 product line.
                </p>
            </section>

            <Separator />

            {/* Key Metrics Dashboard inside Report */}
            <section className="grid md:grid-cols-3 gap-6">
                <div className="bg-secondary/10 p-6 rounded-lg border border-border/50">
                    <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <DollarSign className="size-4" /> Blended Valuation
                    </div>
                    <div className="text-4xl font-bold font-heading">$12,500,000</div>
                    <div className="text-sm text-emerald-500 mt-2 font-medium">Top Quartile for Sector</div>
                </div>
                <div className="bg-secondary/10 p-6 rounded-lg border border-border/50">
                    <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <ShieldCheck className="size-4" /> Confidence Score
                    </div>
                    <div className="text-4xl font-bold font-heading">82<span className="text-xl text-muted-foreground">/100</span></div>
                    <div className="text-sm text-muted-foreground mt-2">Based on 4 Methodologies</div>
                </div>
                <div className="bg-secondary/10 p-6 rounded-lg border border-border/50">
                    <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <TrendingUp className="size-4" /> Growth Factor
                    </div>
                    <div className="text-4xl font-bold font-heading">2.4x</div>
                    <div className="text-sm text-muted-foreground mt-2">Year-over-Year Trajectory</div>
                </div>
            </section>

            {/* Methodology Breakdown */}
            <section className="space-y-6">
                 <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
                    <PieChartIcon className="size-4" /> Methodology Composition
                </div>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h4 className="text-xl font-bold font-heading mb-4">Weighted Analysis</h4>
                        <p className="text-muted-foreground mb-6">
                            Our blended valuation model assigns varying weights to different methodologies based on the company's stage and data availability. 
                            The Scorecard Method carries the highest weight due to the qualitative strength of the founding team.
                        </p>
                        <div className="space-y-4">
                            {METHODOLOGY_DATA.map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-secondary/20 rounded border border-border/50">
                                    <span className="font-medium">{item.name}</span>
                                    <span className="font-mono">${(item.value/1000000).toFixed(1)}M</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-[300px] w-full bg-secondary/5 rounded-xl border border-border/50 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={METHODOLOGY_DATA} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    formatter={(value: number) => [`$${(value / 1000000).toFixed(1)}M`, "Valuation"]}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                    {METHODOLOGY_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 1 ? "hsl(var(--primary))" : "hsl(var(--muted))"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            <Separator />

             {/* Trajectory */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
                    <TrendingUp className="size-4" /> Historical Trajectory
                </div>
                <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={MOCK_VALUATION_HISTORY} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                            <linearGradient id="colorReportVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000000}M`} />
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }} />
                            <Area type="monotone" dataKey="valuation" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorReportVal)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <Separator />

            {/* Recommendations */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold font-heading">Strategic Recommendations</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-emerald-500/5 border-emerald-500/20">
                        <CardHeader>
                            <CardTitle className="text-emerald-500 text-lg">Growth Levers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                <li>Focus on reducing CAC by 10% to unlock a higher multiple.</li>
                                <li>Expand enterprise sales team to capture upmarket demand.</li>
                                <li>Leverage strong "Team" score in investor narratives.</li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-500/5 border-orange-500/20">
                        <CardHeader>
                            <CardTitle className="text-orange-500 text-lg">Risk Mitigation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                <li>Diversify revenue streams to reduce single-client dependency.</li>
                                <li>Extend runway to 18 months before initiating Series A.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </section>

             {/* Footer */}
            <div className="pt-12 text-center text-sm text-muted-foreground">
                <p>Confidential & Proprietary • Founder Ace Inc. • Generated via SVI Platform</p>
                <p className="mt-2 text-xs">This report is based on provided data and market conditions as of Nov 15, 2025. It does not constitute financial advice.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
