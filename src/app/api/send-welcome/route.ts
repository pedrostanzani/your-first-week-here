import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

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

    const greeting = name?.trim() || "there";
    const roleText = role ? ` in ${role}` : "";

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Your Onboarding Buddy <onboarding@fwh.pedrostanzani.com>",
      to: email,
      subject: "Welcome to Resend! Your First Week Starts Now 🚀",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Hello ${greeting}!</h1>
          <p>Welcome to your first week${roleText}! We're excited to have you here.</p>
          <p>This is a hello world email - your personalized onboarding content will be coming soon!</p>
          <br />
          <p>Best,<br />Your Onboarding Buddy</p>
        </div>
      `,
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
