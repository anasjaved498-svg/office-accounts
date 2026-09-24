# Office TikTok Command Center — working Vercel version

This version is intentionally a **small office-style website**, not a flashy dashboard.

## Main workflow

`Device → TikTok Account → Team Member`

Clicking a Device, Account, or Team Member opens a separate workspace page. The main **All Workflow** page shows the complete connection.

Device #1 is seeded with a **blue** workflow line. Team members have their own editable line color; the manager connection uses that color.

## Editing and syncing

Edit a device/account/team member once. The app reloads the records from Supabase after save, so the updated value appears on the dashboard, workflow, device page, account page and team-member page.

You can also add/remove:

- Mobile devices
- TikTok accounts
- Team members
- Unlimited custom fields on all three record types

## Why your previous npm command failed

Your command was running inside:

`C:\Users\Dell\Downloads\tiktok-command-center\tiktok-command-center`

and that folder did not contain `package.json`.

This version includes `package.json` at the project root and does **not require npm install**.

### Local test

1. Extract the ZIP.
2. Open a terminal in the folder that contains `package.json` and `server.cjs`.
3. Run:

```bash
npm run dev
```

4. Open:

`http://localhost:5173`

You can also run `npm start`.

## Supabase

1. Run `supabase.sql` in Supabase SQL Editor.
2. Go to Supabase → Authentication → Users and create the office email/password user.
3. Open `config.js` and paste:

```js
export const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR_ANON_OR_PUBLISHABLE_KEY';
```

Do not put a service-role key in the browser.

When credentials are missing, the app opens in demo mode so you can test the pages and workflow immediately.

## Vercel

Upload/push the project root (the folder containing `index.html`, `app.js`, `styles.css`, `package.json`, and `config.js`) to GitHub and import that repository into Vercel.

No build command is needed. The site is static and Vercel can serve `index.html` directly.

For production, you can also put the values in Vercel Environment Variables, but this version is already prepared for `config.js` as requested.


## Local test (Windows)

1. Extract this ZIP once. Open the folder that contains `package.json`.
2. In that exact folder, click the address bar, type `cmd`, and press Enter.
3. Run `npm run dev`. **Do not run `npm install`; there are no npm packages required for the local server.**
4. Open `http://localhost:5173` in Chrome.
5. The website first runs in Demo Mode when `config.js` still has placeholders. After you enter real Supabase credentials, refresh the page.

You can also double-click `start-local.bat`. Keep that window open while testing.

### Important folder check

Your CMD path should look like:

`C:\Users\Dell\Downloads\tiktok-command-center-final`

and `dir` should show `package.json`. If the path ends with `tiktok-command-center-final\tiktok-command-center-final`, you are one folder too deep.

### Supabase setup

Run `supabase.sql` once in Supabase SQL Editor. Create one office user under Authentication → Users. Put your Project URL and browser-safe anon/publishable key in `config.js`. Never put the `service_role` key in the browser file.

### If Supabase cannot initialize

The website will now show the actual error inside the page instead of a blank white screen. This also means the local UI can be tested in Demo Mode before the database is connected.
