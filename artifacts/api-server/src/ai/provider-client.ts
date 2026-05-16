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
    const body = await response.json() as { error?: { message?: string } };
    if (body.error?.message) {
      message = body.error.message;
    }
  } catch {
    // Keep generic error. Provider bodies may be empty or non-JSON.
  }

  return new AiProviderError(message, classifyStatus(response.status));
}

export async function validateOpenAiKey(args: {
  apiKey: string;
  model: string;
  baseUrl?: string;
}): Promise<void> {
  const response = await fetch(buildProviderUrl(args.baseUrl, `models/${encodeURIComponent(args.model)}`), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
    },
  });

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
  const response = await fetch(buildProviderUrl(args.baseUrl, "chat/completions"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: args.model,
      messages: args.messages,
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw await parseProviderError(response);
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
