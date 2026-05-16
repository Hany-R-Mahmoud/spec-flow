export type LiveAiMessage = {
  role: "system" | "user";
  content: string;
};

export type LiveAiResult = {
  content: string;
  providerRequestId: string | null;
  tokenEstimate: number | null;
};

export class AiProviderError extends Error {
  constructor(
    message: string,
    public readonly errorClass: string,
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}

const DEFAULT_AI_PROVIDER_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_AI_PROVIDER_TIMEOUT_MS = 180_000;
const DEFAULT_AI_PROVIDER_VALIDATION_TIMEOUT_MS = 60_000;

function readTimeoutMs(envName: string, fallback: number): number {
  const raw = process.env[envName];
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const signalWithTimeout = AbortSignal as typeof AbortSignal & {
    timeout?: (milliseconds: number) => AbortSignal;
  };

  if (signalWithTimeout.timeout) {
    return signalWithTimeout.timeout(timeoutMs);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

function toProviderFetchError(error: unknown, timeoutMs: number): AiProviderError {
  if (error instanceof AiProviderError) {
    return error;
  }

  if (error instanceof DOMException && error.name === "TimeoutError") {
    return new AiProviderError(
      `AI provider did not respond within ${Math.round(timeoutMs / 1000)} seconds. Try again or choose a faster model.`,
      "timeout",
    );
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return new AiProviderError(
      `AI provider request was aborted after ${Math.round(timeoutMs / 1000)} seconds. Try again or choose a faster model.`,
      "timeout",
    );
  }

  throw error;
}

function normalizeBaseUrl(baseUrl: string | null | undefined): string {
  const trimmed = baseUrl?.trim();
  if (!trimmed) {
    return DEFAULT_AI_PROVIDER_BASE_URL;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new AiProviderError("AI provider base URL must be a valid absolute URL.", "request");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new AiProviderError("AI provider base URL must start with http:// or https://.", "request");
  }

  return url.toString().replace(/\/+$/, "");
}

function buildProviderUrl(baseUrl: string | null | undefined, path: string): string {
  return new URL(path, `${normalizeBaseUrl(baseUrl)}/`).toString();
}

function classifyStatus(status: number): string {
  if (status === 401 || status === 403) {
    return "auth";
  }

  if (status === 429) {
    return "rate_limit";
  }

  if (status >= 500) {
    return "provider";
  }

  return "request";
}

async function parseProviderError(response: Response): Promise<AiProviderError> {
  let message = `AI provider request failed with status ${response.status}.`;

  try {
    const body = await response.json() as unknown;
    message = extractProviderErrorMessage(body) ?? message;
  } catch {
    // Keep generic error. Provider bodies may be empty or non-JSON.
  }

  return new AiProviderError(message, classifyStatus(response.status));
}

function extractProviderErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const record = body as Record<string, unknown>;
  const error = record.error;

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const errorRecord = error as Record<string, unknown>;
    if (typeof errorRecord.message === "string") {
      return errorRecord.message;
    }
    if (typeof errorRecord.detail === "string") {
      return errorRecord.detail;
    }
  }

  if (typeof record.message === "string") {
    return record.message;
  }

  if (typeof record.detail === "string") {
    return record.detail;
  }

  return null;
}

function shouldRetryWithoutJsonMode(error: AiProviderError): boolean {
  if (error.errorClass !== "request") {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("response_format") ||
    message.includes("json_object") ||
    message.includes("json mode") ||
    message.includes("unsupported") ||
    message.includes("unrecognized") ||
    message.includes("unknown parameter")
  );
}

async function postChatCompletion(args: {
  apiKey: string;
  model: string;
  baseUrl?: string;
  messages: LiveAiMessage[];
  jsonMode: boolean;
  timeoutMs: number;
}): Promise<Response> {
  const body: Record<string, unknown> = {
    model: args.model,
    messages: args.messages,
    temperature: 0.2,
  };

  if (args.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  return fetch(buildProviderUrl(args.baseUrl, "chat/completions"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: createTimeoutSignal(args.timeoutMs),
  });
}

export async function validateOpenAiKey(args: {
  apiKey: string;
  model: string;
  baseUrl?: string;
}): Promise<void> {
  const timeoutMs = readTimeoutMs(
    "AI_PROVIDER_VALIDATION_TIMEOUT_MS",
    DEFAULT_AI_PROVIDER_VALIDATION_TIMEOUT_MS,
  );
  let response: Response;

  try {
    response = await fetch(buildProviderUrl(args.baseUrl, "chat/completions"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: args.model,
        messages: [
          { role: "system", content: "Reply with one word." },
          { role: "user", content: "ok" },
        ],
        max_tokens: 1,
      }),
      signal: createTimeoutSignal(timeoutMs),
    });
  } catch (error) {
    throw toProviderFetchError(error, timeoutMs);
  }

  if (!response.ok) {
    throw await parseProviderError(response);
  }
}

export async function runOpenAiJson(args: {
  apiKey: string;
  model: string;
  baseUrl?: string;
  messages: LiveAiMessage[];
}): Promise<LiveAiResult> {
  const timeoutMs = readTimeoutMs(
    "AI_PROVIDER_TIMEOUT_MS",
    DEFAULT_AI_PROVIDER_TIMEOUT_MS,
  );
  let response: Response;

  try {
    response = await postChatCompletion({ ...args, jsonMode: true, timeoutMs });
  } catch (error) {
    throw toProviderFetchError(error, timeoutMs);
  }

  if (!response.ok) {
    const jsonModeError = await parseProviderError(response);
    if (!shouldRetryWithoutJsonMode(jsonModeError)) {
      throw jsonModeError;
    }

    try {
      response = await postChatCompletion({ ...args, jsonMode: false, timeoutMs });
    } catch (error) {
      throw toProviderFetchError(error, timeoutMs);
    }

    if (!response.ok) {
      throw await parseProviderError(response);
    }
  }

  const body = await response.json() as {
    id?: string;
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { total_tokens?: number };
  };
  const content = body.choices?.[0]?.message?.content;

  if (!content) {
    throw new AiProviderError("AI provider returned an empty response.", "invalid_response");
  }

  return {
    content,
    providerRequestId: body.id ?? null,
    tokenEstimate: body.usage?.total_tokens ?? null,
  };
}
