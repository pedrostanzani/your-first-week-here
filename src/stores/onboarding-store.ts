import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnboardingPlan } from "@/mastra/schemas/onboarding-plan";

interface OnboardingState {
  // User info
  userName: string | null;
  userRole: string | null;
  userGoals: string | null;

  // Plan
  plan: OnboardingPlan | null;
  currentDay: number;

  // Loading states
  isGenerating: boolean;
  error: string | null;

  // Actions
  setUserInfo: (name: string, role: string, goals?: string) => void;
  setPlan: (plan: OnboardingPlan) => void;
  setCurrentDay: (day: number) => void;
  goToNextDay: () => void;
  goToPreviousDay: () => void;
  setIsGenerating: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  userName: null,
  userRole: null,
  userGoals: null,
  plan: null,
  currentDay: 1,
  isGenerating: false,
  error: null,
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

      setIsGenerating: (loading) => set({ isGenerating: loading }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    {
      name: "onboarding-storage",
    }
  )
);
