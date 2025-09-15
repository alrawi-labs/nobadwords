import { cn } from "@/lib/utils";

interface SoftBackgroundProps {
  className?: string;
}

export function SoftBackground({ className }: SoftBackgroundProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className="absolute left-1/2 -top-24 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-3xl" />
      <div className="absolute right-8 top-40 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
    </div>
  );
}
