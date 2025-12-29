import type { Company, InsertCompany, ValuationSnapshot, InsertValuationSnapshot, Scenario, InsertScenario } from "@shared/schema";

const API_BASE = "/api";

// Helper to handle 401 errors by redirecting to login
async function handleResponse<T>(res: Response, errorMessage: string): Promise<T> {
  if (res.status === 401) {
    window.location.href = "/api/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(errorMessage);
  return res.json();
}

// Companies API
export const companiesApi = {
  getAll: async (): Promise<Company[]> => {
    const res = await fetch(`${API_BASE}/companies`, { credentials: "include" });
    return handleResponse(res, "Failed to fetch companies");
  },
  
  getById: async (id: string): Promise<Company> => {
    const res = await fetch(`${API_BASE}/companies/${id}`, { credentials: "include" });
    return handleResponse(res, "Failed to fetch company");
  },
  
  create: async (data: Omit<InsertCompany, 'userId'>): Promise<Company> => {
    const res = await fetch(`${API_BASE}/companies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse(res, "Failed to create company");
  },
  
  update: async (id: string, data: Partial<InsertCompany>): Promise<Company> => {
    const res = await fetch(`${API_BASE}/companies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse(res, "Failed to update company");
  },
  
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/companies/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.status === 401) {
      window.location.href = "/api/login";
      throw new Error("Unauthorized");
    }
    if (!res.ok) throw new Error("Failed to delete company");
  },
};

// Snapshots API
export const snapshotsApi = {
  getByCompany: async (companyId: string): Promise<ValuationSnapshot[]> => {
    const res = await fetch(`${API_BASE}/companies/${companyId}/snapshots`, { credentials: "include" });
    return handleResponse(res, "Failed to fetch snapshots");
  },
  
  getById: async (id: string): Promise<ValuationSnapshot> => {
    const res = await fetch(`${API_BASE}/snapshots/${id}`, { credentials: "include" });
    return handleResponse(res, "Failed to fetch snapshot");
  },
  
  create: async (data: InsertValuationSnapshot): Promise<ValuationSnapshot> => {
    const res = await fetch(`${API_BASE}/snapshots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse(res, "Failed to create snapshot");
  },
  
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/snapshots/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.status === 401) {
      window.location.href = "/api/login";
      throw new Error("Unauthorized");
    }
    if (!res.ok) throw new Error("Failed to delete snapshot");
  },
};

// Scenarios API (company-scoped for data isolation)
export const scenariosApi = {
  getByCompany: async (companyId: string): Promise<Scenario[]> => {
    const res = await fetch(`${API_BASE}/companies/${companyId}/scenarios`, { credentials: "include" });
    return handleResponse(res, "Failed to fetch scenarios");
  },
  
  getById: async (id: string): Promise<Scenario> => {
    const res = await fetch(`${API_BASE}/scenarios/${id}`, { credentials: "include" });
    return handleResponse(res, "Failed to fetch scenario");
  },
  
  create: async (companyId: string, data: Omit<InsertScenario, 'companyId'>): Promise<Scenario> => {
    const res = await fetch(`${API_BASE}/companies/${companyId}/scenarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, companyId }),
      credentials: "include",
    });
    return handleResponse(res, "Failed to create scenario");
  },
  
  update: async (companyId: string, id: string, data: Partial<InsertScenario>): Promise<Scenario> => {
    const res = await fetch(`${API_BASE}/companies/${companyId}/scenarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse(res, "Failed to update scenario");
  },
  
  delete: async (companyId: string, id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/companies/${companyId}/scenarios/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.status === 401) {
      window.location.href = "/api/login";
      throw new Error("Unauthorized");
    }
    if (!res.ok) throw new Error("Failed to delete scenario");
  },
};
