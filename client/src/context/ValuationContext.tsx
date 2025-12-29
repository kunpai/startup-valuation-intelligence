import { createContext, useContext, useState, type ReactNode } from 'react';
import { SECTORS, STAGES, REGIONS } from '@/lib/constants';

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

interface ValuationContextType {
  isDemoMode: boolean;
  companyProfile: CompanyProfile;
  financials: Financials;
  qualitative: QualitativeScores;
  valuationHistory: ValuationHistoryItem[];
  selectedMethodology: string;
  setDemoMode: (isDemo: boolean) => void;
  updateProfile: (data: Partial<CompanyProfile>) => void;
  updateFinancials: (data: Partial<Financials>) => void;
  updateQualitative: (data: Partial<QualitativeScores>) => void;
  updateHistory: (data: ValuationHistoryItem[]) => void;
  setMethodology: (method: string) => void;
  completeOnboarding: () => void;
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
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(DEFAULT_PROFILE);
  const [financials, setFinancials] = useState<Financials>(DEFAULT_FINANCIALS);
  const [qualitative, setQualitative] = useState<QualitativeScores>(DEFAULT_QUALITATIVE);
  const [valuationHistory, setValuationHistory] = useState<ValuationHistoryItem[]>([]);
  const [selectedMethodology, setSelectedMethodology] = useState<string>("blended");

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

  const completeOnboarding = () => {
    setIsDemoMode(false);
  };

  const resetData = () => {
    setIsDemoMode(true);
    setCompanyProfile(DEFAULT_PROFILE);
    setFinancials(DEFAULT_FINANCIALS);
    setQualitative(DEFAULT_QUALITATIVE);
    setValuationHistory([]);
    setSelectedMethodology("blended");
  };

  return (
    <ValuationContext.Provider value={{
      isDemoMode,
      companyProfile,
      financials,
      qualitative,
      valuationHistory,
      selectedMethodology,
      setDemoMode: setIsDemoMode,
      updateProfile,
      updateFinancials,
      updateQualitative,
      updateHistory,
      setMethodology,
      completeOnboarding,
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
