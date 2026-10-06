import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { BL, Field } from "./specialties";

export type Suggestions = {
  followUpQuestions: BL[];
  possibleAssessments: BL[];
  nextSteps: BL[];
  redFlags: BL[];
};

export type Session = {
  accepted: boolean;
  specialty: string | null;
  symptoms: BL[];
  fields: Field[];
  /** checkbox: boolean; select: option index as string; others: typed text */
  values: Record<string, string | boolean>;
  /** sex is stored as an option index so it follows the language */
  patient: { ref: string; age: string; sex: string; date: string; clinician: string };
  notes: string;
  suggestions: Suggestions | null;
  included: Record<keyof Suggestions, boolean>;
  translateFailed: boolean;
};

const empty = (): Session => ({
  accepted: false,
  specialty: null,
  symptoms: [],
  fields: [],
  values: {},
  patient: { ref: "", age: "", sex: "", date: "", clinician: "" },
  notes: "",
  suggestions: null,
  included: { followUpQuestions: true, possibleAssessments: true, nextSteps: true, redFlags: true },
  translateFailed: false,
});

const KEY = "anamnesis.session.v2";
type Updater = (p: Partial<Session> | ((s: Session) => Partial<Session>)) => void;
const Ctx = createContext<{ s: Session; update: Updater; resetPatient: () => void; ready: boolean }>({
  s: empty(),
  update: () => {},
  resetPatient: () => {},
  ready: false,
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Session>(empty);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      sessionStorage.removeItem("anamnesis.session");
      const raw = sessionStorage.getItem(KEY);
      if (raw) setS({ ...empty(), ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) sessionStorage.setItem(KEY, JSON.stringify(s));
  }, [s, ready]);
  const update: Updater = (p) => setS((prev) => ({ ...prev, ...(typeof p === "function" ? p(prev) : p) }));
  const resetPatient = () =>
    setS((prev) => ({
      ...empty(),
      accepted: prev.accepted,
      specialty: prev.specialty,
      fields: prev.fields.filter((f) => f.source !== "ai"),
      patient: { ...empty().patient, clinician: prev.patient.clinician },
    }));
  return <Ctx.Provider value={{ s, update, resetPatient, ready }}>{children}</Ctx.Provider>;
}

export const useSession = () => useContext(Ctx);
