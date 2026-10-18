/* ============================================================
   REKOD MARKAH · Bank Soalan Perniagaan Tingkatan 4
   - doPost : terima keputusan murid daripada index.html, simpan
              satu baris bagi setiap cubaan dalam Google Sheet.
   - doGet  : hantar semua rekod kepada dashboard.html.

   PEMASANGAN (sekali sahaja):
   1. Cipta Google Sheet baharu (contoh: "Rekod Perniagaan T4").
   2. Extensions → Apps Script. Padam kod contoh, tampal fail ini.
   3. Save.
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

// Nama lajur — dibaca oleh dashboard.html dan laporan-telegram.gs.
const TAJUK = ["Tarikh", "Sesi", "Nama", "Kelas", "Negeri", "Set", "Mod",
               "Cubaan Ke", "Betul", "Jumlah", "Wajaran SPM", "Soalan Salah"];

function doPost(e) {
  // doPost hanya dipanggil oleh web murid. Butang "Run" dalam editor tiada data
  // murid — untuk menguji dari editor, pilih fungsi ujiRekod dan tekan Run.
  if (!e || !e.postData) {
    return ContentService.createTextOutput("Tiada data. Untuk ujian, jalankan ujiRekod.");
  }
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

function doGet() {
  const helaian = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const baris = helaian.getLastRow() ? helaian.getDataRange().getDisplayValues() : [];
  return jawapanJson({ ok: true, baris: baris });
}

function jawapanJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Ujian dari editor: pilih "ujiRekod" di sebelah butang Run, kemudian tekan Run.
   Satu baris "UJIAN CIKGU" akan ditambah ke Sheet — padam selepas semakan. */
function ujiRekod() {
  doPost({ postData: { contents: JSON.stringify({
    tarikh: new Date().toISOString(), sesi: "T4 2026", nama: "UJIAN CIKGU", kelas: "4 Intelek",
    negeri: "Johor", set: "PPC 2026", mod: "Latihan", cubaanKe: 1,
    betul: 15, jumlah: 20, wajaranSpm: 15, salah: "3, 8, 12, 17, 20"
  }) } });
  Logger.log("Baris ujian ditambah. Semak Sheet.");
}
