import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetUserParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users/:id", async (req, res) => {
  const params = GetUserParams.parse({ id: req.params.id });
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ ...user, joinedAt: user.joinedAt?.toISOString() ?? new Date().toISOString() });
});

export default router;
