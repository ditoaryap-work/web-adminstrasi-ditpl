// ==========================================
// SETUP: Auto-Create Folder Structure & Fill CONFIG
// Jalankan fungsi ini SEKALI SAJA dari Apps Script Editor
// ==========================================

/**
 * INSTRUKSI:
 * 1. Ganti ARSIP_FOLDER_ID dengan ID folder "3_Arsip_Dokumen" Anda
 * 2. Ganti TEMPLATE_SPTJM_ID dengan ID Google Doc template SPTJM (4_Template_SPTJM)
 * 3. (Opsional) Ganti TEMPLATE_SPT_ID jika template SPT sudah siap
 * 4. Jalankan fungsi setupFolderStructure() dari editor
 */

// === GANTI ID INI SEBELUM MENJALANKAN ===
const ARSIP_FOLDER_ID = "GANTI_DENGAN_ID_FOLDER_3_ARSIP_DOKUMEN";
const TEMPLATE_SPTJM_ID = "GANTI_DENGAN_ID_TEMPLATE_SPTJM";
const TEMPLATE_SPT_ID = "";  // Kosongkan jika belum ada

// Daftar Tim Poksi (harus sama persis dengan yang didaftarkan di DATA_ADMIN)
const TIM_POKSI_LIST = [
  { name: "Tata Usaha Direktorat Penyediaan Lahan", shortName: "TU_Direktorat_PL" },
  { name: "Pendayagunaan Lahan", shortName: "Pendayagunaan_Lahan" },
  { name: "Perancangan Teknis Penyediaan Lahan", shortName: "Perancangan_Teknis" },
  { name: "Perluasan Lahan Wilayah I", shortName: "Perluasan_Wilayah_I" },
  { name: "Perluasan Lahan Wilayah II", shortName: "Perluasan_Wilayah_II" }
];

/**
 * Fungsi utama: Buat struktur folder dan isi CONFIG sheet
 */
function setupFolderStructure() {
  // Validasi
  if (ARSIP_FOLDER_ID === "GANTI_DENGAN_ID_FOLDER_3_ARSIP_DOKUMEN") {
    throw new Error("❌ Anda harus mengganti ARSIP_FOLDER_ID terlebih dahulu! Lihat instruksi di bagian atas file.");
  }
  if (TEMPLATE_SPTJM_ID === "GANTI_DENGAN_ID_TEMPLATE_SPTJM") {
    throw new Error("❌ Anda harus mengganti TEMPLATE_SPTJM_ID terlebih dahulu!");
  }
  
  const arsipFolder = DriveApp.getFolderById(ARSIP_FOLDER_ID);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let configSheet = ss.getSheetByName("CONFIG");
  
  // Buat sheet CONFIG jika belum ada
  if (!configSheet) {
    configSheet = ss.insertSheet("CONFIG");
  }
  
  // Set Header
  configSheet.getRange(1, 1, 1, 5).setValues([[
    "tim_poksi", "folder_id_spt", "folder_id_sptjm", "template_id_spt", "template_id_sptjm"
  ]]);
  configSheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#d9ead3");
  
  // Bersihkan data lama (baris 2 dan seterusnya)
  const lastRow = configSheet.getLastRow();
  if (lastRow > 1) {
    configSheet.getRange(2, 1, lastRow - 1, 5).clearContent();
  }
  
  const results = [];
  
  for (let i = 0; i < TIM_POKSI_LIST.length; i++) {
    const tim = TIM_POKSI_LIST[i];
    
    // Cek apakah folder tim sudah ada
    let timFolder = getOrCreateFolder(arsipFolder, tim.shortName);
    
    // Buat subfolder SPT dan SPTJM
    let sptFolder = getOrCreateFolder(timFolder, "SPT");
    let sptjmFolder = getOrCreateFolder(timFolder, "SPTJM");
    
    // Simpan ke array hasil
    results.push([
      tim.name,                    // A: tim_poksi
      sptFolder.getId(),           // B: folder_id_spt
      sptjmFolder.getId(),         // C: folder_id_sptjm
      TEMPLATE_SPT_ID || "",       // D: template_id_spt
      TEMPLATE_SPTJM_ID           // E: template_id_sptjm (sama untuk semua tim)
    ]);
    
    Logger.log("✅ " + tim.name + " → folder dibuat/ditemukan");
  }
  
  // Tulis ke CONFIG sheet sekaligus
  configSheet.getRange(2, 1, results.length, 5).setValues(results);
  
  // Auto-resize kolom
  configSheet.autoResizeColumns(1, 5);
  
  Logger.log("=================================");
  Logger.log("🎉 SETUP SELESAI!");
  Logger.log("=================================");
  Logger.log("Total tim: " + results.length);
  Logger.log("Folder arsip: " + arsipFolder.getName());
  Logger.log("Template SPTJM: " + TEMPLATE_SPTJM_ID);
  Logger.log("Silakan cek tab CONFIG di spreadsheet Anda.");
}

/**
 * Helper: Cari folder berdasarkan nama, atau buat baru jika tidak ada
 */
function getOrCreateFolder(parentFolder, folderName) {
  const existing = parentFolder.getFoldersByName(folderName);
  if (existing.hasNext()) {
    return existing.next();
  }
  return parentFolder.createFolder(folderName);
}

/**
 * Fungsi bantuan: Cek apakah CONFIG sudah terisi dengan benar
 */
function verifyConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName("CONFIG");
  
  if (!configSheet) {
    Logger.log("❌ Sheet CONFIG belum dibuat! Jalankan setupFolderStructure() dulu.");
    return;
  }
  
  const data = configSheet.getDataRange().getValues();
  Logger.log("=== VERIFIKASI CONFIG ===");
  Logger.log("Total baris (termasuk header): " + data.length);
  
  let errors = 0;
  for (let i = 1; i < data.length; i++) {
    const tim = data[i][0];
    const folderSpt = data[i][1];
    const folderSptjm = data[i][2];
    const templateSpt = data[i][3];
    const templateSptjm = data[i][4];
    
    Logger.log("\n--- " + tim + " ---");
    
    if (!folderSptjm) {
      Logger.log("  ❌ folder_id_sptjm KOSONG!");
      errors++;
    } else {
      try {
        const folder = DriveApp.getFolderById(folderSptjm);
        Logger.log("  ✅ Folder SPTJM: " + folder.getName() + " (OK)");
      } catch (e) {
        Logger.log("  ❌ Folder SPTJM tidak valid: " + e.message);
        errors++;
      }
    }
    
    if (!templateSptjm) {
      Logger.log("  ❌ template_id_sptjm KOSONG!");
      errors++;
    } else {
      try {
        const doc = DriveApp.getFileById(templateSptjm);
        Logger.log("  ✅ Template SPTJM: " + doc.getName() + " (OK)");
      } catch (e) {
        Logger.log("  ❌ Template SPTJM tidak valid: " + e.message);
        errors++;
      }
    }
  }
  
  Logger.log("\n=== HASIL ===");
  if (errors === 0) {
    Logger.log("🎉 Semua konfigurasi VALID! PDF generation siap digunakan.");
  } else {
    Logger.log("⚠️ Ditemukan " + errors + " error. Perbaiki data di atas, lalu jalankan ulang.");
  }
}
