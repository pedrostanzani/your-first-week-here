import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Tailwind,
  Img,
} from "@react-email/components";

type TextBlock = {
  type: "text";
  content: string;
};

type BulletBlock = {
  type: "bullets";
  items: string[];
};

type ContentBlock = TextBlock | BulletBlock;

interface DailySummaryEmailProps {
  firstName: string;
  dayNumber: number;
  content: ContentBlock[];
  baseUrl?: string;
}

const DailySummaryEmail = (props: DailySummaryEmailProps) => {
  const baseUrl =
    props.baseUrl ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  const renderContent = (block: ContentBlock, index: number) => {
    if (block.type === "text") {
      return (
        <Text
          key={index}
          className="text-[#d4d4d4] text-[15px] leading-[24px] m-0 mb-[16px]"
        >
          {block.content}
        </Text>
      );
    }

    if (block.type === "bullets") {
      return (
        <ul
          key={index}
          style={{
            margin: "0 0 16px 0",
            paddingLeft: "20px",
          }}
        >
          {block.items.map((item, itemIndex) => (
            <li
              key={itemIndex}
              style={{
                color: "#d4d4d4",
                fontSize: "15px",
                lineHeight: "24px",
                marginBottom: "8px",
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      );
    }

    return null;
  };

  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-black font-sans py-[40px]">
          <Container
            className="max-w-[600px] mx-auto bg-[#0a0a0a]"
            style={{ border: "1px solid #212121" }}
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
                Day {props.dayNumber} Complete, {props.firstName}!
              </Heading>
              <Text className="text-[#d4d4d4] text-[16px] leading-[24px] m-0">
                Here's a summary of your onboarding progress today.
              </Text>
            </Section>

            {/* Summary Content */}
            <Section className="px-[48px] pb-[40px]">
              {props.content.map((block, index) => renderContent(block, index))}
            </Section>

            {/* Footer */}
            <Section
              className="px-[48px] pb-[32px] pt-[32px]"
              style={{ borderTop: "1px solid #212121" }}
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

DailySummaryEmail.PreviewProps = {
  firstName: "Pedro",
  dayNumber: 1,
  content: [
    {
      type: "text",
      content:
        "You completed 4 out of 5 tasks on your onboarding agenda today. Great progress!",
    },
    {
      type: "text",
      content: "Here's what you accomplished:",
    },
    {
      type: "bullets",
      items: [
        "Reviewed the engineering principles documentation",
        "Got familiar with the codebase structure",
        "Set up your local development environment",
        "Met with your team lead for an intro chat",
      ],
    },
    {
      type: "text",
      content:
        "Tomorrow, we'll dive into the deployment pipeline and your first code review.",
    },
    {
      type: "text",
      content:
        "Keep up the great work! If you have any questions, don't hesitate to reach out to your team.",
    },
  ],
  baseUrl: "http://localhost:3000",
};

export default DailySummaryEmail;
