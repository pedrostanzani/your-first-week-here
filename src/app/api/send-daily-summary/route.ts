import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import DailySummaryEmail from "../../../../emails/daily-summary";
import { dailySummaryAgent } from "@/mastra/agents/daily-summary-agent";
import {
  DailySummaryContentSchema,
  DailySummaryContent,
} from "@/mastra/schemas/daily-summary";

const resend = new Resend(process.env.RESEND_API_KEY);

interface CompletedTask {
  title: string;
  description: string;
}

interface SendDailySummaryRequest {
  firstName: string;
  dayNumber: number;
  dayTitle: string;
  feedback?: string;
  completedTasks: CompletedTask[];
  totalTasks: number;
}

interface SendDailySummaryResponse {
  success: boolean;
  message: string;
  emailId?: string;
}

function buildPrompt(
  firstName: string,
  dayNumber: number,
  dayTitle: string,
  completedTasks: CompletedTask[],
  totalTasks: number,
  feedback?: string
): string {
  const completedCount = completedTasks.length;
  const taskList = completedTasks
    .map((t) => `- ${t.title}: ${t.description}`)
    .join("\n");

  return `Generate the email body content for a daily onboarding summary email.

## Context
- Employee name: ${firstName}
- Day number: ${dayNumber} of 5
- Day theme: "${dayTitle}"
- Tasks completed: ${completedCount} out of ${totalTasks}
${completedCount > 0 ? `\n## Completed Tasks\n${taskList}` : "\n## No tasks were marked as completed today."}
${feedback ? `\n## Employee Feedback\n"${feedback}"` : "\n## No feedback was provided."}

## Instructions
Generate warm, encouraging email content that:
1. Acknowledges their progress for Day ${dayNumber}
2. ${completedCount > 0 ? "Lists what they accomplished (use bullet points)" : "Encourages them without being condescending"}
3. ${feedback ? "Thanks them for their feedback" : ""}
4. ${dayNumber < 5 ? `Looks forward to Day ${dayNumber + 1}` : "Congratulates them on completing their first week!"}

Keep it concise, warm, and celebratory.`;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SendDailySummaryResponse>> {
  try {
    const body = (await request.json()) as SendDailySummaryRequest;
    const { firstName, dayNumber, dayTitle, feedback, completedTasks, totalTasks } = body;

    // Validate required fields
    if (!firstName || typeof firstName !== "string") {
      return NextResponse.json(
        { success: false, message: "First name is required" },
        { status: 400 }
      );
    }

    if (!dayNumber || typeof dayNumber !== "number") {
      return NextResponse.json(
        { success: false, message: "Day number is required" },
        { status: 400 }
      );
    }

    console.log("[send-daily-summary] 🚀 Generating email content with AI agent...");

    // Build the prompt for the agent
    const prompt = buildPrompt(
      firstName,
      dayNumber,
      dayTitle,
      completedTasks,
      totalTasks,
      feedback
    );

    // Generate the email content using the AI agent
    const response = await dailySummaryAgent.generate(prompt, {
      structuredOutput: {
        schema: DailySummaryContentSchema,
      },
    });

    const summaryContent = response.object as DailySummaryContent;

    if (!summaryContent || !summaryContent.content) {
      console.error("[send-daily-summary] ❌ Agent did not return valid content");
      return NextResponse.json(
        { success: false, message: "Failed to generate email content" },
        { status: 500 }
      );
    }

    console.log("[send-daily-summary] ✅ Email content generated:", summaryContent.content.length, "blocks");

    // Base URL for absolute image paths in emails
    const baseUrl = "https://first-week-here.vercel.app";

    // Send email using Resend with React Email template
    const { data, error } = await resend.emails.send({
      from: "Your Onboarding Buddy <onboarding@fwh.pedrostanzani.com>",
      to: "pedrostanzani@icloud.com",
      subject: `Day ${dayNumber} Complete! Here's your summary 📋`,
      react: DailySummaryEmail({
        firstName,
        dayNumber,
        content: summaryContent.content,
        baseUrl,
      }),
    });

    if (error) {
      console.error("Resend API error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send email. Please try again later.",
        },
        { status: 500 }
      );
    }

    console.log("[send-daily-summary] 📧 Email sent successfully:", data?.id);

    return NextResponse.json({
      success: true,
      message: "Daily summary email sent successfully",
      emailId: data?.id,
    });
  } catch (error) {
    console.error("Unexpected error sending daily summary email:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}
