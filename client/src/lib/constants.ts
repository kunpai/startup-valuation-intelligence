
export const SECTORS = [
  "B2B SaaS",
  "Fintech",
  "Marketplace",
  "E-commerce",
  "HealthTech",
  "DeepTech",
  "Web3/Crypto",
  "Consumer App",
];

export const STAGES = [
  "Pre-Seed",
  "Seed",
  "Pre-Series A",
  "Series A",
  "Series B",
  "Series C+",
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
  {
    company: "Acme AI",
    sector: "B2B SaaS",
    round: "Seed",
    valuation: 12000000,
    revenue: 500000,
    growth: 120,
    region: "North America",
  },
  {
    company: "FinFlow",
    sector: "Fintech",
    round: "Pre-Series A",
    valuation: 15000000,
    revenue: 800000,
    growth: 85,
    region: "Europe",
  },
  {
    company: "Healthify",
    sector: "HealthTech",
    round: "Seed",
    valuation: 9000000,
    revenue: 200000,
    growth: 200,
    region: "Asia Pacific",
  },
  {
    company: "LogiChain",
    sector: "Marketplace",
    round: "Series A",
    valuation: 28000000,
    revenue: 2500000,
    growth: 150,
    region: "North America",
  },
  {
    company: "SecureNet",
    sector: "DeepTech",
    round: "Seed",
    valuation: 18000000,
    revenue: 100000,
    growth: 50,
    region: "Israel",
  },
];

export const MOCK_METHODOLOGY_BREAKDOWN = [
  { name: "Venture Capital Method", value: 11000000, fill: "hsl(var(--chart-1))" },
  { name: "Scorecard Method", value: 13000000, fill: "hsl(var(--chart-2))" },
  { name: "Market Comparables", value: 12500000, fill: "hsl(var(--chart-3))" },
  { name: "Risk Factor Summation", value: 12000000, fill: "hsl(var(--chart-4))" },
  { name: "DCF", value: 10500000, fill: "hsl(var(--chart-5))" },
];
