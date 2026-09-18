import { cva, type VariantProps } from "class-variance-authority";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-[0.5px] cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-[#8E12BD] to-[#7B00A6] text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),0_3px_12px_rgba(123,0,166,0.28),inset_0_1px_0_rgba(255,255,255,0.22)] border border-[#7B00A6] hover:from-[#9B1DCC] hover:to-[#8602B3] hover:shadow-[0_2px_4px_rgba(0,0,0,0.12),0_6px_18px_rgba(123,0,166,0.35)]",
        secondary:
          "bg-white/95 text-ink border border-line/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.95)] hover:bg-surface-muted hover:border-ink/20 hover:shadow-xs",
        ghost: "bg-transparent text-ink hover:bg-surface-muted/90",
        outline:
          "border border-ink/15 bg-white/70 backdrop-blur-xs text-ink shadow-2xs hover:bg-white hover:border-ink/30 hover:shadow-xs",
      },
      size: {
        sm: "h-9 rounded-xl px-4 text-xs font-semibold tracking-tight",
        md: "h-11 rounded-xl px-5 text-sm font-semibold tracking-tight",
        lg: "h-13 rounded-2xl px-6 text-base font-semibold tracking-tight",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-line/90 bg-white px-4 text-sm text-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]",
        "placeholder:text-subtle transition-all duration-150",
        "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/15",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-xl border border-line/90 bg-white px-4 py-3 text-sm text-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]",
        "placeholder:text-subtle transition-all duration-150",
        "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/15",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted", className)} {...props} />;
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs font-semibold text-danger">{children}</p>;
}

export function FieldHint({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs text-muted leading-relaxed">{children}</p>;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full appearance-none rounded-xl border border-line/90 bg-white bg-[length:1rem] bg-[right_0.9rem_center] bg-no-repeat px-4 pr-10 text-sm text-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]",
        "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/15",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b6578' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold tracking-tight transition-colors",
        tone === "neutral" && "bg-surface-muted/90 text-ink/80 border border-line/70 shadow-2xs",
        tone === "accent" && "bg-accent/[0.08] text-accent border border-accent/25 shadow-2xs font-semibold",
        tone === "success" && "bg-emerald-500/[0.09] text-emerald-800 border border-emerald-500/25 shadow-2xs font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line/80 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_6px_24px_-4px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-200",
        className,
      )}
      {...props}
    />
  );
}
