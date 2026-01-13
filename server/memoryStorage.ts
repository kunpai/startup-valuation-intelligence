/**
 * In-Memory Storage Implementation
 * Perfect for Vercel deployments and local development
 * Data persists only for the lifetime of the server instance
 */

import {
    type Company,
    type InsertCompany,
    type ValuationSnapshot,
    type InsertValuationSnapshot,
    type Scenario,
    type InsertScenario,
    type Comparable,
    type InsertComparable,
    type CompanyMember,
    type InsertCompanyMember,
    type CompanyInvite,
    type InsertCompanyInvite
} from "@shared/schema";

// Generate unique IDs
function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Default user for non-authenticated mode
const DEFAULT_USER_ID = "demo-user";

export interface IStorage {
    // Companies (scoped by userId)
    getCompany(id: string, userId?: string): Promise<Company | undefined>;
    getCompaniesByUser(userId: string): Promise<Company[]>;
    createCompany(company: InsertCompany): Promise<Company>;
    updateCompany(id: string, userId: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
    deleteCompany(id: string, userId: string): Promise<boolean>;

    // Valuation Snapshots
    getSnapshot(id: string): Promise<ValuationSnapshot | undefined>;
    getSnapshotsByCompany(companyId: string): Promise<ValuationSnapshot[]>;
    createSnapshot(snapshot: InsertValuationSnapshot): Promise<ValuationSnapshot>;
    deleteSnapshot(id: string): Promise<boolean>;

    // Scenarios
    getScenario(id: string): Promise<Scenario | undefined>;
    getScenariosByCompany(companyId: string): Promise<Scenario[]>;
    createScenario(scenario: InsertScenario): Promise<Scenario>;
    updateScenario(id: string, scenario: Partial<InsertScenario>): Promise<Scenario | undefined>;
    deleteScenario(id: string): Promise<boolean>;

    // Comparables
    getComparable(id: string): Promise<Comparable | undefined>;
    getComparablesByCompany(companyId: string): Promise<Comparable[]>;
    getAllComparables(): Promise<Comparable[]>;
    createComparable(comparable: InsertComparable): Promise<Comparable>;
    updateComparable(id: string, comparable: Partial<InsertComparable>): Promise<Comparable | undefined>;
    deleteComparable(id: string): Promise<boolean>;

    // Team Members
    getCompanyMembers(companyId: string): Promise<CompanyMember[]>;
    addCompanyMember(member: InsertCompanyMember): Promise<CompanyMember>;
    removeCompanyMember(companyId: string, userId: string): Promise<boolean>;
    isCompanyMember(companyId: string, userId: string): Promise<boolean>;
    isCompanyOwner(companyId: string, userId: string): Promise<boolean>;
    hasCompanyAccess(companyId: string, userId: string): Promise<boolean>;

    // Invites
    getCompanyInvites(companyId: string): Promise<CompanyInvite[]>;
    getPendingInvitesByEmail(email: string): Promise<CompanyInvite[]>;
    getInviteByToken(token: string): Promise<CompanyInvite | undefined>;
    createInvite(invite: InsertCompanyInvite): Promise<CompanyInvite>;
    updateInviteStatus(id: string, status: string): Promise<CompanyInvite | undefined>;
    deleteInvite(id: string): Promise<boolean>;
}

class MemoryStorage implements IStorage {
    private companies: Map<string, Company> = new Map();
    private snapshots: Map<string, ValuationSnapshot> = new Map();
    private scenarios: Map<string, Scenario> = new Map();
    private comparables: Map<string, Comparable> = new Map();
    private members: Map<string, CompanyMember> = new Map();
    private invites: Map<string, CompanyInvite> = new Map();

    // Initialize with some demo data
    constructor() {
        this.seedDemoData();
    }

