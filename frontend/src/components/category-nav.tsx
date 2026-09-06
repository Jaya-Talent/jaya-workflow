import { Search } from "lucide-react";
import type { Category } from "@/data/dashboard";
import { telegramUrl } from "@/data/dashboard";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboard-store";

type CategoryNavProps = {
  categories: Category[];
  activeNum: number;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (num: number) => void;
};

export function getPriority(num: number): "High" | "Medium" | "Low" {
  const priorityMap: Record<number, "High" | "Medium" | "Low"> = {
    34: "High", 10: "High", 35: "High", 2: "High", 21: "High",
    20: "High", 1: "High", 3: "High", 16: "High", 5: "High",
    4: "Medium", 17: "Medium", 8: "Medium", 11: "Medium", 26: "Medium",
    27: "Medium", 28: "Medium", 29: "Medium", 30: "Medium", 31: "Medium",
  };
  return priorityMap[num] || "Low";
}

export function CategoryNav({
  categories,
  activeNum,
  query,
  onQueryChange,
  onSelect,
}: CategoryNavProps) {
  const postedNums = useDashboardStore((state) => state.postedNums);

  const sortedCategories = [...categories].sort((a, b) => {
    const pA = getPriority(a.num);
    const pB = getPriority(b.num);
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    
    if (priorityOrder[pA] !== priorityOrder[pB]) {
      return priorityOrder[pA] - priorityOrder[pB];
    }
    return a.num - b.num;
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <label className="relative block px-3 pt-3">
        <span className="sr-only">Search categories</span>
        <Search className="pointer-events-none absolute top-1/2 left-6 size-4 -translate-y-px text-muted" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search channels"
          className="h-11 w-full rounded-md border border-border bg-background pr-3 pl-10 text-sm text-foreground placeholder:text-muted transition-[border-color,box-shadow] duration-200 ease-in-out focus-visible:border-sage focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </label>

      <nav
        aria-label="Job categories"
        className="mt-2 min-h-0 flex-1 overflow-y-auto px-2 pb-3"
      >
        {sortedCategories.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted">No channels match that search.</p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {sortedCategories.map((item) => {
              const isActive = item.num === activeNum;
              const isPosted = postedNums.includes(item.num);
              const priority = getPriority(item.num);
              return (
                <li key={item.num}>
                  <button
                     type="button"
                     onClick={() => onSelect(item.num)}
                     aria-current={isActive ? "true" : undefined}
                     className={cn(
                       "flex w-full min-h-11 items-start justify-between gap-3 rounded-md px-3 py-2.5 text-left transition-[background-color,color,transform] duration-200 ease-in-out",
                       isActive
                         ? "bg-sage text-white shadow-soft"
                         : "text-foreground hover:bg-sage-soft",
                     )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 flex-wrap">
                        <span className="block truncate text-sm font-medium leading-snug">
                          {item.category}
                        </span>
                        {isPosted && (
                          <span className={cn(
                            "inline-flex shrink-0 items-center rounded px-1 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-emerald-100/90 text-emerald-800",
                            isActive && "bg-white/20 text-white"
                          )}>
                            Posted
                          </span>
                        )}
                        <span className={cn(
                          "inline-flex shrink-0 items-center rounded px-1.5 py-0.25 text-[9px] font-bold tracking-wide uppercase border",
                          priority === "High" && (isActive ? "bg-red-500/25 text-red-100 border-red-400/30" : "bg-red-50 text-red-700 border-red-100"),
                          priority === "Medium" && (isActive ? "bg-emerald-500/25 text-emerald-100 border-emerald-400/30" : "bg-emerald-50 text-emerald-700 border-emerald-100"),
                          priority === "Low" && (isActive ? "bg-gray-500/25 text-gray-100 border-gray-400/30" : "bg-gray-50 text-gray-600 border-gray-250")
                        )}>
                          {priority}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block truncate font-sans text-xs",
                          isActive ? "text-white/80" : "text-muted",
                        )}
                      >
                        {item.channel}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 shrink-0 tabular-nums text-xs font-medium",
                        isActive ? "text-white/90" : "text-muted",
                      )}
                    >
                      {item.jobs.length}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </div>
  );
}

export function ChannelLink({
  channel,
  className,
}: {
  channel: string;
  className?: string;
}) {
  return (
    <a
      href={telegramUrl(channel)}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center rounded-full bg-sage-soft px-2.5 py-1 font-sans text-xs font-medium text-sage-dark transition-colors duration-200 ease-in-out hover:bg-sage hover:text-white",
        className,
      )}
    >
      {channel}
    </a>
  );
}
