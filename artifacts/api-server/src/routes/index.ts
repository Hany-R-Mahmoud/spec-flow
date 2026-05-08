import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectRouter from "./projects";
import sessionRouter from "./sessions";
import generationRouter from "./generation";
import settingsRouter from "./settings";
import exportPackagesRouter from "./export-packages";
import integrationsRouter from "./integrations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectRouter);
router.use(sessionRouter);
router.use(generationRouter);
router.use(settingsRouter);
router.use(exportPackagesRouter);
router.use(integrationsRouter);

export default router;
