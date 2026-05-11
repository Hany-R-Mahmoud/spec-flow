import type { Response } from "express";
import { logger } from "../lib/logger.js";

export function sendError(
  res: Response,
  status: number,
  message: string,
): Response {
  return res.status(status).json({ message });
}

export function sendUnexpectedError(res: Response, error: unknown): Response {
  if (hasZodIssues(error)) {
    const message =
      error.issues[0]?.message ??
      "Request validation failed at the API boundary.";
    return sendError(res, 400, message);
  }

  if (error instanceof Error) {
    logger.error(
      { err: error, reqId: (res.req as { id?: string } | undefined)?.id },
      "Unexpected API error",
    );
    return sendError(res, 500, "Unexpected server error.");
  }

  logger.error(
    { err: error, reqId: (res.req as { id?: string } | undefined)?.id },
    "Unexpected API error",
  );
  return sendError(res, 500, "Unexpected server error.");
}

function hasZodIssues(
  error: unknown,
): error is { issues: Array<{ message?: string }> } {
  return (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as { issues?: unknown }).issues)
  );
}
