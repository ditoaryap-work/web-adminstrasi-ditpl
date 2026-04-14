// ==========================================
// MAIN ROUTER: Google Apps Script
// File utama — hanya berisi doGet, doPost (router), dan createResponse.
// Semua logika bisnis ada di file terpisah.
// ==========================================

function doGet(e) {
  return ContentService.createTextOutput("API E-Office Aktif!").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    let rawData = e.postData.contents;
    let payload = JSON.parse(rawData);
    let action = payload.action;

    // === AUTH ===
    if (action === "LOGIN") {
      return handleLogin(payload.username, payload.password);
    }

    // === MASTER PEGAWAI ===
    else if (action === "GET_PEGAWAI") {
      return getPegawai();
    }
    else if (action === "SAVE_PEGAWAI") {
      return savePegawai(payload.data);
    }
    else if (action === "DELETE_PEGAWAI") {
      return deletePegawai(payload.row_number);
    }

    // === ADMIN MANAGEMENT ===
    else if (action === "GET_ADMINS") {
      return getAdmins();
    }
    else if (action === "SAVE_ADMIN") {
      return saveAdmin(payload.data);
    }
    else if (action === "DELETE_ADMIN") {
      return deleteAdmin(payload.username);
    }

    // === CONFIG & SBM ===
    else if (action === "GET_CONFIG") {
      return getConfig();
    }
    else if (action === "GET_SBM") {
      return getSbmList();
    }


    // === SPTJM ===
    else if (action === "GET_SPTJM_LIST") {
      return getSptjmList(payload.tim_poksi);
    }
    else if (action === "SAVE_SPTJM") {
      return saveSptjm(payload.data);
    }
    else if (action === "DELETE_SPTJM") {
      return deleteSptjm(payload.id_sptjm);
    }

    // === SPT ===
    else if (action === "GET_SPT_LIST") {
      return getSptList(payload.tim_poksi);
    }
    else if (action === "SAVE_SPT") {
      return saveSpt(payload.data);
    }
    else if (action === "DELETE_SPT") {
      return deleteSpt(payload.id_spt);
    }

    // === SURAT (Arsip Persuratan) ===
    else if (action === "GET_SURAT_LIST") {
      return getSuratList(payload.tim_poksi, payload.role);
    }
    else if (action === "SAVE_SURAT") {
      return saveSurat(payload.data, payload.fileDetails);
    }
    else if (action === "DELETE_SURAT") {
      return deleteSurat(payload.id_surat);
    }

    // === KWITANSI SPJ (Perjalanan Dinas) ===
    else if (action === "GET_SPJ_LIST") {
      return getSpjList(payload.tim_poksi, payload.role);
    }
    else if (action === "SAVE_SPJ") {
      return saveSpj(payload.data, payload.fileDetails);
    }
    else if (action === "DELETE_SPJ") {
      return deleteSpj(payload.id_perjadin);
    }

    // === DEBUG: Test Permissions ===
    else if (action === "TEST_PERMISSIONS") {
      return testPermissions();
    }

    return createResponse(false, "Aksi tidak dikenali: " + action);

  } catch (error) {
    return createResponse(false, "Error di sisi Server: " + error.toString());
  }
}

// ==========================================
// HELPER: Response Builder
// ==========================================
function createResponse(success, message, data = null) {
  let response = {
    success: success,
    message: message,
    data: data
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// TRIGGER AUTH: Jalankan SEKALI dari Editor untuk memicu otorisasi
// Pilih fungsi ini dari dropdown → klik Run (▶️)
// ==========================================
function triggerAuth() {
  var results = [];
  
  // Test 1: SpreadsheetApp
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    results.push("✅ SpreadsheetApp OK: " + ss.getName());
  } catch (e) {
    results.push("❌ SpreadsheetApp GAGAL: " + e.toString());
  }
  
  // Test 2: DriveApp
  try {
    var rootFolder = DriveApp.getRootFolder();
    results.push("✅ DriveApp OK: " + rootFolder.getName());
  } catch (e) {
    results.push("❌ DriveApp GAGAL: " + e.toString());
  }
  
  // Test 3: DocumentApp
  try {
    var doc = DocumentApp.create("_test_auth_delete_me");
    var docId = doc.getId();
    DriveApp.getFileById(docId).setTrashed(true);
    results.push("✅ DocumentApp OK: berhasil buat dan hapus dokumen test");
  } catch (e) {
    results.push("❌ DocumentApp GAGAL: " + e.toString());
  }
  
  // Test 4: UrlFetchApp
  try {
    UrlFetchApp.fetch("https://www.google.com");
    results.push("✅ UrlFetchApp OK");
  } catch (e) {
    results.push("❌ UrlFetchApp GAGAL: " + e.toString());
  }
  
  for (var i = 0; i < results.length; i++) {
    Logger.log(results[i]);
  }
  
  Logger.log("=================================");
  Logger.log("Jika semua ✅, lanjut ke:");
  Logger.log("1. HAPUS deployment lama (Deploy > Manage > Arsip/Hapus)");
  Logger.log("2. Buat deployment BARU (Deploy > New deployment > Web app)");
  Logger.log("=================================");
}

/**
 * Test permissions dari web app (dipanggil via POST action TEST_PERMISSIONS)
 * Berguna untuk mengecek apakah deployment sudah punya izin lengkap
 */
function testPermissions() {
  var results = [];
  
  try {
    SpreadsheetApp.getActiveSpreadsheet();
    results.push("SpreadsheetApp: OK");
  } catch (e) {
    results.push("SpreadsheetApp: GAGAL - " + e.toString());
  }
  
  try {
    DriveApp.getRootFolder();
    results.push("DriveApp: OK");
  } catch (e) {
    results.push("DriveApp: GAGAL - " + e.toString());
  }
  
  try {
    var doc = DocumentApp.create("_perm_test_cleanup");
    DriveApp.getFileById(doc.getId()).setTrashed(true);
    results.push("DocumentApp: OK");
  } catch (e) {
    results.push("DocumentApp: GAGAL - " + e.toString());
  }
  
  return createResponse(true, "Permission Test", results);
}
