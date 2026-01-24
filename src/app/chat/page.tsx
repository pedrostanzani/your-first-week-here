import { Assistant } from "@/components/assistant-ui/assistant";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { IconSquareLetterR } from "@tabler/icons-react";

export default function ChatPage() {
  return (
    <main className="dark h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-3 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-lg font-serif font-medium text-white tracking-tight">
                Ray (Onboarding Assistant)
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden">
        <Assistant />
      </div>
    </main>
  );
}
