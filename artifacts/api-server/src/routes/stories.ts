import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { storiesTable, categoriesTable } from "@workspace/db";
import { eq, ilike, and, sql, desc, asc, ne } from "drizzle-orm";
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
      sql`(${storiesTable.title} ILIKE ${`%${query.search}%`} OR ${storiesTable.titleAr} ILIKE ${`%${query.search}%`} OR ${storiesTable.excerpt} ILIKE ${`%${query.search}%`} OR ${storiesTable.excerptAr} ILIKE ${`%${query.search}%`} OR ${storiesTable.excerptFr} ILIKE ${`%${query.search}%`} OR ${storiesTable.content} ILIKE ${`%${query.search}%`} OR ${storiesTable.contentAr} ILIKE ${`%${query.search}%`} OR ${storiesTable.contentFr} ILIKE ${`%${query.search}%`} OR ${storiesTable.theme} ILIKE ${`%${query.search}%`} OR ${storiesTable.lessons} ILIKE ${`%${query.search}%`})`
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
      titleFr: storiesTable.titleFr,
      slug: storiesTable.slug,
      excerpt: storiesTable.excerpt,
      excerptAr: storiesTable.excerptAr,
      excerptFr: storiesTable.excerptFr,
      content: storiesTable.content,
      contentAr: storiesTable.contentAr,
      contentFr: storiesTable.contentFr,
      categoryId: storiesTable.categoryId,
      categoryName: categoriesTable.name,
      categoryNameAr: categoriesTable.nameAr,
      categoryNameFr: categoriesTable.nameFr,
      difficulty: storiesTable.difficulty,
      theme: storiesTable.theme,
      readingTimeMinutes: storiesTable.readingTimeMinutes,
      isFeatured: storiesTable.isFeatured,
      coverImageUrl: storiesTable.coverImageUrl,
      lessons: storiesTable.lessons,
      lessonsAr: storiesTable.lessonsAr,
      lessonsFr: storiesTable.lessonsFr,
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
  res.json(rows.map(r => ({ ...r, createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(), categoryName: r.categoryName ?? "", categoryNameAr: r.categoryNameAr ?? "", categoryNameFr: r.categoryNameFr ?? "" })));
});

router.get("/stories/featured", async (_req, res) => {
  const rows = await db
    .select({
      id: storiesTable.id,
      title: storiesTable.title,
      titleAr: storiesTable.titleAr,
      titleFr: storiesTable.titleFr,
      slug: storiesTable.slug,
      excerpt: storiesTable.excerpt,
      excerptAr: storiesTable.excerptAr,
      excerptFr: storiesTable.excerptFr,
      content: storiesTable.content,
      contentAr: storiesTable.contentAr,
      contentFr: storiesTable.contentFr,
      categoryId: storiesTable.categoryId,
      categoryName: categoriesTable.name,
      categoryNameAr: categoriesTable.nameAr,
      categoryNameFr: categoriesTable.nameFr,
      difficulty: storiesTable.difficulty,
      theme: storiesTable.theme,
      readingTimeMinutes: storiesTable.readingTimeMinutes,
      isFeatured: storiesTable.isFeatured,
      coverImageUrl: storiesTable.coverImageUrl,
      lessons: storiesTable.lessons,
      lessonsAr: storiesTable.lessonsAr,
      lessonsFr: storiesTable.lessonsFr,
      xpReward: storiesTable.xpReward,
      viewCount: storiesTable.viewCount,
      createdAt: storiesTable.createdAt,
    })
    .from(storiesTable)
    .leftJoin(categoriesTable, eq(storiesTable.categoryId, categoriesTable.id))
    .where(eq(storiesTable.isFeatured, true))
    .limit(5);
  res.json(rows.map(r => ({ ...r, createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(), categoryName: r.categoryName ?? "", categoryNameAr: r.categoryNameAr ?? "", categoryNameFr: r.categoryNameFr ?? "" })));
});

