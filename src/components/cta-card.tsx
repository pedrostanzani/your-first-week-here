"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CTACardProps {
  onGetStartedClick: () => void;
}

export function CTACard({ onGetStartedClick }: CTACardProps) {
  return (
    <div className="frosted-glass rounded-2xl p-8 md:p-10 opacity-0 animate-fade-in-up animate-delay-200">
        <Button
          onClick={onGetStartedClick}
          size="lg"
          className="group bg-white text-black hover:bg-white/90 font-medium px-8 py-6 text-base rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
    </div>
  );
}
