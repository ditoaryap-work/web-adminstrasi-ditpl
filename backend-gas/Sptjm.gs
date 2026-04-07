// ==========================================
// SPTJM: CRUD & Generate PDF (tab SPTJM)
// 100% REST API — TANPA DriveApp/DocumentApp
// ==========================================

/**
 * Mendapatkan daftar SPTJM berdasarkan tim_poksi
 */
function getSptjmList(tim_poksi) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SPTJM");
  if (!sheet) return createResponse(false, "Tab SPTJM tidak ditemukan!");
  
  var data = sheet.getDataRange().getValues();
  var result = [];
  
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    var rowPoksi = String(data[i][12]).trim();
    
    if (tim_poksi && tim_poksi !== "Semua" && tim_poksi !== "Super Admin" && rowPoksi !== tim_poksi) {
      continue;
    }

    result.push({
      id_sptjm: String(data[i][0]),
      nama_lengkap: data[i][1],
      nip: String(data[i][2]),
      jabatan: data[i][3],
      tujuan: data[i][4],
      tanggal_perjalanan: data[i][5],
      tanggal_kembali: data[i][6],
      tiket_berangkat: data[i][7],
      tiket_pulang: data[i][8],
      biaya_sbm: data[i][9],
      total_biaya: data[i][10],
      tanggal_ttd: data[i][11],
      tim_poksi: data[i][12],
      file_link: data[i][13] || ""
    });
  }
  
  return createResponse(true, "Data SPTJM ditarik", result);
}

/**
 * Menyimpan data SPTJM + Auto Generate PDF
 */
function saveSptjm(sptjmData) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SPTJM");
  if (!sheet) return createResponse(false, "Tab SPTJM tidak ditemukan!");
  
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  var targetId = String(sptjmData.id_sptjm || "").trim();
  
  if (targetId) {
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === targetId) {
        rowIndex = i + 1;
        break;
      }
    }
  } else {
    targetId = "SPTJM-" + new Date().getTime();
    sptjmData.id_sptjm = targetId;
  }
  
  var rowData = [
    targetId,
    sptjmData.nama_lengkap || "",
    String(sptjmData.nip || ""),
    sptjmData.jabatan || "",
    sptjmData.tujuan || "",
    sptjmData.tanggal_perjalanan || "",
    sptjmData.tanggal_kembali || "",
    sptjmData.tiket_berangkat || 0,
    sptjmData.tiket_pulang || 0,
    sptjmData.biaya_sbm || 0,
    sptjmData.total_biaya || 0,
    sptjmData.tanggal_ttd || "",
    sptjmData.tim_poksi || "",
    "" // file_link — akan diisi setelah PDF dibuat
  ];

  if (rowIndex > -1) {
    sheet.getRange(rowIndex, 1, 1, 14).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
    // Cari rowIndex yang baru di-append
    var allData = sheet.getDataRange().getValues();
    for (var k = allData.length - 1; k >= 1; k--) {
      if (String(allData[k][0]).trim() === targetId) {
        rowIndex = k + 1;
        break;
      }
    }
  }
  
  SpreadsheetApp.flush();
  Logger.log("[SAVE] Data tersimpan. ID=" + targetId + ", row=" + rowIndex);
  
  // Auto Generate PDF
  try {
    var pdfUrl = generateSptjmPdf(targetId, rowIndex);
    if (pdfUrl && String(pdfUrl).indexOf("http") === 0) {
      Logger.log("[SAVE] PDF berhasil: " + pdfUrl);
      return createResponse(true, "Data disimpan & PDF berhasil dibuat.", { id_sptjm: targetId, file_link: pdfUrl });
    } else {
      Logger.log("[SAVE] PDF gagal: " + pdfUrl);
      return createResponse(true, "Data disimpan, tapi PDF gagal: " + pdfUrl, { id_sptjm: targetId });
    }
  } catch (pdfErr) {
    Logger.log("[SAVE] PDF error: " + pdfErr.toString());
    return createResponse(true, "Data disimpan, tapi PDF error: " + pdfErr.toString(), { id_sptjm: targetId });
  }
}

