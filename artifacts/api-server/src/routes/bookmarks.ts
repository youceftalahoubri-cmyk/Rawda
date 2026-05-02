import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bookmarksTable, storiesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { GetUserBookmarksParams, AddBookmarkParams, AddBookmarkBody, RemoveBookmarkParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users/:id/bookmarks", async (req, res) => {
  const params = GetUserBookmarksParams.parse({ id: req.params.id });
  const rows = await db
    .select({
      id: bookmarksTable.id,
      userId: bookmarksTable.userId,
      storyId: bookmarksTable.storyId,
      storyTitle: storiesTable.title,
      storyCoverImageUrl: storiesTable.coverImageUrl,
      storyExcerpt: storiesTable.excerpt,
      storyReadingTimeMinutes: storiesTable.readingTimeMinutes,
      createdAt: bookmarksTable.createdAt,
    })
    .from(bookmarksTable)
    .leftJoin(storiesTable, eq(bookmarksTable.storyId, storiesTable.id))
    .where(eq(bookmarksTable.userId, params.id));
  res.json(rows.map(r => ({
    ...r,
    storyTitle: r.storyTitle ?? "",
    storyExcerpt: r.storyExcerpt ?? "",
    storyReadingTimeMinutes: r.storyReadingTimeMinutes ?? 5,
    createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(),
  })));
});

router.post("/users/:id/bookmarks", async (req, res) => {
  const params = AddBookmarkParams.parse({ id: req.params.id });
  const body = AddBookmarkBody.parse(req.body);

  const [bm] = await db.insert(bookmarksTable).values({ userId: params.id, storyId: body.storyId }).returning();
  const [story] = await db.select().from(storiesTable).where(eq(storiesTable.id, body.storyId));

  res.status(201).json({
    id: bm.id,
    userId: bm.userId,
    storyId: bm.storyId,
    storyTitle: story?.title ?? "",
    storyCoverImageUrl: story?.coverImageUrl ?? null,
    storyExcerpt: story?.excerpt ?? "",
    storyReadingTimeMinutes: story?.readingTimeMinutes ?? 5,
    createdAt: bm.createdAt?.toISOString() ?? new Date().toISOString(),
  });
});

router.delete("/users/:id/bookmarks/:storyId", async (req, res) => {
  const params = RemoveBookmarkParams.parse({ id: req.params.id, storyId: req.params.storyId });
  await db.delete(bookmarksTable).where(and(eq(bookmarksTable.userId, params.id), eq(bookmarksTable.storyId, params.storyId)));
  res.json({ success: true });
});

export default router;
