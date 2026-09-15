import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "gold" | "success";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-colors focus:outline-none";
  const variants = {
    default: "border-transparent bg-gold/10 text-gold-bright border-gold/30",
    secondary: "border-transparent bg-[#1b1e24] text-[#8f9198]",
    outline: "border-[#262a32] text-[#eae7df]",
    gold: "border-gold/40 bg-gold/20 text-gold-bright",
    success: "border-green-500/20 bg-green-500/10 text-green-400"
  };

  return <div className={cn(base, variants[variant], className)} {...props} />;
}

export { Badge };
