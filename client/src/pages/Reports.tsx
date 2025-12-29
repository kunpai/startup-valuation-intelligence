import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { FileText, Download, Share2, Plus, Calendar, CheckCircle2 } from "lucide-react";

export default function Reports() {
  const REPORTS = [
    {
        title: "Q4 2025 Investor Update",
        type: "Quarterly Report",
        date: "Dec 30, 2025",
        status: "Draft",
        size: "2.4 MB"
    },
    {
        title: "Series A Valuation Audit",
        type: "Valuation Certificate",
        date: "Nov 15, 2025",
        status: "Finalized",
        size: "4.1 MB"
    },
    {
        title: "October Monthly Metrics",
        type: "Monthly Flash",
        date: "Nov 01, 2025",
        status: "Sent",
        size: "1.2 MB"
    },
    {
        title: "Q3 2025 Board Deck",
        type: "Board Material",
        date: "Oct 15, 2025",
        status: "Sent",
        size: "12.5 MB"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Reports & Docs</h1>
          <p className="text-muted-foreground mt-1">Generate and manage investor-ready documents.</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20">
             <Plus className="size-4" /> Create New Report
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="bg-primary text-primary-foreground border-none shadow-xl shadow-primary/10 relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <FileText className="size-32 rotate-12" />
            </div>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="size-5" />
                    One-Pager
                </CardTitle>
                <CardDescription className="text-primary-foreground/70">
                    Standard startup profile for intro meetings.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm font-medium">Includes: Valuation Summary, Team, Market, & Key Metrics.</p>
            </CardContent>
            <CardFooter>
                <Button variant="secondary" className="w-full">Generate Now</Button>
            </CardFooter>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all cursor-pointer group">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="size-5 text-emerald-500" />
                    Full Valuation Audit
                </CardTitle>
                <CardDescription>
                    Comprehensive 15-page breakdown of methodology.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Best for: Due Diligence Data Room, Lead Investor meetings.</p>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full group-hover:bg-secondary transition-colors">Generate Now</Button>
            </CardFooter>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all cursor-pointer group">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="size-5 text-blue-500" />
                    Scenario Analysis
                </CardTitle>
                <CardDescription>
                    Export current simulation scenarios as PDF.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Best for: Showing upside potential and risk mitigation.</p>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full group-hover:bg-secondary transition-colors">Generate Now</Button>
            </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold font-heading mb-4">Recent Documents</h2>
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <div className="divide-y divide-border/50">
                {REPORTS.map((report, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
                        <Link href={`/reports/${i}`} className="flex-1 flex items-center gap-4 cursor-pointer">
                            <div className="bg-secondary/50 p-3 rounded-lg">
                                <FileText className="size-6 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="font-medium hover:text-primary transition-colors">{report.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <span>{report.type}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Calendar className="size-3" /> {report.date}</span>
                                    <span>•</span>
                                    <span>{report.size}</span>
                                </div>
                            </div>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Badge variant={report.status === "Draft" ? "outline" : "secondary"} className={report.status === "Sent" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ""}>
                                {report.status}
                            </Badge>
                            <Button variant="ghost" size="icon">
                                <Share2 className="size-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                                <Download className="size-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
      </div>
    </div>
  );
}
