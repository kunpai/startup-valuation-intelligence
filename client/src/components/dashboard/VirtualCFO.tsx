import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, TrendingUp, AlertTriangle, X, MessageSquare, Maximize2, Minimize2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'insight' | 'alert';
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hi, I'm Mira, your Valuation AI Advisor. I'm analyzing your real-time metrics. How can I help maximize your valuation today?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    type: 'text'
  },
  {
    id: '2',
    role: 'assistant',
    content: "Quick insight: Your **Team Score (125%)** is exceptional, but your **LTV/CAC (3.5x)** is slightly below the Series A target of 4.5x.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    type: 'insight'
  }
];

const PAGE_CONTEXTS: Record<string, string> = {
    '/': "Dashboard: Overview of valuation, key metrics, and methodology breakdown.",
    '/calculator': "Calculator: Inputting financial data, growth rates, and market sizing.",
    '/scenarios': "Scenarios: Modeling future exit scenarios, dilution, and growth assumptions.",
    '/reports': "Reports: Generating and exporting the investor deal room and PDF reports.",
    '/market': "Market Data: Comparable company analysis and industry benchmarks.",
    '/onboarding': "Onboarding: Setting up the initial company profile and sector."
};

export function VirtualCFO() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Optional: Proactive message on page change
  /*
  useEffect(() => {
    // Logic to add a context-aware greeting when page changes
    // avoiding spam by checking last message timestamp or similar logic
  }, [location]);
  */

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI Response
    setTimeout(() => {
      let responseContent = "That's an interesting question. Generally, improving your recurring revenue quality is the fastest lever.";
      let type: 'text' | 'insight' | 'alert' = 'text';

      const currentContext = PAGE_CONTEXTS[location] || "General Valuation Context";
      
      // Simple keyword matching enhanced with page context logic
      const inputLower = input.toLowerCase();
      
      if (inputLower.includes("page") || inputLower.includes("here") || inputLower.includes("context")) {
          if (location === '/calculator') {
              responseContent = "You're on the **Calculator**. Adjusting your 'Growth Rate' above 20% usually has the highest impact on the VC Method valuation.";
              type = 'insight';
          } else if (location === '/scenarios') {
              responseContent = "On the **Scenarios** page, try modeling a 'Downside' case with 20% less revenue to test your runway resilience.";
              type = 'insight';
          } else {
             responseContent = `I see you're on the **${currentContext.split(':')[0]}**. How can I help with this specific section?`;
          }
      } else if (inputLower.includes("improve") || inputLower.includes("higher")) {
        responseContent = "To increase your valuation, focus on these levers:\n1. **Increase LTV/CAC**: Ideally > 4.0x\n2. **Extend Runway**: Investors prefer 18+ months for Series A.\n3. **Market Expansion**: Validate a secondary market segment.";
        type = 'insight';
      } else if (inputLower.includes("risk") || inputLower.includes("bad")) {
        responseContent = "The biggest risk currently is the high dependence on the 'VC Method' which assumes a $50M exit. If market multiples contract, this valuation could drop by 20%.";
        type = 'alert';
      } else if (inputLower.includes("competitor") || inputLower.includes("comps")) {
        responseContent = "I've found 3 new potential competitors in the Fintech space with recent funding. Check the 'Market Comps' tab to see how their 15x revenue multiples compare to yours.";
        type = 'text';
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        type
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
        {/* Floating Toggle Button */}
        {!isOpen && (
            <div 
                className="fixed bottom-6 right-6 z-50 animate-in zoom-in duration-300" 
                data-tour="mira-toggle" // Added for tour targeting
            >
                <Button 
                    onClick={() => setIsOpen(true)} 
                    size="icon" 
                    className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 animate-pulse" />
                    <Avatar className="h-10 w-10 border-2 border-white/20">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mira&backgroundColor=b6e3f4" />
                        <AvatarFallback>M</AvatarFallback>
                    </Avatar>
                    <span className="absolute top-0 right-0 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                </Button>
                <div className="absolute -top-12 right-0 bg-popover text-popover-foreground px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg border border-border/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Ask Mira anything
                </div>
            </div>
        )}

        {/* Chat Interface */}
        <div className={cn(
            "fixed bottom-6 right-6 z-50 w-[380px] transition-all duration-300 origin-bottom-right",
            isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-10 pointer-events-none"
        )}>
            <Card className="flex flex-col border-primary/20 shadow-2xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 h-[600px] overflow-hidden">
                <CardHeader className="border-b border-border/50 py-3 bg-primary/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="h-9 w-9 border border-primary/20 shadow-sm">
                                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mira&backgroundColor=b6e3f4" />
                                    <AvatarFallback>M</AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background"></span>
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    Mira
                                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-4 bg-primary/10 text-primary">
                                        AI Advisor
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="text-[10px]">
                                    Online • Analyzing 24 metrics
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => {}}>
                                <Maximize2 className="size-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => setIsOpen(false)}>
                                <X className="size-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="flex-1 p-0 overflow-hidden relative">
                    <ScrollArea className="h-full p-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            {msg.role === 'assistant' && (
                                <Avatar className="size-6 border shrink-0 mt-1">
                                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mira&backgroundColor=b6e3f4" />
                                    <AvatarFallback>M</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div 
                                className={`
                                    rounded-2xl px-4 py-2.5 text-sm shadow-sm
                                    ${msg.role === 'user' 
                                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                                        : 'bg-secondary/80 border border-border/50 rounded-tl-sm'
                                    }
                                `}
                            >
                                {msg.type === 'insight' && (
                                    <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                        <TrendingUp className="size-3" /> Valuation Insight
                                    </div>
                                )}
                                {msg.type === 'alert' && (
                                    <div className="flex items-center gap-2 mb-2 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-wider">
                                        <AlertTriangle className="size-3" /> Risk Alert
                                    </div>
                                )}
                                <div className="whitespace-pre-line leading-relaxed">
                                    {msg.content}
                                </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            </div>
                        </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-3">
                                <Avatar className="size-6 border shrink-0 mt-1">
                                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mira&backgroundColor=b6e3f4" />
                                    <AvatarFallback>M</AvatarFallback>
                                </Avatar>
                                <div className="bg-secondary/50 border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                                    <div className="size-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="size-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="size-1.5 bg-primary/40 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                    </div>
                    </ScrollArea>
                </CardContent>
                
                <div className="p-3 border-t border-border/50 bg-secondary/10">
                    <form 
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="flex gap-2"
                    >
                        <Input 
                            placeholder="Ask Mira..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="bg-background shadow-none border-primary/20 focus-visible:ring-primary/20"
                        />
                        <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
                            <Send className="size-4" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    </>
  );
}
