# MediAssist AI (DoctAssist)

**Structured clinical intake for doctors, with AI-assisted decision support, in English and French.**

MediAssist turns a few typed symptoms into a structured, specialty-specific intake form. It then produces a clean patient document the doctor can download or print as a PDF.

**Live app:** https://doct-assist.lovable.app

> **For qualified healthcare professionals only.** AI suggestions are decision support for the clinician to review. They are not a diagnosis and are not intended for patients.

---

## How it works

Each step has its own page:

1. **Accept the data protection terms.** The clinician confirms they are a healthcare professional and accepts the confidentiality terms.
2. **Select a specialty.** Choose from 20 outpatient specialties, including General Practice, Internal Medicine, Paediatrics, Cardiology, Respiratory, Gastroenterology, Neurology, Dermatology, ENT, Ophthalmology, OB/GYN, Urology, Endocrinology, Rheumatology, Orthopaedics, Psychiatry, Infectious Disease, Geriatrics, Emergency and Sports Medicine. Each specialty loads a reusable intake template.
3. **Enter symptoms.** Type one or more symptoms, for example *"fever for three days, productive cough, breathlessness on exertion"*.
4. **Fill in the generated form.** AI adds suggested fields for those symptoms (checkboxes, measurements such as temperature, and text fields) on top of the specialty template.
5. **Create the patient document.** A branded clinical intake record, ready to download or print as a PDF.

## Key features

- **Specialty templates that clinicians can edit:** save new fields to your own template, or restore the default at any time.
- **AI-suggested fields** tailored to the symptoms entered. Suggestions keep loading while you start filling in the form.
- **Decision support, clearly labelled:**
  - Suggested follow-up questions
  - Possible assessments to consider
  - A checkbox for each item, plus *Select all*, so the clinician chooses what goes into the document
- **Bilingual:** an English and French toggle at the top of the screen, and the app remembers the last language used.
- **Printable patient document** with the AI-generated sections marked as decision support.

## Data protection

- Intended for qualified healthcare professionals only.
- Users are asked to enter only the minimum data needed and to avoid direct identifiers such as full names, addresses or NHS numbers.
- Symptom descriptions are sent to an AI service to generate suggestions, so no identifying details should be entered in the symptom field.
- Downloaded documents are marked confidential.

## Tech stack

- React, TypeScript, TanStack Start and Router, Vite
- Tailwind CSS with shadcn/ui components
- AI form generation through server functions
- Built and hosted with [Lovable](https://lovable.dev)

---

Built by **Wiam El Youbi**, [wiam-elyoubi.com](https://wiam-elyoubi.com), co-built with **Dr Saad El Alj**.
