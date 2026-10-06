import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAutoTranslate } from "@/lib/useAutoTranslate";
import { Loader2 } from "lucide-react";

export function AppShell({ step, children }: { step: number; children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const { pending, failed, retry } = useAutoTranslate();
  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary font-serif text-lg font-semibold text-primary-foreground">A</span>
            <span className="leading-tight">
              <span className="block font-serif text-lg font-semibold">{t.brand}</span>
              <span className="block text-xs text-muted-foreground">{t.tagline}</span>
            </span>
          </Link>
          <div role="group" aria-label={t.language} className="flex rounded-md border bg-background p-0.5 text-sm">
            {(["en", "fr"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={cn(
                  "rounded px-3 py-1 font-medium transition-colors",
                  lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l === "en" ? "English" : "Français"}
              </button>
            ))}
          </div>
        </div>
        <ol className="mx-auto flex max-w-5xl gap-1 px-5 pb-3">
          {t.steps.map((label, i) => (
            <li key={label} className="flex-1">
              <div className={cn("h-1 rounded-full", i + 1 <= step ? "bg-primary" : "bg-border")} />
              <span className={cn("mt-1 hidden text-xs sm:block", i + 1 === step ? "font-medium text-foreground" : "text-muted-foreground")}>
                {i + 1}. {label}
              </span>
            </li>
          ))}
        </ol>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8">
        <p className="no-print mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">{t.stepOf(step, 5)}</p>
        {(pending || failed) && (
          <div className="no-print mb-4 flex items-center gap-3 rounded-md border bg-card px-4 py-2 text-sm text-muted-foreground">
            {pending ? (
              <><Loader2 className="h-4 w-4 animate-spin" />{t.translating}</>
            ) : (
              <>
                <span>{t.translateFailed}</span>
                <button onClick={retry} className="font-medium text-primary underline">{t.retry}</button>
              </>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
