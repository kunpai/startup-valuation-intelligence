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

function extractIndustries(tags: Array<{ display_value: string; type: string }>): string[] {
  // Get all industry and technology tags for better matching
  return tags
    .filter(t => t.type === "INDUSTRY" || t.type === "MARKET_VERTICAL" || t.type === "TECHNOLOGY")
    .map(t => t.display_value);
}

function extractPrimaryIndustry(tags: Array<{ display_value: string; type: string }>): string | null {
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

interface TransformedCompanyInternal extends CompanySearchResult {
  allIndustries: string[];
}

function transformCompany(company: HarmonicCompany): TransformedCompanyInternal {
  return {
    id: company.entity_urn,
    name: company.name,
    description: company.description,
    sector: extractPrimaryIndustry(company.tags || []),
    stage: mapStage(company.funding?.funding_stage || company.stage),
    region: mapRegion(company.location),
    valuation: null,
    fundingTotal: company.funding?.funding_total || null,
    lastFundingRound: company.funding?.last_funding_type || null,
    headcount: company.headcount,
    website: company.website?.domain || null,
    logoUrl: company.logo_url,
    allIndustries: extractIndustries(company.tags || []),
  };
}

export interface CompanySearchOptions {
  sector?: string;
  stage?: string;
  region?: string;
  limit?: number;
  // New Harmonic-aligned fields for better matching
  industryTags?: string[];
  technologyTags?: string[];
  customerType?: string;
  country?: string;
}

export async function searchCompanies(options: CompanySearchOptions): Promise<CompanySearchResult[]> {
  if (!HARMONIC_API_KEY) {
    console.error("HARMONIC_API_KEY not configured");
    return [];
  }

  const { limit = 20 } = options;
  
  // Request many more than needed since we'll filter client-side
  // Harmonic API returns companies globally, filtering is aggressive
  const fetchSize = 200;

  try {
    console.log("[harmonic] Searching with options:", options);
    
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
            page_size: fetchSize
          }
        }
      }),
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error("[harmonic] Search failed:", errorText);
      return [];
    }

    const searchData = await searchResponse.json() as { results: string[], count: number };
    console.log(`[harmonic] Search returned ${searchData.results?.length || 0} URNs from ${searchData.count} total`);
    
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
      const errorText = await batchResponse.text();
      console.error("[harmonic] Batch get failed:", errorText);
      return [];
    }

    const companies = await batchResponse.json() as HarmonicCompany[];
    console.log(`[harmonic] Got ${companies.length} company details`);
    
    let results = companies.map(transformCompany);
    console.log(`[harmonic] Sample company:`, {
      name: results[0]?.name,
      sector: results[0]?.sector,
      stage: results[0]?.stage,
      region: results[0]?.region,
      allIndustries: results[0]?.allIndustries,
    });

    // Client-side filtering using Harmonic-aligned tags
    // Priority: use industryTags/technologyTags if provided, fall back to sector mapping
    if (options.industryTags?.length || options.technologyTags?.length) {
      const beforeCount = results.length;
      const allRequestedTags = [
        ...(options.industryTags || []),
        ...(options.technologyTags || [])
      ].map(t => t.toLowerCase());
      
      results = results.filter(c => {
        const companyTags = c.allIndustries.map((t: string) => t.toLowerCase());
        // Match if company has at least one of the requested tags
        return allRequestedTags.some(tag => 
          companyTags.some((ct: string) => ct.includes(tag) || tag.includes(ct))
        );
      });
      console.log(`[harmonic] Tag filter: ${beforeCount} -> ${results.length} (tags: ${allRequestedTags.join(', ')})`);
    } else if (options.sector) {
      // Legacy sector filtering for backward compatibility
      const sectorKeywords = getSectorKeywords(options.sector);
      const beforeCount = results.length;
      results = results.filter(c => {
        const allTags = c.allIndustries.join(' ').toLowerCase();
        return sectorKeywords.some(keyword => 
          allTags.includes(keyword.toLowerCase())
        );
      });
      console.log(`[harmonic] Sector filter: ${beforeCount} -> ${results.length} (keywords: ${sectorKeywords.join(', ')})`);
    }

    if (options.stage) {
      const beforeCount = results.length;
      // Map our stage format to Harmonic format for matching
      const stageVariants = getStageVariants(options.stage);
      results = results.filter(c => stageVariants.includes(c.stage || ''));
      console.log(`[harmonic] Stage filter: ${beforeCount} -> ${results.length} (looking for: ${stageVariants.join(', ')})`);
    }

    // Country takes priority over region for more precise matching
    if (options.country) {
      const beforeCount = results.length;
      // Keep country filter relaxed - just log but don't filter too aggressively
      // since region data is less reliable
      console.log(`[harmonic] Country preference: ${options.country} (not filtering strictly)`);
    } else if (options.region) {
      const beforeCount = results.length;
      results = results.filter(c => c.region === options.region);
      console.log(`[harmonic] Region filter: ${beforeCount} -> ${results.length}`);
    }

    console.log(`[harmonic] Final results: ${results.length}`);
    
    // Return without internal allIndustries field
    return results.slice(0, limit).map(({ allIndustries, ...rest }) => rest);
  } catch (error) {
    console.error("[harmonic] API error:", error);
    return [];
  }
}

