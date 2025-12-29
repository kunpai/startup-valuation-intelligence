import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sparkles, RefreshCcw } from "lucide-react";
import { useState } from "react";

export function SimulationSheet() {
  const [growth, setGrowth] = useState(25);
  const [market, setMarket] = useState(50);
  const [churn, setChurn] = useState(5);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-xl shadow-primary/20 size-14 p-0 bg-primary hover:bg-primary/90 animate-in zoom-in duration-300"
        >
          <Sparkles className="size-6 text-primary-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] border-l border-primary/10">
        <SheetHeader>
          <SheetTitle className="text-2xl font-heading flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            What-If Simulator
          </SheetTitle>
          <SheetDescription>
            Adjust key variables to see how they impact your projected valuation.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-8 space-y-8">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label className="text-base">Projected Growth Rate</Label>
                    <span className="font-mono text-primary font-bold">{growth}%</span>
                </div>
                <Slider 
                    value={[growth]} 
                    max={200} 
                    step={1} 
                    onValueChange={(v) => setGrowth(v[0])} 
                    className="py-2"
                />
                <p className="text-xs text-muted-foreground">
                    Increasing growth to 50% usually correlates with a 1.5x valuation multiplier.
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label className="text-base">Market Sentiment Index</Label>
                    <span className="font-mono text-primary font-bold">{market}/100</span>
                </div>
                <Slider 
                    value={[market]} 
                    max={100} 
                    step={1} 
                    onValueChange={(v) => setMarket(v[0])} 
                    className="py-2"
                />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label className="text-base">Churn Rate Reduction</Label>
                    <span className="font-mono text-primary font-bold">-{churn}%</span>
                </div>
                <Slider 
                    value={[churn]} 
                    max={20} 
                    step={0.5} 
                    onValueChange={(v) => setChurn(v[0])} 
                    className="py-2"
                />
            </div>

            <div className="bg-secondary/50 p-6 rounded-xl border border-primary/10 mt-8">
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Projected Impact</h4>
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-sm text-muted-foreground">New Estimated Valuation</div>
                        <div className="text-3xl font-bold font-heading text-emerald-500 mt-1">~$14.8M</div>
                    </div>
                    <div className="text-right">
                         <div className="text-sm text-muted-foreground">Uplift</div>
                         <div className="text-lg font-bold text-emerald-500">+18.4%</div>
                    </div>
                </div>
            </div>
        </div>

        <SheetFooter>
             <SheetClose asChild>
                <Button variant="outline" className="w-full">Close Simulation</Button>
            </SheetClose>
            <Button className="w-full gap-2">
                <RefreshCcw className="size-4" /> Apply Scenarios
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
