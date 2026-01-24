import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WhyPage() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center px-4 py-16">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-linear-to-b from-black via-black to-zinc-950 pointer-events-none" />

      {/* Main content */}
      <div className="relative w-full z-10 flex flex-col items-center max-w-4xl">
        {/* Back button */}
        <div className="w-full mb-12 opacity-0 animate-fade-in-up">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-[#a1a1a1] hover:text-white hover:bg-white/5 -ml-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center w-full space-y-6 mb-16 opacity-0 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-serif tracking-tighter font-semibold text-white">
            Onboarding can be tough.
          </h1>
          <p className="text-xl text-[#a1a1a1] max-w-2xl mx-auto leading-relaxed">
            Starting a new job should be exciting, not overwhelming. But too
            often, new hires are left to navigate a maze of tools, docs, and
            messages on their own.
          </p>
        </div>

        {/* Problem section */}
        <div className="w-full space-y-8">
          {/* Email overload */}
          <div className="opacity-0 animate-fade-in-up animate-delay-100">
            <div className="frosted-glass rounded-2xl p-8 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">
                  Inbox overload from day one
                </h2>
                <p className="text-[#a1a1a1] leading-relaxed">
                  Within hours of starting, your inbox is flooded with calendar
                  invites, tool invitations, onboarding docs, and welcome
                  emails. It's hard to know what's urgent and what can wait.
                </p>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/10">
                <Image
                  src="/lots-of-emails.png"
                  alt="Screenshot of an overwhelming email inbox on day one"
                  width={1200}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* Slack chaos */}
          <div className="opacity-0 animate-fade-in-up animate-delay-200">
            <div className="frosted-glass rounded-2xl p-8 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">
                  No one likes to be a pain in the ass
                </h2>
                <p className="text-[#a1a1a1] leading-relaxed">
                  You don't want to bother your busy teammates with basic
                  questions. But finding answers on your own means digging
                  through endless Notion pages and Slack threads—often at odd
                  hours.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="rounded-xl overflow-hidden border border-white/10 max-w-2xl">
                  <Image
                    src="/slack-messages.png"
                    alt="Screenshot of asking for help on Slack late at night"
                    width={1000}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Solution teaser */}
          <div className="opacity-0 animate-fade-in-up animate-delay-300">
            <div className="text-center space-y-4 py-8">
              <h2 className="text-2xl font-serif tracking-tight font-medium text-white">
                Meet Ray. There's a better way.
              </h2>
              <Link href="/">
                <Button
                // size="lg"
                variant="outline"
                // className="transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
