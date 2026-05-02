import { pgTable, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userProgressTable = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  storyId: integer("story_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  minutesSpent: integer("minutes_spent").notNull().default(0),
  xpEarned: integer("xp_earned").notNull().default(0),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const userStatsTable = pgTable("user_stats", {
  userId: integer("user_id").primaryKey(),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  streak: integer("streak").notNull().default(0),
  totalStoriesRead: integer("total_stories_read").notNull().default(0),
  totalMinutesRead: integer("total_minutes_read").notNull().default(0),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
});

export const insertProgressSchema = createInsertSchema(userProgressTable).omit({ id: true });
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type UserProgress = typeof userProgressTable.$inferSelect;
export type UserStats = typeof userStatsTable.$inferSelect;
