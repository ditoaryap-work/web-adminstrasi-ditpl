// ==========================================
// SPJ: CRUD & Generate PDF (tab PERJADIN)
// Database: 119 kolom flat sesuai format BPK
// Template: Google Sheets → Export PDF (F4)
// ==========================================

// KOLOM INDEX MAP (0-based):
// 0         = id_perjadin (PK sistem)
// 1-8       = Identitas BPK: nomor_st, asal_instansi, nip, nama, pangkat_gol, gol, maksud_tujuan, jumlah_dibayar
// 9-14      = Tujuan & Waktu: tujuan_1, tujuan_2, tujuan_3, lama_tugas, tgl_berangkat, tgl_kembali
// 15-23     = Uang Harian 1-3 (3 fields × 3)
// 24-59     = Penginapan 1-9 (4 fields × 9)
// 60-61     = Extra columns BPK
// 62-70     = Transport 1-3 (3 fields × 3)
// 71-84     = Tiket Berangkat 1-2 (7 fields × 2)
// 85-105    = Tiket Pulang 1-3 (7 fields × 3)
// 106-108   = Taksi, Representasi, Uang Lainnya
// 109-118   = Sistem: no_spd, no_akun, jabatan, tingkat_biaya, kendaraan, tgl_perintah, tim_poksi, file_link, file_bukti, created_at

var PERJADIN_HEADERS = [
  // === SISTEM (1) ===
  "id_perjadin",
  // === BPK IDENTITAS (8) ===
  "nomor_st", "asal_instansi", "nip", "nama", "pangkat_gol", "gol", "maksud_tujuan", "jumlah_dibayar",
  // === BPK TUJUAN & WAKTU (6) ===
  "tujuan_1", "tujuan_2", "tujuan_3", "lama_tugas", "tgl_berangkat", "tgl_kembali",
  // === BPK UANG HARIAN 1-3 (9) ===
  "uh1_perhari", "uh1_hari", "uh1_total",
  "uh2_perhari", "uh2_hari", "uh2_total",
  "uh3_perhari", "uh3_hari", "uh3_total",
  // === BPK PENGINAPAN 1-9 (36) ===
  "htl1_nama", "htl1_perhari", "htl1_hari", "htl1_total",
  "htl2_nama", "htl2_perhari", "htl2_hari", "htl2_total",
  "htl3_nama", "htl3_perhari", "htl3_hari", "htl3_total",
  "htl4_nama", "htl4_perhari", "htl4_hari", "htl4_total",
  "htl5_nama", "htl5_perhari", "htl5_hari", "htl5_total",
  "htl6_nama", "htl6_perhari", "htl6_hari", "htl6_total",
  "htl7_nama", "htl7_perhari", "htl7_hari", "htl7_total",
  "htl8_nama", "htl8_perhari", "htl8_hari", "htl8_total",
  "htl9_nama", "htl9_perhari", "htl9_hari", "htl9_total",
  // === BPK EXTRA (2) ===
  "trp_extra_hari", "trp_extra_total",
  // === BPK TRANSPORT 1-3 (9) ===
  "trp1_perhari", "trp1_hari", "trp1_total",
  "trp2_perhari", "trp2_hari", "trp2_total",
  "trp3_perhari", "trp3_hari", "trp3_total",
  // === BPK TIKET BERANGKAT 1-2 (14) ===
  "tkt_brkt1_tgl", "tkt_brkt1_dari", "tkt_brkt1_ke", "tkt_brkt1_maskapai", "tkt_brkt1_kode_booking", "tkt_brkt1_no_tiket", "tkt_brkt1_harga",
  "tkt_brkt2_tgl", "tkt_brkt2_dari", "tkt_brkt2_ke", "tkt_brkt2_maskapai", "tkt_brkt2_kode_booking", "tkt_brkt2_no_tiket", "tkt_brkt2_harga",
  // === BPK TIKET PULANG 1-3 (21) ===
  "tkt_plg1_tgl", "tkt_plg1_dari", "tkt_plg1_ke", "tkt_plg1_maskapai", "tkt_plg1_kode_booking", "tkt_plg1_no_tiket", "tkt_plg1_harga",
  "tkt_plg2_tgl", "tkt_plg2_dari", "tkt_plg2_ke", "tkt_plg2_maskapai", "tkt_plg2_kode_booking", "tkt_plg2_no_tiket", "tkt_plg2_harga",
  "tkt_plg3_tgl", "tkt_plg3_dari", "tkt_plg3_ke", "tkt_plg3_maskapai", "tkt_plg3_kode_booking", "tkt_plg3_no_tiket", "tkt_plg3_harga",
  // === BPK BIAYA LAIN (3) ===
  "taksi", "representasi", "uang_lainnya",
  // === SISTEM & TEMPLATE (10) ===
  "no_spd", "no_akun", "jabatan", "tingkat_biaya", "kendaraan", "tgl_perintah",
  "tim_poksi", "file_link", "file_bukti", "created_at",
  "nomor_ls", "kode_kapoksi", "kode_mak", "uraian_pembayaran", "no_urut_spd"
];

