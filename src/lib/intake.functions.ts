import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  specialty: z.string().trim().min(1).max(100),
  symptoms: z.string().trim().min(2).max(2000),
  lang: z.enum(["en", "fr"]),
  existingFields: z.array(z.string().max(200)).max(80),
});

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
- fields: 6 to 14 concise data-entry fields that help document the presented symptoms (e.g. "Temperature" number with unit "°C", "Onset" select, "Associated cough" checkbox). Use "checkbox" for yes/no findings, "number" with a unit for measurements, "select" with 3 to 6 options for categorical answers, "text" for short answers, "textarea" for descriptions. Group them with a short "section" name (e.g. "Vital signs", "History of presenting complaint", "Examination"). Do not repeat any of the existing fields provided. Set unit and options to null when not applicable.
- followUpQuestions: 4 to 8 questions the clinician may ask the patient.
- possibleAssessments: 3 to 6 differential considerations, phrased as possibilities to consider.
- nextSteps: 3 to 6 possible investigations or management steps to consider.
- redFlags: 2 to 5 warning signs that would warrant urgent escalation.
Keep each item under 160 characters.`;

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
          return { ok: true, result: clean(JSON.parse(error.text) as GeneratedIntake) };
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

const noDash = (s: string) => s.replace(/\s*[\u2014\u2013]\s*/g, ", ").slice(0, 240);

function clean(o: GeneratedIntake): GeneratedIntake {
  return {
    fields: (o.fields ?? []).slice(0, 20).map((f) => ({
      ...f,
      label: noDash(f.label),
      section: noDash(f.section),
      options: f.options ? f.options.slice(0, 8).map(noDash) : null,
    })),
    followUpQuestions: (o.followUpQuestions ?? []).slice(0, 10).map(noDash),
    possibleAssessments: (o.possibleAssessments ?? []).slice(0, 8).map(noDash),
    nextSteps: (o.nextSteps ?? []).slice(0, 8).map(noDash),
    redFlags: (o.redFlags ?? []).slice(0, 6).map(noDash),
  };
}
