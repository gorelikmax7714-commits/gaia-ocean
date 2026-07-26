// One-time setup: run setupAll() from the editor after `clasp push`.
// Creates the progress spreadsheet (if missing), stores Script Properties,
// and builds the parent summary tab. Idempotent — safe to re-run.

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
  setupSummary();
  Logger.log('✅ Sheet: %s', ss.getUrl());
  return ss.getUrl();
}
