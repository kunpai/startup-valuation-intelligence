/**
 * Startup Valuation Engine
 * 
 * Implements four core valuation methodologies:
 * 1. Venture Capital Method - Back-calculates from expected exit value
 * 2. Scorecard Method - Adjusts baseline valuation based on qualitative factors
 * 3. Market Comparables - Uses revenue multiples from similar companies
 * 4. Discounted Cash Flow (DCF) - Projects future cash flows (simplified for early stage)
 */

export interface ValuationInput {
  // Financials
  revenue: number;
  growthRate: number; // Percentage (e.g., 50 for 50%)
  burnRate: number;
  cashBalance: number;
  lastRoundValuation: number;
  
  // Qualitative scores (0-100)
  teamScore: number;
  productScore: number;
  marketScore: number;
  
  // Company info
  stage: string;
  sector: string;
  
  // Optional: comparable multiples (if user has them)
  comparableMultiples?: number[];
  
  // Weights for blending (defaults provided)
  weights?: {
    vcMethod: number;
    scorecard: number;
    comparables: number;
    dcf: number;
  };
}

export interface ValuationResult {
  blendedValuation: number;
  methodologies: {
    vcMethod: { value: number; weight: number; details: string };
    scorecard: { value: number; weight: number; details: string };
    comparables: { value: number; weight: number; details: string };
    dcf: { value: number; weight: number; details: string };
  };
  confidenceScore: number;
  range: { low: number; high: number };
  insights: string[];
}

// Stage-based default multiples and weights
const STAGE_DEFAULTS: Record<string, { multiple: number; vcWeight: number; scorecardWeight: number; compsWeight: number; dcfWeight: number }> = {
  "Pre-Seed": { multiple: 15, vcWeight: 0.3, scorecardWeight: 0.5, compsWeight: 0.15, dcfWeight: 0.05 },
  "Seed": { multiple: 12, vcWeight: 0.3, scorecardWeight: 0.4, compsWeight: 0.2, dcfWeight: 0.1 },
  "Pre-Series A": { multiple: 10, vcWeight: 0.25, scorecardWeight: 0.35, compsWeight: 0.25, dcfWeight: 0.15 },
  "Series A": { multiple: 8, vcWeight: 0.2, scorecardWeight: 0.25, compsWeight: 0.3, dcfWeight: 0.25 },
  "Series B": { multiple: 6, vcWeight: 0.15, scorecardWeight: 0.2, compsWeight: 0.35, dcfWeight: 0.3 },
  "Series C+": { multiple: 5, vcWeight: 0.1, scorecardWeight: 0.15, compsWeight: 0.35, dcfWeight: 0.4 },
};

// Sector-based adjustments
const SECTOR_MULTIPLES: Record<string, number> = {
  "B2B SaaS": 1.2,
  "Fintech": 1.1,
  "HealthTech": 1.15,
  "DeepTech": 1.3,
  "Web3/Crypto": 1.25,
  "Cybersecurity": 1.2,
  "E-commerce": 0.9,
  "Consumer App": 0.85,
  "EdTech": 0.95,
  "Marketplace": 1.0,
  "PropTech": 0.95,
  "ClimateTech": 1.1,
};

/**
 * Venture Capital Method
 * 
 * Formula: Pre-Money = (Exit Value / Target Multiple) - Investment
 * Simplified: Uses expected exit multiple and required return
 */
function calculateVCMethod(input: ValuationInput): number {
  const targetROI = 10; // VCs typically want 10x return
  const yearsToExit = 7;
  const annualGrowth = Math.min(input.growthRate / 100, 1.5); // Cap at 150%
  
  // Project revenue at exit
  const projectedRevenue = input.revenue * Math.pow(1 + annualGrowth, yearsToExit);
  
  // Get exit multiple based on stage (mature companies have lower multiples)
  const exitMultiple = STAGE_DEFAULTS[input.stage]?.multiple || 8;
  const sectorAdjustment = SECTOR_MULTIPLES[input.sector] || 1.0;
  
  // Exit valuation
  const exitValuation = projectedRevenue * exitMultiple * sectorAdjustment;
  
  // Back-calculate to present value
  const presentValue = exitValuation / Math.pow(targetROI, yearsToExit / 5);
  
  // Minimum floor based on last round
  return Math.max(presentValue, input.lastRoundValuation * 1.1);
}

