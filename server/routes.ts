import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCompanySchema, insertValuationSnapshotSchema, insertScenarioSchema, insertComparableSchema } from "@shared/schema";
import { registerMiraRoutes } from "./mira";
import { calculateValuation, type ValuationInput } from "./valuation";
import { isAuthenticated } from "./replit_integrations/auth";
import crypto from "crypto";

// Get user email from authenticated request
function getUserEmail(req: Express.Request): string {
  const user = req.user as any;
  return user?.claims?.email || "";
}

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

  // ==================== Team Management ====================
  
  // Get team members for a company (owner only)
  app.get("/api/companies/:companyId/team", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const company = await storage.getCompany(req.params.companyId, userId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      const members = await storage.getCompanyMembers(req.params.companyId);
      const invites = await storage.getCompanyInvites(req.params.companyId);
      
      res.json({ 
        members, 
        invites: invites.filter(i => i.status === "pending"),
        owner: { userId: company.userId }
      });
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ error: "Failed to fetch team" });
    }
  });
  
  // Send invite to join company (owner only)
  app.post("/api/companies/:companyId/invites", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const company = await storage.getCompany(req.params.companyId, userId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      // Generate unique invite token
      const inviteToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      const invite = await storage.createInvite({
        companyId: req.params.companyId,
        invitedBy: userId,
        inviteEmail: email,
        inviteToken,
        status: "pending",
        expiresAt
      });
      
      res.status(201).json(invite);
    } catch (error) {
      console.error("Error creating invite:", error);
      res.status(500).json({ error: "Failed to create invite" });
    }
  });
  
  // Cancel/delete invite (owner only)
  app.delete("/api/companies/:companyId/invites/:inviteId", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const company = await storage.getCompany(req.params.companyId, userId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      const success = await storage.deleteInvite(req.params.inviteId);
      if (!success) {
        return res.status(404).json({ error: "Invite not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting invite:", error);
      res.status(500).json({ error: "Failed to delete invite" });
    }
  });
  
  // Get pending invites for current user (by email)
  app.get("/api/invites/pending", isAuthenticated, async (req, res) => {
    try {
      const email = getUserEmail(req);
      if (!email) {
        return res.json([]);
      }
      
      const invites = await storage.getPendingInvitesByEmail(email);
      res.json(invites);
    } catch (error) {
      console.error("Error fetching pending invites:", error);
      res.status(500).json({ error: "Failed to fetch invites" });
    }
  });
  
  // Accept invite by token
  app.post("/api/invites/:token/accept", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const email = getUserEmail(req);
      
      const invite = await storage.getInviteByToken(req.params.token);
      if (!invite) {
        return res.status(404).json({ error: "Invite not found" });
      }
      
      if (invite.status !== "pending") {
        return res.status(400).json({ error: "Invite is no longer valid" });
      }
      
      if (new Date() > invite.expiresAt) {
        await storage.updateInviteStatus(invite.id, "expired");
        return res.status(400).json({ error: "Invite has expired" });
      }
      
      // Verify email matches
      if (invite.inviteEmail.toLowerCase() !== email.toLowerCase()) {
        return res.status(403).json({ error: "This invite is for a different email address" });
      }
      
      // Check if already a member
      const alreadyMember = await storage.isCompanyMember(invite.companyId, userId);
      if (alreadyMember) {
        await storage.updateInviteStatus(invite.id, "accepted");
        return res.json({ message: "Already a team member" });
      }
      
      // Add as member
      await storage.addCompanyMember({
        companyId: invite.companyId,
        userId,
        role: "member"
      });
      
      // Mark invite as accepted
      await storage.updateInviteStatus(invite.id, "accepted");
      
      res.json({ message: "Successfully joined the team", companyId: invite.companyId });
    } catch (error) {
      console.error("Error accepting invite:", error);
      res.status(500).json({ error: "Failed to accept invite" });
    }
  });
  
  // Remove team member (owner only)
  app.delete("/api/companies/:companyId/team/:memberId", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const company = await storage.getCompany(req.params.companyId, userId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      const success = await storage.removeCompanyMember(req.params.companyId, req.params.memberId);
      if (!success) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error removing member:", error);
      res.status(500).json({ error: "Failed to remove member" });
    }
  });

  return httpServer;
}