// Column index constants for readability
var COL = {
  ID: 0,
  NOMOR_ST: 1, ASAL_INSTANSI: 2, NIP: 3, NAMA: 4, PANGKAT_GOL: 5, GOL: 6, MAKSUD: 7, JML_DIBAYAR: 8,
  TUJUAN_1: 9, TUJUAN_2: 10, TUJUAN_3: 11, LAMA: 12, TGL_BRKT: 13, TGL_KMBLI: 14,
  UH_START: 15, // 3 items × 3 fields
  HTL_START: 24, // 9 items × 4 fields
  TRP_EXTRA: 60,
  TRP_START: 62, // 3 items × 3 fields
  TKT_BRKT_START: 71, // 2 items × 7 fields
  TKT_PLG_START: 85, // 3 items × 7 fields
  TAKSI: 106, REPRESENTASI: 107, UANG_LAINNYA: 108,
  NO_SPD: 109, NO_AKUN: 110, JABATAN: 111, TINGKAT_BIAYA: 112,
  KENDARAAN: 113, TGL_PERINTAH: 114,
  TIM_POKSI: 115, FILE_LINK: 116, FILE_BUKTI: 117, CREATED: 118,
  NOMOR_LS: 119, KODE_KAPOKSI: 120, KODE_MAK: 121, URAIAN: 122, NO_URUT_SPD: 123
};

/**
 * Memastikan tab PERJADIN ada dan punya header
 */
function ensurePerjadinSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PERJADIN");
  if (!sheet) {
    sheet = ss.insertSheet("PERJADIN");
    sheet.getRange(1, 1, 1, PERJADIN_HEADERS.length).setValues([PERJADIN_HEADERS]);
    sheet.getRange(1, 1, 1, PERJADIN_HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
    SpreadsheetApp.flush();
    Logger.log("[SPJ] Tab PERJADIN dibuat: " + PERJADIN_HEADERS.length + " kolom.");
  } else {
    var firstCell = sheet.getRange(1, 1).getValue();
    if (!firstCell || String(firstCell).trim() === "") {
      sheet.getRange(1, 1, 1, PERJADIN_HEADERS.length).setValues([PERJADIN_HEADERS]);
      sheet.getRange(1, 1, 1, PERJADIN_HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
      SpreadsheetApp.flush();
    }
  }
  return sheet;
}

// ==========================================
// HELPER: Get sheet tanpa validasi header (untuk operasi READ)
// ==========================================
function getPerjadinSheet_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PERJADIN");
  if (!sheet) return null;
  return sheet;
}

