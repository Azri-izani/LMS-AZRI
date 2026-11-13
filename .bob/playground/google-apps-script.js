/**
 * MyRef — Google Apps Script Backend
 * =====================================
 * Fail ini perlu dideploy sebagai Google Apps Script Web App.
 *
 * LANGKAH SETUP:
 * 1. Buka https://script.google.com → Projek Baharu
 * 2. Padam semua kod sedia ada, tampal kesemua kod di bawah
 * 3. Pastikan FOLDER_ID di bawah adalah betul
 * 4. Klik "Deploy" → "New deployment"
 *    - Type: Web App
 *    - Execute as: Me (akaun Google anda)
 *    - Who has access: Anyone  ← PENTING
 * 5. Klik "Deploy", benarkan permissions yang diminta
 * 6. Salin "Web app URL" yang dipaparkan → tampal ke index.html
 *
 * PENTING — CORS:
 * Google Apps Script TIDAK support CORS untuk request dari file:// (komputer tempatan).
 * Untuk ia berfungsi, index.html MESTI dihost secara online (https://).
 * Cadangan percuma: netlify.com/drop — drag & drop index.html, dapat URL dalam masa 30 saat.
 */

// ─── KONFIGURASI ─────────────────────────────────────────────────────────────
const FOLDER_ID = '14jmno9XpqsadsjvLa2pqIi5EkJww55AE';
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Handle POST — terima upload fail dari index.html, simpan ke Google Drive.
 * Mengembalikan JSON { success, url, id, name } atau { success: false, error }.
 */
function doPost(e) {
  try {
    const params   = JSON.parse(e.postData.contents);
    const fileName = params.name;
    const mimeType = params.mime;
    const base64   = params.data;

    // Buang prefix "data:mime/type;base64," sebelum decode
    const base64Clean = base64.includes(',') ? base64.split(',')[1] : base64;
    const decoded     = Utilities.base64Decode(base64Clean);
    const blob        = Utilities.newBlob(decoded, mimeType, fileName);

    // Simpan ke folder Drive
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const file   = folder.createFile(blob);

    // Benarkan sesiapa yang ada link untuk lihat
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId  = file.getId();
    const viewUrl = 'https://drive.google.com/file/d/' + fileId + '/view';

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, id: fileId, url: viewUrl, name: fileName }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET — semak Apps Script aktif.
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'MyRef Apps Script aktif.', timestamp: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
}
