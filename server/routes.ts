import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCompanySchema, insertValuationSnapshotSchema, insertScenarioSchema, insertComparableSchema } from "@shared/schema";
import { registerMiraRoutes } from "./mira";
import { calculateValuation, type ValuationInput } from "./valuation";
import { isAuthenticated } from "./replit_integrations/auth";

// Helper to get userId from authenticated request
function getUserId(req: Express.Request): string {
  const user = req.user as any;
  return user?.claims?.sub || "";
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Register Mira AI routes
  registerMiraRoutes(app);
  
  // ==================== Companies (authenticated, user-scoped) ====================
  
  // Get all companies for current user
  app.get("/api/companies", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const companies = await storage.getCompaniesByUser(userId);
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });
  
  // Get single company (user-scoped)
  app.get("/api/companies/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const company = await storage.getCompany(req.params.id, userId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ error: "Failed to fetch company" });
    }
  });
  
  // Create company (assign to current user)
  app.post("/api/companies", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const validatedData = insertCompanySchema.parse({
        ...req.body,
        userId
      });
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(400).json({ error: "Invalid company data" });
    }
  });
  
  // Update company (user-scoped)
  app.patch("/api/companies/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const company = await storage.updateCompany(req.params.id, userId, req.body);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ error: "Failed to update company" });
    }
  });
  
  // Delete company (user-scoped)
  app.delete("/api/companies/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const success = await storage.deleteCompany(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ error: "Failed to delete company" });
    }
  });
  
  // ==================== Valuation Snapshots ====================
  
  // Get snapshots for a company
  app.get("/api/companies/:companyId/snapshots", isAuthenticated, async (req, res) => {
    try {
      // First verify user owns this company
      const userId = getUserId(req);
      const company = await storage.getCompany(req.params.companyId, userId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      const snapshots = await storage.getSnapshotsByCompany(req.params.companyId);
      res.json(snapshots);
    } catch (error) {
      console.error("Error fetching snapshots:", error);
      res.status(500).json({ error: "Failed to fetch snapshots" });
    }
  });
  
  // Get single snapshot
  app.get("/api/snapshots/:id", isAuthenticated, async (req, res) => {
    try {
      const snapshot = await storage.getSnapshot(req.params.id);
      if (!snapshot) {
        return res.status(404).json({ error: "Snapshot not found" });
      }
      
      // Verify user owns the company this snapshot belongs to
      const userId = getUserId(req);
      const company = await storage.getCompany(snapshot.companyId, userId);
      if (!company) {
        return res.status(404).json({ error: "Snapshot not found" });
      }
      
      res.json(snapshot);
    } catch (error) {
      console.error("Error fetching snapshot:", error);
      res.status(500).json({ error: "Failed to fetch snapshot" });
    }
  });
  
  // Create snapshot
  app.post("/api/snapshots", isAuthenticated, async (req, res) => {
    try {
      // Verify user owns the company
      const userId = getUserId(req);
      const company = await storage.getCompany(req.body.companyId, userId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      const validatedData = insertValuationSnapshotSchema.parse(req.body);
      const snapshot = await storage.createSnapshot(validatedData);
      res.status(201).json(snapshot);
    } catch (error) {
      console.error("Error creating snapshot:", error);
      res.status(400).json({ error: "Invalid snapshot data" });
    }
  });
  
  // Delete snapshot
  app.delete("/api/snapshots/:id", isAuthenticated, async (req, res) => {
    try {
      const snapshot = await storage.getSnapshot(req.params.id);
      if (!snapshot) {
        return res.status(404).json({ error: "Snapshot not found" });
      }
      
      // Verify user owns the company
      const userId = getUserId(req);
      const company = await storage.getCompany(snapshot.companyId, userId);
      if (!company) {
        return res.status(404).json({ error: "Snapshot not found" });
      }
      
      const success = await storage.deleteSnapshot(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Snapshot not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting snapshot:", error);
      res.status(500).json({ error: "Failed to delete snapshot" });
    }
  });
  
  // ==================== Scenarios (company-scoped) ====================
  
  // Get scenarios for a company
  app.get("/api/companies/:companyId/scenarios", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const company = await storage.getCompany(req.params.companyId, userId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      const scenarios = await storage.getScenariosByCompany(req.params.companyId);
      res.json(scenarios);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      res.status(500).json({ error: "Failed to fetch scenarios" });
    }
  });
  
  // Create scenario for a company
  app.post("/api/companies/:companyId/scenarios", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const company = await storage.getCompany(req.params.companyId, userId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      const validatedData = insertScenarioSchema.parse({
        ...req.body,
        companyId: req.params.companyId
      });
      const scenario = await storage.createScenario(validatedData);
      res.status(201).json(scenario);
    } catch (error) {
      console.error("Error creating scenario:", error);
      res.status(400).json({ error: "Invalid scenario data" });
    }
  });
  
  // Update scenario for a company
  app.patch("/api/companies/:companyId/scenarios/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const company = await storage.getCompany(req.params.companyId, userId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      const scenario = await storage.updateScenario(req.params.id, req.body);
      if (!scenario) {
        return res.status(404).json({ error: "Scenario not found" });
      }
      res.json(scenario);
    } catch (error) {
      console.error("Error updating scenario:", error);
      res.status(500).json({ error: "Failed to update scenario" });
    }
  });
  
  // Delete scenario for a company
  app.delete("/api/companies/:companyId/scenarios/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const company = await storage.getCompany(req.params.companyId, userId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      const success = await storage.deleteScenario(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Scenario not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting scenario:", error);
      res.status(500).json({ error: "Failed to delete scenario" });
    }
  });
  
  // ==================== Comparables ====================
  
  // Get comparables for a company (company-scoped)
  app.get("/api/companies/:companyId/comparables", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const company = await storage.getCompany(req.params.companyId, userId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      const comparables = await storage.getComparablesByCompany(req.params.companyId);
      res.json(comparables);
    } catch (error) {
      console.error("Error fetching comparables:", error);
      res.status(500).json({ error: "Failed to fetch comparables" });
    }
  });
  
  // Create comparable for a company (company-scoped)
  app.post("/api/companies/:companyId/comparables", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const company = await storage.getCompany(req.params.companyId, userId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      const validatedData = insertComparableSchema.parse({
        ...req.body,
        companyId: req.params.companyId
      });
      const comparable = await storage.createComparable(validatedData);
      res.status(201).json(comparable);
    } catch (error) {
      console.error("Error creating comparable:", error);
      res.status(400).json({ error: "Invalid comparable data" });
    }
  });
  
  // Delete comparable for a company (company-scoped)
  app.delete("/api/companies/:companyId/comparables/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const company = await storage.getCompany(req.params.companyId, userId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      const success = await storage.deleteComparable(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Comparable not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting comparable:", error);
      res.status(500).json({ error: "Failed to delete comparable" });
    }
  });
  
  // ==================== Valuation Calculation ====================
  
  // Calculate valuation with real formulas (authenticated but not user-scoped - pure calculation)
  app.post("/api/calculate-valuation", isAuthenticated, async (req, res) => {
    try {
      const input: ValuationInput = req.body;
      const result = calculateValuation(input);
      res.json(result);
    } catch (error) {
      console.error("Error calculating valuation:", error);
      res.status(500).json({ error: "Failed to calculate valuation" });
    }
  });

  return httpServer;
}