// ==========================================
// GET LIST
// ==========================================
function getSpjList(tim_poksi, role) {
  var sheet = getPerjadinSheet_();
  if (!sheet) return createResponse(true, "Belum ada data", []);
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return createResponse(true, "Data SPJ ditarik", []);
  var data = sheet.getRange(1, 1, lastRow, PERJADIN_HEADERS.length).getValues();
  var result = [];

  for (var i = 1; i < data.length; i++) {
    if (!data[i][COL.ID]) continue;
    var rowTim = String(data[i][COL.TIM_POKSI] || "").trim();

    if (role !== "Super Admin" && tim_poksi !== "SEMUA" && rowTim !== tim_poksi) continue;

    var item = {
      id_perjadin: String(data[i][COL.ID]),
      nomor_st: data[i][COL.NOMOR_ST], asal_instansi: data[i][COL.ASAL_INSTANSI],
      nip: String(data[i][COL.NIP]), nama: data[i][COL.NAMA],
      pangkat_gol: data[i][COL.PANGKAT_GOL], gol: data[i][COL.GOL],
      maksud_tujuan: data[i][COL.MAKSUD], jumlah_dibayar: data[i][COL.JML_DIBAYAR],
      tujuan_1: data[i][COL.TUJUAN_1], tujuan_2: data[i][COL.TUJUAN_2], tujuan_3: data[i][COL.TUJUAN_3],
      lama_tugas: data[i][COL.LAMA], tgl_berangkat: data[i][COL.TGL_BRKT], tgl_kembali: data[i][COL.TGL_KMBLI],
      // Sub-items as arrays
      uang_harian: buildSubFlat_(data[i], COL.UH_START, 3, 3, ["perhari", "hari", "total"]),
      penginapan: buildSubFlat_(data[i], COL.HTL_START, 9, 4, ["nama", "perhari", "hari", "total"]),
      transport: buildSubFlat_(data[i], COL.TRP_START, 3, 3, ["perhari", "hari", "total"]),
      tiket_berangkat: buildSubFlat_(data[i], COL.TKT_BRKT_START, 2, 7, ["tgl", "dari", "ke", "maskapai", "kode_booking", "no_tiket", "harga"]),
      tiket_pulang: buildSubFlat_(data[i], COL.TKT_PLG_START, 3, 7, ["tgl", "dari", "ke", "maskapai", "kode_booking", "no_tiket", "harga"]),
      taksi: data[i][COL.TAKSI], representasi: data[i][COL.REPRESENTASI], uang_lainnya: data[i][COL.UANG_LAINNYA],
      // Sistem
      no_spd: data[i][COL.NO_SPD], no_akun: data[i][COL.NO_AKUN],
      jabatan: data[i][COL.JABATAN], tingkat_biaya: data[i][COL.TINGKAT_BIAYA],
      kendaraan: data[i][COL.KENDARAAN], tgl_perintah: data[i][COL.TGL_PERINTAH],
      tim_poksi: data[i][COL.TIM_POKSI],
      nomor_ls: data[i][COL.NOMOR_LS] || "",
      kode_kapoksi: data[i][COL.KODE_KAPOKSI] || "",
      kode_mak: data[i][COL.KODE_MAK] || "",
      uraian_pembayaran: data[i][COL.URAIAN] || "",
      no_urut_spd: data[i][COL.NO_URUT_SPD] || "",
      file_link: data[i][COL.FILE_LINK] || "", file_bukti: data[i][COL.FILE_BUKTI] || "",
      created_at: data[i][COL.CREATED] ? Utilities.formatDate(new Date(data[i][COL.CREATED]), Session.getScriptTimeZone(), "dd MMM yyyy HH:mm") : ""
    };
    result.push(item);
  }
  result.reverse();
  return createResponse(true, "Data SPJ ditarik", result);
}

function buildSubFlat_(row, startIdx, maxItems, fieldsPerItem, fieldNames) {
  var items = [];
  for (var i = 0; i < maxItems; i++) {
    var offset = startIdx + (i * fieldsPerItem);
    var hasData = false;
    var item = {};
    for (var f = 0; f < fieldNames.length; f++) {
      var val = row[offset + f];
      item[fieldNames[f]] = val !== undefined ? val : "";
      if (val && String(val).trim() !== "" && String(val) !== "0") hasData = true;
    }
    if (hasData) items.push(item);
  }
  return items;
}

