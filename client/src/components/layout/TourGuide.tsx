import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, X, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TourGuideProps {
  run: boolean;
  setRun: (run: boolean) => void;
}

interface Step {
  target: string;
  title?: string;
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export function TourGuide({ run, setRun }: TourGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  
  const steps: Step[] = [
    {
      target: 'body', // Center modal
      title: "Welcome to SVI Platform",
      content: (
        <div className="space-y-2">
          <p>Let's take a quick tour of the Startup Valuation Intelligence dashboard.</p>
        </div>
      ),
      placement: 'center',
    },
    {
      target: '[data-tour="dashboard-nav"]',
      title: "Dashboard",
      content: 'Your command center. See your valuation summary, key metrics, and recent activity here.',
      placement: 'right'
    },
    {
      target: '[data-tour="valuation-engine-nav"]',
      title: "Valuation Engine",
      content: 'The core calculator. Combine VC Method, Scorecard, and DCF models to triangulate your value.',
      placement: 'right'
    },
    {
      target: '[data-tour="comps-nav"]',
      title: "Market Comparables",
      content: 'Find similar companies and benchmark your metrics against real market data.',
      placement: 'right'
    },
    {
      target: '[data-tour="scenarios-nav"]',
      title: "Scenarios",
      content: 'Plan for the future. Model different funding rounds, exits, and growth scenarios.',
      placement: 'right'
    },
    {
      target: '[data-tour="reports-nav"]',
      title: "Reports",
      content: 'Generate investor-ready PDFs and one-pagers based on your valuation data.',
      placement: 'right'
    },
    {
        target: '[data-tour="quick-actions"]',
        title: "Quick Actions",
        content: 'Quickly access common tasks like creating a new report or updating your metrics.',
        placement: 'bottom'
    }
  ];

  useEffect(() => {
    if (!run) {
      setCurrentStep(0);
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      const step = steps[currentStep];
      if (step.target === 'body') {
        setTargetRect(null); // Special case for center modal
        return;
      }

      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // Small delay to allow for rendering/animations
    const timer = setTimeout(updatePosition, 100);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentStep, run]);

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
            top = targetRect.top - 200 - gap;
            left = targetRect.left;
            break;
        default:
             top = targetRect.bottom + gap;
             left = targetRect.left;
    }

    // Boundary checks (basic)
    if (top < 20) top = 20;
    if (left < 20) left = 20;
    if (left + 320 > window.innerWidth) left = window.innerWidth - 340;

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
            <Card className="w-[320px] shadow-2xl border-primary/20 bg-card/95 backdrop-blur">
            <CardHeader className="pb-2">
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
