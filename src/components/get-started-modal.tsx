"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface GetStartedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    email: string;
    name?: string;
    role?: string;
  }) => Promise<void>;
}

export function GetStartedModal({
  open,
  onOpenChange,
  onSubmit,
}: GetStartedModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic email validation
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        email,
        name: name.trim() || undefined,
        role: role || undefined,
      });
      setEmail("");
      setName("");
      setRole("");
    } catch {
      setError("Oops! Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="frosted-glass-solid border-white/10 sm:max-w-md gap-0">
        <DialogHeader className="">
          <DialogTitle className="text-2xl font-serif font-semibold text-white">
            Let&apos;s get you set up...
          </DialogTitle>
          <DialogDescription className="text-[#a1a1a1]">
            It's a joy to have you here! Enter your details to start your
            onboarding journey.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/80">
              How would you like us to call you?
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Your preferred name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/20 focus-visible:border-white/20"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/20 focus-visible:border-white/20"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-white/80">
              What role are you joining in?
            </Label>
            <Select value={role} onValueChange={setRole} disabled={isLoading}>
              <SelectTrigger
                id="role"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-white/20 focus:border-white/20"
              >
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                <SelectItem
                  value="Engineering"
                  className="text-white focus:bg-white/10 focus:text-white"
                >
                  Engineering
                </SelectItem>
                <SelectItem
                  value="Design"
                  className="text-white focus:bg-white/10 focus:text-white"
                >
                  Design
                </SelectItem>
                <SelectItem
                  value="Sales"
                  className="text-white focus:bg-white/10 focus:text-white"
                >
                  Sales
                </SelectItem>
                <SelectItem
                  value="Operations"
                  className="text-white focus:bg-white/10 focus:text-white"
                >
                  Operations
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-white text-black hover:bg-white/90 font-medium text-sm rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Start My Onboarding"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
