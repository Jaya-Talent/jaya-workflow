import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Drawer } from "vaul";
import { LAST_UPDATED, totalJobs } from "@/data/dashboard";
import { useActiveCategory, useDashboardStore } from "@/store/dashboard-store";
import { BotanicalRule, SageMark } from "@/components/sage-mark";
import { CategoryNav, ChannelLink, getPriority } from "@/components/category-nav";
import { JobTable } from "@/components/job-table";
import { CopyTelegramButton } from "@/components/copy-telegram-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DashboardShell() {
  const categories = useDashboardStore((state) => state.categories);
  const activeNum = useDashboardStore((state) => state.activeNum);
  const setActiveNum = useDashboardStore((state) => state.setActiveNum);
  const active = useActiveCategory();
  const postedNums = useDashboardStore((state) => state.postedNums);
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return categories;
    return categories.filter((item) => {
      return (
        item.category.toLowerCase().includes(needle) ||
        item.channel.toLowerCase().includes(needle)
      );
    });
  }, [categories, query]);

  const jobsCount = useMemo(() => totalJobs(categories), [categories]);

  function selectCategory(num: number) {
    setActiveNum(num);
    setDrawerOpen(false);
  }

  if (!active) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <p className="text-muted">No categories available.</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#jobs"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to jobs
      </a>

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 pb-36 md:px-8 md:py-8 lg:px-10 lg:pb-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-1 flex size-10 items-center justify-center rounded-md bg-sage-soft">
              <SageMark className="size-6" />
            </span>
            <div>
              <p className="text-xs font-medium tracking-widest text-sage uppercase">Web3 roles</p>
              <h1 className="mt-1 font-serif text-4xl text-foreground md:text-5xl">Jaya Talent</h1>
              <p className="mt-2 max-w-md text-sm text-muted">
                A calm weekly digest of open positions, gathered across thirty-five Telegram channels.
              </p>
            </div>
          </div>
          <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-xs tracking-wider text-muted uppercase">Channels</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{categories.length}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-wider text-muted uppercase">Open roles</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{jobsCount}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-wider text-muted uppercase">Harvested</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{LAST_UPDATED}</dd>
            </div>
          </dl>
        </header>

        <BotanicalRule className="my-6 md:my-8" />

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
          <aside className="hidden min-h-0 lg:col-span-1 lg:flex">
            <div className="sidebar-max flex w-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-soft">
              <div className="border-b border-border px-4 py-3">
                <h2 className="font-serif text-lg text-foreground">Channels</h2>
                <p className="text-xs text-muted">Select a category to plate its roles.</p>
              </div>
              <CategoryNav
                categories={filtered}
                activeNum={activeNum}
                query={query}
                onQueryChange={setQuery}
                onSelect={selectCategory}
              />
            </div>
          </aside>

          <section className="flex min-w-0 flex-col lg:col-span-3">
            <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
              <Drawer.Trigger asChild>
                <button
                  type="button"
                  className="mb-4 flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left shadow-soft transition-[background-color,box-shadow] duration-200 ease-in-out hover:bg-sage-soft lg:hidden"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{active.category}</span>
                    <span className="block truncate text-xs text-muted">{active.channel}</span>
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-muted" />
                </button>
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-50 bg-foreground/20" />
                <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex h-5/6 flex-col rounded-t-xl bg-card outline-none">
                  <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-border" />
                  <div className="px-4 pt-4 pb-2">
                    <Drawer.Title className="font-serif text-2xl">Channels</Drawer.Title>
                    <Drawer.Description className="text-sm text-muted">
                      Choose a category to view its open roles.
                    </Drawer.Description>
                  </div>
                  <div className="min-h-0 flex-1 overflow-hidden">
                    <CategoryNav
                      categories={filtered}
                      activeNum={activeNum}
                      query={query}
                      onQueryChange={setQuery}
                      onSelect={selectCategory}
                    />
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>

            <article
              id="jobs"
              className="flex min-w-0 flex-1 flex-col rounded-lg border border-border bg-card p-5 shadow-soft md:p-7"
            >
              <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                    <h2 className="font-serif text-3xl text-foreground md:text-4xl">{active.category}</h2>
                    <span className={cn(
                      "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border",
                      getPriority(active.num) === "High" && "bg-red-50 text-red-700 border-red-200",
                      getPriority(active.num) === "Medium" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                      getPriority(active.num) === "Low" && "bg-gray-50 text-gray-600 border-gray-200"
                    )}>
                      {getPriority(active.num)} Priority
                    </span>
                    {postedNums.includes(active.num) && (
                      <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        ✓ Posted to Telegram
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <ChannelLink channel={active.channel} />
                    <Badge variant="outline">
                      {active.jobs.length} {active.jobs.length === 1 ? "role" : "roles"}
                    </Badge>
                  </div>
                </div>
              </header>

              <BotanicalRule className="my-5" />

              <JobTable category={active} />

              <div className="mt-6 border-t border-border bg-card pt-5 max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-40 max-lg:mt-0 max-lg:border-t max-lg:px-4 max-lg:pt-3 max-lg:shadow-lift safe-pad-b">
                <CopyTelegramButton category={active} />
              </div>
            </article>
          </section>
        </div>

        <footer className="mt-8 hidden pb-4 text-center text-xs text-muted lg:block">
          Roles are compiled from public listings. Always verify on the company site before applying.
        </footer>
      </div>
    </div>
  );
}
