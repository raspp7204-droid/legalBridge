import { createDeepSeek } from "@ai-sdk/deepseek";
import {
  convertToModelMessages,
  jsonSchema,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { ASSISTANT_SYSTEM_PROMPT, CATEGORIES } from "@/lib/assistant";
import { searchAdvocates, type AdvocateQuery } from "@/lib/lawyer-search";

// Streaming needs a node/edge runtime that stays open long enough for a full answer.
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
  // Defaults to https://api.deepseek.com; override only if you proxy it.
  baseURL: process.env.DEEPSEEK_BASE_URL,
});

/**
 * The assistant's one tool: real advocates out of the real database.
 *
 * Schema is declared with `jsonSchema` from `ai` rather than zod — zod is not
 * a direct dependency here, only a transitive one, so it is not importable
 * under pnpm's strict node_modules layout.
 */
const ADVOCATE_TOOL = tool({
  description:
    "Look up real, verified LawNest advocates in the database. Call this whenever " +
    "the user describes a legal problem, names a budget, names a city or a language, " +
    "or asks who they should talk to. Returns advocates that actually exist with " +
    "their real fees — never answer with an advocate you did not get from here.",
  inputSchema: jsonSchema<AdvocateQuery>({
    type: "object",
    properties: {
      categorySlug: {
        type: "string",
        enum: CATEGORIES.map((c) => c.slug),
        description: "The LawNest practice area that matches the user's problem.",
      },
      maxFee: {
        type: "number",
        description:
          "Most the user is willing to pay for one 30-minute consultation. Fees are 399, 549 or 799.",
      },
      city: {
        type: "string",
        description:
          "City the user mentioned, e.g. Bengaluru, Delhi, Mumbai, Pune, Jaipur, Lucknow, Hyderabad, Kolkata.",
      },
      language: {
        type: "string",
        description:
          "Language the user wants to be advised in, e.g. Hindi, Kannada, Marathi, Tamil, Bengali.",
      },
      minYears: {
        type: "number",
        description: "Minimum years in practice, only if the user asked for seniority.",
      },
    },
    required: [],
    additionalProperties: false,
  }),
  execute: async (input) => searchAdvocates(input ?? {}, 3),
});

export async function POST(req: Request) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return Response.json(
      { error: "DEEPSEEK_API_KEY is not set. Add it to .env.local and restart." },
      { status: 500 },
    );
  }

  let messages: UIMessage[];
  try {
    ({ messages } = (await req.json()) as { messages: UIMessage[] });
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "No messages provided." }, { status: 400 });
  }

  // Keep the request small and predictable on stage: last 20 turns only.
  const recent = messages.slice(-20);

  const result = streamText({
    model: deepseek("deepseek-chat"),
    system: ASSISTANT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(recent),
    temperature: 0.4,
    maxOutputTokens: 800,
    tools: { searchAdvocates: ADVOCATE_TOOL },
    // tool call → result → answer. Caps a misbehaving model on stage.
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      console.error("[assistant]", error);
      return "The assistant could not answer just now. Please try again.";
    },
  });
}