    private seedDemoData() {
        // Create a demo company
        const demoCompany: Company = {
            id: "demo-company-1",
            userId: DEFAULT_USER_ID,
            name: "TechStartup Inc",
            sector: "B2B SaaS",
            stage: "Seed",
            region: "North America",
            foundedYear: 2024,
            industryTags: ["Business Software Services", "SaaS"],
            technologyTags: ["AI / ML", "Cloud"],
            customerType: "B2B",
            revenueModel: "subscription",
            targetCustomerSize: "smb",
            country: "United States",
            description: "AI-powered productivity tools for startups",
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.companies.set(demoCompany.id, demoCompany);

        // Create a demo snapshot
        const demoSnapshot: ValuationSnapshot = {
            id: "demo-snapshot-1",
            companyId: "demo-company-1",
            revenue: 500000,
            growthRate: 100,
            lastRoundValuation: 5000000,
            burnRate: 50000,
            cashBalance: 1000000,
            teamScore: 80,
            productScore: 75,
            marketScore: 85,
            calculatedValuation: 8500000,
            selectedMethodology: "blended",
            snapshotName: "Q4 2024",
            createdAt: new Date(),
        };
        this.snapshots.set(demoSnapshot.id, demoSnapshot);
    }

    // Companies
    async getCompany(id: string, userId?: string): Promise<Company | undefined> {
        const company = this.companies.get(id);
        if (!company) return undefined;
        // In non-auth mode, return any company
        if (!userId) return company;
        // Check ownership or membership
        if (company.userId === userId) return company;
        if (await this.isCompanyMember(id, userId)) return company;
        return undefined;
    }

    async getCompaniesByUser(userId: string): Promise<Company[]> {
        const owned = Array.from(this.companies.values()).filter(c => c.userId === userId);
        const memberOf = Array.from(this.members.values())
            .filter(m => m.userId === userId)
            .map(m => this.companies.get(m.companyId))
            .filter((c): c is Company => c !== undefined);

        const allCompanies = [...owned, ...memberOf];
        const unique = allCompanies.filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);
        return unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async createCompany(insertCompany: InsertCompany): Promise<Company> {
        const company: Company = {
            ...insertCompany,
            id: generateId(),
            userId: insertCompany.userId || DEFAULT_USER_ID,
            industryTags: insertCompany.industryTags || null,
            technologyTags: insertCompany.technologyTags || null,
            customerType: insertCompany.customerType || null,
            revenueModel: insertCompany.revenueModel || null,
            targetCustomerSize: insertCompany.targetCustomerSize || null,
            country: insertCompany.country || null,
            description: insertCompany.description || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.companies.set(company.id, company);
        return company;
    }

    async updateCompany(id: string, userId: string, updateData: Partial<InsertCompany>): Promise<Company | undefined> {
        const company = this.companies.get(id);
        if (!company || company.userId !== userId) return undefined;
        const updated: Company = { ...company, ...updateData, updatedAt: new Date() };
        this.companies.set(id, updated);
        return updated;
    }

    async deleteCompany(id: string, userId: string): Promise<boolean> {
        const company = this.companies.get(id);
        if (!company || company.userId !== userId) return false;
        this.companies.delete(id);
        // Clean up related data
        for (const [key, snapshot] of this.snapshots) {
            if (snapshot.companyId === id) this.snapshots.delete(key);
        }
        for (const [key, scenario] of this.scenarios) {
            if (scenario.companyId === id) this.scenarios.delete(key);
        }
        return true;
    }

    // Snapshots
    async getSnapshot(id: string): Promise<ValuationSnapshot | undefined> {
        return this.snapshots.get(id);
    }

    async getSnapshotsByCompany(companyId: string): Promise<ValuationSnapshot[]> {
        return Array.from(this.snapshots.values())
            .filter(s => s.companyId === companyId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async createSnapshot(insertSnapshot: InsertValuationSnapshot): Promise<ValuationSnapshot> {
        const snapshot: ValuationSnapshot = {
            ...insertSnapshot,
            id: generateId(),
            calculatedValuation: insertSnapshot.calculatedValuation ?? null,
            selectedMethodology: insertSnapshot.selectedMethodology ?? "blended",
            snapshotName: insertSnapshot.snapshotName ?? null,
            createdAt: new Date(),
        };
        this.snapshots.set(snapshot.id, snapshot);
        return snapshot;
    }

    async deleteSnapshot(id: string): Promise<boolean> {
        return this.snapshots.delete(id);
    }

    // Scenarios
    async getScenario(id: string): Promise<Scenario | undefined> {
        return this.scenarios.get(id);
    }

    async getScenariosByCompany(companyId: string): Promise<Scenario[]> {
        return Array.from(this.scenarios.values())
            .filter(s => s.companyId === companyId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async createScenario(insertScenario: InsertScenario): Promise<Scenario> {
        const scenario: Scenario = {
            ...insertScenario,
            id: generateId(),
            description: insertScenario.description ?? null,
            exitValuation: insertScenario.exitValuation ?? null,
            exitYear: insertScenario.exitYear ?? null,
            assumptions: insertScenario.assumptions ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.scenarios.set(scenario.id, scenario);
        return scenario;
    }

    async updateScenario(id: string, updateData: Partial<InsertScenario>): Promise<Scenario | undefined> {
        const scenario = this.scenarios.get(id);
        if (!scenario) return undefined;
        const updated: Scenario = { ...scenario, ...updateData, updatedAt: new Date() };
        this.scenarios.set(id, updated);
        return updated;
    }

    async deleteScenario(id: string): Promise<boolean> {
        return this.scenarios.delete(id);
    }

    // Comparables
    async getComparable(id: string): Promise<Comparable | undefined> {
        return this.comparables.get(id);
    }

    async getComparablesByCompany(companyId: string): Promise<Comparable[]> {
        return Array.from(this.comparables.values())
            .filter(c => c.companyId === companyId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async getAllComparables(): Promise<Comparable[]> {
        return Array.from(this.comparables.values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async createComparable(insertComparable: InsertComparable): Promise<Comparable> {
        const revenueMultiple = insertComparable.revenue && insertComparable.valuation
            ? insertComparable.valuation / insertComparable.revenue
            : null;

        const comparable: Comparable = {
            ...insertComparable,
            id: generateId(),
            companyId: insertComparable.companyId ?? null,
            region: insertComparable.region ?? null,
            revenue: insertComparable.revenue ?? null,
            valuation: insertComparable.valuation ?? null,
            growthRate: insertComparable.growthRate ?? null,
            fundingRound: insertComparable.fundingRound ?? null,
            revenueMultiple,
            source: insertComparable.source ?? null,
            isUserAdded: insertComparable.isUserAdded ?? 1,
            createdAt: new Date(),
        };
        this.comparables.set(comparable.id, comparable);
        return comparable;
    }

    async updateComparable(id: string, updateData: Partial<InsertComparable>): Promise<Comparable | undefined> {
        const comparable = this.comparables.get(id);
        if (!comparable) return undefined;
        const updated: Comparable = { ...comparable, ...updateData };
        this.comparables.set(id, updated);
        return updated;
    }

    async deleteComparable(id: string): Promise<boolean> {
        return this.comparables.delete(id);
    }

    // Team Members
    async getCompanyMembers(companyId: string): Promise<CompanyMember[]> {
        return Array.from(this.members.values())
            .filter(m => m.companyId === companyId)
            .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
    }

    async addCompanyMember(member: InsertCompanyMember): Promise<CompanyMember> {
        const newMember: CompanyMember = {
            ...member,
            id: generateId(),
            role: member.role || "member",
            joinedAt: new Date(),
        };
        this.members.set(newMember.id, newMember);
        return newMember;
    }

    async removeCompanyMember(companyId: string, userId: string): Promise<boolean> {
        for (const [key, member] of this.members) {
            if (member.companyId === companyId && member.userId === userId) {
                this.members.delete(key);
                return true;
            }
        }
        return false;
    }

    async isCompanyMember(companyId: string, userId: string): Promise<boolean> {
        return Array.from(this.members.values()).some(m => m.companyId === companyId && m.userId === userId);
    }

    async isCompanyOwner(companyId: string, userId: string): Promise<boolean> {
        const company = this.companies.get(companyId);
        return company?.userId === userId;
    }

    async hasCompanyAccess(companyId: string, userId: string): Promise<boolean> {
        if (await this.isCompanyOwner(companyId, userId)) return true;
        return await this.isCompanyMember(companyId, userId);
    }

    // Invites
    async getCompanyInvites(companyId: string): Promise<CompanyInvite[]> {
        return Array.from(this.invites.values())
            .filter(i => i.companyId === companyId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async getPendingInvitesByEmail(email: string): Promise<CompanyInvite[]> {
        return Array.from(this.invites.values())
            .filter(i => i.inviteEmail === email && i.status === "pending");
    }

    async getInviteByToken(token: string): Promise<CompanyInvite | undefined> {
        return Array.from(this.invites.values()).find(i => i.inviteToken === token);
    }

    async createInvite(invite: InsertCompanyInvite): Promise<CompanyInvite> {
        const newInvite: CompanyInvite = {
            ...invite,
            id: generateId(),
            status: invite.status || "pending",
            createdAt: new Date(),
        };
        this.invites.set(newInvite.id, newInvite);
        return newInvite;
    }

    async updateInviteStatus(id: string, status: string): Promise<CompanyInvite | undefined> {
        const invite = this.invites.get(id);
        if (!invite) return undefined;
        const updated: CompanyInvite = { ...invite, status };
        this.invites.set(id, updated);
        return updated;
    }

    async deleteInvite(id: string): Promise<boolean> {
        return this.invites.delete(id);
    }
}

export const storage = new MemoryStorage();
export const DEFAULT_USER = DEFAULT_USER_ID;
