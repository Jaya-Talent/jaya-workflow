import { cn } from "@/lib/utils";

export function SageMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("text-sage", className)}
    >
      <path
        d="M16 28c0 0-8-10-8-15.4C8 8.2 11.5 4.5 16 4.5S24 8.2 24 12.6C24 18 16 28 16 28Z"
        fill="currentColor"
      />
      <path
        d="M16 26.5V6.8"
        stroke="#FAF8F5"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M16 13c-2.6-1.7-4.8-.5-5.6 1.4M16 16.6c2.5-1.6 4.7-.4 5.5 1.5"
        stroke="#E2E7D8"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BotanicalRule({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-sage", className)} aria-hidden="true">
      <span className="h-px flex-1 bg-border" />
      <SageMark className="size-3.5" />
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
