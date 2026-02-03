"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Circle,
  ArrowRight,
  MoreVertical,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Loader2,
  Check,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  PartyPopper,
} from "lucide-react";
import type { ToolResultSummary } from "@/stores/onboarding-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import handbookLinks from "@/constants/handbook-links.json";
import { cn } from "@/lib/utils";

// Build a slug to path lookup for handbook articles
const handbookSlugToPath: Record<string, string> = {};
Object.values(handbookLinks)
  .flat()
  .forEach((article) => {
    handbookSlugToPath[article.slug] = article.path;
  });

function getHandbookUrl(slug: string): string {
  const path = handbookSlugToPath[slug];
  if (path) {
    return `https://resend.com${path}`;
  }
  // Fallback: try to construct from slug (won't have category, but better than nothing)
  return `https://resend.com/handbook/${slug}`;
}

// Tool name to friendly display name
const toolDisplayNames: Record<string, string> = {
  "list-handbook-articles": "Fetching handbook articles",
  "fetch-handbook-article": "Reading handbook article",
  "list-github-issues": "Scanning GitHub issues",
  "get-github-issue": "Analyzing GitHub issue",
  "list-github-prs": "Checking recent pull requests",
  "get-github-pr": "Reviewing pull request",
};

// Render tool result summary
function ToolResultDisplay({ result }: { result: ToolResultSummary }) {
  switch (result.type) {
    case "article-list":
      return (
        <div className="text-xs text-[#a1a1a1] space-y-1">
          <div>Found {result.count} articles</div>
          {result.preview && result.preview.length > 0 && (
            <ul className="ml-3 space-y-0.5">
              {result.preview.map((item, i) => (
                <li key={i} className="text-[#666]">
                  • {item.title}{" "}
                  <span className="text-[#444]">({item.category})</span>
                </li>
              ))}
              {result.count && result.count > 5 && (
                <li className="text-[#444]">...and {result.count - 5} more</li>
              )}
            </ul>
          )}
        </div>
      );

    case "article-content":
      return (
        <div className="text-xs text-[#a1a1a1] space-y-1">
          <div>
            <span className="text-white/70">{result.title}</span>
            <span className="text-[#444] ml-1">({result.category})</span>
          </div>
          {result.contentPreview && (
            <div className="text-[#555] italic line-clamp-2">
              {result.contentPreview}
            </div>
          )}
        </div>
      );

    case "issue-list":
      return (
        <div className="text-xs text-[#a1a1a1] space-y-1">
          <div>Found {result.count} issues</div>
          {result.preview && result.preview.length > 0 && (
            <ul className="ml-3 space-y-0.5">
              {result.preview.map((item, i) => (
                <li key={i} className="text-[#666]">
                  • #{item.number}: {item.title}
                </li>
              ))}
              {result.count && result.count > 5 && (
                <li className="text-[#444]">...and {result.count - 5} more</li>
              )}
            </ul>
          )}
        </div>
      );

    case "issue-detail":
      return (
        <div className="text-xs text-[#a1a1a1]">
          <span className="text-green-400/70">#{result.number}</span>
          <span className="ml-1">{result.title}</span>
          {result.state && (
            <span className="ml-1 text-[#444]">({result.state})</span>
          )}
        </div>
      );

    case "pr-list":
      return (
        <div className="text-xs text-[#a1a1a1] space-y-1">
          <div>Found {result.count} pull requests</div>
          {result.preview && result.preview.length > 0 && (
            <ul className="ml-3 space-y-0.5">
              {result.preview.map((item, i) => (
                <li key={i} className="text-[#666]">
                  • #{item.number}: {item.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      );

    default:
      return (
        <div className="text-xs text-[#555] font-mono">
          {JSON.stringify(result.data || result, null, 2).slice(0, 200)}
        </div>
      );
  }
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    userName,
    plan,
    currentDay,
    completedTasks,
    isGenerating,
    error,
    progressSteps,
    goToNextDay,
    goToPreviousDay,
    setCurrentDay,
    toggleTaskCompletion,
    completeDay,
    isDayCompleted,
    getDayFeedback,
    setPlan,
    setIsGenerating,
    setError,
    setUserInfo,
    addProgressStep,
    updateProgressStep,
    clearProgress,
    setInitialChatPrompt,
    reset,
  } = useOnboardingStore();

  // Track which progress steps are expanded to show results
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // Track if the "Plan built" section is expanded
  const [isPlanBuiltExpanded, setIsPlanBuiltExpanded] = useState(true);

  // Day completion feedback dialog state
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  // Track if we've already triggered auto-generation
  const hasAutoGenerated = useRef(false);

  const toggleStepExpanded = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const handleAskForHelp = (task: {
    title: string;
    description: string;
    handbookArticle?: { slug: string; title: string };
    githubIssue?: { number: number; title: string; url: string };
    githubPR?: { number: number; title: string; url: string };
  }) => {
    let prompt = `I need help with this task of my onboarding program:\n\n**${task.title}**\n${task.description}`;
    
    // Add relevant links
    const links: string[] = [];
    if (task.handbookArticle) {
      links.push(`- Handbook article: "${task.handbookArticle.title}" (${getHandbookUrl(task.handbookArticle.slug)})`);
    }
    if (task.githubIssue) {
      links.push(`- GitHub Issue #${task.githubIssue.number}: "${task.githubIssue.title}" (${task.githubIssue.url})`);
    }
    if (task.githubPR) {
      links.push(`- GitHub PR #${task.githubPR.number}: "${task.githubPR.title}" (${task.githubPR.url})`);
    }
    
    if (links.length > 0) {
      prompt += `\n\nRelated resources:\n${links.join("\n")}`;
    }
    
    setInitialChatPrompt(prompt);
    // Small delay to ensure store state is set before navigation
    setTimeout(() => {
      router.push("/chat");
    }, 50);
  };

  const generatePlan = useCallback(async (overrideName?: string, overrideRole?: string) => {
    setIsGenerating(true);
    setError(null);
    clearProgress();

    // Use override values (from URL params) or fall back to store/defaults
    const name = overrideName || userName || "Pedro";
    const role = overrideRole || "Software Engineer";
    const goals = "Get familiar with the codebase and ship my first feature";

    setUserInfo(name, role, goals);

    // Add initial step
    addProgressStep({
      type: "info",
      message: "Starting plan generation...",
      status: "complete",
    });

    try {
      const response = await fetch("/api/generate-plan-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, goals }),
      });

      if (!response.ok) {
        throw new Error("Failed to start generation");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      // Track tool calls to update their status (toolName -> stepId)
      const toolCallStepIds: Map<string, string> = new Map();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case "tool-call": {
                  const toolName = data.toolName || "unknown-tool";
                  const displayName = toolDisplayNames[toolName] || toolName;
                  // Create a unique key for this tool call (in case same tool is called multiple times)
                  const toolCallKey = `${toolName}-${Date.now()}`;
                  const stepId = `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                  toolCallStepIds.set(toolName, stepId);

                  // Manually add with known ID so we can update it later
                  useOnboardingStore.getState().progressSteps.push({
                    id: stepId,
                    type: "tool-call",
                    toolName: toolName,
                    message: displayName,
                    status: "in-progress",
                    timestamp: Date.now(),
                  });
                  // Trigger re-render by setting state
                  useOnboardingStore.setState({
                    progressSteps: [
                      ...useOnboardingStore.getState().progressSteps,
                    ],
                  });
                  break;
                }

                case "tool-result": {
                  const toolName = data.toolName || "unknown-tool";
                  const displayName = toolDisplayNames[toolName] || toolName;
                  // Find and update the corresponding tool call step
                  const stepId = toolCallStepIds.get(toolName);
                  if (stepId) {
                    updateProgressStep(stepId, {
                      status: "complete",
                      message: `${displayName} complete`,
                      result: data.result || null,
                    });
                    toolCallStepIds.delete(toolName);
                  }
                  break;
                }

                case "complete": {
                  if (data.plan) {
                    setPlan(data.plan);
                    addProgressStep({
                      type: "info",
                      message: "Plan generated successfully!",
                      status: "complete",
                    });
                  } else {
                    throw new Error("No plan in response");
                  }
                  break;
                }

                case "error": {
                  throw new Error(data.message);
                }
              }
            } catch (parseError) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      addProgressStep({
        type: "info",
        message: "Generation failed",
        status: "complete",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [
    userName,
    setIsGenerating,
    setError,
    clearProgress,
    setUserInfo,
    addProgressStep,
    updateProgressStep,
    setPlan,
  ]);

  // Auto-generate plan when arriving from get-started modal with query params
  useEffect(() => {
    const nameParam = searchParams.get("name");
    const roleParam = searchParams.get("role");

    // Only auto-generate if:
    // 1. We have at least one param (indicating user came from modal)
    // 2. We haven't already generated a plan
    // 3. We're not currently generating
    // 4. We haven't already triggered auto-generation in this session
    if ((nameParam || roleParam) && !plan && !isGenerating && !hasAutoGenerated.current) {
      hasAutoGenerated.current = true;
      generatePlan(nameParam || undefined, roleParam || undefined);
    }
  }, [searchParams, plan, isGenerating, generatePlan]);

  const handleReset = () => {
    reset();
  };

  const handleSubmitFeedback = () => {
    if (!plan) return;
    
    // Save feedback to store and mark day as completed
    completeDay(currentDay, feedbackText);
    setFeedbackDialogOpen(false);
    setFeedbackText("");
  };

  const currentDayCompleted = isDayCompleted(currentDay);
  const currentDayFeedback = getDayFeedback(currentDay);

  const displayName = userName || "Pedro";

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <h1 className="text-xl font-serif font-semibold text-white tracking-tight hover:text-white/80 transition-colors">
              Your First Week Here
            </h1>
          </Link>
          <div className="text-sm text-[#a1a1a1]">Day {currentDay} of 5</div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-semibold text-white mb-2">
            Welcome, {displayName}!
          </h2>
          <p className="text-[#a1a1a1]">
            Let's get you up to speed. Here's your personalized onboarding plan.
          </p>
        </div>

        {/* Day Tabs - only show when plan exists */}
        {plan && !isGenerating && (
          <Tabs
            value={String(currentDay)}
            onValueChange={(value) => setCurrentDay(Number(value))}
            className="mb-6"
          >
            <TabsList className="bg-white/5 border border-white/10">
              {[1, 2, 3, 4, 5].map((day) => (
                <TabsTrigger
                  key={day}
                  value={String(day)}
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-white/60"
                >
                  Day {day}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Generate Plan Button (if no plan yet) */}
        {!plan && !isGenerating && (
          <Card className="bg-[#0a0a0a] border-white/10 p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Ready to start your journey?
                </h3>
                <p className="text-[#a1a1a1] text-sm max-w-md">
                  Click below to generate your personalized 5-day onboarding
                  plan based on your role and goals.
                </p>
              </div>
              <Button
                onClick={() => generatePlan()}
                className="mt-2 bg-white text-black hover:bg-white/90 font-medium px-6"
              >
                Generate My Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
          </Card>
        )}

        {/* Progress Card - shows during generation and on day 1 only */}
        {progressSteps.length > 0 && (isGenerating || currentDay === 1) && (
          <div className="space-y-4 mb-6">
            <Card className={
              cn(
                "bg-[#0a0a0a] border-white/10 p-6 gap-2 transition-colors",
                !isPlanBuiltExpanded && "hover:bg-white/5"
              )
            }>
              <div
                className={`flex items-center gap-3 ${isPlanBuiltExpanded ? "mb-6" : ""} ${!isGenerating ? "cursor-pointer -mx-2 px-2 py-1 rounded transition-colors" : ""}`}
                onClick={() => !isGenerating && setIsPlanBuiltExpanded(!isPlanBuiltExpanded)}
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Check className="w-5 h-5 text-green-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">
                    {isGenerating ? "Building your plan" : "Plan built"}
                  </h3>
                  <p className="text-[#a1a1a1] text-sm">
                    {isGenerating
                      ? "Ray is researching and personalizing..."
                      : "Click on any step to see what Ray found"}
                  </p>
                </div>
                {!isGenerating && (
                  <ChevronDown
                    className={`w-5 h-5 text-[#666] transition-transform ${isPlanBuiltExpanded ? "rotate-180" : ""}`}
                  />
                )}
              </div>

              {/* Progress Steps */}
              {isPlanBuiltExpanded && <div className="space-y-2">
                {progressSteps.map((step) => {
                  const hasResult = step.result && step.status === "complete";
                  const isExpanded = expandedSteps.has(step.id);

                  return (
                    <div key={step.id} className="space-y-1">
                      <div
                        className={`flex items-center gap-3 text-sm ${hasResult ? "cursor-pointer hover:bg-white/5 -mx-2 px-2 py-1 rounded" : ""}`}
                        onClick={() => hasResult && toggleStepExpanded(step.id)}
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          {step.status === "in-progress" ? (
                            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                          ) : step.status === "complete" ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-white/20" />
                          )}
                        </div>
                        <span
                          className={`flex-1 ${
                            step.status === "complete"
                              ? "text-[#a1a1a1]"
                              : step.status === "in-progress"
                                ? "text-white"
                                : "text-white/50"
                          }`}
                        >
                          {step.toolName ? (
                            <>
                              <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">
                                {step.toolName}
                              </code>
                              {step.status === "complete" && (
                                <span className="ml-1.5">complete</span>
                              )}
                            </>
                          ) : (
                            step.message
                          )}
                        </span>
                        {hasResult && (
                          <ChevronDown
                            className={`w-4 h-4 text-[#666] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        )}
                      </div>

                      {/* Expandable result section */}
                      {hasResult && isExpanded && step.result && (
                        <div className="ml-8 pl-3 border-l border-white/10 py-2">
                          <ToolResultDisplay result={step.result} />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Skeleton for next expected step - only show while generating */}
                {isGenerating && (
                  <div className="flex items-center gap-3 text-sm animate-pulse">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <Circle className="w-4 h-4 text-white/10" />
                    </div>
                    <Skeleton className="h-4 w-48" />
                  </div>
                )}
              </div>}
            </Card>

            {isGenerating && (
              <p className="text-center text-[#a1a1a1] text-sm">
                This usually takes 30-60 seconds
              </p>
            )}
          </div>
        )}

        {/* Plan Display */}
        {plan &&
          !isGenerating &&
          (() => {
            const currentDayData = plan.days.find((d) => d.day === currentDay);

            if (!currentDayData) return null;

            return (
              <div className="space-y-6">
                {/* Current Day */}
                <Card className="bg-[#0a0a0a] border-white/10 p-6 gap-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        Day {currentDayData.day}: {currentDayData.title}
                      </h3>
                      <p className="text-[#a1a1a1] text-sm">
                        {currentDayData.summary}
                      </p>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="space-y-3 ml-11">
                    {currentDayData.tasks.map((task) => {
                      const isCompleted = completedTasks.includes(task.id);

                      return (
                        <div
                          key={task.id}
                          className={`relative flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                            isCompleted
                              ? "bg-green-500/10 hover:bg-green-500/15 border border-green-950"
                              : "border hover:bg-neutral-900/20"
                          }`}
                          onClick={() => toggleTaskCompletion(task.id)}
                        >
                          {/* Task action dropdown */}
                          <div className="absolute top-2 right-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 bg-[#1a1a1a] border-white/10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAskForHelp(task);
                                  }}
                                  className="text-white focus:bg-white/10 focus:text-white cursor-pointer"
                                >
                                  <HelpCircle className="mr-2 h-4 w-4" />
                                  Ask for help
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="mt-0.5">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-white/30 hover:text-white/50" />
                            )}
                          </div>
                          <div className="flex-1 pr-6">
                            <p
                              className={`text-sm font-medium ${
                                isCompleted
                                  ? "text-white/60 line-through"
                                  : "text-white"
                              }`}
                            >
                              {task.title}
                            </p>
                            <p
                              className={`text-xs mt-0.5 ${
                                isCompleted ? "text-[#666]" : "text-[#a1a1a1]"
                              }`}
                            >
                              {task.description}
                            </p>
                            {/* Resource badges and links */}
                            {task.handbookArticle && (
                              <div className="mt-3 space-y-2">
                                <span
                                  className={`inline-block text-xs px-2 py-0.5 rounded ${
                                    isCompleted
                                      ? "bg-blue-500/10 text-blue-300/50"
                                      : "bg-blue-500/20 text-blue-300"
                                  }`}
                                >
                                  📖 {task.handbookArticle.title}
                                </span>
                                <div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    asChild
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <a
                                      href={getHandbookUrl(
                                        task.handbookArticle.slug,
                                      )}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Access article
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            )}
                            {task.githubIssue && (
                              <div className="mt-3 space-y-2">
                                <span
                                  className={`inline-block text-xs px-2 py-0.5 rounded ${
                                    isCompleted
                                      ? "bg-green-500/10 text-green-300/50"
                                      : "bg-green-500/20 text-green-300"
                                  }`}
                                >
                                  🐛 Issue #{task.githubIssue.number}: {task.githubIssue.title}
                                </span>
                                <div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    asChild
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <a
                                      href={task.githubIssue.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Access issue
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            )}
                            {task.githubPR && (
                              <div className="mt-3 space-y-2">
                                <span
                                  className={`inline-block text-xs px-2 py-0.5 rounded ${
                                    isCompleted
                                      ? "bg-purple-500/10 text-purple-300/50"
                                      : "bg-purple-500/20 text-purple-300"
                                  }`}
                                >
                                  🔀 PR #{task.githubPR.number}: {task.githubPR.title}
                                </span>
                                <div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    asChild
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <a
                                      href={task.githubPR.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Access PR
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Suggested First Issue - show on Day 4 or 5 for engineers */}
                {plan.suggestedFirstIssue && currentDay >= 4 && (
                  <Card className="bg-[#0a0a0a] border-green-500/30 p-6">
                    <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <span>🎯</span> Suggested First Issue
                    </h3>
                    <p className="text-white">
                      #{plan.suggestedFirstIssue.number}:{" "}
                      {plan.suggestedFirstIssue.title}
                    </p>
                    <p className="text-[#a1a1a1] text-sm mt-1">
                      {plan.suggestedFirstIssue.reason}
                    </p>
                    <a
                      href={plan.suggestedFirstIssue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-sm text-blue-400 hover:text-blue-300"
                    >
                      View on GitHub →
                    </a>
                  </Card>
                )}

                {/* Day Completion Card */}
                <Card className={cn(
                  "bg-[#0a0a0a] border-white/10 p-6",
                  currentDayCompleted && "border-green-500/30 bg-green-500/5"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      currentDayCompleted ? "bg-green-500/20" : "bg-white/10"
                    )}>
                      {currentDayCompleted ? (
                        <PartyPopper className="w-5 h-5 text-green-400" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-white/60" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">
                        {currentDayCompleted ? "Day completed!" : "How did it go?"}
                      </h3>
                      <p className="text-[#a1a1a1] text-sm">
                        {currentDayCompleted
                          ? "Great job! You've completed your tasks for today."
                          : "Done with today's tasks? Mark the day as complete and share your feedback."}
                      </p>
                      {currentDayCompleted && currentDayFeedback && (
                        <p className="text-[#666] text-sm mt-2 italic">
                          "{currentDayFeedback}"
                        </p>
                      )}
                    </div>
                    {!currentDayCompleted && (
                      <Button
                        onClick={() => setFeedbackDialogOpen(true)}
                        className="bg-white text-black hover:bg-white/90 font-medium"
                      >
                        Mark as completed
                      </Button>
                    )}
                  </div>
                </Card>

              </div>
            );
          })()}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              className="h-14 w-14 rounded-full bg-white text-black hover:bg-white/90 shadow-lg shadow-black/20"
            >
              <MoreVertical className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-[#1a1a1a] border-white/10"
          >
            <DropdownMenuItem
              onClick={goToPreviousDay}
              disabled={!plan || currentDay <= 1}
              className="text-white focus:bg-white/10 focus:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous Day
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={goToNextDay}
              disabled={!plan || currentDay >= 5}
              className="text-white focus:bg-white/10 focus:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="mr-2 h-4 w-4" />
              Next Day
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem asChild>
              <Link
                href="/chat"
                className="text-white focus:bg-white/10 focus:text-white cursor-pointer"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat with Assistant
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={handleReset}
              className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Plan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Day Completion Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">How did Day {currentDay} go?</DialogTitle>
            <DialogDescription className="text-[#a1a1a1]">
              Share any feedback about your onboarding experience today. This is optional.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="What went well? Any challenges or suggestions?"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFeedbackDialogOpen(false);
                setFeedbackText("");
              }}
              className="border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              className="bg-white text-black hover:bg-white/90"
            >
              Complete Day
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-black">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="h-7 w-48 bg-white/10 rounded animate-pulse" />
          <div className="h-5 w-24 bg-white/10 rounded animate-pulse" />
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="h-9 w-64 bg-white/10 rounded animate-pulse mb-2" />
          <div className="h-5 w-96 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    </main>
  );
}
