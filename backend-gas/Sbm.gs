// ==========================================
// SBM: Referensi Standar Biaya Masukan
// ==========================================

function getSbmList() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SBM");
  if (!sheet) return createResponse(false, "Tab SBM tidak ditemukan di Google Sheets!");
  
  let data = sheet.getDataRange().getValues();
  let result = [];
  
  // Headers start at row 0, data starts at row 1.
  // [1] Ibu Kota Kabupaten 
  // [5] Tujuan2 
  // [9] Uang Harian
  // [16] P. Bisnis (Col Q)
  // [17] P. Ekonomi (Col R)
  // [18] Airport Tax (Col S)
  // [19] Taxi Jakarta (Col T)
  // [20] Taxi Daerah (Col U)
  
  for (let i = 1; i < data.length; i++) {
    if (!data[i][1]) continue; // Skip if 'Ibu Kota Kabupaten' is empty
    
    result.push({
      ibu_kota: String(data[i][1]).trim(),
      tujuan_lengkap: data[i][5] ? String(data[i][5]).trim() : "",
      uang_harian: data[i][9] || 0,
      tiket_bisnis: data[i][16] || 0,
      tiket_ekonomi: data[i][17] || 0,
      airport_tax: data[i][18] || 0,
      taxi_jakarta: data[i][19] || 0,
      taxi_daerah: data[i][20] || 0
    });
  }
  
  return createResponse(true, "Data referensi SBM ditarik", result);
}
