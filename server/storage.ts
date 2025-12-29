// Blueprint reference: javascript_database
import { 
  users, 
  companies,
  valuationSnapshots,
  scenarios,
  comparables,
  type User, 
  type InsertUser,
  type Company,
  type InsertCompany,
  type ValuationSnapshot,
  type InsertValuationSnapshot,
  type Scenario,
  type InsertScenario,
  type Comparable,
  type InsertComparable
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Companies
  getCompany(id: string): Promise<Company | undefined>;
  getAllCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: string): Promise<boolean>;
  
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
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Companies
  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }
  
  async getAllCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(desc(companies.createdAt));
  }
  
  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(insertCompany)
      .returning();
    return company;
  }
  
  async updateCompany(id: string, updateData: Partial<InsertCompany>): Promise<Company | undefined> {
    const [company] = await db
      .update(companies)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company || undefined;
  }
  
  async deleteCompany(id: string): Promise<boolean> {
    const result = await db.delete(companies).where(eq(companies.id, id));
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
}

export const storage = new DatabaseStorage();