function getStageVariants(stage: string): string[] {
  // Return all possible stage names that match the given stage
  const stageMap: Record<string, string[]> = {
    "Pre-Seed": ["Pre-Seed", "PRE_SEED"],
    "Seed": ["Seed", "SEED"],
    "Series A": ["Series A", "SERIES_A"],
    "Series B": ["Series B", "SERIES_B"],
    "Series C": ["Series C", "Series C+", "SERIES_C"],
    "Series C+": ["Series C+", "Series D", "SERIES_C", "SERIES_D", "SERIES_E", "Late Stage", "Growth"],
    "Late Stage": ["Late Stage", "Growth", "LATE_STAGE", "GROWTH"],
  };
  return stageMap[stage] || [stage];
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

export interface CompanyNameSearchResult {
  id: string;
  name: string;
  description: string | null;
  sector: string | null;
  stage: string | null;
  region: string | null;
  country: string | null;
  fundingTotal: number | null;
  lastFundingRound: string | null;
  headcount: number | null;
  website: string | null;
  logoUrl: string | null;
  industryTags: string[];
  technologyTags: string[];
  customerType: string | null;
  foundedYear: number | null;
}

function transformToNameSearchResult(company: HarmonicCompany): CompanyNameSearchResult {
  const industryTags = (company.tags || [])
    .filter(t => t.type === "INDUSTRY" || t.type === "MARKET_VERTICAL")
    .map(t => t.display_value);
  
  const technologyTags = (company.tags || [])
    .filter(t => t.type === "TECHNOLOGY")
    .map(t => t.display_value);

  return {
    id: company.entity_urn,
    name: company.name,
    description: company.description,
    sector: extractPrimaryIndustry(company.tags || []),
    stage: mapStage(company.funding?.funding_stage || company.stage),
    region: mapRegion(company.location),
    country: company.location?.country || null,
    fundingTotal: company.funding?.funding_total || null,
    lastFundingRound: company.funding?.last_funding_type || null,
    headcount: company.headcount,
    website: company.website?.domain || null,
    logoUrl: company.logo_url,
    industryTags,
    technologyTags,
    customerType: company.customer_type,
    foundedYear: null, // Harmonic doesn't seem to return this directly
  };
}

// Fast lookup by company domain using GET endpoint
export async function getCompanyByDomain(domain: string): Promise<CompanyNameSearchResult | null> {
  if (!HARMONIC_API_KEY) {
    console.error("HARMONIC_API_KEY not configured");
    return null;
  }

  // Clean domain input
  let cleanDomain = domain.trim().toLowerCase();
  // Remove http(s):// if present
  cleanDomain = cleanDomain.replace(/^https?:\/\//, "");
  // Remove www. if present
  cleanDomain = cleanDomain.replace(/^www\./, "");
  // Remove trailing slash and path
  cleanDomain = cleanDomain.split("/")[0];

  if (!cleanDomain || cleanDomain.length < 4 || !cleanDomain.includes(".")) {
    return null;
  }

  try {
    console.log(`[harmonic] Looking up company by domain: "${cleanDomain}"`);
    
    // Use GET endpoint with website_domain query parameter
    const response = await fetch(`${HARMONIC_BASE_URL}/companies?website_domain=${encodeURIComponent(cleanDomain)}`, {
      method: "GET",
      headers: {
        "apikey": HARMONIC_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[harmonic] Domain lookup returned ${response.status}: ${errorText}`);
      return null;
    }

    const company = await response.json() as HarmonicCompany;
    if (!company || !company.name) {
      console.log(`[harmonic] No company found for domain: ${cleanDomain}`);
      return null;
    }

    console.log(`[harmonic] Found company by domain: ${company.name}`);
    return transformToNameSearchResult(company);
  } catch (error) {
    console.error("[harmonic] Domain lookup error:", error);
    return null;
  }
}

// Search companies by domain - fetches companies and filters by website match
export async function searchCompaniesByName(query: string, limit: number = 10): Promise<CompanyNameSearchResult[]> {
  if (!HARMONIC_API_KEY) {
    console.error("HARMONIC_API_KEY not configured");
    return [];
  }

  if (!query || query.trim().length < 3) {
    return [];
  }

  let searchTerm = query.trim().toLowerCase();
  // Remove common prefixes
  searchTerm = searchTerm.replace(/^https?:\/\//, "").replace(/^www\./, "");
  
  // Only proceed if it looks like a domain (has a dot)
  if (!searchTerm.includes(".")) {
    return [];
  }

  // Extract domain without TLD for matching (e.g., "stripe" from "stripe.com")
  const domainBase = searchTerm.split(".")[0];
  
  try {
    console.log(`[harmonic] Looking up by domain: "${searchTerm}" (base: ${domainBase})`);
    
    // Fetch companies and filter by domain match
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
            page_size: 200
          }
        }
      }),
    });

    if (!searchResponse.ok) {
      console.error("[harmonic] Domain search failed");
      return [];
    }

    const searchData = await searchResponse.json() as { results: string[], count: number };
    
    if (!searchData.results || searchData.results.length === 0) {
      return [];
    }

    // Get company details
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
      return [];
    }

    const companies = await batchResponse.json() as HarmonicCompany[];
    
    // Filter by DOMAIN match (not name match)
    const results = companies
      .filter(c => {
        const website = c.website?.domain?.toLowerCase() || "";
        // Match if website contains the domain or domain base
        return website.includes(searchTerm) || 
               website.includes(domainBase) ||
               website === domainBase ||
               c.name?.toLowerCase() === domainBase;
      })
      .map(transformToNameSearchResult)
      .slice(0, limit);

    console.log(`[harmonic] Found ${results.length} companies matching domain "${searchTerm}"`);
    return results;
  } catch (error) {
    console.error("[harmonic] Domain search error:", error);
    return [];
  }
}
