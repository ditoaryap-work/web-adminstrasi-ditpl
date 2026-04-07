// ==========================================
// SPT: Surat Perintah Tugas
// CRUD + Generate PDF dengan tabel dinamis
// Sheet: A=id_spt B=no C=tanggal_surat D=maksud_perjalanan
//        E=peserta(JSON) F=peserta_count G=status H=tim_poksi
//        I=file_link J=mak
// ==========================================

function getSptList(tim_poksi) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SPT");
  if (!sheet) return createResponse(false, "Tab SPT tidak ditemukan!");
  
  var data = sheet.getDataRange().getValues();
  var result = [];
  
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    
    var rowTimPoksi = String(data[i][7] || "").trim();
    if (tim_poksi && rowTimPoksi !== tim_poksi) continue;
    
    var peserta = [];
    try {
      var raw = data[i][4];
      peserta = typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
    } catch(e) { peserta = []; }
    
    result.push({
      id_spt: String(data[i][0]),
      no: data[i][1],
      tanggal_surat: data[i][2],
      maksud_perjalanan: data[i][3],
      peserta: peserta,
      peserta_count: Number(data[i][5]) || 0,
      status: data[i][6] || "Draft",
      tim_poksi: rowTimPoksi,
      file_link: data[i][8] || "",
      mak: data[i][9] || ""
    });
  }
  
  return createResponse(true, "Data SPT ditarik", result);
}

function saveSpt(sptData) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SPT");
  if (!sheet) return createResponse(false, "Tab SPT tidak ditemukan!");
  
  var targetId = String(sptData.id_spt || "").trim();
  var rowIndex = -1;
  
  if (targetId) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === targetId) {
        rowIndex = i + 1;
        break;
      }
    }
  }
  
  if (!targetId || rowIndex === -1) {
    targetId = "SPT-" + new Date().getTime();
    sptData.id_spt = targetId;
  }
  
  var pesertaJson = JSON.stringify(sptData.peserta || []);
  var pesertaCount = Array.isArray(sptData.peserta) ? sptData.peserta.length : 0;
  
  var rowData = [
    targetId,
    sptData.no || "",
    sptData.tanggal_surat || "",
    sptData.maksud_perjalanan || "",
    pesertaJson,
    pesertaCount,
    sptData.status || "Final",
    sptData.tim_poksi || "",
    "", // file_link — diisi setelah PDF
    sptData.mak || ""
  ];
  
  if (rowIndex > 1) {
    sheet.getRange(rowIndex, 1, 1, 10).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
    SpreadsheetApp.flush();
    var allData = sheet.getDataRange().getValues();
    for (var k = allData.length - 1; k >= 1; k--) {
      if (String(allData[k][0]).trim() === targetId) {
        rowIndex = k + 1;
        break;
      }
    }
  }
  
  SpreadsheetApp.flush();
  
  // Auto Generate PDF
  try {
    var pdfUrl = generateSptPdf(targetId, rowIndex);
    if (pdfUrl && String(pdfUrl).indexOf("http") === 0) {
      return createResponse(true, "SPT disimpan & PDF berhasil.", { id_spt: targetId, file_link: pdfUrl });
    } else {
      Logger.log("PDF result: " + pdfUrl);
      return createResponse(true, "SPT disimpan. PDF: " + String(pdfUrl), { id_spt: targetId });
    }
  } catch (pdfErr) {
    Logger.log("PDF error: " + pdfErr.toString());
    return createResponse(true, "SPT disimpan. PDF error: " + pdfErr.toString(), { id_spt: targetId });
  }
}

function deleteSpt(id_spt) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SPT");
  if (!sheet) return createResponse(false, "Tab SPT tidak ditemukan!");
  
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(id_spt).trim()) {
      sheet.deleteRow(i + 1);
      return createResponse(true, "Data SPT dihapus");
    }
  }
  return createResponse(false, "ID tidak ditemukan");
}

// ==========================================
// GENERATE PDF SPT
// ==========================================

