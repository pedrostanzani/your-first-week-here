import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Link,
  Tailwind,
  Hr,
  Img,
  Button,
} from "@react-email/components";

const WelcomeEmail = (props: {
  firstName: string;
  companyName: string;
  baseUrl?: string;
}) => {
  // Use absolute URL for production, fallback for development
  const baseUrl =
    props.baseUrl ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-black font-sans py-[40px]">
          <Container 
            className="max-w-[600px] mx-auto bg-[#0a0a0a]"
            style={{ border: '1px solid #212121' }}
          >
            {/* Hero Image */}
            <Img
              src={`${baseUrl}/new-york.png`}
              alt="New York City skyline at night"
              width="600"
              height="250"
              style={{
                width: "100%",
                height: "250px",
                objectFit: "cover",
                display: "block",
              }}
            />

            {/* Hero Section */}
            <Section className="px-[48px] pt-[32px] pb-[32px]">
              <Heading className="text-white leading-snug text-[36px] font-serif font-bold m-0 mb-[24px]">
                It's your first week here, {props.firstName}!
              </Heading>
              <Text className="text-[#d4d4d4] text-[16px] leading-[24px] m-0 mb-[12px]">
                And we're lucky to have you.
              </Text>
              <Text className="text-[#d4d4d4] text-[16px] leading-[24px] m-0">
                I'm Ray, your onboarding buddy. Let's get you set up!
              </Text>
            </Section>

            {/* Today's Focus Card */}
            <Section className="px-[48px] mb-[40px]">
              <div 
                className="bg-[#151516] rounded-[8px] p-[16px]"
                style={{ border: '1px solid #212121' }}
              >
                <Heading className="text-white text-[20px] font-sans font-semibold m-0 mb-[24px]">
                  Our mission today
                </Heading>

                <div className="space-y-[16px]">
                  <Text className="text-[#d4d4d4] text-[15px] leading-[22px] m-0 flex items-start">
                    <span className="mr-[12px]">📚</span>
                    We'll go through the engineering principles and processes
                    together. I summarized the top docs for you to get up to
                    speed in no time.
                  </Text>
                </div>
              </div>
            </Section>

            {/* Button linking to the platform */}
            <Section className="px-[48px] mb-[40px]">
              <Button
                href={`${baseUrl}/dashboard`}
                style={{
                  background: '#ffffff',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  fontSize: '16px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'block',
                  padding: '16px 40px',
                  borderRadius: '8px',
                  lineHeight: '100%',
                }}
              >
                Let's get started
              </Button>
            </Section>

            {/* Footer */}
            <Section 
              className="px-[48px] pb-[32px] pt-[32px]"
              style={{ borderTop: '1px solid #212121' }}
            >
              <Text className="text-[#a1a1a1] text-[12px] leading-[16px] m-0 text-center">
                Your First Week Here
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

WelcomeEmail.PreviewProps = {
  firstName: "Pedro",
  companyName: "Resend",
  baseUrl: "http://localhost:3000",
};

export default WelcomeEmail;