// ==========================================
// SAVE
// ==========================================
function saveSpj(spjData, fileDetails) {
  var sheet = ensurePerjadinSheet_();
  var lastRow = sheet.getLastRow();
  var rowIndex = -1;
  var targetId = String(spjData.id_perjadin || "").trim();

  if (targetId && lastRow > 1) {
    var idList = sheet.getRange(1, 1, lastRow, 1).getValues();
    for (var i = 1; i < idList.length; i++) {
      if (String(idList[i][0]).trim() === targetId) { rowIndex = i + 1; break; }
    }
  } else if (!targetId) {
    targetId = "SPJ-" + Utilities.getUuid();
    spjData.id_perjadin = targetId;
  }

  var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  var createdAt = nowStr;
  if (rowIndex > 1) {
    try {
      var existing = sheet.getRange(rowIndex, 1, 1, PERJADIN_HEADERS.length).getValues()[0];
      if (existing[COL.CREATED]) createdAt = existing[COL.CREATED];
    } catch(e) {}
  }

  // === Upload Bukti ===
  var fileBuktiUrl = spjData.file_bukti || "";
  if (fileDetails && fileDetails.length > 0) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var configSheet = ss.getSheetByName("CONFIG");
    if (configSheet) {
      var configData = configSheet.getDataRange().getValues();
      var spjFolderId = "";
      for (var c = 1; c < configData.length; c++) {
        if (String(configData[c][0]).trim() === String(spjData.tim_poksi).trim()) {
          spjFolderId = String(configData[c][9] || "").trim();
          break;
        }
      }
      if (spjFolderId) {
        var uploadedUrls = [];
        if (fileBuktiUrl) uploadedUrls.push(fileBuktiUrl);
        for (var f = 0; f < fileDetails.length; f++) {
          if (!fileDetails[f].base64) continue;
          try {
            var folder = DriveApp.getFolderById(spjFolderId);
            var blob = Utilities.newBlob(Utilities.base64Decode(fileDetails[f].base64), fileDetails[f].mimeType, fileDetails[f].filename);
            var driveFile = folder.createFile(blob);
            driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            uploadedUrls.push(driveFile.getUrl());
          } catch(err) { 
            Logger.log("[SPJ] Upload gagal: " + err.toString()); 
            return createResponse(false, "Gagal mengunggah lampiran gambar ke Google Drive: " + err.toString());
          }
        }
        fileBuktiUrl = uploadedUrls.join(", ");
      }
    }
  }

  // === Flatten all data ke row array ===
  var rowData = new Array(PERJADIN_HEADERS.length);
  for (var x = 0; x < rowData.length; x++) rowData[x] = "";

  // Identitas BPK
  rowData[COL.ID] = targetId;
  rowData[COL.NOMOR_ST] = spjData.nomor_st || "";
  rowData[COL.ASAL_INSTANSI] = spjData.asal_instansi || "Direktorat PL";
  rowData[COL.NIP] = String(spjData.nip || "");
  rowData[COL.NAMA] = spjData.nama || "";
  rowData[COL.PANGKAT_GOL] = spjData.pangkat_gol || "";
  rowData[COL.GOL] = spjData.gol || "";
  rowData[COL.MAKSUD] = spjData.maksud_tujuan || "";
  rowData[COL.JML_DIBAYAR] = spjData.jumlah_dibayar || 0;

  // Tujuan & Waktu
  rowData[COL.TUJUAN_1] = spjData.tujuan_1 || "";
  rowData[COL.TUJUAN_2] = spjData.tujuan_2 || "";
  rowData[COL.TUJUAN_3] = spjData.tujuan_3 || "";
  rowData[COL.LAMA] = spjData.lama_tugas || "";
  rowData[COL.TGL_BRKT] = spjData.tgl_berangkat || "";
  rowData[COL.TGL_KMBLI] = spjData.tgl_kembali || "";

  // Uang Harian 1-3
  var uh = spjData.uang_harian || [];
  for (var u = 0; u < 3; u++) {
    var uhItem = uh[u] || {};
    var uhBase = COL.UH_START + (u * 3);
    rowData[uhBase] = uhItem.perhari || "";
    rowData[uhBase + 1] = uhItem.hari || "";
    rowData[uhBase + 2] = uhItem.total || "";
  }

  // Penginapan 1-9
  var htl = spjData.penginapan || [];
  for (var h = 0; h < 9; h++) {
    var htlItem = htl[h] || {};
    var htlBase = COL.HTL_START + (h * 4);
    rowData[htlBase] = htlItem.nama || "";
    rowData[htlBase + 1] = htlItem.perhari || "";
    rowData[htlBase + 2] = htlItem.hari || "";
    rowData[htlBase + 3] = htlItem.total || "";
  }

  // Transport 1-3
  var trp = spjData.transport || [];
  for (var t = 0; t < 3; t++) {
    var trpItem = trp[t] || {};
    var trpBase = COL.TRP_START + (t * 3);
    rowData[trpBase] = trpItem.perhari || "";
    rowData[trpBase + 1] = trpItem.hari || "";
    rowData[trpBase + 2] = trpItem.total || "";
  }

  // Tiket Berangkat 1-2
  var tktB = spjData.tiket_berangkat || [];
  for (var tb = 0; tb < 2; tb++) {
    var tktBItem = tktB[tb] || {};
    var tbBase = COL.TKT_BRKT_START + (tb * 7);
    rowData[tbBase] = tktBItem.tgl || "";
    rowData[tbBase + 1] = tktBItem.dari || "";
    rowData[tbBase + 2] = tktBItem.ke || "";
    rowData[tbBase + 3] = tktBItem.maskapai || "";
    rowData[tbBase + 4] = tktBItem.kode_booking || "";
    rowData[tbBase + 5] = tktBItem.no_tiket || "";
    rowData[tbBase + 6] = tktBItem.harga || "";
  }

  // Tiket Pulang 1-3
  var tktP = spjData.tiket_pulang || [];
  for (var tp = 0; tp < 3; tp++) {
    var tktPItem = tktP[tp] || {};
    var tpBase = COL.TKT_PLG_START + (tp * 7);
    rowData[tpBase] = tktPItem.tgl || "";
    rowData[tpBase + 1] = tktPItem.dari || "";
    rowData[tpBase + 2] = tktPItem.ke || "";
    rowData[tpBase + 3] = tktPItem.maskapai || "";
    rowData[tpBase + 4] = tktPItem.kode_booking || "";
    rowData[tpBase + 5] = tktPItem.no_tiket || "";
    rowData[tpBase + 6] = tktPItem.harga || "";
  }

  // Biaya Lain
  rowData[COL.TAKSI] = spjData.taksi || "";
  rowData[COL.REPRESENTASI] = spjData.representasi || "";
  rowData[COL.UANG_LAINNYA] = spjData.uang_lainnya || "";

  // Sistem
  rowData[COL.NO_SPD] = spjData.no_spd || "";
  rowData[COL.NO_AKUN] = spjData.no_akun || "";
  rowData[COL.JABATAN] = spjData.jabatan || "";
  rowData[COL.TINGKAT_BIAYA] = spjData.tingkat_biaya || "";
  rowData[COL.KENDARAAN] = spjData.kendaraan || "";
  rowData[COL.TGL_PERINTAH] = spjData.tgl_perintah || "";
  rowData[COL.TIM_POKSI] = spjData.tim_poksi || "";
  rowData[COL.NOMOR_LS] = spjData.nomor_ls || "";
  rowData[COL.KODE_KAPOKSI] = spjData.kode_kapoksi || "";
  rowData[COL.KODE_MAK] = spjData.kode_mak || "";
  rowData[COL.URAIAN] = spjData.uraian_pembayaran || "";
  rowData[COL.NO_URUT_SPD] = spjData.no_urut_spd || "";
  rowData[COL.FILE_LINK] = "";
  rowData[COL.FILE_BUKTI] = fileBuktiUrl;
  rowData[COL.CREATED] = createdAt;

  // SpreadsheetApp.flush(); // Dihapus untuk menghemat IO karena flush berat, dipindah ke tahap akhir jika tidak ekspor PDF

  // === Validasi Data Integrity ===
  // Memastikan bahwa jumlah yang dibayar valid dan tidak kena manipulasi frontend
  var calcTotalUh = 0, calcTotalHtl = 0, calcTotalTrp = 0, calcTotalTkt = 0;
  var uhArr = spjData.uang_harian || [];
  for (var c1 = 0; c1 < 3; c1++) { calcTotalUh += Number((uhArr[c1]||{}).total) || 0; }
  var htlArr = spjData.penginapan || [];
  for (var c2 = 0; c2 < 9; c2++) { calcTotalHtl += Number((htlArr[c2]||{}).total) || 0; }
  var trpArr = spjData.transport || [];
  for (var c3 = 0; c3 < 3; c3++) { calcTotalTrp += Number((trpArr[c3]||{}).total) || 0; }
  var tktBArr = spjData.tiket_berangkat || [];
  for (var c4 = 0; c4 < 2; c4++) { calcTotalTkt += Number((tktBArr[c4]||{}).harga) || 0; }
  var tktPArr = spjData.tiket_pulang || [];
  for (var c5 = 0; c5 < 3; c5++) { calcTotalTkt += Number((tktPArr[c5]||{}).harga) || 0; }
  var grandTotalBackend = calcTotalUh + calcTotalHtl + calcTotalTrp + calcTotalTkt + (Number(spjData.taksi)||0) + (Number(spjData.representasi)||0) + (Number(spjData.uang_lainnya)||0);
  rowData[COL.JML_DIBAYAR] = grandTotalBackend; // Timpa hasil dari Frontend

  if (rowIndex > -1) {
    sheet.getRange(rowIndex, 1, 1, PERJADIN_HEADERS.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
    var allData = sheet.getDataRange().getValues();
    for (var k = allData.length - 1; k >= 1; k--) {
      if (String(allData[k][0]).trim() === targetId) { rowIndex = k + 1; break; }
    }
  }

  // Auto Generate PDF
  try {
    var pdfUrl = generateSpjPdf_(targetId, rowIndex, fileDetails);
    if (pdfUrl && String(pdfUrl).indexOf("http") === 0) {
      return createResponse(true, "Data disimpan & PDF berhasil dibuat.", { id_perjadin: targetId, file_link: pdfUrl, file_bukti: fileBuktiUrl });
    } else {
      return createResponse(true, "Data disimpan, tapi PDF gagal: " + pdfUrl, { id_perjadin: targetId, file_bukti: fileBuktiUrl });
    }
  } catch (pdfErr) {
    return createResponse(true, "Data disimpan, tapi PDF error: " + pdfErr.toString(), { id_perjadin: targetId, file_bukti: fileBuktiUrl });
  }
}

