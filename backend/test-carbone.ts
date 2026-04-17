import { generatePdfFromDocx } from './src/services/pdf.service';
import * as fs from 'fs';
import * as path from 'path';

async function testCarbone() {
  const templatePath = path.resolve(__dirname, 'template', '1_Template_SPT_v1.docx');
  const outputPath = path.resolve(__dirname, 'template', 'OUTPUT_TEST_SPT.pdf');

  console.log(`Menguji konversi template: ${templatePath}`);

  // Dummy Data
  // Data ini dicocokkan dengan tag Carbone yang ada di file DOCX (mis. {d.nomor_surat})
  const dummyData = {
    nomor_surat: "123/ST/DIT-PL/2026",
    maksud_perjalanan: "Pengawasan Area Sawah Baru",
    tanggal_surat: "17 April 2026",
    kegiatan: "Monitoring Eksekusi",
    mak: "018.13.001",
    // Field array untuk testing tabel jika mengaplikasikan {d.peserta[i].nama_lengkap} dsb.
    peserta: [
      {
        no: 1,
        nama_lengkap: "Dito Arya P.",
        gol: "III/b",
        nip: "199001012020121001",
        tujuan: "Sumatera Selatan",
        tanggal_pelaksanaan: "18-20 April 2026"
      },
      {
        no: 2,
        nama_lengkap: "Budi Santoso",
        gol: "III/a",
        nip: "199201012022121002",
        tujuan: "Sumatera Selatan",
        tanggal_pelaksanaan: "18-20 April 2026"
      }
    ]
  };

  try {
    console.log("Menjalankan proses Carbone...");
    const pdfBuffer = await generatePdfFromDocx(templatePath, dummyData);
    
    // Tulis output ke file PDF
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`\nBerhasil! File PDF berhasil di-generate dan disimpan di: ${outputPath}`);
    console.log(`Silakan buka file OUTPUT_TEST_SPT.pdf untuk melihat hasilnya.`);
  } catch (error) {
    console.error("Gagal melakukan konversi:", error);
  }
}

testCarbone();
