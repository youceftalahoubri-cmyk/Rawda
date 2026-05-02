import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storiesRouter from "./stories";
import categoriesRouter from "./categories";
import usersRouter from "./users";
import progressRouter from "./progress";
import bookmarksRouter from "./bookmarks";
import reflectionsRouter from "./reflections";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storiesRouter);
router.use(categoriesRouter);
router.use(usersRouter);
router.use(progressRouter);
router.use(bookmarksRouter);
router.use(reflectionsRouter);
router.use(dashboardRouter);

export default router;