/**
 * Scorecard Method
 * 
 * Adjusts a base valuation by qualitative factors:
 * - Team: 30% weight
 * - Market: 25% weight
 * - Product: 25% weight
 * - Growth Traction: 20% weight
 */
function calculateScorecardMethod(input: ValuationInput): number {
  // Base valuation (median for stage)
  const baseValuations: Record<string, number> = {
    "Pre-Seed": 2000000,
    "Seed": 6000000,
    "Pre-Series A": 12000000,
    "Series A": 20000000,
    "Series B": 50000000,
    "Series C+": 100000000,
  };
  
  const baseValuation = baseValuations[input.stage] || 10000000;
  
  // Calculate weighted adjustment factor
  // Each score is out of 100, we convert to multiplier (0.5 to 1.5 range)
  const teamFactor = 0.5 + (input.teamScore / 100);
  const marketFactor = 0.5 + (input.marketScore / 100);
  const productFactor = 0.5 + (input.productScore / 100);
  
  // Growth traction factor based on growth rate
  const growthFactor = input.growthRate > 100 ? 1.5 : 
                       input.growthRate > 50 ? 1.25 :
                       input.growthRate > 20 ? 1.0 :
                       input.growthRate > 0 ? 0.85 : 0.7;
  
  // Weighted combination
  const adjustmentFactor = (
    (teamFactor * 0.30) +
    (marketFactor * 0.25) +
    (productFactor * 0.25) +
    (growthFactor * 0.20)
  );
  
  // Apply sector adjustment
  const sectorAdjustment = SECTOR_MULTIPLES[input.sector] || 1.0;
  
  return baseValuation * adjustmentFactor * sectorAdjustment;
}

/**
 * Market Comparables Method
 * 
 * Uses revenue multiples from similar companies
 */
function calculateComparablesMethod(input: ValuationInput): number {
  // Default multiples by stage if no comparables provided
  const defaultMultiples: Record<string, number> = {
    "Pre-Seed": 20,
    "Seed": 15,
    "Pre-Series A": 12,
    "Series A": 10,
    "Series B": 8,
    "Series C+": 6,
  };
  
  let multiple: number;
  
  if (input.comparableMultiples && input.comparableMultiples.length > 0) {
    // Use median of provided comparables
    const sorted = [...input.comparableMultiples].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    multiple = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    multiple = defaultMultiples[input.stage] || 10;
  }
  
  // Apply sector adjustment
  const sectorAdjustment = SECTOR_MULTIPLES[input.sector] || 1.0;
  
  // For pre-revenue companies, use a minimum floor
  const effectiveRevenue = Math.max(input.revenue, 100000);
  
  return effectiveRevenue * multiple * sectorAdjustment;
}

/**
 * Simplified DCF Method
 * 
 * Projects cash flows for 5 years with terminal value
 * Simplified for early-stage companies with high uncertainty
 */
function calculateDCFMethod(input: ValuationInput): number {
  const discountRate = 0.35; // 35% for early-stage (high risk)
  const terminalGrowthRate = 0.03; // 3% perpetual growth
  const projectionYears = 5;
  
  // Project revenues
  const growthRate = Math.min(input.growthRate / 100, 1.0); // Cap at 100%
  const projectedRevenues: number[] = [];
  
  for (let year = 1; year <= projectionYears; year++) {
    const decayedGrowth = growthRate * Math.pow(0.8, year - 1); // Growth decays over time
    const previousRevenue = year === 1 ? input.revenue : projectedRevenues[year - 2];
    projectedRevenues.push(previousRevenue * (1 + decayedGrowth));
  }
  
  // Assume profit margin improves over time (typical for growing startups)
  const margins = [0.05, 0.10, 0.15, 0.20, 0.25]; // 5% to 25% over 5 years
  
  // Calculate free cash flows
  const cashFlows = projectedRevenues.map((rev, i) => rev * margins[i]);
  
  // Discount cash flows
  const discountedCashFlows = cashFlows.map((cf, i) => 
    cf / Math.pow(1 + discountRate, i + 1)
  );
  
  // Terminal value (Gordon Growth Model)
  const terminalCashFlow = cashFlows[projectionYears - 1] * (1 + terminalGrowthRate);
  const terminalValue = terminalCashFlow / (discountRate - terminalGrowthRate);
  const discountedTerminalValue = terminalValue / Math.pow(1 + discountRate, projectionYears);
  
  // Sum of discounted values
  const dcfValue = discountedCashFlows.reduce((sum, cf) => sum + cf, 0) + discountedTerminalValue;
  
  // Floor at last round valuation (can't be worth less than previous round)
  return Math.max(dcfValue, input.lastRoundValuation * 0.9);
}

