import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const dailyQuotesTable = pgTable("daily_quotes", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  textAr: text("text_ar"),
  source: text("source").notNull(),
});

export type DailyQuote = typeof dailyQuotesTable.$inferSelect;
