import { cn } from "@/lib/utils";
import { useState } from "react";

type ChipGroupProps = {
  options: readonly string[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  columns?: string;
  maxVisible?: number;
};

export function ChipGroup({
  options,
  value,
  onChange,
  multiple = false,
  columns,
  maxVisible,
}: ChipGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const selected = new Set(Array.isArray(value) ? value : value ? [value] : []);

  function toggle(option: string) {
    if (multiple) {
      const next = new Set(selected);
      if (next.has(option)) next.delete(option);
      else next.add(option);
      onChange([...next]);
    } else {
      onChange(option);
    }
  }

  const visibleOptions = maxVisible && !isExpanded ? options.slice(0, maxVisible) : options;
  const hasMore = maxVisible && options.length > maxVisible;

  return (
    <div className={cn("flex flex-wrap gap-2", columns)}>
      {visibleOptions.map((option) => {
        const active = selected.has(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            aria-pressed={active}
            className={cn(
              "min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150",
              active
                ? "border-accent bg-accent text-accent-fg"
                : "border-line bg-surface text-ink hover:border-ink/20 hover:bg-surface-muted",
            )}
          >
            {option}
          </button>
        );
      })}
      {hasMore && !isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="min-h-11 rounded-full border border-dashed border-ink/30 px-4 py-2 text-sm font-medium text-ink/70 hover:border-ink/50 hover:text-ink transition-colors duration-150"
        >
          +{options.length - maxVisible} more
        </button>
      )}
      {hasMore && isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="min-h-11 rounded-full border border-dashed border-ink/30 px-4 py-2 text-sm font-medium text-ink/70 hover:border-ink/50 hover:text-ink transition-colors duration-150"
        >
          Show less
        </button>
      )}
    </div>
  );
}
