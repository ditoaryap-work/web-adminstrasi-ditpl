// ==========================================
// SPT: Surat Perintah Tugas
// CRUD + Generate PDF dengan tabel dinamis
// Sheet: A=id_spt B=no C=tanggal_surat D=maksud_perjalanan
//        E=peserta(JSON) F=peserta_count G=tim_poksi
//        H=file_link I=mak J=created_at
// Total: 10 kolom (A-J)
// ==========================================

function getSptList(tim_poksi) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SPT");
  if (!sheet) return createResponse(false, "Tab SPT tidak ditemukan!");
  
  var data = sheet.getDataRange().getValues();
  var result = [];
  
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    
    var rowTimPoksi = String(data[i][6] || "").trim();    // Bypass filter jika role adalah Super Admin atau tim_poksi adalah 'SEMUA'
    if (tim_poksi !== "SEMUA" && rowTimPoksi !== tim_poksi) {
      continue;
    }
    
    var peserta = [];
    try {
      var raw = data[i][4]; // E = index 4
      peserta = typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
    } catch(e) { peserta = []; }
    
    result.push({
      id_spt: String(data[i][0]),       // A = index 0
      no: data[i][1],                    // B = index 1
      tanggal_surat: data[i][2],         // C = index 2
      maksud_perjalanan: data[i][3],     // D = index 3
      peserta: peserta,                  // E = index 4
      peserta_count: Number(data[i][5]) || 0, // F = index 5
      tim_poksi: rowTimPoksi,            // G = index 6
      file_link: data[i][7] || "",       // H = index 7
      mak: data[i][8] || "",             // I = index 8
      created_at: data[i][9] ? Utilities.formatDate(new Date(data[i][9]), Session.getScriptTimeZone(), "dd MMM yyyy HH:mm") : "" // J = index 9
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
  
  var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  var createdAt = nowStr;

  if (rowIndex > 1) {
    try {
      var existingRow = sheet.getRange(rowIndex, 1, 1, 10).getValues()[0]; // 10 kolom (A-J)
      if (existingRow[9]) createdAt = existingRow[9]; // J = index 9 = created_at
    } catch(e) {}
  }
  
  // Total 10 kolom: A-J
  var rowData = [
    targetId,                          // A = id_spt
    sptData.no || "",                  // B = no
    sptData.tanggal_surat || "",       // C = tanggal_surat
    sptData.maksud_perjalanan || "",   // D = maksud_perjalanan
    pesertaJson,                       // E = peserta (JSON)
    pesertaCount,                      // F = peserta_count
    sptData.tim_poksi || "",           // G = tim_poksi
    "",                                // H = file_link — diisi setelah PDF
    sptData.mak || "",                 // I = mak
    createdAt                          // J = created_at
  ];
  
  if (rowIndex > 1) {
    sheet.getRange(rowIndex, 1, 1, 10).setValues([rowData]); // 10 kolom
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
// GENERATE PDF SPT (Robust - Direct Cell setText)
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
  
  // Jika sudah ada link lama, hapus PDF lama sebelum generate baru
  var currentLink = String(row[7] || "").trim(); // H = index 7 = file_link
  if (currentLink.indexOf("http") === 0) {
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 8).setValue(""); // Kolom H = kolom ke-8
      SpreadsheetApp.flush();
    }
  }
  
  // STEP 2: Parse peserta
  var peserta = [];
  try {
    peserta = typeof row[4] === 'string' ? JSON.parse(row[4]) : (row[4] || []); // E = index 4
  } catch(e) { peserta = []; }
  if (peserta.length === 0) return "ERR: Tidak ada peserta";
  
  // STEP 3: Cari config
  var tim_poksi = String(row[6]).trim(); // G = index 6 = tim_poksi
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
    var noSurat = String(row[1] || "NoNomor").replace(/[\/\\]/g, '-'); // B = index 1
    var fileName = "SPT-" + noSurat;
    
    // STEP 4: Copy template
    var copy = templateFile.makeCopy(fileName, destinationFolder);
    var copyId = copy.getId();
    
    // STEP 5: Document Manipulation (Text & Table)
    var doc = DocumentApp.openById(copyId);
    var body = doc.getBody();
    
    // Replace global placeholders
    body.replaceText('\\{\\{nomor_surat\\}\\}', String(row[1] || "-"));        // B = no
    body.replaceText('\\{\\{tanggal_surat\\}\\}', formatTanggalIndonesia(row[2])); // C = tanggal_surat
    body.replaceText('\\{\\{maksud_perjalanan\\}\\}', String(row[3] || "-"));   // D = maksud_perjalanan
    body.replaceText('\\{\\{mak\\}\\}', String(row[8] || "-"));                 // I = index 8 = mak
    
    // Dynamic Table Manipulation - ROBUST method using direct setText per cell
    var tables = body.getTables();
    var table = null;
    
    // Cari tabel yang benar-benar mengandung placeholder peserta
    for (var t = 0; t < tables.length; t++) {
      var tableText = tables[t].getText() || "";
      if (tableText.indexOf("nama_lengkap") > -1 || tableText.indexOf("nip") > -1) {
        table = tables[t];
        break;
      }
    }
    
    // Fallback jika tidak menemukan string placeholder: ambil tabel terakhir
    if (!table && tables.length > 0) {
      table = tables[tables.length - 1];
    }
    
    if (table) {
      
      // Asumsi baris 0 adalah Header, baris 1 adalah Placeholder Data
      if (table.getNumRows() > 1) {
        
        // 1. Duplikasi baris placeholder untuk peserta tambahan
        for (var r = 1; r < peserta.length; r++) {
          // Buat baris baru setelah baris terakhir yang ada
          var sourceRow = table.getRow(1);
          var numCells = sourceRow.getNumCells();
          var newRow = table.insertTableRow(1 + r);
          for (var c = 0; c < numCells; c++) {
            var cell = newRow.appendTableCell("");
            // Copy styling dari source cell
            var srcCell = sourceRow.getCell(c);
            var srcText = srcCell.editAsText();
            var newText = cell.editAsText();
            newText.setFontSize(srcText.getFontSize());
            try { newText.setFontFamily(srcText.getFontFamily()); } catch(e) {}
            try { 
              var align = srcCell.getChild(0).getAlignment();
              if (align) cell.getChild(0).setAlignment(align);
            } catch(e) {}
          }
        }
        
        // 2. Isi data per cell secara langsung, tapi dengan aman (cek NumCells)
        for (var p = 0; p < peserta.length; p++) {
          var personRow = table.getRow(p + 1);
          var person = peserta[p];
          var numCols = personRow.getNumCells();
          
          if (numCols > 0) personRow.getCell(0).setText(String(p + 1) + ".");
          if (numCols > 1) personRow.getCell(1).setText(String(person.nama_lengkap || "-"));
          
          if (numCols >= 6) {
             personRow.getCell(2).setText(String(person.pangkat_gol || "-"));
             personRow.getCell(3).setText(String(person.nip || "-"));
             personRow.getCell(4).setText(String(person.tujuan || "-"));
             personRow.getCell(5).setText(String(person.tanggal_pelaksanaan || "-"));
          } else if (numCols === 5) {
             personRow.getCell(2).setText(String(person.nip || "-"));
             personRow.getCell(3).setText(String(person.tujuan || "-"));
             personRow.getCell(4).setText(String(person.tanggal_pelaksanaan || "-"));
          } else if (numCols === 4) {
             personRow.getCell(2).setText(String(person.tujuan || "-"));
             personRow.getCell(3).setText(String(person.tanggal_pelaksanaan || "-"));
          }
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
    
    // STEP 7: Simpan URL ke kolom H (kolom ke-8)
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 8).setValue(pdfUrl); // H = kolom ke-8
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
