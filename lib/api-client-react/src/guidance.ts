import { customFetch } from "./custom-fetch";

export type GuidanceItemType = "error" | "warning" | "success" | "action";

export type GuidanceActionKey =
  | "generate-prd"
  | "generate-epics"
  | "generate-stories"
  | "generate-quality"
  | "send-to-dev-review"
  | "complete-review"
  | "edit-step-skill";

export type AiGuidanceItem = {
  type: GuidanceItemType;
  message: string;
  actionKey?: GuidanceActionKey | null;
};

export type AiGuidanceResponse = {
  items: AiGuidanceItem[];
};

export async function getWorkflowGuidance(
  sessionId: string,
  request: Record<string, unknown>,
): Promise<AiGuidanceResponse> {
  return customFetch<AiGuidanceResponse>(`/api/sessions/${sessionId}/guidance`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}
