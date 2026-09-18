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
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-[1px] cursor-pointer rounded-none tracking-tight select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[#7B00A6] text-white border border-[#640087] shadow-[0_2px_0_#4E006A,inset_0_1px_0_rgba(255,255,255,0.25)] hover:bg-[#8B08BA] hover:shadow-[0_2px_0_#5B007A] active:shadow-none active:translate-y-[2px]",
        secondary:
          "bg-white text-ink border border-line shadow-[0_2px_0_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] hover:bg-surface-muted hover:border-ink/20 active:shadow-none active:translate-y-[2px]",
        ghost: "bg-transparent text-ink hover:bg-surface-muted/90",
        outline:
          "border border-ink/20 bg-white/80 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-white hover:border-accent hover:text-accent active:translate-y-[1px]",
      },
      size: {
        sm: "h-8.5 px-3.5 text-xs font-bold uppercase tracking-wider",
        md: "h-10.5 px-5 text-sm font-semibold",
        lg: "h-12 px-6 text-base font-semibold",
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
        "h-10.5 w-full rounded-none border border-line bg-white px-3.5 text-sm text-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]",
        "placeholder:text-subtle transition-all duration-150",
        "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent",
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
        "min-h-32 w-full rounded-none border border-line bg-white px-3.5 py-3 text-sm text-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]",
        "placeholder:text-subtle transition-all duration-150",
        "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent",
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
        "h-10.5 w-full appearance-none rounded-none border border-line bg-white bg-[length:1rem] bg-[right_0.9rem_center] bg-no-repeat px-3.5 pr-10 text-sm text-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]",
        "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent",
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
        "inline-flex items-center rounded-none px-2.5 py-0.5 text-[11px] font-mono font-medium tracking-tight transition-colors border",
        tone === "neutral" && "bg-surface-muted text-ink/80 border-line shadow-2xs",
        tone === "accent" && "bg-accent/[0.07] text-accent border-accent/25 shadow-2xs font-semibold",
        tone === "success" && "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs font-semibold",
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
        "rounded-none border border-line bg-white p-6 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.03)] relative transition-all duration-200",
        className,
      )}
      {...props}
    />
  );
}

