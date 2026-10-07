import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  specialty: z.string().trim().min(1).max(100),
  symptoms: z.string().trim().min(2).max(2000),
  lang: z.enum(["en", "fr"]),
  existingFields: z.array(z.string().max(200)).max(80),
  /** history: history/risk/negatives fields; exam: vitals/examination fields; support: decision support only */
  part: z.enum(["history", "exam", "support"]).default("history"),
});

const PART_FOCUS = {
  history:
    "Only produce fields. Focus on history of the presenting complaint, relevant past history, medication, risk factors and pertinent negatives. Do not produce vital signs or examination fields. Return empty arrays for followUpQuestions, possibleAssessments, nextSteps and redFlags.",
  exam:
    "Only produce fields. Focus on vital signs, measurements, physical examination findings and bedside tests or scores. Do not produce history or risk factor fields. Return empty arrays for followUpQuestions, possibleAssessments, nextSteps and redFlags.",
  support:
    "Return an empty fields array. Only produce followUpQuestions, possibleAssessments, nextSteps and redFlags.",
} as const;

export type GeneratedField = {
  label: string;
  type: "checkbox" | "text" | "number" | "select" | "textarea";
  unit: string | null;
  options: string[] | null;
  section: string;
};

export type GeneratedIntake = {
  fields: GeneratedField[];
  followUpQuestions: string[];
  possibleAssessments: string[];
  nextSteps: string[];
  redFlags: string[];
};

export const generateIntake = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true; result: GeneratedIntake } | { ok: false; error: string }> => {
    const apiKey = process.env['LOVABLE_API_KEY'];
    if (!apiKey) return { ok: false, error: "config" };

    const { streamText, Output, NoObjectGeneratedError } = await import("ai");
    const { createGatewayProvider } = await import("./server/gateway.server");
    const provider = createGatewayProvider(apiKey);

    const schema = z.object({
      fields: z.array(
        z.object({
          label: z.string(),
          type: z.enum(["checkbox", "text", "number", "select", "textarea"]),
          unit: z.string().nullable(),
          options: z.array(z.string()).nullable(),
          section: z.string(),
        }),
      ),
      followUpQuestions: z.array(z.string()),
      possibleAssessments: z.array(z.string()),
      nextSteps: z.array(z.string()),
      redFlags: z.array(z.string()),
    });

    const language =
      data.lang === "fr"
        ? "French (France), using correct standard French medical terminology"
        : "British English (UK spelling, e.g. paediatric, haemoglobin, oesophagus)";

    const instructions = `You assist qualified clinicians with structured patient intake in an outpatient setting.
Write every string in ${language}. Never use em dashes or en dashes; use commas, colons or full stops instead.
Be clinically accurate and conservative. Do not invent facts about the patient. Output is decision support for the clinician to review, never patient-facing advice.
Produce:
- fields: all clinically relevant additional data-entry fields for the full symptom list. Cover relevant history, vital signs, examination, risk factors and pertinent negatives. Existing fields remain on the form, so do not duplicate them. Use "checkbox" for yes/no findings, "number" with a unit for measurements, "select" with clinically appropriate options, "text" for short answers, "textarea" for descriptions. Group fields with short section names. Set unit and options to null when not applicable.
- followUpQuestions: the clinically relevant questions needed to clarify the symptoms and risks.
- possibleAssessments: relevant differential considerations, phrased as possibilities to consider.
- nextSteps: relevant investigations or management steps to consider.
- redFlags: relevant warning signs that warrant urgent escalation.
Prioritise coverage and clinical relevance, not a fixed item count. Do not omit necessary fields or suggestions to shorten the response. Keep labels, section names and suggestions concise, avoid repetition and explanatory prose, and output only the requested structured content.
This request covers one part of the work, other parts run in parallel: ${PART_FOCUS[data.part]}`;

    const prompt = `Specialty: ${data.specialty}
Presenting symptoms: ${data.symptoms}
Existing fields already on the form: ${data.existingFields.join("; ") || "none"}`;

    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        instructions,
        prompt,
        output: Output.object({ schema }),
        providerOptions: {
          openai: {
            store: false,
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            include: ["reasoning.encrypted_content"],
            strictJsonSchema: true,
          },
        },
      });
      const out = (await result.output) as GeneratedIntake;
      return { ok: true, result: clean(out) };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error) && error.text) {
        try {
          return { ok: true, result: clean(schema.parse(JSON.parse(error.text))) };
        } catch {
          /* fall through */
        }
      }
      const status = (error as { statusCode?: number })?.statusCode;
      console.error("generateIntake failed", status, error);
      if (status === 402) return { ok: false, error: "credits" };
      if (status === 429) return { ok: false, error: "rate" };
      return { ok: false, error: "generic" };
    }
  });

