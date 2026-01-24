import { Mastra } from "@mastra/core";
import { onboardingAgent } from "@/mastra/agents/onboarding-agent";

export const mastra = new Mastra({
  agents: {
    "onboarding-agent": onboardingAgent,
  },
});
