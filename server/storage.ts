// Blueprint reference: javascript_database
import { 
  companies,
  valuationSnapshots,
  scenarios,
  comparables,
  companyMembers,
  companyInvites,
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
import { db } from "./db";
import { eq, desc, and, or } from "drizzle-orm";

export interface IStorage {
  // Companies (scoped by userId)
  getCompany(id: string, userId: string): Promise<Company | undefined>;
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

export class DatabaseStorage implements IStorage {
  // Companies (scoped by userId - returns if owner OR member)
  async getCompany(id: string, userId: string): Promise<Company | undefined> {
    // First check if user owns the company
    const [ownedCompany] = await db
      .select()
      .from(companies)
      .where(and(eq(companies.id, id), eq(companies.userId, userId)));
    
    if (ownedCompany) return ownedCompany;
    
    // Check if user is a member of the company
    const isMember = await this.isCompanyMember(id, userId);
    if (isMember) {
      const [memberCompany] = await db
        .select()
        .from(companies)
        .where(eq(companies.id, id));
      return memberCompany || undefined;
    }
    
    return undefined;
  }
  
  async getCompaniesByUser(userId: string): Promise<Company[]> {
    // Get companies user owns
    const ownedCompanies = await db
      .select()
      .from(companies)
      .where(eq(companies.userId, userId))
      .orderBy(desc(companies.createdAt));
    
    // Get companies user is a member of
    const memberCompanyIds = await db
      .select({ companyId: companyMembers.companyId })
      .from(companyMembers)
      .where(eq(companyMembers.userId, userId));
    
    if (memberCompanyIds.length > 0) {
      const memberCompanies = await db
        .select()
        .from(companies)
        .where(
          or(...memberCompanyIds.map(m => eq(companies.id, m.companyId)))
        );
      
      // Combine and dedupe
      const allCompanies = [...ownedCompanies, ...memberCompanies];
      const uniqueCompanies = allCompanies.filter((company, index, self) =>
        index === self.findIndex(c => c.id === company.id)
      );
      return uniqueCompanies.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    
    return ownedCompanies;
  }
  
  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(insertCompany)
      .returning();
    return company;
  }
  
  async updateCompany(id: string, userId: string, updateData: Partial<InsertCompany>): Promise<Company | undefined> {
    const [company] = await db
      .update(companies)
      .set({ ...updateData, updatedAt: new Date() })
      .where(and(eq(companies.id, id), eq(companies.userId, userId)))
      .returning();
    return company || undefined;
  }
  
  async deleteCompany(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(companies)
      .where(and(eq(companies.id, id), eq(companies.userId, userId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Valuation Snapshots
  async getSnapshot(id: string): Promise<ValuationSnapshot | undefined> {
    const [snapshot] = await db.select().from(valuationSnapshots).where(eq(valuationSnapshots.id, id));
    return snapshot || undefined;
  }
  
  async getSnapshotsByCompany(companyId: string): Promise<ValuationSnapshot[]> {
    return await db
      .select()
      .from(valuationSnapshots)
      .where(eq(valuationSnapshots.companyId, companyId))
      .orderBy(desc(valuationSnapshots.createdAt));
  }
  
  async createSnapshot(insertSnapshot: InsertValuationSnapshot): Promise<ValuationSnapshot> {
    const [snapshot] = await db
      .insert(valuationSnapshots)
      .values(insertSnapshot)
      .returning();
    return snapshot;
  }
  
  async deleteSnapshot(id: string): Promise<boolean> {
    const result = await db.delete(valuationSnapshots).where(eq(valuationSnapshots.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Scenarios
  async getScenario(id: string): Promise<Scenario | undefined> {
    const [scenario] = await db.select().from(scenarios).where(eq(scenarios.id, id));
    return scenario || undefined;
  }
  
  async getScenariosByCompany(companyId: string): Promise<Scenario[]> {
    return await db
      .select()
      .from(scenarios)
      .where(eq(scenarios.companyId, companyId))
      .orderBy(desc(scenarios.createdAt));
  }
  
  async createScenario(insertScenario: InsertScenario): Promise<Scenario> {
    const [scenario] = await db
      .insert(scenarios)
      .values(insertScenario)
      .returning();
    return scenario;
  }
  
  async updateScenario(id: string, updateData: Partial<InsertScenario>): Promise<Scenario | undefined> {
    const [scenario] = await db
      .update(scenarios)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(scenarios.id, id))
      .returning();
    return scenario || undefined;
  }
  
  async deleteScenario(id: string): Promise<boolean> {
    const result = await db.delete(scenarios).where(eq(scenarios.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Comparables
  async getComparable(id: string): Promise<Comparable | undefined> {
    const [comparable] = await db.select().from(comparables).where(eq(comparables.id, id));
    return comparable || undefined;
  }
  
  async getComparablesByCompany(companyId: string): Promise<Comparable[]> {
    return await db
      .select()
      .from(comparables)
      .where(eq(comparables.companyId, companyId))
      .orderBy(desc(comparables.createdAt));
  }
  
  async getAllComparables(): Promise<Comparable[]> {
    return await db.select().from(comparables).orderBy(desc(comparables.createdAt));
  }
  
  async createComparable(insertComparable: InsertComparable): Promise<Comparable> {
    const revenueMultiple = insertComparable.revenue && insertComparable.valuation 
      ? insertComparable.valuation / insertComparable.revenue 
      : null;
    
    const [comparable] = await db
      .insert(comparables)
      .values({ ...insertComparable, revenueMultiple })
      .returning();
    return comparable;
  }
  
  async updateComparable(id: string, updateData: Partial<InsertComparable>): Promise<Comparable | undefined> {
    const [comparable] = await db
      .update(comparables)
      .set(updateData)
      .where(eq(comparables.id, id))
      .returning();
    return comparable || undefined;
  }
  
  async deleteComparable(id: string): Promise<boolean> {
    const result = await db.delete(comparables).where(eq(comparables.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Team Members
  async getCompanyMembers(companyId: string): Promise<CompanyMember[]> {
    return await db
      .select()
      .from(companyMembers)
      .where(eq(companyMembers.companyId, companyId))
      .orderBy(desc(companyMembers.joinedAt));
  }
  
  async addCompanyMember(member: InsertCompanyMember): Promise<CompanyMember> {
    const [newMember] = await db
      .insert(companyMembers)
      .values(member)
      .returning();
    return newMember;
  }
  
  async removeCompanyMember(companyId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(companyMembers)
      .where(and(eq(companyMembers.companyId, companyId), eq(companyMembers.userId, userId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async isCompanyMember(companyId: string, userId: string): Promise<boolean> {
    const [member] = await db
      .select()
      .from(companyMembers)
      .where(and(eq(companyMembers.companyId, companyId), eq(companyMembers.userId, userId)));
    return !!member;
  }
  
  async isCompanyOwner(companyId: string, userId: string): Promise<boolean> {
    const [company] = await db
      .select()
      .from(companies)
      .where(and(eq(companies.id, companyId), eq(companies.userId, userId)));
    return !!company;
  }
  
  async hasCompanyAccess(companyId: string, userId: string): Promise<boolean> {
    // Check if user is either the owner or a member
    const [company] = await db
      .select()
      .from(companies)
      .where(and(eq(companies.id, companyId), eq(companies.userId, userId)));
    
    if (company) return true;
    
    return await this.isCompanyMember(companyId, userId);
  }
  
  // Invites
  async getCompanyInvites(companyId: string): Promise<CompanyInvite[]> {
    return await db
      .select()
      .from(companyInvites)
      .where(eq(companyInvites.companyId, companyId))
      .orderBy(desc(companyInvites.createdAt));
  }
  
  async getPendingInvitesByEmail(email: string): Promise<CompanyInvite[]> {
    return await db
      .select()
      .from(companyInvites)
      .where(and(eq(companyInvites.inviteEmail, email), eq(companyInvites.status, "pending")));
  }
  
  async getInviteByToken(token: string): Promise<CompanyInvite | undefined> {
    const [invite] = await db
      .select()
      .from(companyInvites)
      .where(eq(companyInvites.inviteToken, token));
    return invite || undefined;
  }
  
  async createInvite(invite: InsertCompanyInvite): Promise<CompanyInvite> {
    const [newInvite] = await db
      .insert(companyInvites)
      .values(invite)
      .returning();
    return newInvite;
  }
  
  async updateInviteStatus(id: string, status: string): Promise<CompanyInvite | undefined> {
    const [invite] = await db
      .update(companyInvites)
      .set({ status })
      .where(eq(companyInvites.id, id))
      .returning();
    return invite || undefined;
  }
  
  async deleteInvite(id: string): Promise<boolean> {
    const result = await db.delete(companyInvites).where(eq(companyInvites.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DatabaseStorage();