// ==========================================
// DELETE
// ==========================================
function deleteSpj(id_perjadin) {
  var sheet = ensurePerjadinSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return createResponse(false, "Data SPJ tidak ditemukan.");
  
  var targetId = String(id_perjadin).trim();
  var idList = sheet.getRange(1, 1, lastRow, 1).getValues();
  
  for (var i = 1; i < idList.length; i++) {
    if (String(idList[i][0]).trim() === targetId) {
      sheet.deleteRow(i + 1);
      return createResponse(true, "Data SPJ berhasil dihapus.");
    }
  }
  return createResponse(false, "Data SPJ tidak ditemukan.");
}

// ==========================================
// GENERATE PDF — Google Sheets Template
// Hanya placeholder yang ada di template Kuitansi & SPD
// ==========================================
function generateSpjPdf_(id_perjadin, knownRowIndex, fileDetails) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PERJADIN");
  var configSheet = ss.getSheetByName("CONFIG");
  if (!sheet || !configSheet) return "ERR: Sheet PERJADIN/CONFIG tidak ditemukan";

  var lastRow = sheet.getLastRow();
  var row = null;
  var rowIndex = knownRowIndex || -1;

  if (rowIndex > 0) {
     row = sheet.getRange(rowIndex, 1, 1, PERJADIN_HEADERS.length).getValues()[0];
  } else {
    var idList = sheet.getRange(1, 1, lastRow, 1).getValues();
    for (var i = 1; i < idList.length; i++) {
      if (String(idList[i][0]).trim() === String(id_perjadin).trim()) {
        rowIndex = i + 1;
        row = sheet.getRange(rowIndex, 1, 1, PERJADIN_HEADERS.length).getValues()[0];
        break;
      }
    }
  }
  
  if (!row) return "ERR: Data ID " + id_perjadin + " tidak ditemukan";

  var tim_poksi = String(row[COL.TIM_POKSI]).trim();
  var configData = configSheet.getDataRange().getValues();
  var templateId = "", folderId = "";
  for (var j = 1; j < configData.length; j++) {
    if (String(configData[j][0]).trim() === tim_poksi) {
      folderId = String(configData[j][9] || "").trim();
      templateId = String(configData[j][10] || "").trim();
      break;
    }
  }
  if (!templateId) return "ERR: template_id_spj_sheet kosong";
  if (!folderId) return "ERR: folder_id_spj kosong";

  try {
    var templateFile = DriveApp.getFileById(templateId);
    var destFolder = DriveApp.getFolderById(folderId);
    var nama = String(row[COL.NAMA] || "NoName").replace(/\s+/g, '_');
    var tglPergi = formatTglIndo_(row[COL.TGL_BRKT]);
    var fileName = tglPergi.replace(/\s+/g, '_') + " - SPJ & Kuitansi - " + nama;

    var copy = templateFile.makeCopy(fileName, destFolder);
    var copyId = copy.getId();
    var copySS = SpreadsheetApp.openById(copyId);

    // === Hitung total untuk placeholder ===
    var totalUH = 0, totalHTL = 0, totalTiket = 0, totalTransport = 0;
    for (var u = 0; u < 3; u++) totalUH += Number(row[COL.UH_START + (u * 3) + 2]) || 0;
    for (var h = 0; h < 9; h++) totalHTL += Number(row[COL.HTL_START + (h * 4) + 3]) || 0;
    for (var t = 0; t < 3; t++) totalTransport += Number(row[COL.TRP_START + (t * 3) + 2]) || 0;
    // Total tiket = semua harga tiket berangkat + pulang
    for (var tb = 0; tb < 2; tb++) totalTiket += Number(row[COL.TKT_BRKT_START + (tb * 7) + 6]) || 0;
    for (var tp = 0; tp < 3; tp++) totalTiket += Number(row[COL.TKT_PLG_START + (tp * 7) + 6]) || 0;
    var taksi = Number(row[COL.TAKSI]) || 0;
    var representasi = Number(row[COL.REPRESENTASI]) || 0;
    var uangLainnya = Number(row[COL.UANG_LAINNYA]) || 0;
    var grandTotal = totalUH + totalHTL + totalTiket + totalTransport + taksi + representasi + uangLainnya;

    // === Daftar PLACEHOLDER → VALUE ===
    var rep = {
      "{{NAMA}}": String(row[COL.NAMA] || "-"),
      "{{NIP}}": String(row[COL.NIP] || "-"),
      "{{PANGKAT_GOL}}": String(row[COL.PANGKAT_GOL] || "-"),
      "{{JABATAN}}": String(row[COL.JABATAN] || "-"),
      "{{TINGKAT_BIAYA}}": String(row[COL.TINGKAT_BIAYA] || "-"),
      "{{NO_SPD}}": String(row[COL.NO_SPD] || "-"),
      "{{NO_AKUN}}": String(row[COL.NO_AKUN] || "-"),
      "{{BUNYI_AKUN}}": String(row[COL.MAKSUD] || "-"),
      "{{TUJUAN_LENGKAP}}": String(row[COL.TUJUAN_1] || "-"),
      "{{LAMA_PERJALANAN}}": String(row[COL.LAMA] || "-"),
      "{{TGL_PERGI}}": formatTglIndo_(row[COL.TGL_BRKT]),
      "{{TGL_PULANG}}": formatTglIndo_(row[COL.TGL_KMBLI]),
      "{{TGL_PELAKSANAAN}}": formatTglIndo_(row[COL.TGL_BRKT]),
      "{{TGL_PERINTAH}}": formatTglIndo_(row[COL.TGL_PERINTAH]),
      "{{KENDARAAN}}": String(row[COL.KENDARAAN] || "-"),
      "{{TOTAL_BIAYA_RIL}}": fmtRp_(grandTotal),
      "{{TOTAL_BIAYA_RIIL}}": fmtRp_(grandTotal),
      "{{TERBILANG_TOTAL}}": terbilang_(grandTotal).trim() + " Rupiah",
      "{{TOTAL_TIKET}}": fmtRp_(totalTiket),
      "{{TOTAL_TAXI}}": fmtRp_(taksi),
      "{{UANG_REPRESENTATIF}}": fmtRp_(representasi)
    };

    // Uang Harian 1-3 placeholders
    for (var pu = 0; pu < 3; pu++) {
      var puBase = COL.UH_START + (pu * 3);
      var n = pu + 1;
      rep["{{HARI_" + n + "}}"] = row[puBase + 1] || "";
      rep["{{UH_" + n + "}}"] = fmtRp_(row[puBase]);
      rep["{{TOTAL_UH_" + n + "}}"] = fmtRp_(row[puBase + 2]);
    }

    // Penginapan 1-9 placeholders (template max biasanya 4, tapi kita pasang semua)
    for (var ph = 0; ph < 9; ph++) {
      var phBase = COL.HTL_START + (ph * 4);
      var hn = ph + 1;
      rep["{{NAMA_HOTEL_" + hn + "}}"] = row[phBase] || "";
      rep["{{MALAM_HOTEL_" + hn + "}}"] = row[phBase + 2] || "";
      rep["{{TARIF_HOTEL_" + hn + "}}"] = fmtRp_(row[phBase + 1]);
      rep["{{BIAYA_HOTEL_" + hn + "}}"] = fmtRp_(row[phBase + 3]);
    }

    // Apply replacements
    var sheets = copySS.getSheets();
    for (var s = 0; s < sheets.length; s++) {
      for (var placeholder in rep) {
        sheets[s].createTextFinder(placeholder).matchEntireCell(false).replaceAllWith(rep[placeholder]);
      }
    }

    // === Insert LAMPIRAN BUKTI (Images) ===
    if (fileDetails && fileDetails.length > 0) {
      try {
        var buktiSheet = copySS.insertSheet("LAMPIRAN BUKTI");
        buktiSheet.setColumnWidth(1, 750); 
        var currentYRow = 1;
        for (var f = 0; f < fileDetails.length; f++) {
          if (!fileDetails[f].base64) continue;
          var blobImg = Utilities.newBlob(Utilities.base64Decode(fileDetails[f].base64), fileDetails[f].mimeType, fileDetails[f].filename);
          buktiSheet.insertImage(blobImg, 1, currentYRow);
          currentYRow += 45; // jarak tiap lampiran
        }
      } catch(e) { Logger.log("Gagal insert image lampiran: " + e.toString()); }
    }

    SpreadsheetApp.flush();

    // === Export PDF ===
    var token = ScriptApp.getOAuthToken();
    var exportUrl = "https://docs.google.com/spreadsheets/d/" + copyId + "/export?" +
      "format=pdf&size=legal&portrait=true&fitw=true&gridlines=false&printtitle=false&sheetnames=false&pagenum=false&fzr=false" +
      "&top_margin=0.5&bottom_margin=0.5&left_margin=0.5&right_margin=0.5";

    var response = UrlFetchApp.fetch(exportUrl, { headers: { Authorization: "Bearer " + token }, muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) return "ERR: Export PDF HTTP " + response.getResponseCode();

    var pdfBlob = response.getBlob().setName(fileName + ".pdf");
    var pdfFile = destFolder.createFile(pdfBlob);
    var pdfUrl = pdfFile.getUrl();

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, COL.FILE_LINK + 1).setValue(pdfUrl);
      SpreadsheetApp.flush();
    }

    try { DriveApp.getFileById(copyId).setTrashed(true); } catch(e) {}
    return pdfUrl;

  } catch (err) {
    Logger.log("[SPJ] PDF Error: " + err.toString());
    return "Error: " + err.toString();
  }
}

