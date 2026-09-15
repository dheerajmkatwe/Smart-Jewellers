import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "gold" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-lg font-bold text-xs transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-gold text-black hover:bg-gold-bright shadow",
      gold: "bg-gradient-to-r from-[#f5d77f] via-[#c9a24b] to-[#997327] text-black hover:brightness-110 shadow-md",
      outline: "border border-[#262a32] bg-[#14161b] text-[#eae7df] hover:border-gold hover:text-gold-bright",
      ghost: "text-[#8f9198] hover:text-[#eae7df] hover:bg-[#1b1e24]",
      destructive: "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
    };

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 px-3 text-[11px]",
      lg: "h-10 px-6 text-sm",
      icon: "h-9 w-9"
    };

    return (
      <button
        className={cn(base, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