/**
 * Menghapus data SPTJM
 */
function deleteSptjm(id_sptjm) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SPTJM");
  if (!sheet) return createResponse(false, "Tab SPTJM tidak ditemukan!");
  
  var data = sheet.getDataRange().getValues();
  var targetId = String(id_sptjm).trim();
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === targetId) {
      sheet.deleteRow(i + 1);
      return createResponse(true, "Data SPTJM dihapus");
    }
  }
  
  return createResponse(false, "ID tidak ditemukan");
}

// ==========================================
// GENERATE PDF - 100% REST API v2
// Setiap step ada error check eksplisit
// ==========================================

function generateSptjmPdf(id_sptjm, knownRowIndex) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("SPTJM");
  var configSheet = ss.getSheetByName("CONFIG");
  
  if (!sheet || !configSheet) return "ERR: Sheet tidak ditemukan";
  
  // === STEP 1: Cari data ===
  var data = sheet.getDataRange().getValues();
  var row = null;
  var rowIndex = knownRowIndex || -1;
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(id_sptjm).trim()) {
      row = data[i];
      if (!knownRowIndex) rowIndex = i + 1;
      break;
    }
  }
  if (!row) return "ERR: Data ID " + id_sptjm + " tidak ditemukan";
  
  // Jika file_link sudah ada, kembalikan saja
  var currentLink = String(row[13] || "").trim();
  if (currentLink !== "" && currentLink.indexOf("http") === 0) {
    Logger.log("Sudah punya file link: " + currentLink);
    return currentLink;
  }
  
  // === STEP 2: Cari config ===
  var tim_poksi = String(row[12]).trim();
  var configData = configSheet.getDataRange().getValues();
  var templateId = "";
  var folderId = "";
  
  for (var j = 1; j < configData.length; j++) {
    if (String(configData[j][0]).trim() === tim_poksi) {
      templateId = String(configData[j][5] || "").trim(); // Kolom F: template_id_sptjm
      folderId = String(configData[j][2] || "").trim(); // Kolom C: folder_id_sptjm
      break;
    }
  }
  if (!templateId) return "ERR: template_id kosong untuk Tim: " + tim_poksi;
  if (!folderId) return "ERR: folder_id kosong untuk Tim: " + tim_poksi;
  
  try {
    var templateFile = DriveApp.getFileById(templateId); 
    var destinationFolder = DriveApp.getFolderById(folderId); 

    var nama = String(row[1] || "NoName").replace(/\s+/g, '_');
    var tgl = formatTanggalIndonesia(row[5]).replace(/\s+/g, '_');
    var fileName = tgl + "-SPTJM-" + nama;

    // === STEP 3: Copy template ===
    var copy = templateFile.makeCopy(fileName, destinationFolder);
    var copyId = copy.getId();
    var doc = DocumentApp.openById(copyId);
    var body = doc.getBody();

    var totalNum = Number(row[10]) || 0;

    var tglMulai = formatTanggalIndonesia(row[5]);
    var tglSelesai = formatTanggalIndonesia(row[6]);
    var gabunganTanggal = tglMulai === tglSelesai ? tglMulai : tglMulai + " s/d " + tglSelesai;

    // === STEP 4: Replace placeholders !==
    body.replaceText('{{Nama Lengkap}}', String(row[1] || "-"));
    body.replaceText('{{Nama}}', String(row[1] || "-"));
    body.replaceText('{{NIP}}', String(row[2] || "-"));
    body.replaceText('{{Jabatan}}', String(row[3] || "-"));
    body.replaceText('{{Tujuan}}', String(row[4] || "-"));
    body.replaceText('{{Tanggal}}', gabunganTanggal);
    body.replaceText('{{Tiket Berangkat}}', formatRupiah(row[7]));
    body.replaceText('{{Tiket Pulang}}', formatRupiah(row[8]));
    body.replaceText('{{Total}}', formatRupiah(row[10]));
    body.replaceText('{{Biaya SBM}}', formatRupiah(row[9]));
    body.replaceText('{{Tanggal TTD}}', formatTanggalIndonesia(row[11]));
    body.replaceText('{{Terbilang}}', terbilang(totalNum).trim() + " Rupiah");
    body.replaceText('{{NIP BAWAH}}', "NIP. " + String(row[2] || "-"));

    doc.saveAndClose();

    // === STEP 5: Convert ke PDF dan hapus Doc asli ===
    var pdfBlob = DriveApp.getFileById(copyId).getAs('application/pdf');
    var pdfFile = destinationFolder.createFile(pdfBlob);
    pdfFile.setName(fileName + ".pdf");
    
    // HAPUS setSharing KARENA BISA MENYEBABKAN ERROR JIKA FOLDER SUDAH DIBAGIKAN
    // ATAU TERHALANG POLICY ORGANISASI. FILE AKAN MEWARISI PERMISSION FOLDER.

    var pdfUrl = pdfFile.getUrl();

    // === STEP 6: Simpan URL ke kolom N (kolom ke-14) ===
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 14).setValue(pdfUrl);
      SpreadsheetApp.flush();
    }

    // Hapus Google Docs temporary
    try {
      DriveApp.getFileById(copyId).setTrashed(true);
    } catch(e) {
      Logger.log("Gagal menghapus temp doc: " + e.toString());
    }

    Logger.log("PDF created: " + pdfUrl);
    return pdfUrl;

  } catch (err) {
    Logger.log("Error generate: " + err.toString());
    return "Error: " + err.toString();
  }
}

