// GAYA sync backend. Deploy: New deployment → Web app → Execute as: Me →
// Access: Anyone. Set Script Properties: SYNC_TOKEN (must equal js/config.js
// SYNC_TOKEN), SHEET_ID (target spreadsheet id).

const HEADERS = ['Timestamp', 'Date', 'Region', 'Level', 'Correct', 'Total', 'Stars', 'WrongKeys'];

function doPost(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    const payload = JSON.parse(e.postData.contents);
    const expected = props.getProperty('SYNC_TOKEN');
    if (!expected || payload.token !== expected) {
      return json_({ ok: false, error: 'bad token' });
    }
    const sheet = sessionsSheet_(props.getProperty('SHEET_ID'));
    const rows = (payload.events || []).map(function (ev) {
      return [
        new Date(),
        safeCell_(ev.date, 10),
        safeCell_(ev.region, 20),
        Number(ev.level) || 0,
        Number(ev.correct) || 0,
        Number(ev.total) || 0,
        Number(ev.stars) || 0,
        safeCell_((ev.wrongKeys || []).join(', '), 500),
      ];
    });
    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
    }
    return json_({ ok: true, saved: rows.length });
  } catch (err) {
    logError_(err);
    return json_({ ok: false, error: String(err) });
  }
}

function sessionsSheet_(sheetId) {
  const ss = SpreadsheetApp.openById(sheetId);
  let sheet = ss.getSheetByName('Sessions');
  if (!sheet) {
    sheet = ss.insertSheet('Sessions');
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  }
  return sheet;
}

function logError_(err) {
  try {
    const ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
    const sheet = ss.getSheetByName('Errors') || ss.insertSheet('Errors');
    sheet.appendRow([new Date(), String(err)]);
  } catch (ignored) {} // never mask the original failure
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Truncates and defuses formula injection (leading =, +, @) before setValues.
function safeCell_(value, maxLen) {
  const s = String(value == null ? '' : value).slice(0, maxLen);
  return /^[=+@]/.test(s) ? "'" + s : s;
}

// Run once manually after setting Script Properties: builds the parent summary tab.
function setupSummary() {
  const ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
  sessionsSheet_(ss.getId());
  let sheet = ss.getSheetByName('סיכום') || ss.insertSheet('סיכום');
  sheet.clear();
  sheet.getRange('D1:E10').setValues([
    ['נושא', 'הצלחה'],
    ['order', '=IFERROR(SUMIF(Sessions!C:C,D2,Sessions!E:E)/SUMIF(Sessions!C:C,D2,Sessions!F:F),"")'],
    ['column', '=IFERROR(SUMIF(Sessions!C:C,D3,Sessions!E:E)/SUMIF(Sessions!C:C,D3,Sessions!F:F),"")'],
    ['mult', '=IFERROR(SUMIF(Sessions!C:C,D4,Sessions!E:E)/SUMIF(Sessions!C:C,D4,Sessions!F:F),"")'],
    ['remainder', '=IFERROR(SUMIF(Sessions!C:C,D5,Sessions!E:E)/SUMIF(Sessions!C:C,D5,Sessions!F:F),"")'],
    ['numberline', '=IFERROR(SUMIF(Sessions!C:C,D6,Sessions!E:E)/SUMIF(Sessions!C:C,D6,Sessions!F:F),"")'],
    ['word', '=IFERROR(SUMIF(Sessions!C:C,D7,Sessions!E:E)/SUMIF(Sessions!C:C,D7,Sessions!F:F),"")'],
    ['perimeter', '=IFERROR(SUMIF(Sessions!C:C,D8,Sessions!E:E)/SUMIF(Sessions!C:C,D8,Sessions!F:F),"")'],
    ['shapes', '=IFERROR(SUMIF(Sessions!C:C,D9,Sessions!E:E)/SUMIF(Sessions!C:C,D9,Sessions!F:F),"")'],
    ['bars', '=IFERROR(SUMIF(Sessions!C:C,D10,Sessions!E:E)/SUMIF(Sessions!C:C,D10,Sessions!F:F),"")'],
  ]);
  sheet.getRange('A1:B6').setValues([
    ['סה"כ תרגולים', '=COUNTA(Sessions!A2:A)'],
    ['תרגולים ב-7 ימים', '=COUNTIF(Sessions!B2:B, ">="&TEXT(TODAY()-6,"yyyy-mm-dd"))'],
    ['כוכבים שנצברו', '=SUM(Sessions!G2:G)'],
    ['אחוז הצלחה כללי', '=IFERROR(ROUND(SUM(Sessions!E2:E)/SUM(Sessions!F2:F)*100,0)&"%","-")'],
    ['נושא חזק', '=IFERROR(INDEX(D2:D10,MATCH(MAX(E2:E10),E2:E10,0)),"-")'],
    ['נושא לחיזוק', '=IFERROR(INDEX(D2:D10,MATCH(MIN(E2:E10),E2:E10,0)),"-")'],
  ]);
  sheet.getRange('A1:A6').setFontWeight('bold');
  sheet.setColumnWidth(1, 180);
}
