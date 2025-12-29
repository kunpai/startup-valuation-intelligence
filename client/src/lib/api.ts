import type { Company, InsertCompany, ValuationSnapshot, InsertValuationSnapshot, Scenario, InsertScenario } from "@shared/schema";

const API_BASE = "/api";

// Companies API
export const companiesApi = {
  getAll: async (): Promise<Company[]> => {
    const res = await fetch(`${API_BASE}/companies`);
    if (!res.ok) throw new Error("Failed to fetch companies");
    return res.json();
  },
  
  getById: async (id: string): Promise<Company> => {
    const res = await fetch(`${API_BASE}/companies/${id}`);
    if (!res.ok) throw new Error("Failed to fetch company");
    return res.json();
  },
  
  create: async (data: InsertCompany): Promise<Company> => {
    const res = await fetch(`${API_BASE}/companies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create company");
    return res.json();
  },
  
  update: async (id: string, data: Partial<InsertCompany>): Promise<Company> => {
    const res = await fetch(`${API_BASE}/companies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update company");
    return res.json();
  },
  
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/companies/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete company");
  },
};

// Snapshots API
export const snapshotsApi = {
  getByCompany: async (companyId: string): Promise<ValuationSnapshot[]> => {
    const res = await fetch(`${API_BASE}/companies/${companyId}/snapshots`);
    if (!res.ok) throw new Error("Failed to fetch snapshots");
    return res.json();
  },
  
  getById: async (id: string): Promise<ValuationSnapshot> => {
    const res = await fetch(`${API_BASE}/snapshots/${id}`);
    if (!res.ok) throw new Error("Failed to fetch snapshot");
    return res.json();
  },
  
  create: async (data: InsertValuationSnapshot): Promise<ValuationSnapshot> => {
    const res = await fetch(`${API_BASE}/snapshots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create snapshot");
    return res.json();
  },
  
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/snapshots/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete snapshot");
  },
};

// Scenarios API (company-scoped for data isolation)
export const scenariosApi = {
  getByCompany: async (companyId: string): Promise<Scenario[]> => {
    const res = await fetch(`${API_BASE}/companies/${companyId}/scenarios`);
    if (!res.ok) throw new Error("Failed to fetch scenarios");
    return res.json();
  },
  
  getById: async (id: string): Promise<Scenario> => {
    const res = await fetch(`${API_BASE}/scenarios/${id}`);
    if (!res.ok) throw new Error("Failed to fetch scenario");
    return res.json();
  },
  
  create: async (companyId: string, data: Omit<InsertScenario, 'companyId'>): Promise<Scenario> => {
    const res = await fetch(`${API_BASE}/companies/${companyId}/scenarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, companyId }),
    });
    if (!res.ok) throw new Error("Failed to create scenario");
    return res.json();
  },
  
  update: async (companyId: string, id: string, data: Partial<InsertScenario>): Promise<Scenario> => {
    const res = await fetch(`${API_BASE}/companies/${companyId}/scenarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update scenario");
    return res.json();
  },
  
  delete: async (companyId: string, id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/companies/${companyId}/scenarios/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete scenario");
  },
};
