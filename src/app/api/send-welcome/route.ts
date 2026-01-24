import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import WelcomeEmail from "../../../../emails/welcome";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendWelcomeRequest {
  email: string;
  name?: string;
  role?: string;
}

interface SendWelcomeResponse {
  success: boolean;
  message: string;
  emailId?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SendWelcomeResponse>> {
  try {
    const body = (await request.json()) as SendWelcomeRequest;
    const { email, name, role } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    const firstName = name?.trim() || "there";
    
    // Get the base URL for absolute image paths in emails
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    // Send email using Resend with React Email template
    const { data, error } = await resend.emails.send({
      from: "Your Onboarding Buddy <onboarding@fwh.pedrostanzani.com>",
      to: email,
      subject: "It's your first week here! 🌃",
      react: WelcomeEmail({
        firstName,
        companyName: "Resend",
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

    return NextResponse.json({
      success: true,
      message: "Welcome email sent successfully",
      emailId: data?.id,
    });
  } catch (error) {
    console.error("Unexpected error sending welcome email:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}
