# GAYA backend — Google Sheet + daily e-mail

1. https://script.google.com → **New project**. Delete the sample code and paste
   `Code.gs` followed by `Setup.gs` (or the combined `GAYA-backend.gs`).
2. Select `setupAll` in the toolbar → **Run** → approve the permissions
   (Sheets, Gmail send, triggers). It creates the sheet "GAYA — התקדמות",
   the summary tab, and a daily e-mail at 20:00 (Israel time).
3. **Deploy → New deployment → Web app** — Execute as **Me**, access **Anyone** → Deploy.
4. Copy the web-app URL into `SYNC_URL` in `js/config.js`, bump the cache in `sw.js`, push.
5. Test the e-mail any time: run `sendSummaryNow`.

The app sends two kinds of events: `session` (one finished level, with seconds)
and `usage` (active minutes — counted only while the app is open and touched).
