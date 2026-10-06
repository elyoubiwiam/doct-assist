import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Guard } from "@/components/Guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { generateIntake } from "@/lib/intake.functions";
import { useSession } from "@/lib/session";
import { specialtyName, uid } from "@/lib/specialties";

export const Route = createFileRoute("/symptoms")({
  head: () => ({
    meta: [
      { title: "Enter symptoms | Anamnesis" },
      { name: "description", content: "Enter presenting symptoms to generate a tailored intake form." },
      { property: "og:title", content: "Enter symptoms | Anamnesis" },
      { property: "og:description", content: "Generate structured data-entry fields from presenting symptoms." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SymptomsPage,
});

function SymptomsPage() {
  const { t, lang } = useI18n();
  const { s, update } = useSession();
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const generate = useServerFn(generateIntake);

  const add = () => {
    const parts = draft.split(/[,;\n]/).map((x) => x.trim()).filter((x) => x.length > 0 && x.length <= 200);
    if (parts.length) update((p) => ({ symptoms: [...p.symptoms, ...parts].slice(0, 20) }));
    setDraft("");
  };

  const run = async () => {
    const symptoms = draft.trim() ? [...s.symptoms, draft.trim()] : s.symptoms;
    if (!symptoms.length) {
      toast.error(t.noSymptoms);
      return;
    }
    if (draft.trim()) {
      update({ symptoms });
      setDraft("");
    }
    setLoading(true);
    try {
      const templateFields = s.fields.filter((f) => f.source !== "ai");
      const res = await generate({
        data: {
          specialty: specialtyName(s.specialty!, "en"),
          symptoms: symptoms.join("; "),
          lang,
          existingFields: templateFields.map((f) => f.label),
        },
      });
      if (!res.ok) {
        toast.error(t.errors[res.error] ?? t.errors['generic']);
        return;
      }
      const { fields, ...suggestions } = res.result;
      update({
        fields: [...templateFields, ...fields.map((f) => ({ ...f, id: uid(), source: "ai" as const }))],
        suggestions,
      });
      navigate({ to: "/intake" });
    } catch {
      toast.error(t.errors['generic']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell step={3}>
      <Guard when={s.accepted && !!s.specialty}>
        <p className="text-sm font-medium text-primary">{s.specialty && specialtyName(s.specialty, lang)}</p>
        <h1 className="text-3xl font-semibold">{t.symptomsTitle}</h1>
        <p className="mt-1 text-muted-foreground">{t.symptomsSub}</p>
        <div className="mt-6 rounded-xl border bg-card p-6">
          <div className="flex gap-2">
            <Input
              value={draft}
              maxLength={400}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  add();
                }
              }}
              placeholder={t.symptomsPlaceholder}
            />
            <Button variant="secondary" onClick={add}>{t.addSymptom}</Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t.symptomHint}</p>
          {s.symptoms.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {s.symptoms.map((x, i) => (
                <li key={i} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                  {x}
                  <button aria-label={t.remove} onClick={() => update((p) => ({ symptoms: p.symptoms.filter((_, j) => j !== i) }))}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-6 flex justify-between">
          <Button variant="ghost" asChild><Link to="/specialty">{t.back}</Link></Button>
          <Button size="lg" onClick={run} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? t.generating : t.generate}
          </Button>
        </div>
      </Guard>
    </AppShell>
  );
}
