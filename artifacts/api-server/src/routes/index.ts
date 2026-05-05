import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectRouter from "./projects";
import sessionRouter from "./sessions";
import settingsRouter from "./settings";
import exportPackagesRouter from "./export-packages";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectRouter);
router.use(sessionRouter);
router.use(settingsRouter);
router.use(exportPackagesRouter);

export default router;
