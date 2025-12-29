import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { companiesApi, snapshotsApi, scenariosApi } from '@/lib/api';
import type { Company, ValuationSnapshot } from '@shared/schema';

interface CompanyProfile {
  name: string;
  sector: string;
  stage: string;
  region: string;
  foundedYear: number;
}

interface Financials {
  revenue: number;
  growthRate: number;
  lastRoundValuation: number;
  burnRate: number;
  cashBalance: number;
}

interface QualitativeScores {
  team: number;
  product: number;
  market: number;
}

interface ValuationHistoryItem {
  round: string;
  date: string;
  amount: number;
  valuation: number;
}

interface OnboardingData {
  profile: CompanyProfile;
  financials: Financials;
  qualitative: QualitativeScores;
  methodology: string;
}

interface ValuationContextType {
  isDemoMode: boolean;
  currentCompanyId: string | null;
  companyProfile: CompanyProfile;
  financials: Financials;
  qualitative: QualitativeScores;
  valuationHistory: ValuationHistoryItem[];
  selectedMethodology: string;
  calculatedValuation: number | null;
  setDemoMode: (isDemo: boolean) => void;
  updateProfile: (data: Partial<CompanyProfile>) => void;
  updateFinancials: (data: Partial<Financials>) => void;
  updateQualitative: (data: Partial<QualitativeScores>) => void;
  updateHistory: (data: ValuationHistoryItem[]) => void;
  setMethodology: (method: string) => void;
  setCalculatedValuation: (value: number) => void;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  saveValuation: (snapshotName?: string) => Promise<void>;
  resetData: () => void;
}

const DEFAULT_PROFILE: CompanyProfile = {
  name: "Acme AI",
  sector: "B2B SaaS",
  stage: "Seed",
  region: "North America",
  foundedYear: 2023
};

const DEFAULT_FINANCIALS: Financials = {
  revenue: 600000,
  growthRate: 15,
  lastRoundValuation: 8500000,
  burnRate: 50000,
  cashBalance: 1200000
};

const DEFAULT_QUALITATIVE: QualitativeScores = {
  team: 80,
  product: 75,
  market: 85
};

const ValuationContext = createContext<ValuationContextType | undefined>(undefined);

