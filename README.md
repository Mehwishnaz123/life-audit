# Life Audit website

## Start it on your computer
1. Double-click **1-START-HERE.bat** (only the first time).
   It copies the website to `C:\Users\<you>\Projects\life-audit`, installs what it needs and opens the site.
2. Every time after that, double-click **start-website.bat** inside `Projects\life-audit`.
3. The site opens at http://localhost:3000. Close the black window to stop it.

## What works before the database is connected
The public website (Home, Features, Pricing, FAQ, About, Privacy, Terms) works straight away with built-in text.
Log in, the dashboard and the admin panel need Supabase.

## Connect the database (Supabase)
1. Create a free project at https://supabase.com.
2. In the project, open **SQL Editor**, paste all of `supabase/schema.sql`, click **Run**.
3. Double-click **connect-database.bat** in `Projects\life-audit` and paste the **Project URL** and **anon public** key from **Project Settings → API**.
4. Restart the website (close the window, double-click `start-website.bat`).
5. Sign up on your website, then run the last line of `schema.sql` with your email to become the admin.
6. The admin panel is at http://localhost:3000/admin.

## Where things are
- `app/(site)` — public pages
- `app/app` — the signed-in dashboard (not indexed by search engines)
- `app/admin` — website admin (not indexed)
- `lib/actions` — saving data (login, tasks, admin)
- `supabase/schema.sql` — database tables and security rules