const noDash = (s: string) => s.replace(/\s*[\u2014\u2013]\s*/g, ", ");

function clean(o: GeneratedIntake): GeneratedIntake {
  return {
    fields: (o.fields ?? []).map((f) => ({
      ...f,
      label: noDash(f.label),
      section: noDash(f.section),
      unit: f.unit ? noDash(f.unit) : null,
      options: f.options ? f.options.map(noDash) : null,
    })),
    followUpQuestions: (o.followUpQuestions ?? []).map(noDash),
    possibleAssessments: (o.possibleAssessments ?? []).map(noDash),
    nextSteps: (o.nextSteps ?? []).map(noDash),
    redFlags: (o.redFlags ?? []).map(noDash),
  };
}

const translateInput = z.object({
  items: z.array(z.string().max(600)).min(1).max(150),
  target: z.enum(["en", "fr"]),
});

export const translateContent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => translateInput.parse(input))
  .handler(async ({ data }): Promise<{ ok: true; items: string[] } | { ok: false; error: string }> => {
    const apiKey = process.env['LOVABLE_API_KEY'];
    if (!apiKey) return { ok: false, error: "config" };
    const { streamText, Output, NoObjectGeneratedError } = await import("ai");
    const { createGatewayProvider } = await import("./server/gateway.server");
    const provider = createGatewayProvider(apiKey);
    const target =
      data.target === "fr"
        ? "French (France), using the standard terminology a French physician would write"
        : "British English (UK spelling and UK clinical terminology, e.g. paediatric, oedema, haemoptysis)";
    const instructions = `You are a professional medical translator. Translate each input item into ${target}.
Rules: keep the same number of items in the same order; translate faithfully, without adding, removing or explaining anything; keep numbers, units, abbreviations and scores (e.g. NYHA, GCS, HbA1c, mmHg) unchanged unless a standard local equivalent exists; keep question marks for questions; never use em dashes or en dashes. If an item is already in the target language, correct it only if it contains an error, otherwise return it unchanged.${data.target === "fr" ? " Apply French typography: a space before : ? ! and ;." : ""}`;
    const schema = z.object({ items: z.array(z.string()) });
    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        instructions,
        prompt: JSON.stringify({ items: data.items }),
        output: Output.object({ schema }),
        providerOptions: {
          openai: { store: false, forceReasoning: true, reasoningEffort: "low", include: ["reasoning.encrypted_content"], strictJsonSchema: true },
        },
      });
      let out: { items: string[] };
      try {
        out = (await result.output) as { items: string[] };
      } catch (e) {
        if (NoObjectGeneratedError.isInstance(e) && e.text) out = JSON.parse(e.text);
        else throw e;
      }
      if (!Array.isArray(out.items) || out.items.length !== data.items.length) return { ok: false, error: "generic" };
      return { ok: true, items: out.items.map(noDash) };
    } catch (error) {
      const status = (error as { statusCode?: number })?.statusCode;
      console.error("translateContent failed", status, error);
      if (status === 402) return { ok: false, error: "credits" };
      if (status === 429) return { ok: false, error: "rate" };
      return { ok: false, error: "generic" };
    }
  });
