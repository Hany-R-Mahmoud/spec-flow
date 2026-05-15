import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import projectRouter from "./projects.js";
import sessionRouter from "./sessions.js";
import generationRouter from "./generation.js";
import settingsRouter from "./settings.js";
import aiProviderRouter from "./ai-provider.js";
import exportPackagesRouter from "./export-packages.js";
import integrationsRouter from "./integrations.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectRouter);
router.use(sessionRouter);
router.use(generationRouter);
router.use(settingsRouter);
router.use(aiProviderRouter);
router.use(exportPackagesRouter);
router.use(integrationsRouter);

export default router;
