import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Octokit } from "octokit";

// Initialize Octokit with optional auth token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Default repo for the onboarding context
const DEFAULT_OWNER = "resend";
const DEFAULT_REPO = "react-email";

export const listGitHubIssues = createTool({
  id: "list-github-issues",
  description: `Lists recent GitHub issues from the resend/react-email repository.
Use this to understand what problems users are facing, feature requests, and ongoing discussions.
You can filter by state (open/closed/all) and optionally search for specific terms.`,
  inputSchema: z.object({
    state: z
      .enum(["open", "closed", "all"])
      .optional()
      .describe("Filter by issue state. Defaults to 'open'."),
    labels: z
      .string()
      .optional()
      .describe("Comma-separated list of label names to filter by (e.g., 'bug,help wanted')"),
    search: z
      .string()
      .optional()
      .describe("Search term to filter issues by title/body"),
    limit: z
      .number()
      .optional()
      .describe("Maximum number of issues to return. Defaults to 10, max 30."),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    issues: z.array(
      z.object({
        number: z.number(),
        title: z.string(),
        state: z.string(),
        author: z.string(),
        labels: z.array(z.string()),
        createdAt: z.string(),
        commentsCount: z.number(),
        url: z.string(),
      })
    ).optional(),
    totalCount: z.number().optional(),
    error: z.string().optional(),
  }),
  execute: async (input) => {
    try {
      const limit = Math.min(input.limit || 10, 30);
      
      const response = await octokit.rest.issues.listForRepo({
        owner: DEFAULT_OWNER,
        repo: DEFAULT_REPO,
        state: input.state || "open",
        labels: input.labels,
        per_page: limit,
        sort: "updated",
        direction: "desc",
      });

      // Filter out pull requests (GitHub API returns PRs as issues too)
      let issues = response.data.filter((issue) => !issue.pull_request);

      // Apply search filter if provided
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        issues = issues.filter(
          (issue) =>
            issue.title.toLowerCase().includes(searchLower) ||
            issue.body?.toLowerCase().includes(searchLower)
        );
      }

      return {
        success: true,
        issues: issues.map((issue) => ({
          number: issue.number,
          title: issue.title,
          state: issue.state,
          author: issue.user?.login || "unknown",
          labels: issue.labels.map((label) =>
            typeof label === "string" ? label : label.name || ""
          ),
          createdAt: issue.created_at,
          commentsCount: issue.comments,
          url: issue.html_url,
        })),
        totalCount: issues.length,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch issues: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

export const getGitHubIssue = createTool({
  id: "get-github-issue",
  description: `Gets the full details of a specific GitHub issue including its description and recent comments.
Use this after listing issues to dive deeper into a specific issue.`,
  inputSchema: z.object({
    issueNumber: z.number().describe("The issue number to fetch"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    issue: z.object({
      number: z.number(),
      title: z.string(),
      state: z.string(),
      author: z.string(),
      body: z.string(),
      labels: z.array(z.string()),
      createdAt: z.string(),
      updatedAt: z.string(),
      commentsCount: z.number(),
      url: z.string(),
      comments: z.array(
        z.object({
          author: z.string(),
          body: z.string(),
          createdAt: z.string(),
        })
      ),
    }).optional(),
    error: z.string().optional(),
  }),
  execute: async (input) => {
    try {
      const [issueResponse, commentsResponse] = await Promise.all([
        octokit.rest.issues.get({
          owner: DEFAULT_OWNER,
          repo: DEFAULT_REPO,
          issue_number: input.issueNumber,
        }),
        octokit.rest.issues.listComments({
          owner: DEFAULT_OWNER,
          repo: DEFAULT_REPO,
          issue_number: input.issueNumber,
          per_page: 10,
        }),
      ]);

      const issue = issueResponse.data;
      const comments = commentsResponse.data;

      return {
        success: true,
        issue: {
          number: issue.number,
          title: issue.title,
          state: issue.state,
          author: issue.user?.login || "unknown",
          body: issue.body || "",
          labels: issue.labels.map((label) =>
            typeof label === "string" ? label : label.name || ""
          ),
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          commentsCount: issue.comments,
          url: issue.html_url,
          comments: comments.map((comment) => ({
            author: comment.user?.login || "unknown",
            body: comment.body || "",
            createdAt: comment.created_at,
          })),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch issue: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

export const listGitHubPRs = createTool({
  id: "list-github-prs",
  description: `Lists recent pull requests from the resend/react-email repository.
Use this to see what engineers have been building lately and understand ongoing development.`,
  inputSchema: z.object({
    state: z
      .enum(["open", "closed", "all"])
      .optional()
      .describe("Filter by PR state. Defaults to 'open'."),
    limit: z
      .number()
      .optional()
      .describe("Maximum number of PRs to return. Defaults to 10, max 30."),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    pullRequests: z.array(
      z.object({
        number: z.number(),
        title: z.string(),
        state: z.string(),
        author: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        draft: z.boolean(),
        url: z.string(),
        additions: z.number(),
        deletions: z.number(),
        changedFiles: z.number(),
      })
    ).optional(),
    totalCount: z.number().optional(),
    error: z.string().optional(),
  }),
  execute: async (input) => {
    try {
      const limit = Math.min(input.limit || 10, 30);

      const response = await octokit.rest.pulls.list({
        owner: DEFAULT_OWNER,
        repo: DEFAULT_REPO,
        state: input.state || "open",
        per_page: limit,
        sort: "updated",
        direction: "desc",
      });

      return {
        success: true,
        pullRequests: response.data.map((pr) => ({
          number: pr.number,
          title: pr.title,
          state: pr.state,
          author: pr.user?.login || "unknown",
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          draft: pr.draft || false,
          url: pr.html_url,
          additions: pr.additions || 0,
          deletions: pr.deletions || 0,
          changedFiles: pr.changed_files || 0,
        })),
        totalCount: response.data.length,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch pull requests: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

export const getGitHubPR = createTool({
  id: "get-github-pr",
  description: `Gets the full details of a specific pull request including description and files changed.
Use this after listing PRs to understand what a specific PR is implementing.`,
  inputSchema: z.object({
    prNumber: z.number().describe("The pull request number to fetch"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    pullRequest: z.object({
      number: z.number(),
      title: z.string(),
      state: z.string(),
      author: z.string(),
      body: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
      mergedAt: z.string().nullable(),
      draft: z.boolean(),
      url: z.string(),
      additions: z.number(),
      deletions: z.number(),
      changedFiles: z.number(),
      files: z.array(
        z.object({
          filename: z.string(),
          status: z.string(),
          additions: z.number(),
          deletions: z.number(),
        })
      ),
    }).optional(),
    error: z.string().optional(),
  }),
  execute: async (input) => {
    try {
      const [prResponse, filesResponse] = await Promise.all([
        octokit.rest.pulls.get({
          owner: DEFAULT_OWNER,
          repo: DEFAULT_REPO,
          pull_number: input.prNumber,
        }),
        octokit.rest.pulls.listFiles({
          owner: DEFAULT_OWNER,
          repo: DEFAULT_REPO,
          pull_number: input.prNumber,
          per_page: 30,
        }),
      ]);

      const pr = prResponse.data;
      const files = filesResponse.data;

      return {
        success: true,
        pullRequest: {
          number: pr.number,
          title: pr.title,
          state: pr.state,
          author: pr.user?.login || "unknown",
          body: pr.body || "",
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          mergedAt: pr.merged_at,
          draft: pr.draft || false,
          url: pr.html_url,
          additions: pr.additions,
          deletions: pr.deletions,
          changedFiles: pr.changed_files,
          files: files.map((file) => ({
            filename: file.filename,
            status: file.status,
            additions: file.additions,
            deletions: file.deletions,
          })),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch pull request: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

export const githubTools = {
  listGitHubIssues,
  getGitHubIssue,
  listGitHubPRs,
  getGitHubPR,
};
