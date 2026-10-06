import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Guard } from "@/components/Guard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { useSession, type Suggestions } from "@/lib/session";
import { defaultTemplate, resetTemplate, saveTemplate, specialtyName, uid, type Field, type FieldType } from "@/lib/specialties";

export const Route = createFileRoute("/intake")({
  head: () => ({
    meta: [
      { title: "Intake form | Anamnesis" },
      { name: "description", content: "Complete the structured intake form and review decision support suggestions." },
      { property: "og:title", content: "Intake form | Anamnesis" },
      { property: "og:description", content: "Editable intake fields with clinician decision support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IntakePage,
});

const selectCls = "h-9 w-full rounded-md border border-input bg-card px-3 text-sm";

function FieldInput({ f }: { f: Field }) {
  const { t } = useI18n();
  const { s, update } = useSession();
  const v = s.values[f.id];
  const set = (val: string | boolean) => update((p) => ({ values: { ...p.values, [f.id]: val } }));
  if (f.type === "checkbox")
    return (
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={v === true} onCheckedChange={(c) => set(c === true)} /> {t.yes}
      </label>
    );
  if (f.type === "select")
    return (
      <select className={selectCls} value={(v as string) ?? ""} onChange={(e) => set(e.target.value)}>
        <option value="">{t.select}</option>
        {(f.options ?? []).map((o) => <option key={o}>{o}</option>)}
      </select>
    );
  if (f.type === "textarea")
    return <Textarea rows={2} maxLength={2000} value={(v as string) ?? ""} onChange={(e) => set(e.target.value)} />;
  return (
    <div className="flex items-center gap-2">
      <Input
        type={f.type === "number" ? "number" : "text"}
        step="any"
        maxLength={300}
        value={(v as string) ?? ""}
        onChange={(e) => set(e.target.value)}
      />
      {f.unit && <span className="shrink-0 font-mono text-xs text-muted-foreground">{f.unit}</span>}
    </div>
  );
}

function FieldGroup({ title, fields, tag }: { title: string; fields: Field[]; tag?: string }) {
  const { t } = useI18n();
  const { update } = useSession();
  if (!fields.length) return null;
  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        {tag && <span className="rounded bg-accent px-2 py-0.5 text-xs text-accent-foreground">{tag}</span>}
      </div>
      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.id} className="group">
            <div className="mb-1 flex items-center justify-between gap-2">
              <Label className="text-sm">
                {f.label}
                {f.section && <span className="ml-2 text-xs font-normal text-muted-foreground">{f.section}</span>}
              </Label>
              <button
                aria-label={t.remove}
                title={t.remove}
                className="text-muted-foreground opacity-50 hover:text-destructive group-hover:opacity-100"
                onClick={() => update((p) => ({ fields: p.fields.filter((x) => x.id !== f.id) }))}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <FieldInput f={f} />
          </div>
        ))}
      </div>
    </section>
  );
}

function AddField() {
  const { t } = useI18n();
  const { update } = useSession();
  const [label, setLabel] = useState("");
  const [type, setType] = useState<FieldType>("text");
  const [options, setOptions] = useState("");
  const add = () => {
    const l = label.trim().slice(0, 120);
    if (!l) return;
    const opts = options.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 10);
    update((p) => ({
      fields: [...p.fields, { id: uid(), label: l, type, options: type === "select" ? opts : null, unit: null, source: "custom" }],
    }));
    setLabel("");
    setOptions("");
  };
  return (
    <div className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed bg-card p-4">
      <div className="min-w-48 flex-1">
        <Label className="text-xs">{t.newFieldLabel}</Label>
        <Input value={label} maxLength={120} onChange={(e) => setLabel(e.target.value)} />
      </div>
      <select className={`${selectCls} w-40`} value={type} onChange={(e) => setType(e.target.value as FieldType)}>
        {(Object.keys(t.types) as FieldType[]).map((k) => <option key={k} value={k}>{t.types[k]}</option>)}
      </select>
      {type === "select" && (
        <Input className="w-56" placeholder="A, B, C" value={options} onChange={(e) => setOptions(e.target.value)} />
      )}
      <Button variant="secondary" onClick={add}><Plus className="h-4 w-4" />{t.addField}</Button>
    </div>
  );
}

