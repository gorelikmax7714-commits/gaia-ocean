# GAYA sync backend — deployment

1. Create a Google Sheet named "GAYA — התקדמות". Copy its ID from the URL.
2. script.google.com → New project → paste Code.gs.
3. Project Settings → Script Properties:
   - `SHEET_ID` = the sheet id
   - `SYNC_TOKEN` = the value of SYNC_TOKEN in js/config.js
4. Run `setupSummary` once (authorize when prompted).
5. Deploy → New deployment → Web app → Execute as **Me**, access **Anyone**.
6. Copy the web app URL into `SYNC_URL` in js/config.js, commit, redeploy the PWA.
7. Test: `curl -L -X POST -H "Content-Type: text/plain" -d "{\"token\":\"<SYNC_TOKEN>\",\"events\":[{\"date\":\"2026-07-25\",\"region\":\"times\",\"level\":0,\"correct\":9,\"total\":10,\"stars\":2,\"wrongKeys\":[]}]}" "<SYNC_URL>"`
   Expected: `{"ok":true,"saved":1}` and a new row in Sessions.
