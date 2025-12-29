import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle2, ChevronLeft } from "lucide-react";

interface Question {
  id: string;
  text: string;
  category: string;
  weight: number; // contribution to category score
  options: { label: string; value: number }[];
}

const QUESTIONS: Question[] = [
  // Team (Weight: 30%)
  {
    id: "q1",
    category: "Team Strength",
    text: "Do the founders have previous exit experience?",
    weight: 1.5,
    options: [
      { label: "Yes, multiple exits", value: 150 },
      { label: "Yes, one exit", value: 125 },
      { label: "No, but deep industry experience", value: 100 },
      { label: "First time founders", value: 80 }
    ]
  },
  {
    id: "q2",
    category: "Team Strength",
    text: "Is the technical team fully hired in-house?",
    weight: 1.0,
    options: [
      { label: "Yes, full committed team", value: 125 },
      { label: "Founders are technical", value: 110 },
      { label: "Partially outsourced", value: 90 },
      { label: "Fully outsourced dev shop", value: 70 }
    ]
  },
  // Market (Weight: 25%)
  {
    id: "q3",
    category: "Market Size",
    text: "What is the estimated TAM (Total Addressable Market)?",
    weight: 1.0,
    options: [
      { label: "> $10 Billion", value: 150 },
      { label: "$1B - $10B", value: 120 },
      { label: "$100M - $1B", value: 100 },
      { label: "< $100M", value: 80 }
    ]
  },
  {
    id: "q4",
    category: "Market Size",
    text: "How fast is the market growing?",
    weight: 1.0,
    options: [
      { label: "Hypergrowth (>30% CAGR)", value: 140 },
      { label: "Fast (15-30% CAGR)", value: 120 },
      { label: "Steady (5-15% CAGR)", value: 100 },
      { label: "Stagnant / Declining", value: 70 }
    ]
  },
  // Product (Weight: 15%)
  {
    id: "q5",
    category: "Product/Tech",
    text: "What is the current product status?",
    weight: 1.0,
    options: [
      { label: "Live with revenue", value: 150 },
      { label: "Live beta / pilots", value: 125 },
      { label: "MVP Complete", value: 100 },
      { label: "Development phase", value: 70 }
    ]
  },
  // Competitive Environment (Weight: 10%)
  {
    id: "q6",
    category: "Competitive Environment",
    text: "How saturated is the competitive landscape?",
    weight: 1.0,
    options: [
      { label: "Blue ocean (No direct competitors)", value: 150 },
      { label: "Few players, fragmented", value: 120 },
      { label: "Competitive but we have a moat", value: 100 },
      { label: "Highly saturated / Red ocean", value: 70 }
    ]
  }
];

interface ScorecardQuestionnaireProps {
  onComplete: (scores: Record<string, number>) => void;
  onCancel: () => void;
}

export function ScorecardQuestionnaire({ onComplete, onCancel }: ScorecardQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [QUESTIONS[currentStep].id]: parseInt(value) }));
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      calculateAndSubmit();
    }
  };

  const calculateAndSubmit = () => {
    // Group by category and average the scores
    const categoryScores: Record<string, { total: number, count: number }> = {};
    
    QUESTIONS.forEach(q => {
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { total: 0, count: 0 };
      }
      categoryScores[q.category].total += (answers[q.id] || 100);
      categoryScores[q.category].count += 1;
    });

    const finalScores: Record<string, number> = {};
    Object.keys(categoryScores).forEach(cat => {
      finalScores[cat] = Math.round(categoryScores[cat].total / categoryScores[cat].count);
    });

    onComplete(finalScores);
  };

  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;
  const currentQ = QUESTIONS[currentStep];

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-auto p-0 hover:bg-transparent">
            <ChevronLeft className="size-4 mr-1" /> Back
          </Button>
          <span className="text-xs font-mono text-muted-foreground">
            Question {currentStep + 1} of {QUESTIONS.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <CardTitle className="mt-4 text-xl">{currentQ.category}</CardTitle>
        <CardDescription className="text-base font-medium text-foreground">
          {currentQ.text}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup onValueChange={handleAnswer} value={answers[currentQ.id]?.toString()}>
          <div className="space-y-3">
            {currentQ.options.map((option) => (
              <div key={option.value} className={`
                flex items-center space-x-2 border rounded-lg p-4 cursor-pointer transition-all
                ${answers[currentQ.id] === option.value ? 'bg-primary/10 border-primary' : 'hover:bg-secondary/50 border-border'}
              `}>
                <RadioGroupItem value={option.value.toString()} id={`opt-${option.value}`} />
                <Label htmlFor={`opt-${option.value}`} className="flex-1 cursor-pointer font-normal">
                  {option.label}
                </Label>
                {answers[currentQ.id] === option.value && (
                  <CheckCircle2 className="size-4 text-primary" />
                )}
              </div>
            ))}
          </div>
        </RadioGroup>

        <div className="flex justify-end pt-4">
          <Button onClick={handleNext} disabled={!answers[currentQ.id]} className="gap-2">
            {currentStep === QUESTIONS.length - 1 ? 'Finish' : 'Next Question'}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
