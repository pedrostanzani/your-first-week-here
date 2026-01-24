import { Mastra } from "@mastra/core";
import { onboardingAgent } from "@/mastra/agents/onboarding-agent";
import { dailySummaryAgent } from "@/mastra/agents/daily-summary-agent";

export const mastra = new Mastra({
  agents: {
    "onboarding-agent": onboardingAgent,
    "daily-summary-agent": dailySummaryAgent,
  },
});
