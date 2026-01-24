import { NextRequest } from "next/server";
import { onboardingAgent } from "@/mastra/agents/onboarding-agent";

interface GeneratePlanRequest {
  name: string;
  role: string;
  goals?: string;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body = (await request.json()) as GeneratePlanRequest;
    const { name, role, goals } = body;

    // Validate required fields
    if (!name || !role) {
      return new Response(
        JSON.stringify({ error: "Name and role are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const prompt = buildPrompt(name, role, goals);

    console.log("[generate-plan-stream] 🚀 Starting stream for:", { name, role });

    const stream = await onboardingAgent.stream(prompt);

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "start", message: "Starting plan generation..." })}\n\n`)
          );

          let fullText = "";

          for await (const chunk of stream.fullStream) {
            // Log chunk structure for debugging
            console.log(`[generate-plan-stream] Chunk:`, JSON.stringify(chunk).slice(0, 300));
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const c = chunk as any;
            
            switch (chunk.type) {
              case "tool-call": {
                // Try multiple possible property paths
                const toolName = c.toolName || c.payload?.toolName || c.name || c.payload?.name || "unknown-tool";
                console.log(`[generate-plan-stream] 🔧 Tool call: ${toolName}`);
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "tool-call",
                      toolName,
                    })}\n\n`
                  )
                );
                break;
              }

              case "tool-result": {
                // Try multiple possible property paths
                const toolName = c.toolName || c.payload?.toolName || c.name || c.payload?.name || "unknown-tool";
                const result = c.result || c.payload?.result || null;
                console.log(`[generate-plan-stream] ✅ Tool result: ${toolName}`);
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "tool-result",
                      toolName,
                      result: summarizeToolResult(result),
                    })}\n\n`
                  )
                );
                break;
              }

              case "text-delta": {
                const textDelta = c.textDelta || c.payload?.text || c.text || "";
                fullText += textDelta;
                break;
              }

              case "finish":
                console.log("[generate-plan-stream] 🏁 Stream finished");
                break;
            }
          }

          // Get the final text and try to parse it as JSON for the plan
          const finalText = await stream.text;
          console.log("[generate-plan-stream] 📝 Final text length:", finalText.length);

          // Try to extract JSON from the response
          let plan = null;
          try {
            // Look for JSON in the response
            const jsonMatch = finalText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              plan = JSON.parse(jsonMatch[0]);
            }
          } catch (parseError) {
            console.log("[generate-plan-stream] ⚠️ Could not parse JSON from response");
          }

          // Send completion event with the plan
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                plan,
                text: finalText,
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          console.error("[generate-plan-stream] ❌ Stream error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message: error instanceof Error ? error.message : "Unknown error",
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[generate-plan-stream] ❌ Request error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Summarize tool results to avoid sending huge payloads to the client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function summarizeToolResult(result: any): any {
  if (!result) return null;
  
  // Handle handbook article list
  if (result.articles && Array.isArray(result.articles)) {
    return {
      type: "article-list",
      count: result.articles.length,
      preview: result.articles.slice(0, 5).map((a: { title: string; category: string }) => ({
        title: a.title,
        category: a.category,
      })),
    };
  }
  
  // Handle fetched article content
  if (result.success && result.content) {
    return {
      type: "article-content",
      title: result.title,
      category: result.category,
      contentPreview: result.content.slice(0, 300) + (result.content.length > 300 ? "..." : ""),
    };
  }
  
  // Handle GitHub issues list
  if (result.issues && Array.isArray(result.issues)) {
    return {
      type: "issue-list",
      count: result.issues.length,
      preview: result.issues.slice(0, 5).map((i: { number: number; title: string }) => ({
        number: i.number,
        title: i.title,
      })),
    };
  }
  
  // Handle single GitHub issue
  if (result.issue && result.issue.number) {
    return {
      type: "issue-detail",
      number: result.issue.number,
      title: result.issue.title,
      state: result.issue.state,
    };
  }
  
  // Handle GitHub PRs list
  if (result.pullRequests && Array.isArray(result.pullRequests)) {
    return {
      type: "pr-list",
      count: result.pullRequests.length,
      preview: result.pullRequests.slice(0, 5).map((p: { number: number; title: string }) => ({
        number: p.number,
        title: p.title,
      })),
    };
  }
  
  // Fallback: return stringified preview
  const str = JSON.stringify(result);
  if (str.length > 500) {
    return { type: "raw", preview: str.slice(0, 500) + "..." };
  }
  return { type: "raw", data: result };
}

function buildPrompt(name: string, role: string, goals?: string): string {
  const isEngineer =
    role.toLowerCase().includes("engineer") ||
    role.toLowerCase().includes("developer") ||
    role.toLowerCase().includes("swe");

  return `Create a personalized 5-day onboarding plan for a new employee.

Name: ${name}
Role: ${role}
${goals ? `Personal goals for first week: ${goals}` : ""}

Instructions:
1. First, use listHandbookArticles to discover relevant articles for their role
2. ${isEngineer ? "Use listGitHubIssues to find a good first issue for them to work on" : "Focus on role-specific handbook content"}
3. Create a comprehensive 5-day plan with specific, actionable tasks
4. Include references to actual handbook articles you found (use the slug)
5. ${isEngineer ? "Include a suggested first issue from GitHub with the issue number, title, URL, and why it's a good fit" : "Include key people they should connect with"}

IMPORTANT: Your response MUST be a valid JSON object matching this structure:
{
  "employeeName": "${name}",
  "role": "${role}",
  "createdAt": "${new Date().toISOString()}",
  "days": [
    {
      "day": 1,
      "title": "Day theme",
      "summary": "Brief summary",
      "tasks": [
        {
          "id": "unique-id",
          "title": "Task title",
          "description": "Task description",
          "type": "reading|meeting|task|exploration|contribution",
          "priority": "high|medium|low",
          "handbookArticle": { "slug": "article-slug", "title": "Article Title" }
        }
      ]
    }
  ],
  "suggestedFirstIssue": {
    "number": 123,
    "title": "Issue title",
    "url": "https://github.com/...",
    "reason": "Why this is good for a first contribution"
  }
}

Make sure each day has 3-5 tasks. Return ONLY the JSON object, no additional text.`;
}
