import { useEffect, useId, useRef, useState } from "react";
import { Check, Send, ExternalLink } from "lucide-react";
import { telegramUrl, type Category } from "@/data/dashboard";
import { copyText, formatTelegramPost, formatTelegramHtml } from "@/lib/telegram";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/store/dashboard-store";

export function CopyTelegramButton({ category }: { category: Category }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const [draft, setDraft] = useState("");
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const liveId = useId();

  const postedNums = useDashboardStore((state) => state.postedNums);
  const markPosted = useDashboardStore((state) => state.markPosted);
  const isPosted = postedNums.includes(category.num);

  useEffect(() => {
    setStatus("idle");
    setDraft("");
  }, [category.num]);

  useEffect(() => {
    if (status !== "copied") return;
    const id = window.setTimeout(() => setStatus("idle"), 2200);
    return () => window.clearTimeout(id);
  }, [status]);

  useEffect(() => {
    if (status !== "error") return;
    const node = areaRef.current;
    if (!node) return;
    node.focus();
    node.select();
  }, [status, draft]);

  async function handleCopy() {
    if (category.jobs.length === 0) return;
    const text = formatTelegramPost(category);
    const html = formatTelegramHtml(category);
    setDraft(text);
    const ok = await copyText(text, html);
    setStatus(ok ? "copied" : "error");
  }

  async function handleOpenAndPost() {
    if (category.jobs.length === 0) return;
    const text = formatTelegramPost(category);
    const html = formatTelegramHtml(category);
    setDraft(text);
    const ok = await copyText(text, html);
    setStatus(ok ? "copied" : "error");
    
    // Mark as posted
    markPosted(category.num);
    
    // Open Telegram link
    const url = telegramUrl(category.channel);
    window.open(url, "_blank");
  }

  const copied = status === "copied";

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          type="button"
          size="lg"
          onClick={handleCopy}
          disabled={category.jobs.length === 0}
          aria-describedby={liveId}
          className={cn("w-full rounded-md font-medium transition-all duration-200", copied && "bg-sage hover:bg-sage-dark")}
        >
          <span className="relative inline-flex h-4 w-4 items-center justify-center mr-2">
            <Send
              className={cn(
                "absolute transition-[opacity,transform,filter] duration-200 ease-in-out size-4",
                copied ? "icon-swap-off" : "icon-swap-on",
              )}
            />
            <Check
              className={cn(
                "absolute transition-[opacity,transform,filter] duration-200 ease-in-out size-4",
                copied ? "icon-swap-on" : "icon-swap-off",
              )}
            />
          </span>
          {copied ? "Copied Post!" : "Copy Telegram Post Text"}
        </Button>

        <Button
          type="button"
          size="lg"
          onClick={handleOpenAndPost}
          disabled={category.jobs.length === 0}
          className={cn(
            "w-full rounded-md font-medium transition-all duration-200 bg-clay hover:bg-clay-dark text-white shadow-soft",
            isPosted && "bg-emerald-600 hover:bg-emerald-700"
          )}
        >
          <span className="relative inline-flex h-4 w-4 items-center justify-center mr-2">
            {isPosted ? <Check className="size-4" /> : <ExternalLink className="size-4" />}
          </span>
          {isPosted ? "Posted to Channel" : "Open & Post to Channel"}
        </Button>
      </div>

      <p id={liveId} className="sr-only" aria-live="polite">
        {copied
          ? "Telegram post copied to clipboard."
          : status === "error"
            ? "Clipboard blocked. Message is selected below."
            : ""}
      </p>

      {status === "error" ? (
        <div className="mt-1">
          <p className="mb-2 text-center text-xs text-muted">
            Clipboard is blocked here. The message is selected — copy it manually.
          </p>
          <textarea
            ref={areaRef}
            readOnly
            value={draft}
            rows={8}
            className="w-full rounded-md border border-border bg-background p-3 font-sans text-xs leading-relaxed text-foreground"
          />
        </div>
      ) : (
        <p className="mt-1 text-center text-xs text-muted">
          Copy formats listings into markdown. Open & Post copies to clipboard and opens the Telegram channel.
        </p>
      )}
    </div>
  );
}
