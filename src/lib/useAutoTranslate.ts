import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { translateContent } from "./intake.functions";
import { useSession, type Session } from "./session";
import type { BL } from "./specialties";
import type { Lang } from "./i18n";

/** Walk every bilingual string held in the session. */
function eachBL(s: Session, fn: (b: BL) => BL): Partial<Session> {
  const m = (b: BL | null) => (b ? fn(b) : b);
  return {
    symptoms: s.symptoms.map(fn),
    fields: s.fields.map((f) => ({
      ...f,
      label: fn(f.label),
      unit: m(f.unit),
      section: m(f.section),
      options: f.options ? f.options.map(fn) : null,
    })),
    suggestions: s.suggestions
      ? {
          followUpQuestions: s.suggestions.followUpQuestions.map(fn),
          possibleAssessments: s.suggestions.possibleAssessments.map(fn),
          nextSteps: s.suggestions.nextSteps.map(fn),
          redFlags: s.suggestions.redFlags.map(fn),
        }
      : null,
  };
}

/** Fills in any missing English or French side of session content using the AI. */
export function useAutoTranslate() {
  const { s, update, ready } = useSession();
  const translate = useServerFn(translateContent);
  const busy = useRef(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!ready || busy.current || s.translateFailed) return;
    const need: Record<Lang, Set<string>> = { en: new Set(), fr: new Set() };
    eachBL(s, (b) => {
      const en = b.en.trim();
      const fr = b.fr.trim();
      if (en && !fr) need.fr.add(en);
      if (fr && !en) need.en.add(fr);
      return b;
    });
    const jobs = (["en", "fr"] as Lang[]).filter((l) => need[l].size > 0);
    if (!jobs.length) return;
    busy.current = true;
    setPending(true);
    (async () => {
      const maps: Record<Lang, Map<string, string>> = { en: new Map(), fr: new Map() };
      let failed = false;
      for (const target of jobs) {
        const items = [...need[target]].slice(0, 150);
        try {
          const res = await translate({ data: { items, target } });
          if (res.ok) res.items.forEach((t, i) => t && maps[target].set(items[i], t));
          else failed = true;
        } catch {
          failed = true;
        }
      }
      update((prev) => ({
        ...eachBL(prev, (b) => {
          const en = b.en.trim();
          const fr = b.fr.trim();
          if (en && !fr && maps.fr.has(en)) return { en: b.en, fr: maps.fr.get(en)! };
          if (fr && !en && maps.en.has(fr)) return { en: maps.en.get(fr)!, fr: b.fr };
          return b;
        }),
        translateFailed: failed,
      }));
      busy.current = false;
      setPending(false);
    })();
  }, [s, ready, translate, update]);

  return { pending, failed: s.translateFailed, retry: () => update({ translateFailed: false }) };
}
