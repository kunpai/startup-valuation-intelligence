
export const SECTORS = [
  "B2B SaaS",
  "Fintech",
  "Marketplace",
  "E-commerce",
  "HealthTech",
  "DeepTech",
  "Web3/Crypto",
  "Consumer App",
  "EdTech",
  "PropTech",
  "ClimateTech",
  "Cybersecurity"
];

export const STAGES = [
  "Pre-Seed",
  "Seed",
  "Pre-Series A",
  "Series A",
  "Series B",
  "Series C+",
];

export const REGIONS = [
  "North America",
  "Europe",
  "Asia Pacific",
  "Latin America",
  "MENA",
  "Africa"
];

export const MOCK_VALUATION_HISTORY = [
  { date: "2023-Q1", valuation: 2000000, label: "Idea" },
  { date: "2023-Q3", valuation: 3500000, label: "MVP" },
  { date: "2024-Q1", valuation: 5000000, label: "Pre-Seed" },
  { date: "2024-Q3", valuation: 8500000, label: "Seed" },
  { date: "2025-Q1", valuation: 12500000, label: "Current" },
  { date: "2025-Q3", valuation: 18000000, label: "Proj. Series A" },
];

export const MOCK_COMPS = [
  { company: "Acme AI", sector: "B2B SaaS", round: "Seed", valuation: 12000000, revenue: 500000, growth: 120, region: "North America" },
  { company: "FinFlow", sector: "Fintech", round: "Pre-Series A", valuation: 15000000, revenue: 800000, growth: 85, region: "Europe" },
  { company: "Healthify", sector: "HealthTech", round: "Seed", valuation: 9000000, revenue: 200000, growth: 200, region: "Asia Pacific" },
  { company: "LogiChain", sector: "Marketplace", round: "Series A", valuation: 28000000, revenue: 2500000, growth: 150, region: "North America" },
  { company: "SecureNet", sector: "DeepTech", round: "Seed", valuation: 18000000, revenue: 100000, growth: 50, region: "Israel" },
  { company: "EduLearn", sector: "EdTech", round: "Seed", valuation: 7500000, revenue: 150000, growth: 90, region: "Europe" },
  { company: "PropEstate", sector: "PropTech", round: "Series A", valuation: 22000000, revenue: 1800000, growth: 110, region: "North America" },
  { company: "GreenPower", sector: "ClimateTech", round: "Pre-Seed", valuation: 4500000, revenue: 0, growth: 0, region: "Europe" },
  { company: "BlockTrade", sector: "Web3/Crypto", round: "Series A", valuation: 40000000, revenue: 5000000, growth: 300, region: "Asia Pacific" },
  { company: "CyberGuard", sector: "Cybersecurity", round: "Pre-Series A", valuation: 16000000, revenue: 900000, growth: 70, region: "Israel" },
  { company: "ShopFast", sector: "E-commerce", round: "Seed", valuation: 6000000, revenue: 300000, growth: 60, region: "Latin America" },
  { company: "PayNow", sector: "Fintech", round: "Series B", valuation: 150000000, revenue: 12000000, growth: 130, region: "MENA" },
  { company: "FarmTech", sector: "AgriTech", round: "Seed", valuation: 5500000, revenue: 50000, growth: 40, region: "Africa" },
  { company: "MediCare", sector: "HealthTech", round: "Series A", valuation: 32000000, revenue: 3000000, growth: 180, region: "North America" },
  { company: "SaaSify", sector: "B2B SaaS", round: "Series A", valuation: 25000000, revenue: 2000000, growth: 100, region: "Europe" }
];

export const MOCK_METHODOLOGY_BREAKDOWN = [
  { name: "Venture Capital Method", value: 11000000, fill: "hsl(var(--chart-1))" },
  { name: "Scorecard Method", value: 13000000, fill: "hsl(var(--chart-2))" },
  { name: "Market Comparables", value: 12500000, fill: "hsl(var(--chart-3))" },
  { name: "Risk Factor Summation", value: 12000000, fill: "hsl(var(--chart-4))" },
  { name: "DCF", value: 10500000, fill: "hsl(var(--chart-5))" },
];

export const MOCK_MILESTONES = [
  { 
    title: "Product Launch v2.0", 
    date: "Dec 15, 2025", 
    impact: "High", 
    score: "+$2M",
    type: "past",
    description: "Successfully launched core platform with 99.9% uptime."
  },
  { 
    title: "Key Hire: CTO", 
    date: "Nov 20, 2025", 
    impact: "Medium", 
    score: "+$1.5M",
    type: "past",
    description: "Ex-Google engineering lead joined the founding team."
  },
  { 
    title: "Partnership with BigCorp", 
    date: "Oct 10, 2025", 
    impact: "High", 
    score: "+$3M",
    type: "past",
    description: "Signed LOI for pilot program with Fortune 500 partner."
  },
  {
    title: "Seed Round Close",
    date: "Aug 15, 2024",
    impact: "Critical",
    score: "$8.5M Valuation",
    type: "round",
    description: "Raised $1.5M led by EarlyBird VC."
  },
  { 
    title: "Achieve $1M ARR", 
    date: "Q3 2026 (Proj)", 
    impact: "High", 
    score: "Projected",
    type: "future",
    description: "Milestone for Series A readiness."
  },
  { 
    title: "Series A Fundraise", 
    date: "Q4 2026 (Proj)", 
    impact: "Critical", 
    score: "Target: $25M Val",
    type: "future",
    description: "Next major equity financing event."
  }
];

export const METHODOLOGY_DESCRIPTIONS = [
  {
    id: "blended",
    name: "Blended Approach",
    description: "Combines multiple methodologies for a balanced view.",
    details: "Recommended for most startups. Uses a weighted average of VC Method, Scorecard, and Market Comps to reduce bias.",
    suitableFor: "All stages"
  },
  {
    id: "vc_method",
    name: "Venture Capital Method",
    description: "Back-solves valuation based on expected investor ROI.",
    details: "Focuses on terminal value at exit and works backward to present day value based on required return rates.",
    suitableFor: "Pre-revenue to Series A"
  },
  {
    id: "market_comps",
    name: "Market Comparables",
    description: "Benchmarks against similar companies in your sector.",
    details: "Derives valuation multiples (e.g., Revenue Multiple) from public or private peer data.",
    suitableFor: "Revenue generating companies"
  },
  {
    id: "scorecard",
    name: "Scorecard Method",
    description: "Adjusts average valuations based on qualitative factors.",
    details: "Starts with an average pre-money valuation for your region/sector and adjusts up or down based on team, product, market size, etc.",
    suitableFor: "Early stage / Pre-seed"
  },
  {
    id: "dcf",
    name: "Discounted Cash Flow",
    description: "Projects future cash flows and discounts them to today.",
    details: "Highly sensitive to assumptions. Best for companies with predictable cash flows.",
    suitableFor: "Later stage / Mature"
  }
];
