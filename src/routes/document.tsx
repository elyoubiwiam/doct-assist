import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Guard } from "@/components/Guard";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useSession, type Suggestions } from "@/lib/session";
import { specialtyName } from "@/lib/specialties";

export const Route = createFileRoute("/document")({
  head: () => ({
    meta: [
      { title: "Patient document | Anamnesis" },
      { name: "description", content: "Review, download or print the clinical intake record as a PDF." },
      { property: "og:title", content: "Patient document | Anamnesis" },
      { property: "og:description", content: "A clean, printable clinical intake record." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DocumentPage,
});

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-dashed py-1.5 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium">{v}</span>
    </div>
  );
}

function DocumentPage() {
  const { t, lang } = useI18n();
  const { s, resetPatient } = useSession();
  const navigate = useNavigate();
  const locale = lang === "fr" ? "fr-FR" : "en-GB";
  const now = new Date().toLocaleString(locale, { dateStyle: "long", timeStyle: "short" });
  const fmtDate = (d: string) => (d ? new Date(d).toLocaleDateString(locale, { dateStyle: "long" }) : t.notRecorded);

  const display = (id: string, unit?: string | null) => {
    const v = s.values[id];
    if (v === true) return t.yes;
    if (v === false || v === undefined || v === "") return null;
    return unit ? `${v} ${unit}` : String(v);
  };
  const recorded = s.fields.map((f) => ({ f, v: display(f.id, f.unit) })).filter((x) => x.v !== null);

  const blocks: [keyof Suggestions, string][] = [
    ["redFlags", t.redFlags],
    ["followUpQuestions", t.followUp],
    ["possibleAssessments", t.assessments],
    ["nextSteps", t.nextSteps],
  ];
  const shown = blocks.filter(([k]) => s.included[k] && (s.suggestions?.[k]?.length ?? 0) > 0);

  return (
    <AppShell step={5}>
      <Guard when={s.accepted && !!s.specialty && s.symptoms.length > 0}>
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" asChild><Link to="/intake">{t.back}</Link></Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetPatient();
                navigate({ to: "/symptoms" });
              }}
            >
              {t.newPatient}
            </Button>
            <Button onClick={() => window.print()}><Printer className="h-4 w-4" />{t.print}</Button>
          </div>
        </div>
        <p className="no-print -mt-3 mb-4 text-right text-xs text-muted-foreground">{t.printHint}</p>

        <article className="print-sheet mx-auto max-w-[210mm] rounded-xl border bg-card p-10 shadow-sm">
          <header className="flex items-start justify-between border-b-2 border-primary pb-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-primary font-serif text-xl font-semibold text-primary-foreground">A</span>
              <div>
                <div className="font-serif text-xl font-semibold">{t.brand}</div>
                <div className="text-xs text-muted-foreground">{t.tagline}</div>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-semibold">{t.docTitle}</h1>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-destructive">{t.confidential}</div>
            </div>
          </header>

          <section className="avoid-break mt-6 grid gap-x-10 sm:grid-cols-2 print:grid-cols-2">
            <div>
              <Row k={t.patientRef} v={s.patient.ref || t.notRecorded} />
              <Row k={t.age} v={s.patient.age || t.notRecorded} />
              <Row k={t.sex} v={s.patient.sex || t.notRecorded} />
            </div>
            <div>
              <Row k={t.consultDate} v={fmtDate(s.patient.date)} />
              <Row k={t.specialty} v={specialtyName(s.specialty!, lang)} />
              <Row k={t.clinician} v={s.patient.clinician || t.notRecorded} />
            </div>
          </section>

          <section className="avoid-break mt-6">
            <h2 className="mb-2 text-lg font-semibold text-primary">{t.presenting}</h2>
            <p className="text-sm">{s.symptoms.join(", ")}</p>
          </section>

          <section className="mt-6">
            <h2 className="mb-2 text-lg font-semibold text-primary">{t.findings}</h2>
            {recorded.length ? (
              <div className="grid gap-x-10 sm:grid-cols-2 print:grid-cols-2">
                {recorded.map(({ f, v }) => <Row key={f.id} k={f.label} v={v!} />)}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.notRecorded}</p>
            )}
          </section>

          {s.notes.trim() && (
            <section className="avoid-break mt-6">
              <h2 className="mb-2 text-lg font-semibold text-primary">{t.notes}</h2>
              <p className="whitespace-pre-wrap text-sm">{s.notes}</p>
            </section>
          )}

          {shown.length > 0 && (
            <section className="mt-8 rounded-lg border-2 border-dashed p-5">
              <h2 className="text-lg font-semibold">{t.decisionSupport}</h2>
              <p className="mb-4 text-xs text-muted-foreground">{t.decisionSupportNote}</p>
              <div className="grid gap-5 sm:grid-cols-2 print:grid-cols-2">
                {shown.map(([k, title]) => (
                  <div key={k} className="avoid-break">
                    <h3 className={`font-sans text-sm font-semibold ${k === "redFlags" ? "text-destructive" : ""}`}>{title}</h3>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
                      {s.suggestions![k].map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          <footer className="avoid-break mt-10 grid grid-cols-2 gap-10 text-xs text-muted-foreground">
            <div>
              <div className="h-12 border-b" />
              <div className="mt-1">{t.signature}</div>
            </div>
            <div className="text-right">
              <div>{t.generatedOn} {now}</div>
              <p className="mt-2">{t.docDisclaimer}</p>
            </div>
          </footer>
        </article>
      </Guard>
    </AppShell>
  );
}
