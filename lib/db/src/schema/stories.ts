import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const storiesTable = pgTable("stories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  categoryId: integer("category_id").notNull(),
  difficulty: text("difficulty").notNull().default("beginner"),
  theme: text("theme"),
  readingTimeMinutes: integer("reading_time_minutes").notNull().default(5),
  isFeatured: boolean("is_featured").notNull().default(false),
  coverImageUrl: text("cover_image_url"),
  lessons: text("lessons"),
  xpReward: integer("xp_reward").notNull().default(50),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStorySchema = createInsertSchema(storiesTable).omit({ id: true, createdAt: true });
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof storiesTable.$inferSelect;
