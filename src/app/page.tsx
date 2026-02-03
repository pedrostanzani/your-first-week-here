"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GetStartedModal } from "@/components/get-started-modal";
import { RealtimeClock } from "@/components/realtime-clock";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: {
    email: string;
    name?: string;
    role?: string;
  }) => {
    // Build query params for the dashboard
    const params = new URLSearchParams();
    if (data.name) params.set("name", data.name);
    if (data.role) params.set("role", data.role);

    // Navigate to dashboard to generate the onboarding plan
    const queryString = params.toString();
    router.push(`/dashboard${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-linear-to-b from-black via-black to-zinc-950 pointer-events-none" />

      {/* Main content */}
      <div className="relative w-full z-10 flex flex-col items-center">
        <div className="text-center w-full space-y-2 opacity-0 animate-fade-in-up min-h-56 flex flex-col justify-center">
          <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
            <div>
              <h1 className="text-left pb-2 text-5xl font-serif tracking-tighter font-semibold text-white tracking-tight">
                Your First Week Here
              </h1>
              <p className="text-left text-base text-[#a1a1a1]">
                Generate a personalized 5-day onboarding plan.
              </p>
            </div>
            <div>
              <RealtimeClock />
            </div>
          </div>
        </div>
        <div className="relative w-full max-w-5xl min-h-[500px] rounded-3xl overflow-hidden opacity-0 animate-fade-in-up animate-delay-200">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/new-york.png')" }}
          >
            {/* Dark overlay for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          </div>

          {/* Content Card Overlay */}
          <div className="absolute bottom-8 left-8 z-10">
            <div className="p-5 lg:p-8 lg:pr-6 rounded-2xl backdrop-blur-[15px] border border-white/20 shadow-[0_2px_6px_0_rgba(0,0,0,0.15)] bg-gradient-to-r from-black/12 via-black/7 to-black/7 bg-clip-padding max-w-[500px]">
              <div className="flex relative z-10 flex-col gap-4 items-start">
                <p className="font-medium text-white text-[15px] leading-[140%] max-w-[42ch] tracking-[-0.15px]">
                  Welcome! We'll get you set up in no time. Meet your AI
                  onboarding buddy.
                </p>
                <Button
                  onClick={() => setModalOpen(true)}
                  size="lg"
                  className="group bg-white text-black hover:bg-white/90 font-medium px-8 py-6 text-base rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GetStartedModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
