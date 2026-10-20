# Supabase setup

Local configuration lives in `.env.local`. All `.env`, `.env.*`, `*.env` and `*.env.*` files are ignored by Git, including nested examples. Do not commit any environment file.

1. Run `supabase/setup.sql` in your Supabase project's SQL Editor. It creates the public portfolio content table and the public project-images bucket. Writes are limited to accounts with the server-managed portfolio_admin flag.
2. In Authentication > Users, create your own email/password user. Set the password directly in Supabase; do not put it in source code or share it in chat.
3. Run the commented admin-grant query at the bottom of setup.sql separately, replacing YOUR_EMAIL_HERE with that account's email. Sign in again afterward so the session contains the updated permission.
4. Restart the development server. Open the Studio and sign in using that email/password. Choose an image and wait for Saved to cloud. Edits automatically save to Supabase after a short pause and become live. Save now retries a failed save. For a new project, finish its form with Save & Add to Portfolio.
5. For deployment, add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the hosting provider's environment settings and rebuild. Use the same values as your ignored local file. Never use a service-role or secret key in Vite variables.

A publishable key is intentionally included in the browser build; the database and storage policies protect write access. No public signup interface is provided. The old browser-only admin passwords no longer work.

Replacing/removing an image does not delete the original storage object, so existing published links remain valid until the next publication. Unused images may be removed manually in Supabase after publishing.

Cloud content is authoritative on startup. Conditional writes reject stale tab/device saves rather than overwriting newer work. A differing browser draft is offered for explicit recovery, never automatically substituted for cloud content. The legacy browser draft is preserved; pending edits have a separate backup. Use the same browser and exact site address where you edited to recover an old draft. Loading failures pause editing; failed saves keep a visible error and can be retried. Export backup remains available.

Run persistence regression checks with node --test tests/portfolioPersistence.test.js.
