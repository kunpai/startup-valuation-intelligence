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
  TrendingUp,
  Sparkles
} from "lucide-react";
import methodologyImage from '@assets/generated_images/methodology_diagram_blending_four_colors.png';
import miraInterfaceImage from '@assets/generated_images/ai_financial_assistant_interface.png';

export default function PlatformOverview() {
  return (
    <div className="space-y-12 pb-20 max-w-6xl mx-auto">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-10 pb-6 animate-in fade-in slide-in-from-top-8 duration-700 relative">
        <Badge variant="secondary" className="px-4 py-1.5 text-sm rounded-full mb-4 border-primary/20 bg-primary/10 text-primary">
          v2.0 Release • Intelligent Valuation Engine
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
          The Operating System for <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Startup Valuation</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Move beyond simple spreadsheets. Our platform blends quantitative models with qualitative scoring to tell the complete story of your startup's value.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/calculator">
                <Button size="lg" className="h-12 px-8 text-lg gap-2 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all rounded-full">
                    Start Valuation <ArrowRight className="size-5" />
                </Button>
            </Link>
            <Link href="/reports/deal-room">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg gap-2 rounded-full bg-background/50 backdrop-blur border-primary/20 hover:bg-primary/5">
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

      {/* Mira AI Section */}
      <section className="grid lg:grid-cols-2 gap-12 items-center bg-card/30 rounded-3xl p-8 border border-white/5">
        <div className="relative order-2 lg:order-1 group">
             <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 blur-2xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <img 
                src={miraInterfaceImage} 
                alt="Mira AI Assistant" 
                className="rounded-xl shadow-2xl border border-white/10 relative z-10 w-full object-cover h-[400px] hover:scale-[1.02] transition-transform duration-500"
            />
        </div>
        <div className="space-y-6 order-1 lg:order-2">
             <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">New Feature</Badge>
            <h2 className="text-3xl md:text-4xl font-bold font-heading">Meet Mira, Your AI CFO</h2>
            <p className="text-lg text-muted-foreground">
                Don't navigate fundraising alone. Mira is an always-on AI advisor that understands your specific financial context.
            </p>
            <ul className="space-y-3">
                <li className="flex gap-3 items-start">
                    <CheckCircle2 className="size-5 text-emerald-500 mt-1" />
                    <span><strong>Context Aware:</strong> Knows if you're working on market sizing or revenue projections and offers specific advice.</span>
                </li>
                <li className="flex gap-3 items-start">
                    <CheckCircle2 className="size-5 text-emerald-500 mt-1" />
                    <span><strong>Valuation Optimization:</strong> Suggests actionable levers to increase your valuation before you pitch.</span>
                </li>
                <li className="flex gap-3 items-start">
                    <CheckCircle2 className="size-5 text-emerald-500 mt-1" />
                    <span><strong>24/7 Availability:</strong> Get instant answers to complex financial questions.</span>
                </li>
            </ul>
            <Button className="gap-2 rounded-full" onClick={() => document.querySelector<HTMLButtonElement>('[data-tour="mira-toggle"] button')?.click()}>
                <Sparkles className="size-4" /> Chat with Mira
            </Button>
        </div>
      </section>

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
        <div className="relative group">
             <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity" />
             <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
                 <img 
                    src={methodologyImage} 
                    alt="Valuation Methodology Diagram" 
                    className="w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-6 pt-20">
                    <div className="flex justify-between items-end">
                        <div>
                             <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Calculated Result</p>
                             <p className="text-3xl font-bold text-foreground">Weighted Average</p>
                        </div>
                        <Badge variant="outline" className="text-lg px-4 py-1 border-primary/50 text-primary bg-primary/5">Defensible</Badge>
                    </div>
                </div>
             </div>
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
