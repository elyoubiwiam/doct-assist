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
- Clinician-edited specialty templates are saved per specialty and language in localStorage (`src/lib/specialties.ts`).
- AI intake generation runs only in the `generateIntake` server function; the browser never calls the AI gateway directly.
