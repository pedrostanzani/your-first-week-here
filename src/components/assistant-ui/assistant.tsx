"use client";

import { useEffect, useState } from "react";
import { AssistantRuntimeProvider, useThreadRuntime } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { Thread } from "./thread";
import { useOnboardingStore } from "@/stores/onboarding-store";

function AssistantWithInitialPrompt() {
  const threadRuntime = useThreadRuntime();
  const [promptSent, setPromptSent] = useState(false);

  useEffect(() => {
    if (promptSent) return;

    // Check for initial prompt with a small delay to allow store to sync
    const checkAndSendPrompt = () => {
      const prompt = useOnboardingStore.getState().initialChatPrompt;
      if (prompt) {
        threadRuntime.append({
          role: "user",
          content: [{ type: "text", text: prompt }],
        });
        useOnboardingStore.getState().setInitialChatPrompt(null);
        setPromptSent(true);
      }
    };

    // Check immediately
    checkAndSendPrompt();

    // Also check after a short delay in case of timing issues
    const timer = setTimeout(checkAndSendPrompt, 150);
    return () => clearTimeout(timer);
  }, [threadRuntime, promptSent]);

  return <Thread />;
}

export function Assistant() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantWithInitialPrompt />
    </AssistantRuntimeProvider>
  );
}
