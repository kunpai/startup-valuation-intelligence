import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Calculator, 
  LineChart, 
  Briefcase, 
  FileText, 
  Brain, 
  Target, 
  ShieldCheck, 
  LayoutDashboard,
  ArrowRight,
  CheckCircle2,
  Users,
  Lightbulb,
  TrendingUp
} from "lucide-react";

export default function PlatformOverview() {
  return (
    <div className="space-y-12 pb-20 max-w-6xl mx-auto">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-10 pb-6 animate-in fade-in slide-in-from-top-8 duration-700">
        <Badge variant="secondary" className="px-4 py-1.5 text-sm rounded-full mb-4">
          v2.0 Release • Intelligent Valuation Engine
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold font-heading tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
          The Operating System for <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Startup Valuation</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Move beyond simple spreadsheets. Our platform blends quantitative models with qualitative scoring to tell the complete story of your startup's value.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/calculator">
                <Button size="lg" className="h-12 px-8 text-lg gap-2 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all">
                    Start Valuation <ArrowRight className="size-5" />
                </Button>
            </Link>
            <Link href="/reports/deal-room">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg gap-2">
                    View Sample Report
                </Button>
            </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard 
          icon={<Calculator className="size-6 text-blue-500" />}
          title="Multi-Method Engine"
          description="Combines VC Method, Scorecard, Market Comps, and DCF into a single weighted valuation."
          link="/calculator"
        />
        <FeatureCard 
          icon={<Briefcase className="size-6 text-purple-500" />}
          title="Market Benchmarks"
          description="Compare your metrics against real-time data from similar startups in your sector."
          link="/comparables"
        />
        <FeatureCard 
          icon={<TrendingUp className="size-6 text-emerald-500" />}
          title="Scenario Planning"
          description="Model 'Best Case' vs 'Base Case' outcomes to prepare for investor negotiations."
          link="/scenarios"
        />
        <FeatureCard 
          icon={<FileText className="size-6 text-orange-500" />}
          title="Investor Deal Room"
          description="Generate professional PDF reports and investment memos ready for sharing."
          link="/reports"
        />
      </section>

      <Separator className="bg-border/50" />

      {/* Methodology Section */}
      <section className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading">Our Methodology</h2>
            <p className="text-lg text-muted-foreground">
                Investors don't use just one number. Neither should you. We triangulate value using four distinct frameworks tailored to your stage.
            </p>
            
            <div className="space-y-4">
                <MethodRow 
                    icon={<Users className="size-5" />}
                    title="Scorecard Method"
                    text="Adjusts valuation based on team strength, market size, and product maturity relative to peers."
                />
                <MethodRow 
                    icon={<Target className="size-5" />}
                    title="Venture Capital Method"
                    text="Back-solves from a future exit value based on required investor ROI targets."
                />
                <MethodRow 
                    icon={<LayoutDashboard className="size-5" />}
                    title="Market Comparables"
                    text="Applies revenue multiples from recent transactions of similar companies."
                />
                 <MethodRow 
                    icon={<LineChart className="size-5" />}
                    title="Discounted Cash Flow"
                    text="Projects future free cash flows and discounts them to present value (for later stages)."
                />
            </div>
        </div>
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-blue-500/20 blur-3xl rounded-full opacity-50" />
            <Card className="relative border-primary/10 shadow-2xl bg-card/80 backdrop-blur">
                <CardHeader>
                    <CardTitle>Weighted Blended Average</CardTitle>
                    <CardDescription>How we calculate your final number</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Scorecard (Qualitative)</span>
                            <span>30%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[30%]" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>VC Method (Future)</span>
                            <span>40%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[40%]" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Comps (Market)</span>
                            <span>20%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 w-[20%]" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>DCF (Intrinsic)</span>
                            <span>10%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[10%]" />
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="text-center">
                            <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Final Valuation</div>
                            <div className="text-3xl font-bold font-heading text-primary">$12.5M</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </section>

      <Separator className="bg-border/50" />

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold font-heading">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Common questions about the platform and valuation mechanics.</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>What stages is this platform for?</AccordionTrigger>
                <AccordionContent>
                    Our platform is optimized for Pre-Seed to Series A startups. The "Smart Weighting" engine automatically adjusts the methodology mix based on your stage. For example, Pre-Seed leans heavily on the Scorecard Method (qualitative), while Series A weighs financials and market comps more heavily.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Can I export the reports?</AccordionTrigger>
                <AccordionContent>
                    Yes! The "Investor Deal Room" generates a professional, printable report that acts as an Investment Memo. You can print to PDF directly from the browser to share with prospective investors or advisors.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>How accurate is the valuation?</AccordionTrigger>
                <AccordionContent>
                    Valuation is an art and a science. No tool can give you a "perfect" number because value is ultimately what an investor is willing to pay. However, our blended approach provides a scientifically defensible range that helps you negotiate with confidence rather than guessing.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
                <AccordionTrigger>Is my data secure?</AccordionTrigger>
                <AccordionContent>
                   Currently, this is a client-side prototype. All data is stored locally in your session or browser. In a production environment, we would use enterprise-grade encryption to ensure your financial data remains strictly confidential.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
                <AccordionTrigger>What if I have no revenue yet?</AccordionTrigger>
                <AccordionContent>
                   That's normal! For pre-revenue companies, our engine automatically prioritizes the "Scorecard Method" and "VC Method" which don't rely on current revenue multiples, but rather on team strength, market size, and future potential.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </section>

      {/* Final CTA */}
      <section className="bg-primary/5 border border-primary/10 rounded-2xl p-12 text-center space-y-6">
        <h2 className="text-3xl font-bold font-heading">Ready to find your number?</h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Join hundreds of founders using data to drive their fundraising strategy.
        </p>
        <Link href="/calculator">
            <Button size="lg" className="px-8 shadow-lg shadow-primary/20">
                Launch Valuation Engine
            </Button>
        </Link>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, description, link }: { icon: React.ReactNode, title: string, description: string, link: string }) {
    return (
        <Link href={link}>
            <Card className="h-full hover:border-primary/50 hover:bg-secondary/10 transition-all cursor-pointer group">
                <CardHeader>
                    <div className="mb-2 p-2 bg-secondary/50 w-fit rounded-lg group-hover:scale-110 transition-transform">
                        {icon}
                    </div>
                    <CardTitle className="text-xl">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription className="text-base">
                        {description}
                    </CardDescription>
                </CardContent>
            </Card>
        </Link>
    )
}

function MethodRow({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) {
    return (
        <div className="flex gap-4 items-start">
            <div className="mt-1 p-2 bg-secondary/50 rounded-lg text-primary">
                {icon}
            </div>
            <div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-muted-foreground">{text}</p>
            </div>
        </div>
    )
}
