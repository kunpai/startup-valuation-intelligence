import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (for future auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Companies table
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
