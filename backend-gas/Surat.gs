// ==========================================
// SURAT: Logika Arsip Surat Masuk & Keluar
// Akses Spreadsheet Tab: SURAT
// ==========================================

function getSuratList(tim_poksi, role) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SURAT");
  if (!sheet) return createResponse(false, "Tab SURAT tidak ditemukan!");
  
  let lastRow = sheet.getLastRow();
  if (lastRow <= 1) return createResponse(true, "Data SURAT berhasil ditarik", []);
  let data = sheet.getRange(1, 1, lastRow, 18).getValues();

  let headers = data[0]; 
  let results = [];
  
  // Format Headers: id_surat, tim_poksi, tipe_surat, kategori_surat, sifat_surat, 
  // nomor_surat, tanggal_masuk, tanggal_surat, asal_tujuan, perihal,
  // tgl_acara_mulai, tgl_acara_selesai, disposisi_ke, tgl_disposisi,
  // tindak_lanjut, file_surat, file_notulensi, created_at
  
  for (let i = 1; i < data.length; i++) {
    let rowTimPoksi = String(data[i][1] || "");
    
    // Bypass filter jika role adalah Super Admin atau tim_poksi adalah 'SEMUA'
    if (role !== "Super Admin" && tim_poksi !== "SEMUA" && rowTimPoksi !== tim_poksi) {
      continue;
    }
    
    // Tangani kemungkinan data string/array JSON pada disposisi
    let disposisi_ke = [];
    try {
      if (data[i][12]) disposisi_ke = JSON.parse(data[i][12]);
    } catch(e) {
      disposisi_ke = data[i][12] ? data[i][12].split(',') : [];
    }

    results.push({
      row_number: i + 1,
      id_surat: data[i][0],
      tim_poksi: rowTimPoksi,
      tipe_surat: data[i][2],
      kategori_surat: data[i][3],
      sifat_surat: data[i][4],
      nomor_surat: data[i][5],
      tanggal_masuk: data[i][6],
      tanggal_surat: data[i][7],
      asal_tujuan: data[i][8],
      perihal: data[i][9],
      tgl_acara_mulai: data[i][10],
      tgl_acara_selesai: data[i][11],
      disposisi_ke: disposisi_ke,
      tgl_disposisi: data[i][13],
      tindak_lanjut: data[i][14],
      file_surat: data[i][15],
      file_notulensi: data[i][16],
      created_at: data[i][17]
    });
  }
  
  // Urutkan terbaru di atas
  results.reverse();
  return createResponse(true, "Data SURAT berhasil ditarik", results);
}

