import { z } from "zod";

// Text block for paragraphs
export const TextBlockSchema = z.object({
  type: z.literal("text"),
  content: z.string().describe("The paragraph text content"),
});

// Bullet block for lists
export const BulletBlockSchema = z.object({
  type: z.literal("bullets"),
  items: z.array(z.string()).describe("Array of bullet point items"),
});

// Union of content block types
export const ContentBlockSchema = z.discriminatedUnion("type", [
  TextBlockSchema,
  BulletBlockSchema,
]);

// The complete daily summary email content
export const DailySummaryContentSchema = z.object({
  content: z
    .array(ContentBlockSchema)
    .min(1)
    .describe("Array of content blocks (text paragraphs or bullet lists) for the email body"),
});

// TypeScript types derived from schemas
export type TextBlock = z.infer<typeof TextBlockSchema>;
export type BulletBlock = z.infer<typeof BulletBlockSchema>;
export type ContentBlock = z.infer<typeof ContentBlockSchema>;
export type DailySummaryContent = z.infer<typeof DailySummaryContentSchema>;
