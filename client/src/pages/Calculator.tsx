import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SECTORS, STAGES } from "@/lib/constants";
import { Check, Info } from "lucide-react";

export default function Calculator() {
  const [revenue, setRevenue] = useState(500000);
  const [growth, setGrowth] = useState(25);
  
  return (
    <div className="grid lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
      {/* Scrollable Form Section */}
      <div className="lg:col-span-2 overflow-y-auto pr-4 space-y-8 pb-20">
        <div>
          <h1 className="text-3xl font-bold font-heading">Valuation Calculator</h1>
          <p className="text-muted-foreground mt-2">Input your startup's key metrics to generate a blended valuation estimate.</p>
        </div>

        <Card className="bg-card/50 border-primary/10">
            <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>Basic information about your startup</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Sector / Industry</Label>
                    <Select defaultValue={SECTORS[0]}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Sector" />
                        </SelectTrigger>
                        <SelectContent>
                            {SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Current Stage</Label>
                    <Select defaultValue={STAGES[1]}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Stage" />
                        </SelectTrigger>
                        <SelectContent>
                            {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Incorporation Location</Label>
                    <Select defaultValue="us-delaware">
                        <SelectTrigger>
                            <SelectValue placeholder="Select Location" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="us-delaware">US (Delaware)</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="sg">Singapore</SelectItem>
                            <SelectItem value="eu">Europe (Other)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Founded Year</Label>
                    <Input type="number" defaultValue="2023" />
                </div>
            </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/10">
            <CardHeader>
                <CardTitle>Financial Metrics</CardTitle>
                <CardDescription>Revenue and growth indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <Label>Annual Recurring Revenue (ARR)</Label>
                        <span className="font-mono text-sm">${revenue.toLocaleString()}</span>
                    </div>
                    <Slider 
                        defaultValue={[500000]} 
                        max={5000000} 
                        step={10000} 
                        onValueChange={(v) => setRevenue(v[0])}
                        className="py-2"
                    />
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <Label>YoY Growth Rate</Label>
                        <span className="font-mono text-sm">{growth}%</span>
                    </div>
                    <Slider 
                        defaultValue={[25]} 
                        max={300} 
                        step={1} 
                        onValueChange={(v) => setGrowth(v[0])}
                        className="py-2"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                        <Label>Monthly Burn Rate</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input className="pl-6" placeholder="50000" defaultValue="45000" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Cash Runway (Months)</Label>
                        <Input type="number" defaultValue="14" />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/10">
            <CardHeader>
                <CardTitle>Team & Market</CardTitle>
                <CardDescription>Qualitative factors affecting valuation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Founder Experience</Label>
                    <Select defaultValue="serial">
                        <SelectTrigger>
                            <SelectValue placeholder="Select Experience" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="first">First-time Founder</SelectItem>
                            <SelectItem value="serial">Serial Founder (Exited)</SelectItem>
                            <SelectItem value="serial-failed">Serial Founder (Failed)</SelectItem>
                            <SelectItem value="veteran">Industry Veteran</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-2">
                    <Label>Market Size (TAM)</Label>
                    <Select defaultValue="1b">
                        <SelectTrigger>
                            <SelectValue placeholder="Select TAM" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="500m">$500M - $1B</SelectItem>
                            <SelectItem value="1b">$1B - $5B</SelectItem>
                            <SelectItem value="5b">$5B - $10B</SelectItem>
                            <SelectItem value="10b+">$10B+</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>IP & Defensibility</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2 border border-input rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <div className="h-4 w-4 rounded-full border border-primary bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                            <span className="text-sm">Patents Filed</span>
                        </div>
                        <div className="flex items-center space-x-2 border border-input rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                           <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                            <span className="text-sm">Network Effects</span>
                        </div>
                        <div className="flex items-center space-x-2 border border-input rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                            <span className="text-sm">Proprietary Data</span>
                        </div>
                        <div className="flex items-center space-x-2 border border-input rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <div className="h-4 w-4 rounded-full border border-primary bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                            <span className="text-sm">First Mover</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Sticky Results Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 space-y-4">
            <Card className="bg-primary text-primary-foreground border-none shadow-lg shadow-primary/25">
                <CardHeader className="pb-2">
                    <CardDescription className="text-primary-foreground/80">Estimated Valuation</CardDescription>
                    <CardTitle className="text-4xl font-heading font-bold">$12.5M</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-primary-foreground/80 mb-4">
                        Confidence Interval: <span className="font-mono font-bold">$10M - $15M</span>
                    </div>
                    <Separator className="bg-primary-foreground/20 mb-4" />
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>VC Method</span>
                            <span className="font-mono font-medium">$11.0M</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Scorecard</span>
                            <span className="font-mono font-medium">$13.0M</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Comps</span>
                            <span className="font-mono font-medium">$12.5M</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/50 border-primary/10">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Optimization Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-3 items-start">
                        <div className="bg-emerald-500/10 p-1.5 rounded text-emerald-500 mt-0.5">
                            <Info className="size-4" />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Increasing growth rate to <span className="text-foreground font-medium">150%</span> could boost valuation by <span className="text-emerald-500">+$2.1M</span>.
                        </div>
                    </div>
                    <div className="flex gap-3 items-start">
                        <div className="bg-emerald-500/10 p-1.5 rounded text-emerald-500 mt-0.5">
                            <Info className="size-4" />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            A <span className="text-foreground font-medium">second-time founder</span> premium adds approx 15-20% to pre-seed valuations.
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Button className="w-full h-12 text-lg font-medium shadow-lg shadow-primary/20">
                Generate Full Report
            </Button>
        </div>
      </div>
    </div>
  );
}
