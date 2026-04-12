// ==========================================
// CONFIG: Pengaturan Folder & Template (tab CONFIG)
// Kolom: A=tim_poksi | B=folder_id_spt | C=folder_id_sptjm 
//        D=template_id_spt_v1 | E=template_id_spt_v2 | F=template_id_sptjm
// ==========================================

function getConfig() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CONFIG");
  if (!sheet) return createResponse(false, "Tab CONFIG tidak ditemukan!");
  
  let data = sheet.getDataRange().getValues();
  let result = [];
  
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    result.push({
      tim_poksi: String(data[i][0]).trim(),
      folder_id_spt: data[i][1] || "",
      folder_id_sptjm: data[i][2] || "",
      template_id_spt_v1: data[i][3] || "",
      template_id_spt_v2: data[i][4] || "",
      template_id_sptjm: data[i][5] || "",
      folder_id_surat_masuk: data[i][6] || "",
      folder_id_surat_keluar: data[i][7] || "",
      folder_id_notulensi: data[i][8] || ""
    });
  }
  
  return createResponse(true, "Konfigurasi ditarik", result);
}
