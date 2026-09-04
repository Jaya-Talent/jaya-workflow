import { useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type TagInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions: readonly string[];
  placeholder?: string;
  id?: string;
};

export function TagInput({ value, onChange, suggestions, placeholder, id }: TagInputProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return suggestions
      .filter((item) => !value.includes(item))
      .filter((item) => (q ? item.toLowerCase().includes(q) : true))
      .slice(0, 8);
  }, [query, suggestions, value]);

  function add(tag: string) {
    const next = tag.trim();
    if (!next) return;
    if (value.some((item) => item.toLowerCase() === next.toLowerCase())) {
      setQuery("");
      return;
    }
    if (value.length >= 20) return;
    onChange([...value, next]);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function remove(tag: string) {
    onChange(value.filter((item) => item !== tag));
  }

  return (
    <div className="relative">
      <div
        className={cn(
          "flex min-h-12 flex-wrap items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2",
          "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-sm text-accent"
          >
            {tag}
            <button
              type="button"
              className="grid size-6 place-items-center rounded-full hover:bg-accent/10"
              onClick={() => remove(tag)}
              aria-label={`Remove ${tag}`}
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              if (query.trim()) add(query);
              else if (filtered[0]) add(filtered[0]);
            }
            if (event.key === "Backspace" && !query && value.length) {
              remove(value[value.length - 1]!);
            }
          }}
          placeholder={value.length === 0 ? placeholder : "Add another"}
          className="min-w-32 flex-1 bg-transparent py-1 text-base text-ink outline-none placeholder:text-subtle"
        />
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-xl bg-surface py-1 shadow-[var(--shadow-card)]">
          {filtered.map((item) => (
            <li key={item}>
              <button
                type="button"
                className="flex w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-surface-muted"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => add(item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
