import { z } from "zod";

// Task types for the onboarding plan
export const TaskTypeEnum = z.enum([
  "reading",      // Read a handbook article or documentation
  "meeting",      // Schedule or attend a meeting
  "task",         // Complete a specific task
  "exploration",  // Explore codebase, tools, or systems
  "contribution", // Make a contribution (PR, issue, etc.)
]);

// Individual task within a day
export const OnboardingTaskSchema = z.object({
  id: z.string().describe("Unique identifier for the task"),
  title: z.string().describe("Short title of the task"),
  description: z.string().describe("Detailed description of what to do"),
  type: TaskTypeEnum.describe("Type of task"),
  estimatedMinutes: z.number().optional().describe("Estimated time in minutes"),
  priority: z.enum(["high", "medium", "low"]).describe("Priority level"),
  // Optional references to resources
  handbookArticle: z
    .object({
      slug: z.string(),
      title: z.string(),
    })
    .optional()
    .describe("Related handbook article if applicable"),
  githubIssue: z
    .object({
      number: z.number(),
      title: z.string(),
      url: z.string(),
    })
    .optional()
    .describe("Related GitHub issue for engineers"),
  githubPR: z
    .object({
      number: z.number(),
      title: z.string(),
      url: z.string(),
    })
    .optional()
    .describe("Related GitHub PR to review"),
});

// A single day in the onboarding plan
export const OnboardingDaySchema = z.object({
  day: z.number().min(1).max(5).describe("Day number (1-5)"),
  title: z.string().describe("Theme/title for the day"),
  summary: z.string().describe("Brief summary of what this day focuses on"),
  tasks: z.array(OnboardingTaskSchema).describe("Tasks for this day"),
});

// The complete 5-day onboarding plan
export const OnboardingPlanSchema = z.object({
  employeeName: z.string().describe("Name of the new employee"),
  role: z.string().describe("Role of the new employee (e.g., 'Engineering', 'Sales')"),
  createdAt: z.string().describe("ISO timestamp of when plan was created"),
  welcomeMessage: z.string().describe("Personalized welcome message"),
  days: z
    .array(OnboardingDaySchema)
    .length(5)
    .describe("The 5-day onboarding plan"),
  suggestedFirstIssue: z
    .object({
      number: z.number(),
      title: z.string(),
      url: z.string(),
      reason: z.string().describe("Why this issue is a good first contribution"),
    })
    .optional()
    .describe("For engineers: a suggested first issue to work on"),
  keyContacts: z
    .array(
      z.object({
        role: z.string(),
        purpose: z.string().describe("Why you should connect with this person"),
      })
    )
    .optional()
    .describe("Key people to connect with during onboarding"),
});

// TypeScript types derived from schemas
export type TaskType = z.infer<typeof TaskTypeEnum>;
export type OnboardingTask = z.infer<typeof OnboardingTaskSchema>;
export type OnboardingDay = z.infer<typeof OnboardingDaySchema>;
export type OnboardingPlan = z.infer<typeof OnboardingPlanSchema>;