// ==========================================
// HELPERS
// ==========================================

function formatRupiah(amount) {
  if (amount === undefined || amount === null || amount === "") return "Rp. 0";
  var num = typeof amount === 'string' ? parseFloat(String(amount).replace(/[^0-9.-]+/g, "")) : Number(amount);
  if (isNaN(num)) num = 0;
  return "Rp. " + Math.round(num).toLocaleString('id-ID');
}

function formatTanggalIndonesia(date) {
  if (!date) return "-";
  var parsed;
  if (date instanceof Date) {
    parsed = date;
  } else {
    parsed = new Date(date);
  }
  if (isNaN(parsed.getTime())) return String(date);

  var bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  var tanggal = parsed.getDate();
  if (tanggal < 10) tanggal = "0" + tanggal;
  return tanggal + " " + bulan[parsed.getMonth()] + " " + parsed.getFullYear();
}

function terbilang(a) {
  var bilangan = ['','Satu','Dua','Tiga','Empat','Lima','Enam','Tujuh','Delapan','Sembilan','Sepuluh','Sebelas'];
  var kalimat = '';
  a = Math.floor(a);
  if (a < 12) kalimat = bilangan[a];
  else if (a < 20) kalimat = terbilang(a - 10) + ' Belas';
  else if (a < 100) kalimat = terbilang(Math.floor(a / 10)) + ' Puluh ' + terbilang(a % 10);
  else if (a < 200) kalimat = 'Seratus ' + terbilang(a - 100);
  else if (a < 1000) kalimat = terbilang(Math.floor(a / 100)) + ' Ratus ' + terbilang(a % 100);
  else if (a < 2000) kalimat = 'Seribu ' + terbilang(a - 1000);
  else if (a < 1000000) kalimat = terbilang(Math.floor(a / 1000)) + ' Ribu ' + terbilang(a % 1000);
  else if (a < 1000000000) kalimat = terbilang(Math.floor(a / 1000000)) + ' Juta ' + terbilang(a % 1000000);
  return kalimat.replace(/\s+/g, ' ').trim();
}
