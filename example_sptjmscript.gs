function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('AutoFill Docs');
  menu.addItem('AutoFill SPTJM', 'createAutoFillSPTJM')
  menu.addToUi();
}

function formatRupiah(amount) {
  return 'Rp. ' + Math.round(amount).toLocaleString('id-ID');
}

function formatTanggalIndonesia(date) {
  if (!(date instanceof Date)) {
    return date; // Jika bukan objek Date, kembalikan nilai aslinya
  }

  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const tanggal = date.getDate();
  const namaBulan = bulan[date.getMonth()];
  const tahun = date.getFullYear();

  return `${tanggal} ${namaBulan} ${tahun}`;
}

// 1EsoVnGM254Nc5E4CJwUA-ZMHx-fkV0vu

function createAutoFillSPTJM() {
  const googleDocTemplateId = '1y7ZlIYXhCzm0nuHpC7RbheTVK5vvckPffjBGN9E_C_0'; 
  const destinationFolderId = '1N69VOvwUQLxWfhvAH1LG0H7kQHipj65w'; 
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SPTJM');

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  // Ambil SATU BARIS saja (baris terakhir)
  const row = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];

  // Cek apakah URL PDF sudah ada → kalau sudah, STOP
  const pdfUrl = row[11]; // kolom L → index 11
  if (pdfUrl && pdfUrl.toString().trim() !== "") {
    Logger.log("Baris terakhir sudah punya PDF. Tidak diproses ulang.");
    return;
  }

  try {
    const templateFile = DriveApp.getFileById(googleDocTemplateId); 
    const destinationFolder = DriveApp.getFolderById(destinationFolderId); 

    const copy = templateFile.makeCopy(`${row[5]}-SPTJM-${row[1]}`, destinationFolder);
    const doc = DocumentApp.openById(copy.getId());
    const body = doc.getBody();

    const tiketBerangkat = formatRupiah(row[6]);
    const tiketPulang = formatRupiah(row[7]);
    const total = formatRupiah(row[8]);
    const biayaSBM = formatRupiah(row[9]);

    // MAPPING TIDAK DIUBAH
    body.replaceText('{{Nama Lengkap}}', row[1]);
    body.replaceText('{{Nama}}', row[1]);
    body.replaceText('{{NIP}}', row[2]);
    body.replaceText('{{Jabatan}}', row[3]);
    body.replaceText('{{Tujuan}}', row[4]);
    body.replaceText('{{Tanggal}}', formatTanggalIndonesia(row[5]));
    body.replaceText('{{Tiket Berangkat}}', tiketBerangkat);
    body.replaceText('{{Tiket Pulang}}', tiketPulang);
    body.replaceText('{{Total}}', total);
    body.replaceText('{{Biaya SBM}}', biayaSBM);
    body.replaceText('{{Tanggal TTD}}', formatTanggalIndonesia(row[10]));
    body.replaceText('{{Terbilang}}', terbilang(row[8]).trim());
    body.replaceText('{{NIP BAWAH}}', 'NIP. ' + row[2]);

    doc.saveAndClose();

    // Buat PDF
    const pdfBlob = DriveApp.getFileById(copy.getId()).getAs('application/pdf');
    const pdfFile = destinationFolder.createFile(pdfBlob);
    pdfFile.setName(`${row[5]}-SPTJM-${row[1]}.pdf`);

    // Simpan URL ke kolom L baris terakhir
    sheet.getRange(lastRow, 12).setValue(pdfFile.getUrl());

    // Hapus Google Docs
    DriveApp.getFileById(copy.getId()).setTrashed(true);

    Logger.log(`PDF dibuat untuk ${row[1]}`);

  } catch (err) {
    Logger.log("Error row " + lastRow + ": " + err);
  }
}
