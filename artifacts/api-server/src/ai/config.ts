import type { GenerationMode } from "@workspace/db";

export type GenerationRuntime = {
  mode: GenerationMode;
  unavailableReason: string | null;
  modelLabel: string;
};

export function getGenerationRuntime(): GenerationRuntime {
  const configuredMode = process.env["SPECFLOW_AI_MODE"]?.toLowerCase();

  if (configuredMode === "unavailable") {
    return {
      mode: "unavailable",
      unavailableReason:
        "AI generation is disabled by SPECFLOW_AI_MODE=unavailable.",
      modelLabel: "disabled",
    };
  }

  if (configuredMode === "live") {
    return {
      mode: "unavailable",
      unavailableReason:
        "Live model mode is not wired in this MVP. Use demo mode or remove SPECFLOW_AI_MODE=live.",
      modelLabel: "live-not-configured",
    };
  }

  return {
    mode: "demo",
    unavailableReason: null,
    modelLabel: "deterministic-demo",
  };
}
