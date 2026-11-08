// GAYA sync backend + daily parent e-mail.
// Setup (once): paste Code.gs + Setup.gs, run setupAll(), approve permissions,
// then Deploy → New deployment → Web app → Execute as: Me → Access: Anyone.

const HEADERS = ['Timestamp', 'Date', 'Region', 'Level', 'Correct', 'Total', 'Stars', 'WrongKeys', 'Seconds'];
const USAGE_HEADERS = ['Timestamp', 'Date', 'Seconds'];
const TZ = 'Asia/Jerusalem';
const SUMMARY_HOUR = 20; // daily e-mail at 20:00 Israel time

const TOPIC_NAMES = {
  order: 'סדר פעולות', column: 'חיבור וחיסור במאונך', mult: 'כפל ומשמעות הכפל',
  remainder: 'חילוק עם שארית', numberline: 'ישר המספרים', word: 'בעיות מילוליות',
  perimeter: 'היקף', shapes: 'זוויות ומקבילות', bars: 'דיאגרמת עמודות', review: 'חזרה על טעויות',
};
const LEVEL_NAMES = ['צעד ראשון', 'מתקדמת', 'אלופה'];

function doPost(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    const payload = JSON.parse(e.postData.contents);
    const expected = props.getProperty('SYNC_TOKEN');
    if (!expected || payload.token !== expected) {
      return json_({ ok: false, error: 'bad token' });
    }
    const ss = SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
    const events = payload.events || [];
    const sessions = events.filter(function (ev) { return ev.type !== 'usage'; }).map(function (ev) {
      return [
        new Date(),
        safeCell_(ev.date, 10),
        safeCell_(ev.region, 20),
        Number(ev.level) || 0,
        Number(ev.correct) || 0,
        Number(ev.total) || 0,
        Number(ev.stars) || 0,
        safeCell_((ev.wrongKeys || []).join(', '), 500),
        Math.min(Number(ev.seconds) || 0, 6 * 3600),
      ];
    });
    const usage = events.filter(function (ev) { return ev.type === 'usage'; }).map(function (ev) {
      return [new Date(), safeCell_(ev.date, 10), Math.min(Number(ev.seconds) || 0, 6 * 3600)];
    });
    if (sessions.length) {
      const sh = sheet_(ss, 'Sessions', HEADERS);
      sh.getRange(sh.getLastRow() + 1, 1, sessions.length, HEADERS.length).setValues(sessions);
    }
    if (usage.length) {
      const sh = sheet_(ss, 'Usage', USAGE_HEADERS);
      sh.getRange(sh.getLastRow() + 1, 1, usage.length, USAGE_HEADERS.length).setValues(usage);
    }
    return json_({ ok: true, saved: sessions.length + usage.length });
  } catch (err) {
    logError_(err);
    return json_({ ok: false, error: String(err) });
  }
}

// Creates the tab if missing and keeps its header row complete (adds new columns).
function sheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  const current = sh.getRange(1, 1, 1, headers.length).getValues()[0];
  if (current.join('|') !== headers.join('|')) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  }
  return sh;
}

// ---------- daily e-mail ----------

function rowsForDate_(ss, name, dateISO) {
  const sh = ss.getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues()
    .filter(function (r) { return dateKey_(r[1]) === dateISO; });
}

function dateKey_(v) {
  return v instanceof Date ? Utilities.formatDate(v, TZ, 'yyyy-MM-dd') : String(v);
}

