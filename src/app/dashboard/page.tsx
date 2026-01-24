"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  ArrowRight,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding-store";

export default function DashboardPage() {
  const {
    userName,
    plan,
    currentDay,
    isGenerating,
    error,
    goToNextDay,
    goToPreviousDay,
    setPlan,
    setIsGenerating,
    setError,
    setUserInfo,
    reset,
  } = useOnboardingStore();

  const generatePlan = async () => {
    setIsGenerating(true);
    setError(null);

    // Default user info for demo
    const name = userName || "Pedro";
    const role = "Software Engineer";
    const goals = "Get familiar with the codebase and ship my first feature";

    setUserInfo(name, role, goals);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, goals }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate plan");
      }

      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    reset();
  };

  const displayName = userName || "Pedro";

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-serif font-semibold text-white tracking-tight">
            Your First Week Here
          </h1>
          <div className="text-sm text-[#a1a1a1]">
            Day {currentDay} of 5
          </div>
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
                  Click below to generate your personalized 5-day onboarding plan 
                  based on your role and goals.
                </p>
              </div>
              <Button
                onClick={generatePlan}
                className="mt-2 bg-white text-black hover:bg-white/90 font-medium px-6"
              >
                Generate My Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="space-y-4">
            <Card className="bg-[#0a0a0a] border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-48" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
            <Card className="bg-[#0a0a0a] border-white/10 p-6">
              <Skeleton className="h-4 w-32 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </Card>
            <p className="text-center text-[#a1a1a1] text-sm animate-pulse">
              Generating your personalized plan... This may take a moment.
            </p>
          </div>
        )}

        {/* Plan Display */}
        {plan && !isGenerating && (() => {
          const currentDayData = plan.days.find((d) => d.day === currentDay);
          
          if (!currentDayData) return null;

          return (
            <div className="space-y-6">
              {/* Welcome Message - only show on Day 1 */}
              {currentDay === 1 && (
                <Card className="bg-[#0a0a0a] border-white/10 p-6">
                  <p className="text-[#d4d4d4] italic">"{plan.welcomeMessage}"</p>
                </Card>
              )}

              {/* Current Day */}
              <Card className="bg-[#0a0a0a] border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      Day {currentDayData.day}: {currentDayData.title}
                    </h3>
                    <p className="text-[#a1a1a1] text-sm">{currentDayData.summary}</p>
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-3 ml-11">
                  {currentDayData.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="mt-0.5">
                        {task.priority === "high" ? (
                          <CheckCircle2 className="w-4 h-4 text-white/40" />
                        ) : (
                          <Circle className="w-4 h-4 text-white/20" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                          {task.title}
                        </p>
                        <p className="text-[#a1a1a1] text-xs mt-0.5">
                          {task.description}
                        </p>
                        {task.handbookArticle && (
                          <span className="inline-block mt-2 text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                            📖 {task.handbookArticle.title}
                          </span>
                        )}
                        {task.githubIssue && (
                          <span className="inline-block mt-2 text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded">
                            🐛 Issue #{task.githubIssue.number}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Suggested First Issue - show on Day 4 or 5 for engineers */}
              {plan.suggestedFirstIssue && currentDay >= 4 && (
                <Card className="bg-[#0a0a0a] border-green-500/30 p-6">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <span>🎯</span> Suggested First Issue
                  </h3>
                  <p className="text-white">
                    #{plan.suggestedFirstIssue.number}: {plan.suggestedFirstIssue.title}
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

              {/* Day Navigation Hint */}
              <p className="text-center text-[#a1a1a1] text-sm">
                Use the menu in the bottom right to navigate between days
              </p>
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
            <DropdownMenuItem
              onClick={handleReset}
              className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Demo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </main>
  );
}
