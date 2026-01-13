import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, DEFAULT_USER } from "./memoryStorage";
import { insertCompanySchema, insertValuationSnapshotSchema, insertScenarioSchema, insertComparableSchema } from "@shared/schema";
import { registerMiraRoutes } from "./mira";
import { calculateValuation, type ValuationInput } from "./valuation";
import { searchCompanies, getCompanyByDomain, searchCompaniesByName } from "./harmonic";
import crypto from "crypto";

// Default user ID for non-authenticated mode
const getUserId = () => DEFAULT_USER;
const getUserEmail = () => "demo@example.com";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Register Mira AI routes
  registerMiraRoutes(app);

  // ==================== Companies ====================

  // Get all companies for current user
  app.get("/api/companies", async (req, res) => {
    try {
      const userId = getUserId();
      const companies = await storage.getCompaniesByUser(userId);
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  // Get single company
  app.get("/api/companies/:id", async (req, res) => {
    try {
      const userId = getUserId();
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

  // Create company
  app.post("/api/companies", async (req, res) => {
    try {
      const userId = getUserId();
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

  // Update company
  app.patch("/api/companies/:id", async (req, res) => {
    try {
      const userId = getUserId();
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

  // Delete company
  app.delete("/api/companies/:id", async (req, res) => {
    try {
      const userId = getUserId();
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
  app.get("/api/companies/:companyId/snapshots", async (req, res) => {
    try {
      const snapshots = await storage.getSnapshotsByCompany(req.params.companyId);
      res.json(snapshots);
    } catch (error) {
      console.error("Error fetching snapshots:", error);
      res.status(500).json({ error: "Failed to fetch snapshots" });
    }
  });

  // Get single snapshot
  app.get("/api/snapshots/:id", async (req, res) => {
    try {
      const snapshot = await storage.getSnapshot(req.params.id);
      if (!snapshot) {
        return res.status(404).json({ error: "Snapshot not found" });
      }
      res.json(snapshot);
    } catch (error) {
      console.error("Error fetching snapshot:", error);
      res.status(500).json({ error: "Failed to fetch snapshot" });
    }
  });

  // Create snapshot
  app.post("/api/snapshots", async (req, res) => {
    try {
      const validatedData = insertValuationSnapshotSchema.parse(req.body);
      const snapshot = await storage.createSnapshot(validatedData);
      res.status(201).json(snapshot);
    } catch (error) {
      console.error("Error creating snapshot:", error);
      res.status(400).json({ error: "Invalid snapshot data" });
    }
  });

  // Delete snapshot
  app.delete("/api/snapshots/:id", async (req, res) => {
    try {
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

  // ==================== Scenarios ====================

  // Get scenarios for a company
  app.get("/api/companies/:companyId/scenarios", async (req, res) => {
    try {
      const scenarios = await storage.getScenariosByCompany(req.params.companyId);
      res.json(scenarios);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      res.status(500).json({ error: "Failed to fetch scenarios" });
    }
  });

  // Create scenario for a company
  app.post("/api/companies/:companyId/scenarios", async (req, res) => {
    try {
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
  app.patch("/api/companies/:companyId/scenarios/:id", async (req, res) => {
    try {
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
  app.delete("/api/companies/:companyId/scenarios/:id", async (req, res) => {
    try {
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

  // Get comparables for a company
  app.get("/api/companies/:companyId/comparables", async (req, res) => {
    try {
      const comparables = await storage.getComparablesByCompany(req.params.companyId);
      res.json(comparables);
    } catch (error) {
      console.error("Error fetching comparables:", error);
      res.status(500).json({ error: "Failed to fetch comparables" });
    }
  });

  // Create comparable for a company
  app.post("/api/companies/:companyId/comparables", async (req, res) => {
    try {
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

  // Delete comparable for a company
  app.delete("/api/companies/:companyId/comparables/:id", async (req, res) => {
    try {
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

  // Calculate valuation with real formulas
  app.post("/api/calculate-valuation", async (req, res) => {
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

  // Get team members for a company
  app.get("/api/companies/:companyId/team", async (req, res) => {
    try {
      const userId = getUserId();
      const members = await storage.getCompanyMembers(req.params.companyId);
      const invites = await storage.getCompanyInvites(req.params.companyId);

      res.json({
        members,
        invites: invites.filter(i => i.status === "pending"),
        owner: { userId }
      });
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ error: "Failed to fetch team" });
    }
  });

  // Send invite to join company
  app.post("/api/companies/:companyId/invites", async (req, res) => {
    try {
      const userId = getUserId();
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const inviteToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

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

  // Cancel/delete invite
  app.delete("/api/companies/:companyId/invites/:inviteId", async (req, res) => {
    try {
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

  // Get pending invites for current user
  app.get("/api/invites/pending", async (req, res) => {
    try {
      const email = getUserEmail();
      const invites = await storage.getPendingInvitesByEmail(email);
      res.json(invites);
    } catch (error) {
      console.error("Error fetching pending invites:", error);
      res.status(500).json({ error: "Failed to fetch invites" });
    }
  });

  // Accept invite by token
  app.post("/api/invites/:token/accept", async (req, res) => {
    try {
      const userId = getUserId();
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

      const alreadyMember = await storage.isCompanyMember(invite.companyId, userId);
      if (alreadyMember) {
        await storage.updateInviteStatus(invite.id, "accepted");
        return res.json({ message: "Already a team member" });
      }

      await storage.addCompanyMember({
        companyId: invite.companyId,
        userId,
        role: "member"
      });

      await storage.updateInviteStatus(invite.id, "accepted");

      res.json({ message: "Successfully joined the team", companyId: invite.companyId });
    } catch (error) {
      console.error("Error accepting invite:", error);
      res.status(500).json({ error: "Failed to accept invite" });
    }
  });

  // Remove team member
  app.delete("/api/companies/:companyId/team/:memberId", async (req, res) => {
    try {
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

  // ==================== Market Comparables (Harmonic API) ====================

  // Search for comparable companies
  app.get("/api/harmonic/search", async (req, res) => {
    try {
      const { sector, stage, region, limit, industryTags, technologyTags, customerType, country } = req.query;

      const parsedIndustryTags = industryTags
        ? (Array.isArray(industryTags) ? industryTags as string[] : (industryTags as string).split(','))
        : undefined;
      const parsedTechnologyTags = technologyTags
        ? (Array.isArray(technologyTags) ? technologyTags as string[] : (technologyTags as string).split(','))
        : undefined;

      const results = await searchCompanies({
        sector: sector as string | undefined,
        stage: stage as string | undefined,
        region: region as string | undefined,
        limit: limit ? parseInt(limit as string) : 20,
        industryTags: parsedIndustryTags,
        technologyTags: parsedTechnologyTags,
        customerType: customerType as string | undefined,
        country: country as string | undefined,
      });

      res.json(results);
    } catch (error) {
      console.error("Error searching Harmonic:", error);
      res.status(500).json({ error: "Failed to search comparable companies" });
    }
  });

  // Lookup company by domain
  app.get("/api/harmonic/company", async (req, res) => {
    try {
      const { domain } = req.query;

      if (!domain) {
        return res.status(400).json({ error: "Domain is required" });
      }

      const company = await getCompanyByDomain(domain as string);

      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      res.json(company);
    } catch (error) {
      console.error("Error looking up company:", error);
      res.status(500).json({ error: "Failed to lookup company" });
    }
  });

  // Search companies by name
  app.get("/api/harmonic/search-by-name", async (req, res) => {
    try {
      const { q, limit } = req.query;

      if (!q || typeof q !== 'string' || q.trim().length < 2) {
        return res.json([]);
      }

      const results = await searchCompaniesByName(q, limit ? parseInt(limit as string) : 10);
      res.json(results);
    } catch (error) {
      console.error("Error searching companies by name:", error);
      res.status(500).json({ error: "Failed to search companies" });
    }
  });

  // ==================== Auth (simplified for no-auth mode) ====================

  // Return a demo user for all auth requests
  app.get("/api/auth/user", (req, res) => {
    res.json({
      id: DEFAULT_USER,
      email: "demo@example.com",
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: null,
    });
  });

  // Login just redirects to home
  app.get("/api/login", (req, res) => {
    res.redirect("/");
  });

  // Logout just redirects to home
  app.get("/api/logout", (req, res) => {
    res.redirect("/");
  });

  return httpServer;
}
