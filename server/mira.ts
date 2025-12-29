import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { storage } from "./storage";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const MIRA_SYSTEM_PROMPT = `You are Mira, an AI CFO and valuation advisor for startup founders. You are friendly, knowledgeable, and supportive.

Your expertise includes:
- Startup valuation methodologies (VC Method, Scorecard Method, Market Comparables, DCF)
- Fundraising strategy and investor relations
- Financial modeling and projections
- Market analysis and competitive positioning
- Pitch deck optimization

Guidelines:
- Be concise but thorough - founders are busy
- Use specific numbers and examples when possible
- If asked about the user's specific valuation, reference their data
- Acknowledge uncertainty when appropriate - valuation is an art and science
- Encourage data-driven decision making
- Be encouraging but realistic

Important: You have access to the user's company profile and financial data. Reference it when relevant to give personalized advice.`;

interface MiraRequest {
  message: string;
  companyId?: string;
  context?: {
    currentPage?: string;
    financials?: {
      revenue: number;
      growthRate: number;
      burnRate: number;
      cashBalance: number;
      lastRoundValuation: number;
    };
    qualitative?: {
      team: number;
      market: number;
      product: number;
    };
    calculatedValuation?: number;
  };
}

export function registerMiraRoutes(app: Express): void {
  app.post("/api/mira/chat", async (req: Request, res: Response) => {
    try {
      const { message, companyId, context }: MiraRequest = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      let companyContext = "";
      
      if (companyId) {
        const company = await storage.getCompany(companyId);
        const snapshots = await storage.getSnapshotsByCompany(companyId);
        const latestSnapshot = snapshots[0];
        
        if (company) {
          companyContext = `
User's Company Profile:
- Name: ${company.name}
- Sector: ${company.sector}
- Stage: ${company.stage}
- Region: ${company.region}
- Founded: ${company.foundedYear}
`;
        }
        
        if (latestSnapshot) {
          companyContext += `
Current Financial Snapshot:
- Revenue: $${latestSnapshot.revenue?.toLocaleString() || 0}
- Growth Rate: ${latestSnapshot.growthRate || 0}%
- Burn Rate: $${latestSnapshot.burnRate?.toLocaleString() || 0}/month
- Cash Balance: $${latestSnapshot.cashBalance?.toLocaleString() || 0}
- Last Round Valuation: $${latestSnapshot.lastRoundValuation?.toLocaleString() || 0}
- Team Score: ${latestSnapshot.teamScore}/100
- Product Score: ${latestSnapshot.productScore}/100
- Market Score: ${latestSnapshot.marketScore}/100
- Calculated Valuation: $${latestSnapshot.calculatedValuation?.toLocaleString() || 'Not calculated yet'}
`;
        }
      } else if (context) {
        if (context.financials) {
          companyContext = `
User's Current Financial Data:
- Revenue: $${context.financials.revenue?.toLocaleString() || 0}
- Growth Rate: ${context.financials.growthRate || 0}%
- Burn Rate: $${context.financials.burnRate?.toLocaleString() || 0}/month
- Cash Balance: $${context.financials.cashBalance?.toLocaleString() || 0}
- Last Round Valuation: $${context.financials.lastRoundValuation?.toLocaleString() || 0}
`;
        }
        if (context.qualitative) {
          companyContext += `
Qualitative Scores:
- Team: ${context.qualitative.team}/100
- Market: ${context.qualitative.market}/100
- Product: ${context.qualitative.product}/100
`;
        }
        if (context.calculatedValuation) {
          companyContext += `\nCalculated Valuation: $${context.calculatedValuation.toLocaleString()}`;
        }
        if (context.currentPage) {
          companyContext += `\n\nUser is currently viewing: ${context.currentPage}`;
        }
      }

      const systemPrompt = MIRA_SYSTEM_PROMPT + (companyContext ? `\n\n${companyContext}` : "");

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        stream: true,
        max_tokens: 1024,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true, fullResponse })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Mira chat error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "I encountered an issue. Please try again." })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to get response from Mira" });
      }
    }
  });

  app.post("/api/mira/quick-insight", async (req: Request, res: Response) => {
    try {
      const { type, data } = req.body;
      
      const prompts: Record<string, string> = {
        valuation: `Based on this startup data, provide a 2-sentence valuation insight: Revenue: $${data?.revenue || 0}, Growth: ${data?.growthRate || 0}%, Stage: ${data?.stage || 'Early'}, Sector: ${data?.sector || 'Tech'}`,
        improvement: `Suggest one specific action this startup can take to increase their valuation in the next 90 days. Revenue: $${data?.revenue || 0}, Growth: ${data?.growthRate || 0}%`,
        benchmark: `How does this compare to typical ${data?.stage || 'Seed'} stage ${data?.sector || 'SaaS'} companies? Revenue: $${data?.revenue || 0}, Growth: ${data?.growthRate || 0}%`
      };

      const prompt = prompts[type] || prompts.valuation;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a concise startup valuation expert. Give brief, actionable insights in 2-3 sentences max." },
          { role: "user", content: prompt }
        ],
        max_tokens: 150,
      });

      res.json({ insight: response.choices[0]?.message?.content || "Unable to generate insight" });
    } catch (error) {
      console.error("Quick insight error:", error);
      res.status(500).json({ error: "Failed to generate insight" });
    }
  });
}
