import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { userProgressTable, userStatsTable, storiesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { GetUserProgressParams, RecordStoryProgressParams, RecordStoryProgressBody } from "@workspace/api-zod";

const router: IRouter = Router();

const LEVEL_NAMES = ["Seeker", "Student", "Learner", "Scholar", "Hafiz", "Imam", "Sage"];

function computeLevel(xp: number): { level: number; levelName: string } {
  const level = Math.min(Math.floor(xp / 200) + 1, LEVEL_NAMES.length);
  return { level, levelName: LEVEL_NAMES[level - 1] };
}

const BADGES = [
  { id: "first_story", name: "First Step", description: "Completed your first story", iconName: "BookOpen", threshold: 1 },
  { id: "streak_3", name: "3-Day Seeker", description: "Maintained a 3-day streak", iconName: "Flame", threshold: 3, type: "streak" },
  { id: "streak_7", name: "Week of Light", description: "Maintained a 7-day streak", iconName: "Star", threshold: 7, type: "streak" },
  { id: "stories_5", name: "Avid Reader", description: "Read 5 stories", iconName: "Book", threshold: 5 },
  { id: "stories_10", name: "Devoted Learner", description: "Read 10 stories", iconName: "Award", threshold: 10 },
];

router.get("/users/:id/progress", async (req, res) => {
  const params = GetUserProgressParams.parse({ id: req.params.id });

  let [stats] = await db.select().from(userStatsTable).where(eq(userStatsTable.userId, params.id));
  if (!stats) {
    await db.insert(userStatsTable).values({ userId: params.id }).onConflictDoNothing();
    stats = { userId: params.id, xp: 0, level: 1, streak: 0, totalStoriesRead: 0, totalMinutesRead: 0, lastActiveAt: new Date() };
  }

  const recentActivity = await db
    .select({
      storyId: userProgressTable.storyId,
      storyTitle: storiesTable.title,
      completedAt: userProgressTable.completedAt,
      xpEarned: userProgressTable.xpEarned,
    })
    .from(userProgressTable)
    .leftJoin(storiesTable, eq(userProgressTable.storyId, storiesTable.id))
    .where(eq(userProgressTable.userId, params.id))
    .orderBy(desc(userProgressTable.completedAt))
    .limit(10);

  const { level, levelName } = computeLevel(stats.xp);

  const earnedBadges = BADGES.filter(b => {
    if (b.type === "streak") return stats.streak >= b.threshold;
    return stats.totalStoriesRead >= b.threshold;
  }).map(b => ({ id: b.id, name: b.name, description: b.description, iconName: b.iconName, earnedAt: new Date().toISOString() }));

  res.json({
    userId: stats.userId,
    xp: stats.xp,
    level,
    levelName,
    streak: stats.streak,
    totalStoriesRead: stats.totalStoriesRead,
    totalMinutesRead: stats.totalMinutesRead,
    badges: earnedBadges,
    recentActivity: recentActivity.map(a => ({
      storyId: a.storyId,
      storyTitle: a.storyTitle ?? "",
      completedAt: a.completedAt?.toISOString() ?? new Date().toISOString(),
      xpEarned: a.xpEarned,
    })),
  });
});

router.post("/users/:id/progress/story", async (req, res) => {
  const params = RecordStoryProgressParams.parse({ id: req.params.id });
  const body = RecordStoryProgressBody.parse(req.body);

  const [story] = await db.select().from(storiesTable).where(eq(storiesTable.id, body.storyId));
  const xpEarned = body.completed ? (story?.xpReward ?? 50) : 0;

  await db.insert(userProgressTable).values({
    userId: params.id,
    storyId: body.storyId,
    completed: body.completed,
    minutesSpent: body.minutesSpent,
    xpEarned,
  });

  let [stats] = await db.select().from(userStatsTable).where(eq(userStatsTable.userId, params.id));
  if (!stats) {
    await db.insert(userStatsTable).values({ userId: params.id });
    [stats] = await db.select().from(userStatsTable).where(eq(userStatsTable.userId, params.id));
  }

  const newXp = stats.xp + xpEarned;
  const newTotal = body.completed ? stats.totalStoriesRead + 1 : stats.totalStoriesRead;
  const newMinutes = stats.totalMinutesRead + body.minutesSpent;
  const newStreak = stats.streak + (body.completed ? 1 : 0);

  await db.update(userStatsTable).set({
    xp: newXp,
    totalStoriesRead: newTotal,
    totalMinutesRead: newMinutes,
    streak: newStreak,
    lastActiveAt: new Date(),
  }).where(eq(userStatsTable.userId, params.id));

  const { level, levelName } = computeLevel(newXp);

  const recentActivity = await db
    .select({
      storyId: userProgressTable.storyId,
      storyTitle: storiesTable.title,
      completedAt: userProgressTable.completedAt,
      xpEarned: userProgressTable.xpEarned,
    })
    .from(userProgressTable)
    .leftJoin(storiesTable, eq(userProgressTable.storyId, storiesTable.id))
    .where(eq(userProgressTable.userId, params.id))
    .orderBy(desc(userProgressTable.completedAt))
    .limit(10);

  const earnedBadges = [
    { id: "first_story", name: "First Step", description: "Completed your first story", iconName: "BookOpen" },
    ...(newStreak >= 3 ? [{ id: "streak_3", name: "3-Day Seeker", description: "3-day streak", iconName: "Flame" }] : []),
    ...(newStreak >= 7 ? [{ id: "streak_7", name: "Week of Light", description: "7-day streak", iconName: "Star" }] : []),
    ...(newTotal >= 5 ? [{ id: "stories_5", name: "Avid Reader", description: "Read 5 stories", iconName: "Book" }] : []),
    ...(newTotal >= 10 ? [{ id: "stories_10", name: "Devoted Learner", description: "Read 10 stories", iconName: "Award" }] : []),
  ].filter(() => newTotal > 0).map(b => ({ ...b, earnedAt: new Date().toISOString() }));

  res.json({
    userId: params.id,
    xp: newXp,
    level,
    levelName,
    streak: newStreak,
    totalStoriesRead: newTotal,
    totalMinutesRead: newMinutes,
    badges: earnedBadges,
    recentActivity: recentActivity.map(a => ({
      storyId: a.storyId,
      storyTitle: a.storyTitle ?? "",
      completedAt: a.completedAt?.toISOString() ?? new Date().toISOString(),
      xpEarned: a.xpEarned,
    })),
  });
});

export default router;
