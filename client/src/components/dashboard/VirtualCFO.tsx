import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
    content: "Hi there! I'm your Valuation Analyst AI. I've reviewed your financial inputs and market data. Ask me anything about your valuation or how to improve it.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    type: 'text'
  },
  {
    id: '2',
    role: 'assistant',
    content: "Based on your current metrics, your **Team Score (125%)** is driving a significant premium, but your **LTV/CAC (3.5x)** is slightly below the Series A top-quartile benchmark of 4.5x.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    type: 'insight'
  }
];

export function VirtualCFO() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

      if (input.toLowerCase().includes("improve") || input.toLowerCase().includes("higher")) {
        responseContent = "To increase your valuation, focus on these levers:\n1. **Increase LTV/CAC**: Ideally > 4.0x\n2. **Extend Runway**: Investors prefer 18+ months for Series A.\n3. **Market Expansion**: Validate a secondary market segment.";
        type = 'insight';
      } else if (input.toLowerCase().includes("risk") || input.toLowerCase().includes("bad")) {
        responseContent = "The biggest risk currently is the high dependence on the 'VC Method' which assumes a $50M exit. If market multiples contract, this valuation could drop by 20%.";
        type = 'alert';
      } else if (input.toLowerCase().includes("competitor") || input.toLowerCase().includes("comps")) {
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
    <Card className="h-[600px] flex flex-col border-primary/20 shadow-2xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardHeader className="border-b border-border/50 py-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bot className="size-4 text-primary" />
          Virtual CFO
          <Badge variant="secondary" className="ml-auto text-[10px] bg-primary/10 text-primary hover:bg-primary/20">
            <Sparkles className="size-3 mr-1" />
            AI Active
          </Badge>
        </CardTitle>
        <CardDescription className="text-xs">
            Expert guidance on your valuation strategy.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="size-8 border">
                  {msg.role === 'assistant' ? (
                    <AvatarFallback className="bg-primary/10 text-primary"><Bot className="size-4" /></AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-secondary text-secondary-foreground"><User className="size-4" /></AvatarFallback>
                  )}
                </Avatar>
                <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`
                        rounded-2xl px-4 py-2.5 text-sm shadow-sm
                        ${msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                            : 'bg-secondary/50 border border-border/50 rounded-tl-sm'
                        }
                    `}
                  >
                    {msg.type === 'insight' && (
                        <div className="flex items-center gap-2 mb-2 text-emerald-500 font-bold text-xs uppercase tracking-wider">
                            <TrendingUp className="size-3" /> Valuation Insight
                        </div>
                    )}
                    {msg.type === 'alert' && (
                        <div className="flex items-center gap-2 mb-2 text-orange-500 font-bold text-xs uppercase tracking-wider">
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
                    <Avatar className="size-8 border">
                        <AvatarFallback className="bg-primary/10 text-primary"><Bot className="size-4" /></AvatarFallback>
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
                placeholder="Ask about your valuation..." 
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
  );
}
