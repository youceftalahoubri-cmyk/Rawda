import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db";
import { CreateCategoryBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/categories", async (_req, res) => {
  const cats = await db.select().from(categoriesTable);
  res.json(cats);
});

router.post("/categories", async (req, res) => {
  const body = CreateCategoryBody.parse(req.body);
  const [cat] = await db.insert(categoriesTable).values(body).returning();
  res.status(201).json(cat);
});

export default router;
