import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { storiesTable, categoriesTable, usersTable, userProgressTable, userStatsTable, dailyQuotesTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";

const router: IRouter = Router();

const LEVEL_NAMES = ["Seeker", "Student", "Learner", "Scholar", "Hafiz", "Imam", "Sage"];
function computeLevel(xp: number): { level: number; levelName: string } {
  const level = Math.min(Math.floor(xp / 200) + 1, LEVEL_NAMES.length);
  return { level, levelName: LEVEL_NAMES[level - 1] };
}

router.get("/dashboard/summary", async (_req, res) => {
  const [storyCount] = await db.select({ count: sql<number>`count(*)` }).from(storiesTable);
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
  const [catCount] = await db.select({ count: sql<number>`count(*)` }).from(categoriesTable);
  const [readToday] = await db.select({ count: sql<number>`count(*)` }).from(userProgressTable)
    .where(sql`DATE(completed_at) = CURRENT_DATE`);

  const [topCat] = await db
    .select({ name: categoriesTable.name, count: sql<number>`count(${userProgressTable.id})` })
    .from(userProgressTable)
    .leftJoin(storiesTable, eq(userProgressTable.storyId, storiesTable.id))
    .leftJoin(categoriesTable, eq(storiesTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.name)
    .orderBy(desc(sql`count(${userProgressTable.id})`))
    .limit(1);

  const [featured] = await db
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
    .limit(1);

  res.json({
    totalStories: Number(storyCount?.count ?? 0),
    totalUsers: Number(userCount?.count ?? 0),
    totalCategories: Number(catCount?.count ?? 0),
    storiesReadToday: Number(readToday?.count ?? 0),
    mostReadCategory: topCat?.name ?? "Prophets",
    featuredStory: featured ? {
      ...featured,
      categoryName: featured.categoryName ?? "",
      createdAt: featured.createdAt?.toISOString() ?? new Date().toISOString(),
    } : null,
  });
});

router.get("/dashboard/daily-quote", async (_req, res) => {
  const quotes = await db.select().from(dailyQuotesTable);
  if (quotes.length === 0) {
    return res.json({
      text: "Indeed, with hardship comes ease.",
      textAr: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
      source: "Quran 94:5",
      date: new Date().toISOString().split("T")[0],
    });
  }
  const quote = quotes[Math.floor(Date.now() / 86400000) % quotes.length];
  res.json({ ...quote, date: new Date().toISOString().split("T")[0] });
});

router.get("/dashboard/leaderboard", async (_req, res) => {
  const rows = await db
    .select({
      userId: userStatsTable.userId,
      userName: usersTable.name,
      avatarUrl: usersTable.avatarUrl,
      xp: userStatsTable.xp,
      streak: userStatsTable.streak,
    })
    .from(userStatsTable)
    .leftJoin(usersTable, eq(userStatsTable.userId, usersTable.id))
    .orderBy(desc(userStatsTable.xp))
    .limit(20);

  res.json(rows.map((r, i) => {
    const { level, levelName } = computeLevel(r.xp);
    return {
      rank: i + 1,
      userId: r.userId,
      userName: r.userName ?? "Anonymous",
      avatarUrl: r.avatarUrl ?? null,
      xp: r.xp,
      level,
      levelName,
      streak: r.streak,
    };
  }));
});

export default router;
