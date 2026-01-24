import * as React from 'react';
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
} from '@react-email/components';

interface WelcomeEmailProps {
  firstName?: string;
  companyName?: string;
}

const WelcomeEmail = ({
  firstName = 'Sarah',
  companyName = 'Resend',
}: WelcomeEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-black font-sans py-[40px]">
          <Container className="max-w-[600px] mx-auto bg-[#0a0a0a] border border-white border-opacity-10">
            {/* Hero Section */}
            <Section className="px-[48px] pt-[48px] pb-[32px]">
              <Heading className="text-white text-[36px] font-serif font-bold leading-[42px] m-0 mb-[24px]">
                Welcome to {companyName}, {firstName}!
              </Heading>
              <Text className="text-[#d4d4d4] text-[16px] leading-[24px] m-0">
                I'm Oscar, your AI onboarding buddy. I'll guide you through your first week and answer any questions you have along the way.
              </Text>
            </Section>

            {/* Today's Focus Card */}
            <Section className="px-[48px] mb-[40px]">
              <div className="bg-[#151516] border border-white border-opacity-10 rounded-[8px] p-[32px]">
                <Heading className="text-white text-[20px] font-sans font-semibold m-0 mb-[24px]">
                  Today's Focus (Day 1)
                </Heading>

                <div className="space-y-[16px]">
                  <Text className="text-[#d4d4d4] text-[15px] leading-[22px] m-0 flex items-start">
                    <span className="mr-[12px]">📚</span>
                    Explore the Resend dashboard and API documentation
                  </Text>
                  <Text className="text-[#d4d4d4] text-[15px] leading-[22px] m-0 flex items-start">
                    <span className="mr-[12px]">👥</span>
                    Join #general on Slack and introduce yourself to the team
                  </Text>
                  <Text className="text-[#d4d4d4] text-[15px] leading-[22px] m-0 flex items-start">
                    <span className="mr-[12px]">💻</span>
                    Set up your development environment and local Resend instance
                  </Text>
                  <Text className="text-[#d4d4d4] text-[15px] leading-[22px] m-0 flex items-start">
                    <span className="mr-[12px]">🤝</span>
                    Schedule 1-on-1s with your team leads and engineering buddy
                  </Text>
                </div>
              </div>
            </Section>

            {/* Contact Section */}
            <Section className="px-[48px] pb-[32px]">
              <Heading className="text-white text-[18px] font-sans font-semibold m-0 mb-[16px]">
                How to Reach Oscar
              </Heading>
              <Text className="text-[#d4d4d4] text-[15px] leading-[22px] m-0 mb-[12px]">
                Have questions? I'm here to help.
              </Text>
              <Text className="text-white text-[18px] font-mono font-medium m-0 mb-[12px] tracking-wide">
                <Link href="mailto:oscar@resend.com" className="text-white no-underline">
                  oscar@resend.com
                </Link>
              </Text>
              <Text className="text-[#a1a1a1] text-[14px] leading-[20px] m-0">
                You can email me anytime, or just reply to this email. I respond within 24 hours.
              </Text>
            </Section>

            {/* Divider */}
            <Section className="px-[48px] mb-[32px]">
              <Hr className="border-white border-opacity-10 m-0" />
            </Section>

            {/* Closing */}
            <Section className="px-[48px] pb-[48px]">
              <Text className="text-[#d4d4d4] text-[15px] leading-[22px] m-0 mb-[24px]">
                You're going to do amazing things here at {companyName}. I'm excited to be part of your journey, and I'm here whenever you need guidance or have questions.
              </Text>
              <Text className="text-[#d4d4d4] text-[15px] leading-[22px] m-0 mb-[8px]">
                Welcome to the team!
              </Text>
              <Text className="text-[#a1a1a1] text-[14px] leading-[20px] m-0">
                - Oscar, Your AI Onboarding Buddy
              </Text>
            </Section>

            {/* Footer */}
            <Section className="px-[48px] pb-[32px] border-t border-white border-opacity-10 pt-[32px]">
              <Text className="text-[#a1a1a1] text-[12px] leading-[16px] m-0 text-center">
                {companyName} • San Francisco, CA
              </Text>
              <Text className="text-[#a1a1a1] text-[12px] leading-[16px] m-0 text-center mt-[8px]">
                <Link href="#" className="text-[#a1a1a1] underline">
                  Unsubscribe
                </Link>
                {' '}• © 2026 {companyName}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

WelcomeEmail.PreviewProps = {
  firstName: 'Alex',
  companyName: 'Resend',
};

export default WelcomeEmail;
