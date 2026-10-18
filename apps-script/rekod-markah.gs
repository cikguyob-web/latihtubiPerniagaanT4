/* ============================================================
   REKOD MARKAH · Bank Soalan Perniagaan Tingkatan 4
   Terima keputusan murid daripada index.html dan simpan
   satu baris bagi setiap cubaan dalam Google Sheet.

   PEMASANGAN (sekali sahaja):
   1. Cipta Google Sheet baharu (contoh: "Rekod Perniagaan T4").
   2. Extensions → Apps Script. Tampal fail ini, Save.
   3. Deploy → New deployment → Select type: Web app
        Execute as     : Me
        Who has access : Anyone
      Tekan Deploy, benarkan akses, salin "Web app URL".
   4. Beri URL itu kepada Claude (untuk ENDPOINT_CIKGU dalam index.html).
   5. Dalam Sheet: File → Share → Publish to web →
      pilih helaian pertama + "Comma-separated values (.csv)" → Publish.
      Beri pautan itu kepada Claude (untuk URL_CSV dalam dashboard.html).
   ============================================================ */

// Nama lajur — dibaca oleh dashboard.html dan laporan-telegram.gs.
const TAJUK = ["Tarikh", "Sesi", "Nama", "Kelas", "Negeri", "Set", "Mod",
               "Cubaan Ke", "Betul", "Jumlah", "Wajaran SPM", "Soalan Salah"];

function doPost(e) {
  const kunci = LockService.getScriptLock();
  kunci.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const helaian = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (helaian.getLastRow() === 0) {
      helaian.appendRow(TAJUK);
      helaian.setFrozenRows(1);
    }
    helaian.appendRow([
      d.tarikh ? new Date(d.tarikh) : new Date(),
      d.sesi || "",
      String(d.nama || "").trim(),
      d.kelas || "",
      d.negeri || "",
      d.set || "",
      d.mod || "",
      d.cubaanKe || "",
      d.betul,
      d.jumlah,
      d.wajaranSpm,
      d.salah || "Tiada"
    ]);
    return ContentService.createTextOutput("OK");
  } finally {
    kunci.releaseLock();
  }
}
