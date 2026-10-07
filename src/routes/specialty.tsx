import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Stethoscope } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Guard } from "@/components/Guard";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { SPECIALTIES, loadTemplate } from "@/lib/specialties";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/specialty")({
  head: () => ({
    meta: [
      { title: "Select a specialty | DoctAssist" },
      { name: "description", content: "Choose a specialty to load its reusable, editable intake template." },
      { property: "og:title", content: "Select a specialty | DoctAssist" },
      { property: "og:description", content: "Twenty outpatient specialty templates, editable by clinicians." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SpecialtyPage,
});

function SpecialtyPage() {
  const { t, lang } = useI18n();
  const { s, update } = useSession();
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const list = SPECIALTIES.filter((x) => x.name[lang].toLowerCase().includes(q.toLowerCase())).sort((a, b) =>
    a.name[lang].localeCompare(b.name[lang], lang),
  );
  return (
    <AppShell step={2}>
      <Guard when={s.accepted}>
        <div className="flex items-center gap-3">
          <Stethoscope className="h-7 w-7 shrink-0 text-primary" aria-hidden="true" />
          <h1 className="text-3xl font-semibold">{t.specialtyTitle}</h1>
        </div>
        <p className="mt-1 text-muted-foreground">{t.specialtySub}</p>
        <Input className="mt-6 max-w-sm bg-card" placeholder={t.searchSpecialty} value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((sp) => (
            <button
              key={sp.id}
              onClick={() => {
                update({ specialty: sp.id, fields: loadTemplate(sp.id, lang), values: {}, suggestions: null, symptoms: [], translateFailed: false });
                navigate({ to: "/symptoms" });
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg border bg-card p-4 text-left transition hover:border-primary hover:shadow-sm",
                s.specialty === sp.id && "border-primary ring-1 ring-primary",
              )}
            >
              <span className="text-2xl" aria-hidden>{sp.icon}</span>
              <span>
                <span className="block font-medium">{sp.name[lang]}</span>
                <span className="block text-xs text-muted-foreground">{t.fieldsCount(sp.fields.length)}</span>
              </span>
            </button>
          ))}
        </div>
      </Guard>
    </AppShell>
  );
}
