import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, X, Check, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import dashboardHero from '@assets/generated_images/abstract_valuation_dashboard_concept.png';
import miraHero from '@assets/generated_images/friendly_ai_assistant_robot.png';

interface TourGuideProps {
  run: boolean;
  setRun: (run: boolean) => void;
}

interface Step {
  target: string;
  title?: string;
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  route?: string; // New: Optional route to navigate to
  image?: string;
}

export function TourGuide({ run, setRun }: TourGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [location, setLocation] = useLocation();
  
  const steps: Step[] = [
    // --- Phase 1: Dashboard & High Level ---
    {
      target: 'body',
      title: "Welcome to Valuation Intelligence",
      content: (
        <div className="space-y-3">
          <p>This platform creates defensible startup valuations by blending quantitative data with qualitative scoring.</p>
          <div className="bg-primary/5 p-2 rounded-md border border-primary/10">
            <p className="text-xs text-muted-foreground flex gap-2">
                <Sparkles className="size-3 text-primary shrink-0 mt-0.5" />
                <span><strong>New:</strong> Meet Mira, your AI Valuation Advisor, available 24/7.</span>
            </p>
          </div>
        </div>
      ),
      placement: 'center',
      route: '/',
      image: dashboardHero
    },
    {
      target: '[data-tour="dashboard-nav"]',
      title: "Your Command Center",
      content: "The Dashboard gives you a real-time pulse on your valuation. As you update metrics, this number updates instantly.",
      placement: 'right',
      route: '/'
    },
    {
      target: '[data-tour="methodology-chart"]',
      title: "The Blended Approach",
      content: "We don't rely on just one method. We combine VC methodology, Market Comps, Scorecards, and DCF analysis. This chart shows how much each method contributes to your final number.",
      placement: 'left',
      route: '/'
    },
    // --- Phase 1.5: Mira Introduction ---
    {
        target: '[data-tour="mira-toggle"]', 
        title: "Meet Mira, Your AI CFO",
        content: (
            <div className="space-y-2">
                <p>Need advice? Click here to chat with Mira. She understands your specific financial data and can suggest how to improve your valuation.</p>
                <p className="text-xs text-muted-foreground">Try asking: "How do I increase my pre-money valuation?"</p>
            </div>
        ),
        placement: 'top',
        route: '/',
        image: miraHero
    },
    
    // --- Phase 2: Calculator Deep Dive ---
    {
      target: '[data-tour="valuation-engine-nav"]',
      title: "The Engine Room",
      content: "Let's go to the Valuation Engine where the magic happens. This is where you input your assumptions.",
      placement: 'right',
      route: '/calculator'
    },
    {
        target: '[data-tour="smart-weighting"]',
        title: "Smart Weighting",
        content: "Our AI automatically adjusts the weight of each method based on your stage. Pre-seed? We lean on qualitative scores. Series A? We lean on revenue.",
        placement: 'bottom',
        route: '/calculator'
    },
    {
        target: '[data-tour="scorecard-tab"]',
        title: "Qualitative Scoring",
        content: "Numbers aren't everything. The Scorecard method lets you value your Team, IP, and Market Size to justify a premium valuation.",
        placement: 'bottom',
        route: '/calculator'
    },

    // --- Phase 3: Market Comps ---
    {
        target: '[data-tour="comps-nav"]',
        title: "Market Comparables",
        content: "Investors will benchmark you against peers. Let's see how you stack up.",
        placement: 'right',
        route: '/comparables'
    },
    {
        target: '[data-tour="comps-filter"]',
        title: "Discovery Engine",
        content: "Find relevant competitors by Sector, Stage, and Revenue. We pull data from recent funding rounds to give you accurate multiples.",
        placement: 'right',
        route: '/comparables'
    },

    // --- Phase 4: Output ---
    {
        target: '[data-tour="reports-nav"]',
        title: "Investor Deal Room",
        content: "Once you're done, generate a professional Deal Room report. This is your 'Investment Memo' ready for VCs.",
        placement: 'right',
        route: '/reports/deal-room'
    },
    {
        target: '[data-tour="deal-room-export"]',
        title: "Export & Share",
        content: "Print this report to PDF or share a secure link. It explains the 'Why' behind your valuation to investors.",
        placement: 'bottom',
        route: '/reports/deal-room'
    }
  ];

  useEffect(() => {
    if (!run) {
      setCurrentStep(0);
      setTargetRect(null);
      return;
    }

    const currentStepData = steps[currentStep];

    // Handle Routing
    if (currentStepData.route && location !== currentStepData.route) {
        setLocation(currentStepData.route);
        // Give time for route transition
        setTimeout(updatePosition, 500); 
        return;
    }

    // Standard Position Update
    updatePosition();

    // Listeners
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentStep, run, location]); // Re-run when step, run state, or location changes

  const updatePosition = () => {
      const step = steps[currentStep];
      if (!step) return;

      if (step.target === 'body') {
        setTargetRect(null);
        return;
      }

      // Try finding element with retries
      const findElement = () => {
          // Special handling for Mira button which might be dynamically rendered
          let selector = step.target;
          // If targeting Mira and using generic selector, try to find the specific button
          if (step.title?.includes("Mira")) {
               // We need a better way to target Mira, let's assume she's the floating button at bottom right
               // We'll rely on the generic selector or specific data attribute if added later
               // For now, let's try to target the last button in the body that is fixed positioned if possible
               // Or just use the selector defined in steps
          }

          const element = document.querySelector(selector);
          if (element) {
            const rect = element.getBoundingClientRect();
            setTargetRect(rect);
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
              // Retry briefly if element mounting
              setTimeout(findElement, 100);
          }
      };
      
      findElement();
    };


  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setRun(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setRun(false);
  };

  if (!run) return null;

  const currentStepData = steps[currentStep];
  const isCenter = currentStepData.placement === 'center';
  const isLast = currentStep === steps.length - 1;

  // Calculate tooltip position
  const getTooltipStyle = () => {
    if (isCenter || !targetRect) {
        return {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            position: 'fixed' as const
        };
    }

    const gap = 12;
    // Simple positioning logic
    let top = 0;
    let left = 0;

    switch (currentStepData.placement) {
        case 'right':
            top = targetRect.top + (targetRect.height / 2) - 100; // rough centering
            left = targetRect.right + gap;
            break;
        case 'left':
            top = targetRect.top;
            left = targetRect.left - 320 - gap; // Width of card
            break;
        case 'bottom':
            top = targetRect.bottom + gap;
            left = targetRect.left;
            break;
        case 'top':
            top = targetRect.top - (currentStepData.image ? 400 : 200) - gap; // Adjust for image height
            left = targetRect.left - 200; // Shift left a bit for better alignment usually
            break;
        default:
             top = targetRect.bottom + gap;
             left = targetRect.left;
    }

    // Boundary checks (basic)
    if (top < 20) top = 20;
    if (left < 20) left = 20;
    if (left + 320 > window.innerWidth) left = window.innerWidth - 340;
    // Bottom boundary check
    if (top + 400 > window.innerHeight) {
        // If it goes off bottom, flip to top if placement wasn't forced
        if (currentStepData.placement !== 'top') {
             top = targetRect.top - (currentStepData.image ? 350 : 200) - gap;
        }
    }

    return {
        top,
        left,
        position: 'fixed' as const
    };
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 pointer-events-auto"
        onClick={handleSkip}
      />

      {/* Spotlight for target element */}
      {!isCenter && targetRect && (
        <motion.div
            layoutId="spotlight"
            className="absolute border-2 border-primary rounded-md shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all duration-300 pointer-events-none"
            style={{
                top: targetRect.top - 4,
                left: targetRect.left - 4,
                width: targetRect.width + 8,
                height: targetRect.height + 8,
            }}
            initial={false}
            animate={{
                top: targetRect.top - 4,
                left: targetRect.left - 4,
                width: targetRect.width + 8,
                height: targetRect.height + 8,
            }}
        />
      )}

      {/* Tooltip Card */}
      <div 
        className="pointer-events-auto absolute transition-all duration-300 ease-out z-[101]"
        style={getTooltipStyle()}
      >
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            key={currentStep}
            transition={{ duration: 0.2 }}
        >
            <Card className="w-[340px] shadow-2xl border-primary/20 bg-card/95 backdrop-blur overflow-hidden">
            {currentStepData.image && (
                <div className="h-32 w-full overflow-hidden relative border-b border-primary/10">
                    <img 
                        src={currentStepData.image} 
                        alt={currentStepData.title} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                </div>
            )}
            <CardHeader className={cn("pb-2", currentStepData.image ? "pt-4" : "")}>
                <div className="flex items-center justify-between">
                    <h4 className="font-bold text-lg text-primary">{currentStepData.title}</h4>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSkip}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground pb-4">
                {currentStepData.content}
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
                <div className="flex gap-2">
                    <span className="text-xs text-muted-foreground self-center">
                        {currentStep + 1} / {steps.length}
                    </span>
                </div>
                <div className="flex gap-2">
                    {currentStep > 0 && (
                        <Button variant="outline" size="sm" onClick={handlePrev}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <Button size="sm" onClick={handleNext} className="gap-1">
                        {isLast ? 'Finish' : 'Next'} 
                        {isLast ? <Check className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </Button>
                </div>
            </CardFooter>
            </Card>
        </motion.div>
      </div>
    </div>
  );
}
