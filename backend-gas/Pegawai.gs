// ==========================================
// PEGAWAI: Tarik Data Master Pegawai (tab MASTER_PEGAWAI)
// ==========================================

function getPegawai() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER_PEGAWAI");
  if (!sheet) return createResponse(false, "Tab MASTER_PEGAWAI tidak ditemukan!");
  
  let data = sheet.getDataRange().getValues();
  let result = [];
  
  // Mapping setelah Kolom G dihapus:
  // [1] Nama | [2] NIP | [3] Gol | [4] Ruang | [5] Kolom F (Biaya) | [6] Jabatan | [7] Dir | [8] Poksi
  for (let i = 1; i < data.length; i++) {
    if (!data[i][2]) continue;
    
    result.push({
      nip: String(data[i][2]).trim(),
      nama_lengkap: data[i][1],
      golongan: data[i][3],
      pangkat_gol_ruang: data[i][4],
      tingkat_biaya: data[i][5],
      jabatan: data[i][6],
      direktorat: data[i][7],
      poksi: data[i][8]
    });
  }
  
  return createResponse(true, "Data Pegawai ditarik", result);
}

function savePegawai(data) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER_PEGAWAI");
  if (!sheet) return createResponse(false, "Tab MASTER_PEGAWAI tidak ditemukan!");
  
  let targetNip = String(data.nip).trim();
  if (!targetNip) return createResponse(false, "NIP tidak boleh kosong!");
  
  let existingData = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < existingData.length; i++) {
    if (String(existingData[i][2]).trim() === targetNip) {
      rowIndex = i + 1;
      break;
    }
  }
  
  let rowData = [
    data.no || "", // Let No untouched or blank if new
    data.nama_lengkap || "",
    targetNip,
    data.golongan || "",
    data.pangkat_gol_ruang || "",
    data.tingkat_biaya || "",
    data.jabatan || "",
    data.direktorat || "",
    data.poksi || ""
  ];
  
  if (rowIndex > -1) {
    // Pertahankan kolom No
    rowData[0] = existingData[rowIndex - 1][0];
    sheet.getRange(rowIndex, 1, 1, 9).setValues([rowData]);
  } else {
    // Generate nomor baru untuk kolom A
    rowData[0] = existingData.length; 
    sheet.appendRow(rowData);
  }
  
  return createResponse(true, "Data Pegawai berhasil disimpan!");
}

function deletePegawai(nip) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER_PEGAWAI");
  if (!sheet) return createResponse(false, "Tab MASTER_PEGAWAI tidak ditemukan!");
  
  let data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][2]).trim() === String(nip).trim()) {
      sheet.deleteRow(i + 1);
      return createResponse(true, "Data Pegawai berhasil dihapus!");
    }
  }
  return createResponse(false, "Pegawai tidak ditemukan!");
}
