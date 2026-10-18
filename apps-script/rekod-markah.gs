/* ============================================================
   REKOD MARKAH · Bank Soalan Perniagaan Tingkatan 4
   - doPost : terima keputusan murid daripada index.html, simpan
              satu baris bagi setiap cubaan dalam Google Sheet.
   - doGet  : hantar semua rekod kepada dashboard.html, HANYA jika
              kata laluan guru betul. Murid tidak boleh baca rekod.

   PEMASANGAN (sekali sahaja):
   1. Cipta Google Sheet baharu (contoh: "Rekod Perniagaan T4").
   2. Extensions → Apps Script. Padam kod contoh, tampal fail ini.
   3. Tukar KATA_LALUAN_GURU di bawah kepada kata laluan sebenar, Save.
      (Repo GitHub ini terbuka — jangan simpan kata laluan sebenar di GitHub.)
   4. Deploy → New deployment → ⚙️ Web app
        Execute as     : Me
        Who has access : Anyone
      Tekan Deploy, benarkan akses, salin "Web app URL".
   5. Beri URL itu kepada Claude (ENDPOINT_CIKGU dalam index.html
      dan dashboard.html).
   Sheet TIDAK perlu diterbitkan (Publish to web) — biarkan peribadi.

   Jika kod ini diubah kemudian: Deploy → Manage deployments → ✏️ →
   Version: New version → Deploy (URL kekal sama).
   ============================================================ */

const KATA_LALUAN_GURU = "TUKAR_KATA_LALUAN_DI_SINI";

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

function doGet(e) {
  const kunci = (e && e.parameter && e.parameter.kunci) || "";
  if (KATA_LALUAN_GURU === "TUKAR_KATA_LALUAN_DI_SINI" || kunci !== KATA_LALUAN_GURU) {
    return jawapanJson({ ok: false, ralat: "kata_laluan" });
  }
  const helaian = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const baris = helaian.getLastRow() ? helaian.getDataRange().getDisplayValues() : [];
  return jawapanJson({ ok: true, baris: baris });
}

function jawapanJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