function dailySummary() {
  const props = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
  const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  const to = props.getProperty('NOTIFY_EMAIL') || Session.getEffectiveUser().getEmail();

  const usageSec = rowsForDate_(ss, 'Usage', today).reduce(function (s, r) { return s + (Number(r[2]) || 0); }, 0);
  const sessions = rowsForDate_(ss, 'Sessions', today);
  const sessionSec = sessions.reduce(function (s, r) { return s + (Number(r[8]) || 0); }, 0);
  const minutes = Math.round(Math.max(usageSec, sessionSec) / 60);

  if (sessions.length === 0 && minutes === 0) {
    MailApp.sendEmail({
      to: to,
      subject: 'GAYA — גאיה לא תרגלה חשבון היום',
      htmlBody: '<div dir="rtl" style="font-family:Arial">היום לא היה תרגול באפליקציה. אולי מחר? 🦄</div>',
    });
    return;
  }

  let correct = 0;
  let total = 0;
  const rows = sessions.map(function (r) {
    correct += Number(r[4]) || 0;
    total += Number(r[5]) || 0;
    const topic = TOPIC_NAMES[r[2]] || r[2];
    const level = r[2] === 'review' ? '' : ' · ' + (LEVEL_NAMES[Number(r[3])] || '');
    const time = Utilities.formatDate(new Date(r[0]), TZ, 'HH:mm');
    const mins = r[8] ? Math.max(1, Math.round(Number(r[8]) / 60)) + ' דק׳' : '';
    return '<tr><td>' + time + '</td><td>' + topic + level + '</td><td>' + r[4] + '/' + r[5] + '</td><td>'
      + '★'.repeat(Number(r[6]) || 0) + '</td><td>' + mins + '</td></tr>';
  }).join('');
  const pct = total ? Math.round((correct / total) * 100) : 0;

  const html = '<div dir="rtl" style="font-family:Arial;font-size:15px;color:#1d2b4f">'
    + '<h2 style="margin:0 0 8px">סיכום היום של גאיה 🦄</h2>'
    + '<p style="font-size:18px">⏱️ זמן תרגול: <b>' + minutes + ' דקות</b><br>'
    + '📚 שלבים שהושלמו: <b>' + sessions.length + '</b><br>'
    + '✅ נכון מהניסיון הראשון: <b>' + correct + '/' + total + '</b> (' + pct + '%)</p>'
    + (rows ? '<table cellpadding="6" style="border-collapse:collapse;border:1px solid #ddd">'
      + '<tr style="background:#eef5fc"><th>שעה</th><th>נושא</th><th>נכון</th><th>כוכבים</th><th>זמן</th></tr>'
      + rows + '</table>' : '')
    + '<p style="color:#5b6b8c;font-size:13px">"נכון" = פתרה לבד בלי לפתוח את הדרך. השאר נלמדו עם הפתרון המודרך ויחזרו בחזרה על טעויות.</p>'
    + '</div>';

  MailApp.sendEmail({
    to: to,
    subject: 'GAYA — גאיה תרגלה היום ' + minutes + ' דקות',
    htmlBody: html,
  });
}

function setupDailyTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === 'dailySummary'; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('dailySummary').timeBased().atHour(SUMMARY_HOUR).everyDays(1).inTimezone(TZ).create();
}

// ---------- helpers ----------

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

// Parent summary tab inside the spreadsheet.
function setupSummary() {
  const ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
  sheet_(ss, 'Sessions', HEADERS);
  sheet_(ss, 'Usage', USAGE_HEADERS);
  const sheet = ss.getSheetByName('סיכום') || ss.insertSheet('סיכום');
  sheet.clear();
  const topics = Object.keys(TOPIC_NAMES).filter(function (k) { return k !== 'review'; });
  sheet.getRange(1, 4, topics.length + 1, 2).setValues([['נושא', 'הצלחה']].concat(topics.map(function (t, i) {
    const r = i + 2;
    return [t, '=IFERROR(SUMIF(Sessions!C:C,D' + r + ',Sessions!E:E)/SUMIF(Sessions!C:C,D' + r + ',Sessions!F:F),"")'];
  })));
  const last = topics.length + 1;
  sheet.getRange('A1:B7').setValues([
    ['סה"כ שלבים', '=COUNTA(Sessions!A2:A)'],
    ['דקות תרגול היום', '=ROUND(SUMIF(Usage!B:B,TEXT(TODAY(),"yyyy-mm-dd"),Usage!C:C)/60,0)'],
    ['דקות ב-7 ימים', '=ROUND(SUMIF(Usage!B:B,">="&TEXT(TODAY()-6,"yyyy-mm-dd"),Usage!C:C)/60,0)'],
    ['כוכבים שנצברו', '=SUM(Sessions!G2:G)'],
    ['אחוז הצלחה כללי', '=IFERROR(ROUND(SUM(Sessions!E2:E)/SUM(Sessions!F2:F)*100,0)&"%","-")'],
    ['נושא חזק', '=IFERROR(INDEX(D2:D' + last + ',MATCH(MAX(E2:E' + last + '),E2:E' + last + ',0)),"-")'],
    ['נושא לחיזוק', '=IFERROR(INDEX(D2:D' + last + ',MATCH(MIN(E2:E' + last + '),E2:E' + last + ',0)),"-")'],
  ]);
  sheet.getRange('A1:A7').setFontWeight('bold');
  sheet.setColumnWidth(1, 180);
}
