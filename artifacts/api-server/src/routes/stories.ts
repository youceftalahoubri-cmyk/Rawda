import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { storiesTable, categoriesTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";
import {
  ListStoriesQueryParams,
  CreateStoryBody,
  GetStoryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stories", async (req, res) => {
  const query = ListStoriesQueryParams.parse(req.query);
  const conditions = [];
  if (query.categoryId) conditions.push(eq(storiesTable.categoryId, query.categoryId));
  if (query.difficulty) conditions.push(eq(storiesTable.difficulty, query.difficulty));
  if (query.theme) conditions.push(ilike(storiesTable.theme, `%${query.theme}%`));
  if (query.search) {
    conditions.push(
      sql`(${storiesTable.title} ILIKE ${`%${query.search}%`} OR ${storiesTable.titleAr} ILIKE ${`%${query.search}%`} OR ${storiesTable.excerpt} ILIKE ${`%${query.search}%`} OR ${storiesTable.theme} ILIKE ${`%${query.search}%`} OR ${storiesTable.lessons} ILIKE ${`%${query.search}%`})`
    );
  }
  const rows = await db
    .select({
      id: storiesTable.id,
      title: storiesTable.title,
      titleAr: storiesTable.titleAr,
      slug: storiesTable.slug,
      excerpt: storiesTable.excerpt,
      content: storiesTable.content,
      categoryId: storiesTable.categoryId,
      categoryName: categoriesTable.name,
      difficulty: storiesTable.difficulty,
      theme: storiesTable.theme,
      readingTimeMinutes: storiesTable.readingTimeMinutes,
      isFeatured: storiesTable.isFeatured,
      coverImageUrl: storiesTable.coverImageUrl,
      lessons: storiesTable.lessons,
      xpReward: storiesTable.xpReward,
      viewCount: storiesTable.viewCount,
      createdAt: storiesTable.createdAt,
    })
    .from(storiesTable)
    .leftJoin(categoriesTable, eq(storiesTable.categoryId, categoriesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(query.limit ?? 20)
    .offset(query.offset ?? 0);
  res.json(rows.map(r => ({ ...r, createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(), categoryName: r.categoryName ?? "" })));
});

router.get("/stories/featured", async (_req, res) => {
  const rows = await db
    .select({
      id: storiesTable.id,
      title: storiesTable.title,
      titleAr: storiesTable.titleAr,
      slug: storiesTable.slug,
      excerpt: storiesTable.excerpt,
      content: storiesTable.content,
      categoryId: storiesTable.categoryId,
      categoryName: categoriesTable.name,
      difficulty: storiesTable.difficulty,
      theme: storiesTable.theme,
      readingTimeMinutes: storiesTable.readingTimeMinutes,
      isFeatured: storiesTable.isFeatured,
      coverImageUrl: storiesTable.coverImageUrl,
      lessons: storiesTable.lessons,
      xpReward: storiesTable.xpReward,
      viewCount: storiesTable.viewCount,
      createdAt: storiesTable.createdAt,
    })
    .from(storiesTable)
    .leftJoin(categoriesTable, eq(storiesTable.categoryId, categoriesTable.id))
    .where(eq(storiesTable.isFeatured, true))
    .limit(5);
  res.json(rows.map(r => ({ ...r, createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(), categoryName: r.categoryName ?? "" })));
});

router.get("/stories/:id", async (req, res) => {
  const params = GetStoryParams.parse({ id: req.params.id });
  await db.update(storiesTable).set({ viewCount: sql`${storiesTable.viewCount} + 1` }).where(eq(storiesTable.id, params.id));
  const [row] = await db
    .select({
      id: storiesTable.id,
      title: storiesTable.title,
      titleAr: storiesTable.titleAr,
      slug: storiesTable.slug,
      excerpt: storiesTable.excerpt,
      content: storiesTable.content,
      categoryId: storiesTable.categoryId,
      categoryName: categoriesTable.name,
      difficulty: storiesTable.difficulty,
      theme: storiesTable.theme,
      readingTimeMinutes: storiesTable.readingTimeMinutes,
      isFeatured: storiesTable.isFeatured,
      coverImageUrl: storiesTable.coverImageUrl,
      lessons: storiesTable.lessons,
      xpReward: storiesTable.xpReward,
      viewCount: storiesTable.viewCount,
      createdAt: storiesTable.createdAt,
    })
    .from(storiesTable)
    .leftJoin(categoriesTable, eq(storiesTable.categoryId, categoriesTable.id))
    .where(eq(storiesTable.id, params.id));
  if (!row) return res.status(404).json({ error: "Story not found" });
  res.json({ ...row, createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(), categoryName: row.categoryName ?? "" });
});

router.post("/stories", async (req, res) => {
  const body = CreateStoryBody.parse(req.body);
  const [story] = await db.insert(storiesTable).values(body).returning();
  await db.update(categoriesTable).set({ storyCount: sql`${categoriesTable.storyCount} + 1` }).where(eq(categoriesTable.id, body.categoryId));
  const cat = await db.select().from(categoriesTable).where(eq(categoriesTable.id, body.categoryId)).limit(1);
  res.status(201).json({ ...story, categoryName: cat[0]?.name ?? "", createdAt: story.createdAt?.toISOString() ?? new Date().toISOString() });
});

export default router;
