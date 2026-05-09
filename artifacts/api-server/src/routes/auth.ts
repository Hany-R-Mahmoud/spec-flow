import { getAuth } from "@clerk/express";
import type { Request, Response } from "express";
import { sendError } from "./error-response";

export type WorkspaceType = "personal" | "organization";

export type WorkspaceAuthContext = {
  actorUserId: string;
  workspaceId: string;
  workspaceType: WorkspaceType;
  orgId: string | null;
  orgRole: string | null;
  canManageWorkspace: boolean;
};

export function getWorkspaceAuthContext(
  req: Request,
): WorkspaceAuthContext | null {
  const auth = getAuth(req);

  if (!auth.isAuthenticated || !auth.userId) {
    return null;
  }

  const orgId = auth.orgId ?? null;
  const workspaceType: WorkspaceType = orgId ? "organization" : "personal";
  const workspaceId = workspaceType === "organization"
    ? `org:${orgId}`
    : `personal:${auth.userId}`;

  return {
    actorUserId: auth.userId,
    workspaceId,
    workspaceType,
    orgId,
    orgRole: auth.orgRole ?? null,
    canManageWorkspace:
      workspaceType === "personal" || auth.orgRole === "org:admin",
  };
}

export function requireAuthContext(
  req: Request,
  res: Response,
): WorkspaceAuthContext | null {
  const context = getWorkspaceAuthContext(req);

  if (!context) {
    sendError(res, 401, "Authentication required.");
    return null;
  }

  return context;
}

export function requireMutableWorkspaceContext(
  req: Request,
  res: Response,
): WorkspaceAuthContext | null {
  const context = requireAuthContext(req, res);
  if (!context) {
    return null;
  }

  if (!context.canManageWorkspace) {
    sendError(res, 403, "Forbidden.");
    return null;
  }

  return context;
}
