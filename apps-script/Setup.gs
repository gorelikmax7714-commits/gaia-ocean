// One-time setup: run setupAll() from the editor (approve the permissions).
// Creates the progress spreadsheet (if missing), stores Script Properties,
// builds the summary tab and schedules the daily e-mail. Safe to re-run.

const SETUP_SHEET_NAME = 'GAYA — התקדמות';
const SETUP_SYNC_TOKEN = 'gaya-ocean-2026'; // must equal js/config.js SYNC_TOKEN

function setupAll() {
  const props = PropertiesService.getScriptProperties();
  let ss = null;
  const existingId = props.getProperty('SHEET_ID');
  if (existingId) {
    try { ss = SpreadsheetApp.openById(existingId); } catch (e) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create(SETUP_SHEET_NAME);
    props.setProperty('SHEET_ID', ss.getId());
  }
  props.setProperty('SYNC_TOKEN', SETUP_SYNC_TOKEN);
  if (!props.getProperty('NOTIFY_EMAIL')) {
    props.setProperty('NOTIFY_EMAIL', Session.getEffectiveUser().getEmail());
  }
  setupSummary();
  setupDailyTrigger();
  Logger.log('✅ Sheet: %s', ss.getUrl());
  Logger.log('✅ Daily e-mail at %s:00 to %s', SUMMARY_HOUR, props.getProperty('NOTIFY_EMAIL'));
  return ss.getUrl();
}

// Run this to get today's e-mail right now (for testing).
function sendSummaryNow() {
  dailySummary();
}
