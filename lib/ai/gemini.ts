import { z } from "zod";

export const GEMINI_MODEL = "gemini-3.5-flash-lite";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const TIMEOUT_MS = 8_000;

const providerResponseSchema = z.object({
  candidates: z.array(z.object({
    content: z.object({ parts: z.array(z.object({ text: z.string().optional() })) }),
  })).min(1),
});

export class GeminiUnavailableError extends Error {}

export interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

export async function generateGeminiJson(options: {
  parts: GeminiPart[];
  responseSchema: Record<string, unknown>;
  maxOutputTokens: number;
  apiKey?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}): Promise<unknown> {
  const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiUnavailableError("missing_api_key");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? TIMEOUT_MS);
  try {
    const response = await (options.fetchImpl ?? fetch)(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: options.parts }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: options.maxOutputTokens,
          responseMimeType: "application/json",
          responseJsonSchema: options.responseSchema,
        },
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new GeminiUnavailableError(`provider_${response.status}`);
    const parsed = providerResponseSchema.safeParse(await response.json());
    if (!parsed.success) throw new GeminiUnavailableError("malformed_provider_response");
    const text = parsed.data.candidates[0]?.content.parts.map((part) => part.text ?? "").join("").trim();
    if (!text) throw new GeminiUnavailableError("empty_provider_response");
    try { return JSON.parse(text); } catch { throw new GeminiUnavailableError("invalid_provider_json"); }
  } catch (error) {
    if (error instanceof GeminiUnavailableError) throw error;
    if (error instanceof Error && error.name === "AbortError") throw new GeminiUnavailableError("provider_timeout");
    throw new GeminiUnavailableError("provider_failure");
  } finally {
    clearTimeout(timer);
  }
}
