import { createDeepSeek } from "@ai-sdk/deepseek";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { ASSISTANT_SYSTEM_PROMPT } from "@/lib/assistant";

// Streaming needs a node/edge runtime that stays open long enough for a full answer.
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
  // Defaults to https://api.deepseek.com; override only if you proxy it.
  baseURL: process.env.DEEPSEEK_BASE_URL,
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
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      console.error("[assistant]", error);
      return "The assistant could not answer just now. Please try again.";
    },
  });
}