// ==========================================
// HELPERS
// ==========================================
function fmtRp_(a) {
  if (a === undefined || a === null || a === "") return "Rp. 0";
  var n = typeof a === 'string' ? parseFloat(String(a).replace(/[^0-9.-]+/g, "")) : Number(a);
  if (isNaN(n)) n = 0;
  return "Rp. " + Math.round(n).toLocaleString('id-ID');
}

function formatTglIndo_(d) {
  if (!d) return "-";
  var p = (d instanceof Date) ? d : new Date(d);
  if (isNaN(p.getTime())) return String(d);
  var bln = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  var tgl = p.getDate(); if (tgl < 10) tgl = "0" + tgl;
  return tgl + " " + bln[p.getMonth()] + " " + p.getFullYear();
}

function terbilang_(a) {
  var b = ['','Satu','Dua','Tiga','Empat','Lima','Enam','Tujuh','Delapan','Sembilan','Sepuluh','Sebelas'];
  var k = ''; a = Math.floor(a);
  if (a < 12) k = b[a];
  else if (a < 20) k = terbilang_(a - 10) + ' Belas';
  else if (a < 100) k = terbilang_(Math.floor(a / 10)) + ' Puluh ' + terbilang_(a % 10);
  else if (a < 200) k = 'Seratus ' + terbilang_(a - 100);
  else if (a < 1000) k = terbilang_(Math.floor(a / 100)) + ' Ratus ' + terbilang_(a % 100);
  else if (a < 2000) k = 'Seribu ' + terbilang_(a - 1000);
  else if (a < 1000000) k = terbilang_(Math.floor(a / 1000)) + ' Ribu ' + terbilang_(a % 1000);
  else if (a < 1000000000) k = terbilang_(Math.floor(a / 1000000)) + ' Juta ' + terbilang_(a % 1000000);
  return k.replace(/\s+/g, ' ').trim();
}
