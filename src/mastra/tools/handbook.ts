import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import handbookLinks from "@/constants/handbook-links.json";

// Build a flat index of all articles for the agent to see
const allArticles = Object.entries(handbookLinks).flatMap(([category, articles]) =>
  articles.map((article) => ({
    category,
    title: article.title,
    slug: article.slug,
    path: article.path,
  }))
);

export const listHandbookArticles = createTool({
  id: "list-handbook-articles",
  description: `Lists all available Resend handbook articles organized by category. 
Use this to discover what articles are available before fetching specific ones.
Categories include: company, design, engineering, marketing, people, sales, success.`,
  inputSchema: z.object({
    category: z
      .enum(["company", "design", "engineering", "marketing", "people", "sales", "success", "all"])
      .optional()
      .describe("Filter by category, or 'all' to see everything. Defaults to 'all'."),
  }),
  outputSchema: z.object({
    articles: z.array(
      z.object({
        category: z.string(),
        title: z.string(),
        slug: z.string(),
      })
    ),
  }),
  execute: async (input) => {
    const category = input?.category || "all";
    
    if (category === "all") {
      return {
        articles: allArticles.map(({ category, title, slug }) => ({ category, title, slug })),
      };
    }
    
    const filtered = allArticles.filter((a) => a.category === category);
    return {
      articles: filtered.map(({ category, title, slug }) => ({ category, title, slug })),
    };
  },
});

export const fetchHandbookArticle = createTool({
  id: "fetch-handbook-article",
  description: `Fetches the full content of a specific Resend handbook article by its slug.
Use listHandbookArticles first to discover available articles and their slugs.
Returns the article content in markdown format.`,
  inputSchema: z.object({
    slug: z.string().describe("The slug of the article to fetch (e.g., 'why-we-exist', 'how-we-work')"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    title: z.string().optional(),
    category: z.string().optional(),
    content: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async (input) => {
    const { slug } = input;
    
    // Find the article in our index
    const article = allArticles.find((a) => a.slug === slug);
    
    if (!article) {
      return {
        success: false,
        error: `Article with slug "${slug}" not found. Use listHandbookArticles to see available articles.`,
      };
    }
    
    try {
      const url = `https://resend.com${article.path}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch article: HTTP ${response.status}`,
        };
      }
      
      const html = await response.text();
      
      // Extract the main content from the HTML
      // The handbook articles have their content in a specific structure
      const content = extractArticleContent(html);
      
      return {
        success: true,
        title: article.title,
        category: article.category,
        content,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch article: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

function extractArticleContent(html: string): string {
  // Remove script and style tags
  let content = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  
  // Try to find the main article content
  // Look for common article containers
  const articleMatch = content.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                       content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  
  if (articleMatch) {
    content = articleMatch[1];
  }
  
  // Convert common HTML elements to markdown-ish text
  content = content
    // Headers
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n# $1\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n### $1\n")
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "\n#### $1\n")
    // Paragraphs and line breaks
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "\n$1\n")
    .replace(/<br\s*\/?>/gi, "\n")
    // Lists
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "• $1\n")
    .replace(/<\/?ul[^>]*>/gi, "\n")
    .replace(/<\/?ol[^>]*>/gi, "\n")
    // Links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "$2 ($1)")
    // Bold and italic
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")
    // Code
    .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, "")
    // Decode common HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Clean up whitespace
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  
  return content;
}

export const handbookTools = {
  listHandbookArticles,
  fetchHandbookArticle,
};
