import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { reflectionsTable, storiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetUserReflectionsParams, CreateReflectionParams, CreateReflectionBody, DeleteReflectionParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users/:id/reflections", async (req, res) => {
  const params = GetUserReflectionsParams.parse({ id: req.params.id });
  const rows = await db
    .select({
      id: reflectionsTable.id,
      userId: reflectionsTable.userId,
      storyId: reflectionsTable.storyId,
      storyTitle: storiesTable.title,
      content: reflectionsTable.content,
      createdAt: reflectionsTable.createdAt,
    })
    .from(reflectionsTable)
    .leftJoin(storiesTable, eq(reflectionsTable.storyId, storiesTable.id))
    .where(eq(reflectionsTable.userId, params.id));
  res.json(rows.map(r => ({
    ...r,
    storyTitle: r.storyTitle ?? "",
    createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(),
  })));
});

router.post("/users/:id/reflections", async (req, res) => {
  const params = CreateReflectionParams.parse({ id: req.params.id });
  const body = CreateReflectionBody.parse(req.body);
  const [ref] = await db.insert(reflectionsTable).values({ userId: params.id, storyId: body.storyId, content: body.content }).returning();
  const [story] = await db.select().from(storiesTable).where(eq(storiesTable.id, body.storyId));
  res.status(201).json({
    id: ref.id,
    userId: ref.userId,
    storyId: ref.storyId,
    storyTitle: story?.title ?? "",
    content: ref.content,
    createdAt: ref.createdAt?.toISOString() ?? new Date().toISOString(),
  });
});

router.delete("/users/:id/reflections/:reflectionId", async (req, res) => {
  const params = DeleteReflectionParams.parse({ id: req.params.id, reflectionId: req.params.reflectionId });
  await db.delete(reflectionsTable).where(eq(reflectionsTable.id, params.reflectionId));
  res.json({ success: true });
});

export default router;