/**
 * Calculate confidence score based on data quality
 */
function calculateConfidenceScore(input: ValuationInput): number {
  let score = 50; // Base score
  
  // Revenue quality
  if (input.revenue > 0) score += 15;
  if (input.revenue > 500000) score += 10;
  
  // Growth data
  if (input.growthRate > 0) score += 10;
  
  // Qualitative data completeness
  if (input.teamScore > 0 && input.productScore > 0 && input.marketScore > 0) score += 10;
  
  // Comparable data
  if (input.comparableMultiples && input.comparableMultiples.length >= 3) score += 10;
  
  // Previous round validation
  if (input.lastRoundValuation > 0) score += 5;
  
  return Math.min(score, 100);
}

/**
 * Main valuation calculation function
 */
export function calculateValuation(input: ValuationInput): ValuationResult {
  // Get stage-based weights or use defaults
  const stageDefaults = STAGE_DEFAULTS[input.stage] || STAGE_DEFAULTS["Seed"];
  
  const weights = input.weights || {
    vcMethod: stageDefaults.vcWeight,
    scorecard: stageDefaults.scorecardWeight,
    comparables: stageDefaults.compsWeight,
    dcf: stageDefaults.dcfWeight,
  };
  
  // Calculate each methodology
  const vcValue = calculateVCMethod(input);
  const scorecardValue = calculateScorecardMethod(input);
  const comparablesValue = calculateComparablesMethod(input);
  const dcfValue = calculateDCFMethod(input);
  
  // Calculate blended valuation
  const blendedValuation = 
    (vcValue * weights.vcMethod) +
    (scorecardValue * weights.scorecard) +
    (comparablesValue * weights.comparables) +
    (dcfValue * weights.dcf);
  
  // Calculate range (±20% of blended)
  const range = {
    low: blendedValuation * 0.8,
    high: blendedValuation * 1.2,
  };
  
  // Generate insights
  const insights: string[] = [];
  
  if (input.growthRate > 100) {
    insights.push("Your exceptional growth rate significantly boosts your valuation across all methods.");
  } else if (input.growthRate < 20) {
    insights.push("Increasing your growth rate would have the biggest impact on your valuation.");
  }
  
  if (input.teamScore < 60) {
    insights.push("Strengthening your team's credentials could add 15-25% to your scorecard valuation.");
  }
  
  if (input.revenue < 100000 && input.stage !== "Pre-Seed") {
    insights.push("Pre-revenue companies rely heavily on qualitative factors. Focus on traction metrics.");
  }
  
  const highestMethod = Math.max(vcValue, scorecardValue, comparablesValue, dcfValue);
  const lowestMethod = Math.min(vcValue, scorecardValue, comparablesValue, dcfValue);
  
  if (highestMethod > lowestMethod * 2) {
    insights.push("There's significant variance between valuation methods, suggesting high uncertainty.");
  }
  
  return {
    blendedValuation: Math.round(blendedValuation),
    methodologies: {
      vcMethod: { 
        value: Math.round(vcValue), 
        weight: weights.vcMethod,
        details: `Based on ${7}-year exit projection with ${10}x target ROI`
      },
      scorecard: { 
        value: Math.round(scorecardValue), 
        weight: weights.scorecard,
        details: `Team: ${input.teamScore}/100, Market: ${input.marketScore}/100, Product: ${input.productScore}/100`
      },
      comparables: { 
        value: Math.round(comparablesValue), 
        weight: weights.comparables,
        details: `Using ${input.comparableMultiples?.length || 'default'} comparable companies`
      },
      dcf: { 
        value: Math.round(dcfValue), 
        weight: weights.dcf,
        details: `5-year projection with 35% discount rate`
      },
    },
    confidenceScore: calculateConfidenceScore(input),
    range,
    insights,
  };
}
