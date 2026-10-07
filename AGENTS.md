<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All UI copy lives in `src/lib/i18n.tsx` (en + fr dictionaries); never hardcode user-facing strings, so both languages stay in sync.
- Patient data stays in browser sessionStorage (`src/lib/session.tsx`); never persist it server-side, because of medical data sensitivity.
- All session and template text is stored bilingually ({ en, fr }); missing sides are filled by the `translateContent` server function via `useAutoTranslate`, so content follows the language toggle. Clinician-edited templates are saved per specialty in localStorage (`src/lib/specialties.ts`).
- AI intake generation runs only in the `generateIntake` server function; the browser never calls the AI gateway directly.
- Intake generation uses the model's lowest supported reasoning effort and concise, coverage-led output without fixed item counts or post-generation truncation, so latency optimisation does not discard clinical content.
- Intake generation is split into parallel parts (history, exam, support) that stream into the form, so the clinician starts filling in immediately; why: cuts waiting without dropping coverage.
- Alias @vercel/oidc to src/lib/server/vercel-oidc-stub.ts in vite.config.ts; why: the real package uses createRequire(node:fs), which crashes the published Worker on every request.
