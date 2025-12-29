import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models first (required for Replit Auth)
// Note: The auth models define the users and sessions tables
export * from "./models/auth";

// Companies table - scoped to authenticated users
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Links company to authenticated user
  name: text("name").notNull(),
  sector: text("sector").notNull(),
  stage: text("stage").notNull(),
  region: text("region").notNull(),
  foundedYear: integer("founded_year").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

// Valuation Snapshots table - stores complete valuation state at a point in time
export const valuationSnapshots = pgTable("valuation_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: 'cascade' }),
  
  // Financials
  revenue: real("revenue").notNull(),
  growthRate: real("growth_rate").notNull(),
  lastRoundValuation: real("last_round_valuation").notNull(),
  burnRate: real("burn_rate").notNull(),
  cashBalance: real("cash_balance").notNull(),
  
  // Qualitative scores (0-100)
  teamScore: integer("team_score").notNull(),
  productScore: integer("product_score").notNull(),
  marketScore: integer("market_score").notNull(),
  
  // Calculated valuations
  calculatedValuation: real("calculated_valuation"),
  selectedMethodology: text("selected_methodology").default("blended"),
  
  // Metadata
  snapshotName: text("snapshot_name"), // e.g., "Q4 2024 Review"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertValuationSnapshotSchema = createInsertSchema(valuationSnapshots).omit({
  id: true,
  createdAt: true,
});

export type InsertValuationSnapshot = z.infer<typeof insertValuationSnapshotSchema>;
export type ValuationSnapshot = typeof valuationSnapshots.$inferSelect;

// User-editable Market Comparables
export const comparables = pgTable("comparables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").references(() => companies.id, { onDelete: 'cascade' }),
  
  companyName: text("company_name").notNull(),
  sector: text("sector").notNull(),
  stage: text("stage").notNull(),
  region: text("region"),
  
  revenue: real("revenue"),
  valuation: real("valuation"),
  growthRate: real("growth_rate"),
  fundingRound: text("funding_round"),
  
  revenueMultiple: real("revenue_multiple"),
  source: text("source"),
  isUserAdded: integer("is_user_added").default(1),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertComparableSchema = createInsertSchema(comparables).omit({
  id: true,
  createdAt: true,
});

export type InsertComparable = z.infer<typeof insertComparableSchema>;
export type Comparable = typeof comparables.$inferSelect;

// Scenarios table - different what-if models
export const scenarios = pgTable("scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: 'cascade' }),
  
  name: text("name").notNull(), // "Base Case", "Best Case", "Downside"
  description: text("description"),
  
  // Scenario-specific financials
  revenue: real("revenue").notNull(),
  growthRate: real("growth_rate").notNull(),
  exitValuation: real("exit_valuation"),
  exitYear: integer("exit_year"),
  
  // Additional assumptions stored as JSON
  assumptions: jsonb("assumptions").$type<Record<string, any>>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertScenarioSchema = createInsertSchema(scenarios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Scenario = typeof scenarios.$inferSelect;

// Re-export chat models
export * from "./models/chat";
