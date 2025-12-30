const HARMONIC_API_KEY = process.env.HARMONIC_API_KEY;
const HARMONIC_BASE_URL = "https://api.harmonic.ai";

export interface HarmonicCompany {
  entity_urn: string;
  name: string;
  description: string | null;
  customer_type: string | null;
  stage: string | null;
  location: {
    country: string | null;
    city: string | null;
  } | null;
  headcount: number | null;
  funding: {
    funding_total: number | null;
    last_funding_type: string | null;
    last_funding_total: number | null;
    funding_stage: string | null;
  } | null;
  tags: Array<{
    display_value: string;
    type: string;
  }>;
  website: {
    domain: string | null;
  } | null;
  logo_url: string | null;
}

export interface CompanySearchResult {
  id: string;
  name: string;
  description: string | null;
  sector: string | null;
  stage: string | null;
  region: string | null;
  valuation: number | null;
  fundingTotal: number | null;
  lastFundingRound: string | null;
  headcount: number | null;
  website: string | null;
  logoUrl: string | null;
}

function mapStage(harmonicStage: string | null): string {
  if (!harmonicStage) return "Unknown";
  const stageMap: Record<string, string> = {
    "PRE_SEED": "Pre-Seed",
    "SEED": "Seed",
    "SERIES_A": "Series A",
    "SERIES_B": "Series B",
    "SERIES_C": "Series C+",
    "SERIES_D": "Series C+",
    "SERIES_E": "Series C+",
    "LATE_STAGE": "Series C+",
    "GROWTH": "Series C+",
  };
  return stageMap[harmonicStage] || harmonicStage;
}

function extractIndustry(tags: Array<{ display_value: string; type: string }>): string | null {
  const industryTag = tags.find(t => t.type === "INDUSTRY" || t.type === "MARKET_VERTICAL");
  return industryTag?.display_value || null;
}

function mapRegion(location: { country: string | null } | null): string {
  if (!location?.country) return "Unknown";
  const country = location.country;
  
  if (["United States", "Canada"].includes(country)) return "North America";
  if (["United Kingdom", "Germany", "France", "Spain", "Italy", "Netherlands", "Sweden", "Norway", "Denmark", "Finland", "Switzerland", "Austria", "Belgium", "Ireland", "Portugal"].includes(country)) return "Europe";
  if (["China", "Japan", "South Korea", "India", "Singapore", "Australia", "New Zealand", "Indonesia", "Thailand", "Vietnam", "Philippines", "Malaysia"].includes(country)) return "Asia Pacific";
  if (["Brazil", "Mexico", "Argentina", "Chile", "Colombia", "Peru"].includes(country)) return "Latin America";
  if (["United Arab Emirates", "Saudi Arabia", "Israel", "Turkey", "Egypt", "Qatar", "Kuwait"].includes(country)) return "MENA";
  if (["Nigeria", "South Africa", "Kenya", "Ghana", "Rwanda"].includes(country)) return "Africa";
  
  return "Other";
}

function transformCompany(company: HarmonicCompany): CompanySearchResult {
  return {
    id: company.entity_urn,
    name: company.name,
    description: company.description,
    sector: extractIndustry(company.tags || []),
    stage: mapStage(company.funding?.funding_stage || company.stage),
    region: mapRegion(company.location),
    valuation: null,
    fundingTotal: company.funding?.funding_total || null,
    lastFundingRound: company.funding?.last_funding_type || null,
    headcount: company.headcount,
    website: company.website?.domain || null,
    logoUrl: company.logo_url,
  };
}

export async function searchCompanies(options: {
  sector?: string;
  stage?: string;
  region?: string;
  limit?: number;
}): Promise<CompanySearchResult[]> {
  if (!HARMONIC_API_KEY) {
    console.error("HARMONIC_API_KEY not configured");
    return [];
  }

  const { limit = 20 } = options;

  try {
    const searchResponse = await fetch(`${HARMONIC_BASE_URL}/search/companies`, {
      method: "POST",
      headers: {
        "apikey": HARMONIC_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          filter_group: {
            filters: [],
            join_operator: "and"
          },
          pagination: {
            page_size: limit
          }
        }
      }),
    });

    if (!searchResponse.ok) {
      console.error("Harmonic search failed:", await searchResponse.text());
      return [];
    }

    const searchData = await searchResponse.json() as { results: string[] };
    
    if (!searchData.results || searchData.results.length === 0) {
      return [];
    }

    const batchResponse = await fetch(`${HARMONIC_BASE_URL}/companies/batchGet`, {
      method: "POST",
      headers: {
        "apikey": HARMONIC_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        urns: searchData.results,
      }),
    });

    if (!batchResponse.ok) {
      console.error("Harmonic batch get failed:", await batchResponse.text());
      return [];
    }

    const companies = await batchResponse.json() as HarmonicCompany[];
    
    let results = companies.map(transformCompany);

    if (options.sector) {
      const sectorKeywords = getSectorKeywords(options.sector);
      results = results.filter(c => 
        c.sector && sectorKeywords.some(keyword => 
          c.sector!.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    if (options.stage) {
      results = results.filter(c => c.stage === options.stage);
    }

    if (options.region) {
      results = results.filter(c => c.region === options.region);
    }

    return results.slice(0, limit);
  } catch (error) {
    console.error("Harmonic API error:", error);
    return [];
  }
}

function getSectorKeywords(sector: string): string[] {
  const sectorMap: Record<string, string[]> = {
    "B2B SaaS": ["SaaS", "Software", "Business Software", "Enterprise"],
    "Fintech": ["Fintech", "Financial", "Payments", "Banking", "Insurance"],
    "Marketplace": ["Marketplace", "E-commerce", "Commerce"],
    "E-commerce": ["E-commerce", "Commerce", "Retail", "DTC"],
    "HealthTech": ["Health", "Healthcare", "Medical", "Biotech"],
    "DeepTech": ["AI / ML", "Deep Tech", "Machine Learning", "Robotics"],
    "Web3/Crypto": ["Web3", "Crypto", "Blockchain", "DeFi"],
    "Consumer App": ["Consumer", "Mobile App", "Social"],
    "EdTech": ["Education", "EdTech", "Learning"],
    "PropTech": ["Real Estate", "PropTech", "Property"],
    "ClimateTech": ["Climate", "Clean Energy", "Sustainability", "Green"],
    "Cybersecurity": ["Security", "Cybersecurity", "Privacy"],
  };
  return sectorMap[sector] || [sector];
}

export async function getCompanyByDomain(domain: string): Promise<CompanySearchResult | null> {
  if (!HARMONIC_API_KEY) {
    console.error("HARMONIC_API_KEY not configured");
    return null;
  }

  try {
    const response = await fetch(`${HARMONIC_BASE_URL}/companies`, {
      method: "POST",
      headers: {
        "apikey": HARMONIC_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apikey: HARMONIC_API_KEY,
        website_domain: domain,
      }),
    });

    if (!response.ok) {
      console.error("Harmonic company lookup failed:", await response.text());
      return null;
    }

    const data = await response.json() as { results?: HarmonicCompany[] };
    
    if (data.results && data.results.length > 0) {
      return transformCompany(data.results[0]);
    }

    return null;
  } catch (error) {
    console.error("Harmonic API error:", error);
    return null;
  }
}
