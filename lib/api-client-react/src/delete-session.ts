import { customFetch } from "./custom-fetch";

export async function deleteSession(
  sessionId: string,
  options?: RequestInit,
): Promise<{ id: string; deleted: boolean }> {
  return customFetch<{ id: string; deleted: boolean }>(
    `/api/sessions/${sessionId}`,
    { ...options, method: "DELETE" },
  );
}
