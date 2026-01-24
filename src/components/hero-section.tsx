"use client";

interface HeroSectionProps {
  title: string;
  tagline: string;
}

export function HeroSection({ title, tagline }: HeroSectionProps) {
  return (
    <div className="text-center space-y-4 opacity-0 animate-fade-in-up">
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold text-white tracking-tight">
        {title}
      </h1>
      <p className="text-lg md:text-xl text-[#a1a1a1] max-w-md mx-auto">
        {tagline}
      </p>
    </div>
  );
}
