import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { storiesTable, categoriesTable } from "@workspace/db";
import { eq, ilike, and, sql, desc, asc, ne, or } from "drizzle-orm";
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
  const sortOrderMap = {
    newest: desc(storiesTable.createdAt),
    popular: desc(storiesTable.viewCount),
    shortest: asc(storiesTable.readingTimeMinutes),
    longest: desc(storiesTable.readingTimeMinutes),
    xp: desc(storiesTable.xpReward),
  };
  const orderBy = query.sortBy ? sortOrderMap[query.sortBy as keyof typeof sortOrderMap] : desc(storiesTable.createdAt);

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
    .orderBy(orderBy)
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
  if (!row) { res.status(404).json({ error: "Story not found" }); return; }
  res.json({ ...row, createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(), categoryName: row.categoryName ?? "" });
});

router.get("/stories/:id/related", async (req, res) => {
  const { id } = GetStoryParams.parse({ id: req.params.id });
  const limit = Math.min(parseInt(req.query.limit as string) || 3, 6);

  // Fetch the current story to know its category and theme
  const [current] = await db
    .select({ categoryId: storiesTable.categoryId, theme: storiesTable.theme })
    .from(storiesTable)
    .where(eq(storiesTable.id, id));

  if (!current) { res.json([]); return; }

  const selectFields = {
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
  };

  // Priority 1: same category AND same theme
  const sameConditions = [
    ne(storiesTable.id, id),
    eq(storiesTable.categoryId, current.categoryId),
  ];
  if (current.theme) sameConditions.push(ilike(storiesTable.theme, `%${current.theme}%`));

  let rows = await db
    .select(selectFields)
    .from(storiesTable)
    .leftJoin(categoriesTable, eq(storiesTable.categoryId, categoriesTable.id))
    .where(and(...sameConditions))
    .orderBy(desc(storiesTable.viewCount))
    .limit(limit);

  // Fill remaining slots from same category
  if (rows.length < limit) {
    const existingIds = new Set([id, ...rows.map(r => r.id)]);
    const extra = await db
      .select(selectFields)
      .from(storiesTable)
      .leftJoin(categoriesTable, eq(storiesTable.categoryId, categoriesTable.id))
      .where(and(
        ne(storiesTable.id, id),
        eq(storiesTable.categoryId, current.categoryId),
        sql`${storiesTable.id} NOT IN (${sql.join(Array.from(existingIds).map(i => sql`${i}`), sql`, `)})`
      ))
      .orderBy(desc(storiesTable.viewCount))
      .limit(limit - rows.length);
    rows = [...rows, ...extra];
  }

  // Fill remaining slots from popular stories across all categories
  if (rows.length < limit) {
    const existingIds = new Set([id, ...rows.map(r => r.id)]);
    const fallback = await db
      .select(selectFields)
      .from(storiesTable)
      .leftJoin(categoriesTable, eq(storiesTable.categoryId, categoriesTable.id))
      .where(sql`${storiesTable.id} NOT IN (${sql.join(Array.from(existingIds).map(i => sql`${i}`), sql`, `)})`)
      .orderBy(desc(storiesTable.viewCount))
      .limit(limit - rows.length);
    rows = [...rows, ...fallback];
  }

  res.json(rows.map(r => ({ ...r, createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(), categoryName: r.categoryName ?? "" })));
});

router.post("/stories", async (req, res) => {
  const body = CreateStoryBody.parse(req.body);
  const [story] = await db.insert(storiesTable).values(body).returning();
  await db.update(categoriesTable).set({ storyCount: sql`${categoriesTable.storyCount} + 1` }).where(eq(categoriesTable.id, body.categoryId));
  const cat = await db.select().from(categoriesTable).where(eq(categoriesTable.id, body.categoryId)).limit(1);
  res.status(201).json({ ...story, categoryName: cat[0]?.name ?? "", createdAt: story.createdAt?.toISOString() ?? new Date().toISOString() });
});

export default router;
