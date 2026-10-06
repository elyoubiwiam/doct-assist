# Fix translations, translate custom fields, enrich specialty templates

## 1. Complete and correct translation (English and French)

Problem: when the language is switched mid-session, content already on screen stays in the original language (template fields, AI fields, AI suggestions, symptoms, list options). Some interface text is also hardcoded and never translated.

Fixes:
- Switching language re-renders every template field, unit and list option in the new language, instantly and without AI (each template field gets a stable identity so both versions are known).
- Everything else already on screen (AI fields, AI suggestions, symptoms, custom fields, list options) is translated by the AI when the language is switched, with a short "Translating..." indicator. Values already typed by the doctor (numbers, ticks, notes) are kept.
- Remove all remaining hardcoded text: the "fields / champs" count, the "AI" badge, the "Language" label, the "A, B, C" placeholder, units such as "weeks / SA", "bpm", "/min".
- Full proofreading pass of every sentence in both dictionaries: UK spelling, correct French medical terms (for example "pollakiurie", "Glasgow", "AVPU" wording), consistent tone, no em or en dashes, French typographic spacing before ":" "?" "!".
- The printed document follows the current language entirely, including dates.

## 2. Doctor-added fields are translated

- When a doctor adds a field (label and list options), it is stored with both an English and a French version: the AI translates it at creation.
- Fields saved into a doctor's template keep both versions, so the template loads correctly in either language.
- If translation fails, the field is kept as typed and marked "not translated", with a retry button.

## 3. More thorough specialty templates

Each of the 20 specialties is expanded to roughly 12 to 20 fields, grouped into sections:

- **Common to all**: allergies, current medication, past medical history, family history.
- **Social history (all specialties)**: smoking status and pack-years, alcohol intake (units per week), recreational drug use, occupation and exposures, living situation.
- **Vital signs** where relevant: temperature, heart rate, blood pressure, respiratory rate, oxygen saturation, weight, height, BMI.
- **Specialty-specific**, for example:
  - Respiratory: cough type and duration, sputum colour, haemoptysis, dyspnoea (MRC scale), wheeze, chest pain, night sweats, occupational exposure (asbestos, dust), inhaler use, peak flow, vaccination (influenza, pneumococcal, COVID-19).
  - Cardiology: chest pain character, exertional link, palpitations, syncope, orthopnoea, oedema, NYHA class, cardiovascular risk factors.
  - Gastroenterology: pain site, bowel habit, stool changes, dysphagia, reflux, weight loss, alcohol intake.
  - Similar depth for every other specialty.
- Templates remain fully editable and resettable as today.

## Technical details

- `src/lib/specialties.ts`: template fields get a stable `key` and bilingual `label`, `unit`, `options`, `section`. Session `Field` stores `{ en, fr }` for label, options and section; display picks the current language.
- New server function `translateContent` (same AI gateway setup as `generateIntake`) taking a batch of strings and the target language, returning translations in order. Used on language switch (AI fields, suggestions, symptoms) and on custom field creation. Results cached in the session so switching back and forth is instant.
- `generateIntake` returns fields and suggestions in both languages in one call, so most switches need no extra AI request.
- Saved templates in localStorage store bilingual fields under one key per specialty (existing per-language saved templates migrated once).
- All remaining strings moved into `src/lib/i18n.tsx`; full review of both dictionaries.