function SuggestionBlock({ k, title, danger }: { k: keyof Suggestions; title: string; danger?: boolean }) {
  const { t } = useI18n();
  const { s, update } = useSession();
  const items = s.suggestions?.[k] ?? [];
  if (!items.length) return null;
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className={`font-sans text-sm font-semibold ${danger ? "text-destructive" : ""}`}>{title}</h3>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          {t.include}
          <Switch checked={s.included[k]} onCheckedChange={(c) => update((p) => ({ included: { ...p.included, [k]: c } }))} />
        </label>
      </div>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {items.map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    </div>
  );
}

function IntakePage() {
  const { t, lang } = useI18n();
  const { s, update } = useSession();
  const navigate = useNavigate();
  const setP = (k: keyof typeof s.patient, v: string) => update((p) => ({ patient: { ...p.patient, [k]: v.slice(0, 120) } }));

  const tpl = s.fields.filter((f) => f.source === "template");
  const ai = s.fields.filter((f) => f.source === "ai");
  const custom = s.fields.filter((f) => f.source === "custom");

  return (
    <AppShell step={4}>
      <Guard when={s.accepted && !!s.specialty && s.symptoms.length > 0}>
        <p className="text-sm font-medium text-primary">{s.specialty && specialtyName(s.specialty, lang)}</p>
        <h1 className="text-3xl font-semibold">{t.intakeTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{s.symptoms.join(", ")}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">{t.patientDetails}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>{t.patientRef}</Label><Input value={s.patient.ref} onChange={(e) => setP("ref", e.target.value)} /></div>
                <div><Label>{t.age}</Label><Input type="number" min={0} max={130} value={s.patient.age} onChange={(e) => setP("age", e.target.value)} /></div>
                <div>
                  <Label>{t.sex}</Label>
                  <select className={selectCls} value={s.patient.sex} onChange={(e) => setP("sex", e.target.value)}>
                    <option value="">{t.select}</option>
                    {t.sexOptions.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div><Label>{t.consultDate}</Label><Input type="date" value={s.patient.date} onChange={(e) => setP("date", e.target.value)} /></div>
                <div className="sm:col-span-2"><Label>{t.clinician}</Label><Input value={s.patient.clinician} onChange={(e) => setP("clinician", e.target.value)} /></div>
              </div>
            </section>

            <FieldGroup title={t.templateFields} fields={[...tpl, ...custom]} />
            <FieldGroup title={t.aiFields} fields={ai} tag="AI" />
            <AddField />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  saveTemplate(s.specialty!, lang, [...tpl, ...custom]);
                  toast.success(t.templateSaved);
                }}
              >
                {t.saveTemplate}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  resetTemplate(s.specialty!, lang);
                  update((p) => ({ fields: [...defaultTemplate(p.specialty!, lang), ...p.fields.filter((f) => f.source === "ai")] }));
                  toast.success(t.templateReset);
                }}
              >
                {t.resetTemplate}
              </Button>
            </div>

            <section className="rounded-xl border bg-card p-6">
              <h2 className="mb-3 text-xl font-semibold">{t.notes}</h2>
              <Textarea rows={5} maxLength={5000} value={s.notes} onChange={(e) => update({ notes: e.target.value })} />
            </section>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-lg bg-warning p-4 text-warning-foreground">
              <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" />{t.decisionSupport}</div>
              <p className="mt-1 text-xs leading-relaxed">{t.decisionSupportNote}</p>
            </div>
            <SuggestionBlock k="redFlags" title={t.redFlags} danger />
            <SuggestionBlock k="followUpQuestions" title={t.followUp} />
            <SuggestionBlock k="possibleAssessments" title={t.assessments} />
            <SuggestionBlock k="nextSteps" title={t.nextSteps} />
          </aside>
        </div>

        <div className="mt-8 flex justify-between">
          <Button variant="ghost" asChild><Link to="/symptoms">{t.back}</Link></Button>
          <Button size="lg" onClick={() => navigate({ to: "/document" })}>{t.createDoc}</Button>
        </div>
      </Guard>
    </AppShell>
  );
}
