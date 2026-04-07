// ==========================================
// PEGAWAI: Tarik Data Master Pegawai (tab MASTER_PEGAWAI)
// ==========================================

function getPegawai() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER_PEGAWAI");
  if (!sheet) return createResponse(false, "Tab MASTER_PEGAWAI tidak ditemukan!");
  
  let data = sheet.getDataRange().getValues();
  let result = [];
  
  // Kolom: [0] No | [1] Nama | [2] NIP | [3] Gol | [4] Ruang | [5] Biaya | [6] Jabatan | [7] Dir | [8] Poksi
  for (let i = 1; i < data.length; i++) {
    if (!data[i][1]) continue; // Skip rows without nama
    
    result.push({
      row_number: i + 1, // Row number di sheet (untuk delete/update)
      nip: String(data[i][2] || "").trim(),
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
  
  if (!data.nama_lengkap) return createResponse(false, "Nama Lengkap tidak boleh kosong!");
  
  let existingData = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  // Jika ada row_number, langsung gunakan (update mode)
  if (data.row_number && data.row_number > 1) {
    rowIndex = data.row_number;
  } else {
    // Cari berdasarkan NIP (jika ada) untuk backward compatibility
    let targetNip = String(data.nip || "").trim();
    if (targetNip) {
      for (let i = 1; i < existingData.length; i++) {
        if (String(existingData[i][2]).trim() === targetNip) {
          rowIndex = i + 1;
          break;
        }
      }
    }
  }
  
  let rowData = [
    "", // No — diisi di bawah
    data.nama_lengkap || "",
    String(data.nip || "").trim(),
    data.golongan || "",
    data.pangkat_gol_ruang || "",
    data.tingkat_biaya || "",
    data.jabatan || "",
    data.direktorat || "",
    data.poksi || ""
  ];
  
  if (rowIndex > 1) {
    // Update: Pertahankan kolom No dari data lama
    rowData[0] = existingData[rowIndex - 1][0];
    sheet.getRange(rowIndex, 1, 1, 9).setValues([rowData]);
  } else {
    // Insert baru: Generate nomor urut
    rowData[0] = existingData.length; 
    sheet.appendRow(rowData);
  }
  
  return createResponse(true, "Data Pegawai berhasil disimpan!");
}

function deletePegawai(row_number) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER_PEGAWAI");
  if (!sheet) return createResponse(false, "Tab MASTER_PEGAWAI tidak ditemukan!");
  
  let rowNum = parseInt(row_number);
  if (!rowNum || rowNum < 2) return createResponse(false, "Row number tidak valid!");
  
  let lastRow = sheet.getLastRow();
  if (rowNum > lastRow) return createResponse(false, "Baris tidak ditemukan!");
  
  sheet.deleteRow(rowNum);
  return createResponse(true, "Data Pegawai berhasil dihapus!");
}