function generateSptPdf(id_spt, knownRowIndex) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("SPT");
  var configSheet = ss.getSheetByName("CONFIG");
  if (!sheet || !configSheet) return "ERR: Sheet tidak ditemukan";
  
  // STEP 1: Cari data
  var data = sheet.getDataRange().getValues();
  var row = null;
  var rowIndex = knownRowIndex || -1;
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(id_spt).trim()) {
      row = data[i];
      if (!knownRowIndex) rowIndex = i + 1;
      break;
    }
  }
  if (!row) return "ERR: ID " + id_spt + " tidak ditemukan";
  
  // Skip jika sudah ada link
  var currentLink = String(row[8] || "").trim();
  if (currentLink.indexOf("http") === 0) return currentLink;
  
  // STEP 2: Parse peserta
  var peserta = [];
  try {
    peserta = typeof row[4] === 'string' ? JSON.parse(row[4]) : (row[4] || []);
  } catch(e) { peserta = []; }
  if (peserta.length === 0) return "ERR: Tidak ada peserta";
  
  // STEP 3: Cari config
  var tim_poksi = String(row[7]).trim();
  var configData = configSheet.getDataRange().getValues();
  var templateId = "";
  var folderId = "";
  
  for (var j = 1; j < configData.length; j++) {
    if (String(configData[j][0]).trim() === tim_poksi) {
      templateId = peserta.length > 5 
        ? String(configData[j][4] || "").trim()   // Kolom E: template_id_spt_v2
        : String(configData[j][3] || "").trim();  // Kolom D: template_id_spt_v1
      folderId = String(configData[j][1] || "").trim(); // Kolom B: folder_id_spt
      break;
    }
  }
  if (!templateId) return "ERR: template kosong untuk: " + tim_poksi;
  if (!folderId) return "ERR: folder kosong untuk: " + tim_poksi;
  
  try {
    var templateFile = DriveApp.getFileById(templateId);
    var destinationFolder = DriveApp.getFolderById(folderId);
    var noSurat = String(row[1] || "NoNomor").replace(/[\/\\]/g, '-');
    var fileName = "SPT-" + noSurat;
    
    // STEP 4: Copy template
    var copy = templateFile.makeCopy(fileName, destinationFolder);
    var copyId = copy.getId();
    
    // STEP 5: Document Manipulation (Text & Table)
    var doc = DocumentApp.openById(copyId);
    var body = doc.getBody();
    
    // Replace global placeholders
    body.replaceText('\\{\\{nomor_surat\\}\\}', String(row[1] || "-"));
    body.replaceText('\\{\\{tanggal_surat\\}\\}', formatTanggalIndonesia(row[2]));
    body.replaceText('\\{\\{maksud_perjalanan\\}\\}', String(row[3] || "-"));
    body.replaceText('\\{\\{mak\\}\\}', String(row[9] || "-"));
    
    // Dynamic Table Manipulation
    var tables = body.getTables();
    if (tables.length > 0) {
      var table = tables[0];
      
      // Asumsi baris 0 adalah Header, baris 1 adalah Placeholder Data
      if (table.getNumRows() > 1) {
        var placeholderRow = table.getRow(1);
        
        // 1. Duplicate baris placeholder sesuai jumlah peserta tambahan
        for (var r = 1; r < peserta.length; r++) {
          var newRow = placeholderRow.copy();
          table.insertTableRow(1 + r, newRow);
        }
        
        // 2. Isi data untuk masing-masing peserta
        for (var p = 0; p < peserta.length; p++) {
          var personRow = table.getRow(p + 1);
          var person = peserta[p];
          
          // Kolom pertama di-fix angkanya (No)
          personRow.getCell(0).setText(String(p + 1) + ".");
          
          // Replace placeholder di baris tersebut
          personRow.replaceText('\\{\\{nama_lengkap\\}\\}', String(person.nama_lengkap || "-"));
          personRow.replaceText('\\{\\{gol\\}\\}', String(person.pangkat_gol || "-"));
          personRow.replaceText('\\{\\{nip\\}\\}', String(person.nip || "-"));
          personRow.replaceText('\\{\\{tujuan\\}\\}', String(person.tujuan || "-"));
          personRow.replaceText('\\{\\{tanggal_pelaksanaan\\}\\}', String(person.tanggal_pelaksanaan || "-"));
        }
      }
    } else {
      Logger.log("WARN: Tidak ada tabel ditemukan di dokumen");
    }
    
    doc.saveAndClose();
    
    // STEP 6: Export ke PDF
    var pdfBlob = DriveApp.getFileById(copyId).getAs('application/pdf');
    var pdfFile = destinationFolder.createFile(pdfBlob);
    pdfFile.setName(fileName + ".pdf");
    var pdfUrl = pdfFile.getUrl();
    
    // STEP 8: Simpan URL ke kolom I (kolom 9)
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 9).setValue(pdfUrl);
      SpreadsheetApp.flush();
    }
    
    // Hapus temp doc
    try { DriveApp.getFileById(copyId).setTrashed(true); } catch(e) {}
    
    Logger.log("SPT PDF OK: " + pdfUrl);
    return pdfUrl;
    
  } catch (err) {
    Logger.log("SPT PDF Error: " + err.toString());
    return "Error: " + err.toString();
  }
}
