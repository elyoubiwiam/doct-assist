import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Anamnesis: data protection notice" },
      { name: "description", content: "Read and accept the data protection notice before starting a structured clinical intake." },
      { property: "og:title", content: "Anamnesis: structured clinical intake" },
      { property: "og:description", content: "AI-assisted structured patient intake for clinicians, in English and French." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LegalPage,
});

function LegalPage() {
  const { t } = useI18n();
  const { s, update } = useSession();
  const [ok, setOk] = useState(false);
  const navigate = useNavigate();
  const checked = ok || s.accepted;
  return (
    <AppShell step={1}>
      <div className="mx-auto max-w-3xl rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-semibold">{t.legalTitle}</h1>
        </div>
        <p className="text-muted-foreground">{t.legalIntro}</p>
        <ol className="mt-6 space-y-3">
          {t.legalPoints.map((p, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="mt-0.5 font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
              <span>{p}</span>
            </li>
          ))}
        </ol>
        <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-lg border bg-muted p-4 text-sm">
          <Checkbox checked={checked} onCheckedChange={(v) => setOk(v === true)} className="mt-0.5" />
          <span>{t.legalAccept}</span>
        </label>
        <div className="mt-6 flex justify-end">
          <Button
            size="lg"
            disabled={!checked}
            onClick={() => {
              update({ accepted: true });
              navigate({ to: "/specialty" });
            }}
          >
            {t.legalButton}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
