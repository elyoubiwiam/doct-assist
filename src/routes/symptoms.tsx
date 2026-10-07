import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, Stethoscope, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Guard } from "@/components/Guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { generateIntake } from "@/lib/intake.functions";
import { useSession } from "@/lib/session";
import { fromLang, specialtyName, tr, uid } from "@/lib/specialties";

export const Route = createFileRoute("/symptoms")({
  head: () => ({
    meta: [
      { title: "Enter symptoms | DoctAssist" },
      { name: "description", content: "Enter presenting symptoms to generate a tailored intake form." },
      { property: "og:title", content: "Enter symptoms | DoctAssist" },
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
    if (parts.length) update((p) => ({ symptoms: [...p.symptoms, ...parts.map((x) => fromLang(x, lang))].slice(0, 20) }));
    setDraft("");
  };

  const run = async () => {
    if (!s.specialty || loading) return;
    const symptoms = draft.trim() ? [...s.symptoms, fromLang(draft.trim().slice(0, 200), lang)] : s.symptoms;
    if (!symptoms.length) {
      toast.error(t.noSymptoms);
      return;
    }
    if (draft.trim()) {
      update({ symptoms });
      setDraft("");
    }
    setLoading(true);
    const templateFields = s.fields.filter((f) => f.source !== "ai");
    const runId = uid();
    const b = (x: string) => fromLang(x, lang);
    const base = {
      specialty: specialtyName(s.specialty, "en"),
      symptoms: symptoms.map((x) => tr(x, lang)).join("; "),
      lang,
      existingFields: templateFields.map((f) => tr(f.label, lang)).slice(0, 80),
    };
    const parts = ["history", "exam", "support"] as const;
    update({
      fields: templateFields,
      suggestions: { followUpQuestions: [], possibleAssessments: [], nextSteps: [], redFlags: [] },
      pending: parts.length,
      excluded: {},
      runId,
      translateFailed: false,
    });
    let errored = false;
    for (const part of parts) {
      generate({ data: { ...base, part } })
        .then((res) => {
          if (!res.ok) {
            if (!errored) toast.error(t.errors[res.error] ?? t.errors['generic']);
            errored = true;
            return;
          }
          const { fields, ...sg } = res.result;
          update((p) => {
            if (p.runId !== runId) return {};
            const known = new Set(p.fields.map((f) => tr(f.label, lang).toLowerCase()));
            const fresh = fields.filter((f) => !known.has(f.label.toLowerCase()));
            const cur = p.suggestions ?? { followUpQuestions: [], possibleAssessments: [], nextSteps: [], redFlags: [] };
            return {
              fields: [
                ...p.fields,
                ...fresh.map((f) => ({
                  id: uid(),
                  type: f.type,
                  label: b(f.label),
                  unit: f.unit ? b(f.unit) : null,
                  section: f.section ? b(f.section) : null,
                  options: f.options ? f.options.map(b) : null,
                  source: "ai" as const,
                })),
              ],
              suggestions: {
                followUpQuestions: [...cur.followUpQuestions, ...sg.followUpQuestions.map(b)],
                possibleAssessments: [...cur.possibleAssessments, ...sg.possibleAssessments.map(b)],
                nextSteps: [...cur.nextSteps, ...sg.nextSteps.map(b)],
                redFlags: [...cur.redFlags, ...sg.redFlags.map(b)],
              },
            };
          });
        })
        .catch(() => {
          if (!errored) toast.error(t.errors['generic']);
          errored = true;
        })
        .finally(() => update((p) => (p.runId === runId ? { pending: Math.max(0, p.pending - 1) } : {})));
    }
    setLoading(false);
    navigate({ to: "/intake" });
  };

  return (
    <AppShell step={3}>
      <Guard when={s.accepted && !!s.specialty}>
        <p className="text-sm font-medium text-primary">{s.specialty && specialtyName(s.specialty, lang)}</p>
        <div className="flex items-center gap-3">
          <Stethoscope className="h-7 w-7 shrink-0 text-primary" aria-hidden="true" />
          <h1 className="text-3xl font-semibold">{t.symptomsTitle}</h1>
        </div>
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
                  {tr(x, lang)}
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
