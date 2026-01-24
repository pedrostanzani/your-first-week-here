import { NextRequest, NextResponse } from "next/server";
import { onboardingAgent } from "@/mastra/agents/onboarding-agent";
import { OnboardingPlanSchema, OnboardingPlan } from "@/mastra/schemas/onboarding-plan";

interface GeneratePlanRequest {
  name: string;
  role: string;
  goals?: string;
}

interface GeneratePlanResponse {
  success: boolean;
  plan?: OnboardingPlan;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<GeneratePlanResponse>> {
  const startTime = Date.now();
  console.log("\n" + "=".repeat(60));
  console.log("[generate-plan] 🚀 Request received");
  
  try {
    const body = (await request.json()) as GeneratePlanRequest;
    const { name, role, goals } = body;

    console.log("[generate-plan] 📋 Request payload:", { name, role, goals });

    // Validate required fields
    if (!name || typeof name !== "string") {
      console.log("[generate-plan] ❌ Validation failed: Name is required");
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    if (!role || typeof role !== "string") {
      console.log("[generate-plan] ❌ Validation failed: Role is required");
      return NextResponse.json(
        { success: false, error: "Role is required" },
        { status: 400 }
      );
    }

    // Build the prompt for the agent
    const prompt = buildPrompt(name, role, goals);
    console.log("[generate-plan] 📝 Prompt built, length:", prompt.length, "chars");
    console.log("[generate-plan] 🤖 Calling onboardingAgent.generate()...");

    // Generate the structured onboarding plan
    const response = await onboardingAgent.generate(prompt, {
      structuredOutput: {
        schema: OnboardingPlanSchema,
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[generate-plan] ✅ Agent response received in ${elapsed}s`);
    
    // Log response details
    if (response.text) {
      console.log("[generate-plan] 💬 Agent text response length:", response.text.length, "chars");
    }
    
    if (response.toolCalls && response.toolCalls.length > 0) {
      console.log("[generate-plan] 🔧 Tool calls made:", response.toolCalls.length);
      for (const call of response.toolCalls) {
        console.log(`   - ${call.toolName}`);
      }
    }

    const plan = response.object as OnboardingPlan;
    
    if (plan) {
      console.log("[generate-plan] 📦 Plan generated successfully:");
      console.log(`   - Employee: ${plan.employeeName}`);
      console.log(`   - Role: ${plan.role}`);
      console.log(`   - Days: ${plan.days?.length || 0}`);
      console.log(`   - Total tasks: ${plan.days?.reduce((sum, d) => sum + (d.tasks?.length || 0), 0) || 0}`);
      if (plan.suggestedFirstIssue) {
        console.log(`   - First issue: #${plan.suggestedFirstIssue.number}`);
      }
    } else {
      console.log("[generate-plan] ⚠️ Plan object is null/undefined");
    }

    console.log("[generate-plan] ✨ Sending success response");
    console.log("=".repeat(60) + "\n");

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`[generate-plan] ❌ Error after ${elapsed}s:`, error);
    
    if (error instanceof Error) {
      console.error("[generate-plan] Error name:", error.name);
      console.error("[generate-plan] Error message:", error.message);
      console.error("[generate-plan] Error stack:", error.stack);
    }
    
    console.log("=".repeat(60) + "\n");
    
    return NextResponse.json(
      {
        success: false,
        error: `Failed to generate plan: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

function buildPrompt(name: string, role: string, goals?: string): string {
  const isEngineer = role.toLowerCase().includes("engineer") || 
                     role.toLowerCase().includes("developer") ||
                     role.toLowerCase().includes("swe");

  let prompt = `Create a personalized 5-day onboarding plan for a new employee:

Name: ${name}
Role: ${role}
${goals ? `Personal goals for first week: ${goals}` : ""}

Instructions:
1. First, use listHandbookArticles to discover relevant articles for their role
2. ${isEngineer ? "Use listGitHubIssues to find a good first issue for them to work on" : "Focus on role-specific handbook content"}
3. Create a comprehensive 5-day plan with specific, actionable tasks
4. Include references to actual handbook articles you found (use the slug)
5. ${isEngineer ? "Include a suggested first issue from GitHub with the issue number, title, URL, and why it's a good fit" : "Include key people they should connect with"}

Make sure each day has 3-5 tasks that are achievable and build on each other.
The plan should feel welcoming and set them up for success.

Today's date for the createdAt field: ${new Date().toISOString()}`;

  return prompt;
}
