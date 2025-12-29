import { useValuation } from "@/context/ValuationContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Share2, 
  Printer, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Target, 
  ShieldCheck,
  Building2,
  Calendar,
  Globe,
  Mail
} from "lucide-react";
import { Link } from "wouter";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_VALUATION_HISTORY } from "@/lib/constants";

export default function DealRoom() {
  const { companyProfile, financials, qualitative, valuationHistory } = useValuation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 print:p-0 print:m-0 print:max-w-none">
      
      {/* Print/Export Controls - Hidden in Print Mode */}
      <div className="flex justify-between items-center print:hidden animate-in fade-in slide-in-from-top-4">
        <div>
            <Link href="/reports">
                <Button variant="ghost" className="mb-2 pl-0 hover:bg-transparent hover:text-primary">← Back to Reports</Button>
            </Link>
            <h1 className="text-3xl font-bold font-heading">Investor Deal Room</h1>
            <p className="text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handlePrint}>
                <Printer className="size-4" /> Print / PDF
            </Button>
            <Button className="gap-2 shadow-lg shadow-primary/20">
                <Share2 className="size-4" /> Share Link
            </Button>
        </div>
      </div>

      {/* Report Container - A4-ish Aspect Ratio */}
      <div className="bg-card border border-border/50 shadow-2xl rounded-xl overflow-hidden print:shadow-none print:border-none">
        
        {/* Header / Cover Page Style */}
        <div className="bg-primary/5 p-8 md:p-12 border-b border-border/50 text-center md:text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <Badge variant="outline" className="mb-4 bg-background/50 backdrop-blur border-primary/20 text-primary px-3 py-1">
                        CONFIDENTIAL • SERIES A
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight text-foreground mb-2">
                        {companyProfile.name}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Valuation Report & Investment Memorandum
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground text-right">
                    <div className="flex items-center gap-2">
                        <Building2 className="size-4" /> {companyProfile.region} • {companyProfile.sector}
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="size-4" /> Founded {companyProfile.foundedYear}
                    </div>
                    <div className="flex items-center gap-2">
                        <Globe className="size-4" /> {companyProfile.name.toLowerCase().replace(/\s/g, '')}.com
                    </div>
                </div>
            </div>
        </div>

        {/* Executive Summary */}
        <div className="p-8 md:p-12 space-y-12">
            
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                    <Target className="size-6 text-primary" />
                    <h2 className="text-2xl font-bold">Executive Summary</h2>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="bg-secondary/10 border-primary/10 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pre-Money Valuation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold font-heading text-primary">$12.5M</div>
                            <div className="text-xs text-muted-foreground mt-1">Blended Weighted Average</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-secondary/10 border-primary/10 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Confidence Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold font-heading text-emerald-500">82/100</div>
                            <div className="text-xs text-muted-foreground mt-1">High Data Reliability</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-secondary/10 border-primary/10 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Stage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold font-heading">{companyProfile.stage}</div>
                            <div className="text-xs text-muted-foreground mt-1">Growth Phase</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                    <p>
                        {companyProfile.name} is a high-growth {companyProfile.sector} company based in {companyProfile.region}. 
                        Demonstrating strong traction with <span className="text-foreground font-medium">${(financials.revenue/1000).toFixed(0)}k ARR</span> and a <span className="text-foreground font-medium">{financials.growthRate}% MoM growth rate</span>. 
                        The valuation is supported by a robust Scorecard assessment (Team: {qualitative.team}/100) and comparable market transactions in the sector.
                    </p>
                </div>
            </section>

            <Separator />

            {/* Financial Highlights */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="size-6 text-blue-500" />
                    <h2 className="text-2xl font-bold">Financial Performance</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold mb-4">Historical Valuation Growth</h3>
                        <div className="h-[200px] w-full border rounded-lg p-2 bg-card/50">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={MOCK_VALUATION_HISTORY}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                    <XAxis dataKey="date" hide />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Area type="monotone" dataKey="valuation" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold mb-4">Key Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-secondary/20 border border-border/50">
                                <div className="text-xs text-muted-foreground">Annual Revenue</div>
                                <div className="text-lg font-mono font-bold mt-1">${(financials.revenue/1000).toFixed(0)}k</div>
                            </div>
                            <div className="p-4 rounded-lg bg-secondary/20 border border-border/50">
                                <div className="text-xs text-muted-foreground">Burn Rate</div>
                                <div className="text-lg font-mono font-bold mt-1">${(financials.burnRate/1000).toFixed(0)}k/mo</div>
                            </div>
                            <div className="p-4 rounded-lg bg-secondary/20 border border-border/50">
                                <div className="text-xs text-muted-foreground">Runway</div>
                                <div className="text-lg font-mono font-bold mt-1">{(financials.cashBalance / financials.burnRate).toFixed(1)} Months</div>
                            </div>
                            <div className="p-4 rounded-lg bg-secondary/20 border border-border/50">
                                <div className="text-xs text-muted-foreground">LTV / CAC</div>
                                <div className="text-lg font-mono font-bold mt-1 text-emerald-500">4.2x</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Separator />

             {/* Qualitative Assessment */}
             <section className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                    <ShieldCheck className="size-6 text-emerald-500" />
                    <h2 className="text-2xl font-bold">Qualitative Strengths</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">Team Experience</span>
                            <span className="text-sm font-bold text-emerald-500">{qualitative.team}/100</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${qualitative.team}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Founders with prior exits and domain expertise.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">Market Timing</span>
                            <span className="text-sm font-bold text-blue-500">{qualitative.market}/100</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${qualitative.market}%` }} />
                        </div>
                         <p className="text-xs text-muted-foreground mt-2">Rapidly expanding TAM with low competition.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">Product Moat</span>
                            <span className="text-sm font-bold text-orange-500">{qualitative.product}/100</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${qualitative.product}%` }} />
                        </div>
                         <p className="text-xs text-muted-foreground mt-2">Proprietary IP and high switching costs.</p>
                    </div>
                </div>
            </section>

             {/* Disclaimer Footer */}
             <div className="mt-12 pt-8 border-t border-border/30 text-xs text-muted-foreground text-center">
                <p>This report is generated by Valuation Intelligence Platform for informational purposes only. It does not constitute financial advice or a formal appraisal.</p>
                <p className="mt-2">Generated {new Date().toLocaleDateString()}</p>
             </div>
        </div>
      </div>
    </div>
  );
}
