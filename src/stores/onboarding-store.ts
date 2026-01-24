import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnboardingPlan } from "@/mastra/schemas/onboarding-plan";

export interface ToolResultSummary {
  type: string;
  count?: number;
  number?: number;
  preview?: Array<{ title?: string; category?: string; number?: number }>;
  title?: string;
  category?: string;
  contentPreview?: string;
  state?: string;
  data?: unknown;
}

export interface ProgressStep {
  id: string;
  type: "tool-call" | "tool-result" | "info";
  toolName?: string;
  message: string;
  status: "pending" | "in-progress" | "complete";
  timestamp: number;
  result?: ToolResultSummary | null;
}

interface OnboardingState {
  // User info
  userName: string | null;
  userRole: string | null;
  userGoals: string | null;

  // Plan
  plan: OnboardingPlan | null;
  currentDay: number;

  // Task completion tracking (Set of task IDs)
  completedTasks: string[];

  // Loading states
  isGenerating: boolean;
  error: string | null;

  // Progress tracking
  progressSteps: ProgressStep[];

  // Initial chat prompt (for "Ask for help" feature)
  initialChatPrompt: string | null;

  // Actions
  setUserInfo: (name: string, role: string, goals?: string) => void;
  setPlan: (plan: OnboardingPlan) => void;
  setCurrentDay: (day: number) => void;
  goToNextDay: () => void;
  goToPreviousDay: () => void;
  toggleTaskCompletion: (taskId: string) => void;
  isTaskCompleted: (taskId: string) => boolean;
  setIsGenerating: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addProgressStep: (step: Omit<ProgressStep, "id" | "timestamp">) => void;
  updateProgressStep: (id: string, updates: Partial<ProgressStep>) => void;
  clearProgress: () => void;
  setInitialChatPrompt: (prompt: string | null) => void;
  reset: () => void;
}

const initialState = {
  userName: null,
  userRole: null,
  userGoals: null,
  plan: null,
  currentDay: 1,
  completedTasks: [] as string[],
  isGenerating: false,
  error: null,
  progressSteps: [] as ProgressStep[],
  initialChatPrompt: null as string | null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUserInfo: (name, role, goals) =>
        set({ userName: name, userRole: role, userGoals: goals }),

      setPlan: (plan) => set({ plan, error: null }),

      setCurrentDay: (day) => {
        if (day >= 1 && day <= 5) {
          set({ currentDay: day });
        }
      },

      goToNextDay: () => {
        const { currentDay } = get();
        if (currentDay < 5) {
          set({ currentDay: currentDay + 1 });
        }
      },

      goToPreviousDay: () => {
        const { currentDay } = get();
        if (currentDay > 1) {
          set({ currentDay: currentDay - 1 });
        }
      },

      toggleTaskCompletion: (taskId) => {
        set((state) => {
          const isCompleted = state.completedTasks.includes(taskId);
          return {
            completedTasks: isCompleted
              ? state.completedTasks.filter((id) => id !== taskId)
              : [...state.completedTasks, taskId],
          };
        });
      },

      isTaskCompleted: (taskId) => {
        return get().completedTasks.includes(taskId);
      },

      setIsGenerating: (loading) => set({ isGenerating: loading }),

      setError: (error) => set({ error }),

      addProgressStep: (step) => {
        const newStep: ProgressStep = {
          ...step,
          id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };
        set((state) => ({
          progressSteps: [...state.progressSteps, newStep],
        }));
      },

      updateProgressStep: (id, updates) => {
        set((state) => ({
          progressSteps: state.progressSteps.map((step) =>
            step.id === id ? { ...step, ...updates } : step
          ),
        }));
      },

      clearProgress: () => set({ progressSteps: [] }),

      setInitialChatPrompt: (prompt) => set({ initialChatPrompt: prompt }),

      reset: () => set(initialState),
    }),
    {
      name: "onboarding-storage",
    }
  )
);