router.get("/stories/:id", async (req, res) => {
  const params = GetStoryParams.parse({ id: req.params.id });
  await db.update(storiesTable).set({ viewCount: sql`${storiesTable.viewCount} + 1` }).where(eq(storiesTable.id, params.id));
  const [row] = await db
    .select({
      id: storiesTable.id,
      title: storiesTable.title,
      titleAr: storiesTable.titleAr,
      titleFr: storiesTable.titleFr,
      slug: storiesTable.slug,
      excerpt: storiesTable.excerpt,
      excerptAr: storiesTable.excerptAr,
      excerptFr: storiesTable.excerptFr,
      content: storiesTable.content,
      contentAr: storiesTable.contentAr,
      contentFr: storiesTable.contentFr,
      categoryId: storiesTable.categoryId,
      categoryName: categoriesTable.name,
      categoryNameAr: categoriesTable.nameAr,
      categoryNameFr: categoriesTable.nameFr,
      difficulty: storiesTable.difficulty,
      theme: storiesTable.theme,
      readingTimeMinutes: storiesTable.readingTimeMinutes,
      isFeatured: storiesTable.isFeatured,
      coverImageUrl: storiesTable.coverImageUrl,
      lessons: storiesTable.lessons,
      lessonsAr: storiesTable.lessonsAr,
      lessonsFr: storiesTable.lessonsFr,
      xpReward: storiesTable.xpReward,
      viewCount: storiesTable.viewCount,
      createdAt: storiesTable.createdAt,
    })
    .from(storiesTable)
    .leftJoin(categoriesTable, eq(storiesTable.categoryId, categoriesTable.id))
    .where(eq(storiesTable.id, params.id));
  if (!row) { res.status(404).json({ error: "Story not found" }); return; }
  res.json({ ...row, createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(), categoryName: row.categoryName ?? "", categoryNameAr: row.categoryNameAr ?? "", categoryNameFr: row.categoryNameFr ?? "" });
});

router.get("/stories/:id/related", async (req, res) => {
  const { id } = GetStoryParams.parse({ id: req.params.id });
  const limit = Math.min(parseInt(req.query.limit as string) || 3, 6);

  const [current] = await db
    .select({ categoryId: storiesTable.categoryId, theme: storiesTable.theme })
    .from(storiesTable)
    .where(eq(storiesTable.id, id));

  if (!current) { res.json([]); return; }

  const selectFields = {
    id: storiesTable.id,
    title: storiesTable.title,
    titleAr: storiesTable.titleAr,
    titleFr: storiesTable.titleFr,
    slug: storiesTable.slug,
    excerpt: storiesTable.excerpt,
    excerptAr: storiesTable.excerptAr,
    excerptFr: storiesTable.excerptFr,
    content: storiesTable.content,
    contentAr: storiesTable.contentAr,
    contentFr: storiesTable.contentFr,
    categoryId: storiesTable.categoryId,
    categoryName: categoriesTable.name,
    categoryNameAr: categoriesTable.nameAr,
    categoryNameFr: categoriesTable.nameFr,
    difficulty: storiesTable.difficulty,
    theme: storiesTable.theme,
    readingTimeMinutes: storiesTable.readingTimeMinutes,
    isFeatured: storiesTable.isFeatured,
    coverImageUrl: storiesTable.coverImageUrl,
    lessons: storiesTable.lessons,
    lessonsAr: storiesTable.lessonsAr,
    lessonsFr: storiesTable.lessonsFr,
    xpReward: storiesTable.xpReward,
    viewCount: storiesTable.viewCount,
    createdAt: storiesTable.createdAt,
  };

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

  res.json(rows.map(r => ({ ...r, createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(), categoryName: r.categoryName ?? "", categoryNameAr: r.categoryNameAr ?? "", categoryNameFr: r.categoryNameFr ?? "" })));
});

router.post("/stories", async (req, res) => {
  const body = CreateStoryBody.parse(req.body);
  const [story] = await db.insert(storiesTable).values(body).returning();
  await db.update(categoriesTable).set({ storyCount: sql`${categoriesTable.storyCount} + 1` }).where(eq(categoriesTable.id, body.categoryId));
  const cat = await db.select().from(categoriesTable).where(eq(categoriesTable.id, body.categoryId)).limit(1);
  res.status(201).json({ ...story, categoryName: cat[0]?.name ?? "", categoryNameAr: cat[0]?.nameAr ?? "", categoryNameFr: cat[0]?.nameFr ?? "", createdAt: story.createdAt?.toISOString() ?? new Date().toISOString() });
});

export default router;
