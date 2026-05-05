import type { Response } from "express";

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
    return sendError(res, 500, error.message);
  }

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
