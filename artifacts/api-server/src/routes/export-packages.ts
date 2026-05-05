import { Router, type IRouter } from "express";
import { ListExportPackagesResponse } from "@workspace/api-zod";
import { exportPackagesTable } from "@workspace/db";
import { sendUnexpectedError } from "./error-response";
import {
  asc,
  ensureSeedData,
  requireDatabase,
  toExportPackage,
} from "./persistence";

const router: IRouter = Router();

router.get("/export-packages", async (_req, res) => {
  try {
    const db = requireDatabase();
    await ensureSeedData(db);
    const exportPackages = await db
      .select()
      .from(exportPackagesTable)
      .orderBy(asc(exportPackagesTable.date));

    res.json(
      ListExportPackagesResponse.parse({
        exportPackages: exportPackages.map(toExportPackage),
      }),
    );
  } catch (error) {
    sendUnexpectedError(res, error);
  }
});

export default router;