export function ValuationProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(DEFAULT_PROFILE);
  const [financials, setFinancials] = useState<Financials>(DEFAULT_FINANCIALS);
  const [qualitative, setQualitative] = useState<QualitativeScores>(DEFAULT_QUALITATIVE);
  const [valuationHistory, setValuationHistory] = useState<ValuationHistoryItem[]>([]);
  const [selectedMethodology, setSelectedMethodology] = useState<string>("blended");
  const [calculatedValuation, setCalculatedValuation] = useState<number | null>(null);

  // Load existing company data on mount
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const companies = await companiesApi.getAll();
        if (companies.length > 0) {
          // Load the first company (in a real app, we'd have company selection)
          const company = companies[0];
          setCurrentCompanyId(company.id);
          setCompanyProfile({
            name: company.name,
            sector: company.sector,
            stage: company.stage,
            region: company.region,
            foundedYear: company.foundedYear
          });
          setIsDemoMode(false);
          
          // Load snapshots for this company
          const snapshots = await snapshotsApi.getByCompany(company.id);
          if (snapshots.length > 0) {
            const latest = snapshots[0]; // Most recent snapshot
            setFinancials({
              revenue: latest.revenue,
              growthRate: latest.growthRate,
              lastRoundValuation: latest.lastRoundValuation,
              burnRate: latest.burnRate,
              cashBalance: latest.cashBalance
            });
            setQualitative({
              team: latest.teamScore,
              product: latest.productScore,
              market: latest.marketScore
            });
            if (latest.calculatedValuation) {
              setCalculatedValuation(latest.calculatedValuation);
            }
            if (latest.selectedMethodology) {
              setSelectedMethodology(latest.selectedMethodology);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load company data:", error);
        // Stay in demo mode if loading fails
      }
    };
    
    loadCompanyData();
  }, []);

  const updateProfile = (data: Partial<CompanyProfile>) => {
    setCompanyProfile(prev => ({ ...prev, ...data }));
  };

  const updateFinancials = (data: Partial<Financials>) => {
    setFinancials(prev => ({ ...prev, ...data }));
  };

  const updateQualitative = (data: Partial<QualitativeScores>) => {
    setQualitative(prev => ({ ...prev, ...data }));
  };

  const updateHistory = (data: ValuationHistoryItem[]) => {
    setValuationHistory(data);
  };

  const setMethodology = (method: string) => {
    setSelectedMethodology(method);
  };

  const completeOnboarding = async (data: OnboardingData) => {
    try {
      // Update local state first
      setCompanyProfile(data.profile);
      setFinancials(data.financials);
      setQualitative(data.qualitative);
      setSelectedMethodology(data.methodology);
      
      // Create company in database with provided data
      const company = await companiesApi.create({
        name: data.profile.name,
        sector: data.profile.sector,
        stage: data.profile.stage,
        region: data.profile.region,
        foundedYear: data.profile.foundedYear
      });
      
      setCurrentCompanyId(company.id);
      setIsDemoMode(false);
      
      // Create initial snapshot with provided data
      await snapshotsApi.create({
        companyId: company.id,
        revenue: data.financials.revenue,
        growthRate: data.financials.growthRate,
        lastRoundValuation: data.financials.lastRoundValuation,
        burnRate: data.financials.burnRate,
        cashBalance: data.financials.cashBalance,
        teamScore: data.qualitative.team,
        productScore: data.qualitative.product,
        marketScore: data.qualitative.market,
        calculatedValuation: null,
        selectedMethodology: data.methodology,
        snapshotName: "Initial Setup"
      });
    } catch (error) {
      console.error("Failed to save company profile:", error);
      // Still complete onboarding even if save fails
      setIsDemoMode(false);
    }
  };

  const saveValuationSnapshot = async (companyId: string, snapshotName?: string) => {
    try {
      await snapshotsApi.create({
        companyId,
        revenue: financials.revenue,
        growthRate: financials.growthRate,
        lastRoundValuation: financials.lastRoundValuation,
        burnRate: financials.burnRate,
        cashBalance: financials.cashBalance,
        teamScore: qualitative.team,
        productScore: qualitative.product,
        marketScore: qualitative.market,
        calculatedValuation,
        selectedMethodology,
        snapshotName
      });
    } catch (error) {
      console.error("Failed to save valuation snapshot:", error);
      throw error;
    }
  };

  const saveValuation = async (snapshotName?: string) => {
    if (!currentCompanyId) {
      console.error("No company selected");
      return;
    }
    
    await saveValuationSnapshot(currentCompanyId, snapshotName);
  };

  const resetData = () => {
    setIsDemoMode(true);
    setCurrentCompanyId(null);
    setCompanyProfile(DEFAULT_PROFILE);
    setFinancials(DEFAULT_FINANCIALS);
    setQualitative(DEFAULT_QUALITATIVE);
    setValuationHistory([]);
    setSelectedMethodology("blended");
    setCalculatedValuation(null);
  };

  return (
    <ValuationContext.Provider value={{
      isDemoMode,
      currentCompanyId,
      companyProfile,
      financials,
      qualitative,
      valuationHistory,
      selectedMethodology,
      calculatedValuation,
      setDemoMode: setIsDemoMode,
      updateProfile,
      updateFinancials,
      updateQualitative,
      updateHistory,
      setMethodology,
      setCalculatedValuation,
      completeOnboarding,
      saveValuation,
      resetData
    }}>
      {children}
    </ValuationContext.Provider>
  );
}

export function useValuation() {
  const context = useContext(ValuationContext);
  if (context === undefined) {
    throw new Error('useValuation must be used within a ValuationProvider');
  }
  return context;
}
