import { createUIMessageStreamResponse } from "ai";
import { handleChatStream } from "@mastra/ai-sdk";
import { mastra } from "@/mastra";

// Allow streaming responses up to 120 seconds for complex multi-tool conversations
export const maxDuration = 120;

export async function POST(req: Request) {
  const params = await req.json();

  const stream = await handleChatStream({
    mastra,
    agentId: "onboarding-agent",
    params,
    defaultOptions: {
      // Allow up to 15 sequential tool calls/LLM steps
      maxSteps: 15,
    },
  });

  return createUIMessageStreamResponse({ stream });
}