function saveSurat(data, fileDetails) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SURAT");
  if (!sheet) return createResponse(false, "Tab SURAT tidak ditemukan! Buat tab SURAT secara manual di Spreadsheet.");
  
  let configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CONFIG");
  if (!configSheet) return createResponse(false, "Tab CONFIG tidak ditemukan di Spreadsheet!");
  let configData = configSheet.getDataRange().getValues();
  let conf = null;
  
  // 1. Dapatkan Config Folder
  for (let i = 1; i < configData.length; i++) {
    if (String(configData[i][0]).trim() === String(data.tim_poksi).trim()) {
      conf = {
        folderMasuk:    String(configData[i][6] || "").trim(),
        folderKeluar:   String(configData[i][7] || "").trim(),
        folderNotulensi: String(configData[i][8] || "").trim()
      };
      break;
    }
  }
  
  if (!conf) {
    return createResponse(false, 
      "Konfigurasi folder tidak ditemukan untuk Tim Poksi: \"" + data.tim_poksi + "\". " +
      "Pastikan baris tim ini sudah ada di tab CONFIG."
    );
  }

  // 2. Unggah File ke Google Drive (jika ada payload Base64)
  if (fileDetails && fileDetails.length > 0) {
    for (let f of fileDetails) {
      if (!f.base64) continue;
      
      // Tentukan folder tujuan upload berdasarkan field dan tipe surat
      let targetFolderId = "";
      let namaFolder = "";
      
      if (f.fieldName === "file_notulensi") {
        targetFolderId = conf.folderNotulensi;
        namaFolder = "Notulensi_Acara";
      } else if (data.tipe_surat === "Masuk") {
        targetFolderId = conf.folderMasuk;
        namaFolder = "Surat_Masuk";
      } else {
        targetFolderId = conf.folderKeluar;
        namaFolder = "Surat_Keluar";
      }
      
      // Validasi: pastikan Folder ID tidak kosong sebelum memanggil DriveApp
      if (!targetFolderId) {
        return createResponse(false, 
          "Folder ID untuk " + namaFolder + " belum diisi di tab CONFIG (kolom " +
          (f.fieldName === "file_notulensi" ? "I" : (data.tipe_surat === "Masuk" ? "G" : "H")) +
          ") untuk Tim Poksi: " + data.tim_poksi + ". " +
          "Isi Folder ID Google Drive yang benar di tab CONFIG lalu coba lagi."
        );
      }
      
      try {
        let folder = DriveApp.getFolderById(targetFolderId);
        let blob = Utilities.newBlob(Utilities.base64Decode(f.base64), f.mimeType, f.filename);
        let driveFile = folder.createFile(blob);
        driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        // Simpan URL Drive ke field yang sesuai
        data[f.fieldName] = driveFile.getUrl();
        
      } catch (err) {
        return createResponse(false, 
          "Gagal mengunggah berkas \"" + f.filename + "\" ke Google Drive. " +
          "Pastikan Folder ID: " + targetFolderId + " valid dan GAS memiliki akses ke folder tersebut. " +
          "Detail: " + err.message
        );
      }
    }
  }

  // 3. Simpan Data ke Spreadsheet
  let isEdit = !!data.id_surat;
  let row = -1;
  let oldData = sheet.getDataRange().getValues();
  
  if (isEdit) {
    let lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      let ids = sheet.getRange(1, 1, lastRow, 1).getValues();
      for (let i = 1; i < ids.length; i++) {
        if (ids[i][0] === data.id_surat) {
          row = i + 1;
          break;
        }
      }
    }
    if (row === -1) return createResponse(false, "Surat dengan ID tersebut tidak ditemukan untuk diupdate!");
  } else {
    // Data Baru
    data.id_surat = "SRT-" + new Date().getTime();
    data.created_at = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    row = sheet.getLastRow() + 1;
  }
  
  // Parsing Array Disposisi -> JSON String
  let dispString = "";
  if (data.disposisi_ke && Array.isArray(data.disposisi_ke)) {
    dispString = JSON.stringify(data.disposisi_ke);
  }

  let rowData = [
    data.id_surat || "",
    data.tim_poksi || "",
    data.tipe_surat || "",
    data.kategori_surat || "",
    data.sifat_surat || "",
    data.nomor_surat || "",
    data.tanggal_masuk || "",
    data.tanggal_surat || "",
    data.asal_tujuan || "",
    data.perihal || "",
    data.tgl_acara_mulai || "",
    data.tgl_acara_selesai || "",
    dispString,
    data.tgl_disposisi || "",
    data.tindak_lanjut || "",
    data.file_surat || "",
    data.file_notulensi || "",
    data.created_at || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss")
  ];
  
  if (!isEdit && sheet.getLastRow() === 0) {
    // Buat Headers jika kosong
    sheet.appendRow([
      "id_surat", "tim_poksi", "tipe_surat", "kategori_surat", "sifat_surat", 
      "nomor_surat", "tanggal_masuk", "tanggal_surat", "asal_tujuan", "perihal",
      "tgl_acara_mulai", "tgl_acara_selesai", "disposisi_ke", "tgl_disposisi",
      "tindak_lanjut", "file_surat", "file_notulensi", "created_at"
    ]);
    row = 2;
  }

  sheet.getRange(row, 1, 1, rowData.length).setValues([rowData]);
  return createResponse(true, isEdit ? "Data Surat Diperbarui" : "Data Surat Disimpan", { id_surat: data.id_surat });
}

function deleteSurat(id_surat) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SURAT");
  if (!sheet) return createResponse(false, "Tab SURAT tidak ditemukan");
  
  let lastRow = sheet.getLastRow();
  if (lastRow <= 1) return createResponse(false, "Data Surat tidak ditemukan untuk dihapus");

  let ids = sheet.getRange(1, 1, lastRow, 1).getValues();
  for (let i = 1; i < ids.length; i++) {
    if (ids[i][0] === id_surat) {
      sheet.deleteRow(i + 1);
      return createResponse(true, "Data Surat berhasil dihapus");
    }
  }
  
  return createResponse(false, "Data Surat tidak ditemukan untuk dihapus");
}
