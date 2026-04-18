import { generatePdfFromDocx } from './src/services/pdf.service';
import * as fs from 'fs';
import * as path from 'path';

async function testDocxTemplater() {
  // Ganti path ke template yang masih menggunakan format {{variabel}} misal 1_Template_SPT_v1.docx
  // Pastikan Anda masih punya file template aslinya!
  const templatePath = path.resolve(__dirname, 'template', '1_Template_SPT_v1.docx');
  const outputPath = path.resolve(__dirname, 'template', 'OUTPUT_TEST_DOCXTEMP.pdf');

  console.log(`Menguji konversi template dengan docxtemplater: ${templatePath}`);

  // Dummy Data sesuai format tag {{...}} di file DOCX Anda
  const dummyData = {
    nomor_surat: "123/ST/DIT-PL/2026",
    maksud_perjalanan: "Pengawasan Area Sawah Baru (Native DOCX Temp)",
    tanggal_surat: "17 April 2026",
    kegiatan: "Monitoring Eksekusi Cepat",
    mak: "018.13.001",
    // NOTE: Harus diubah tag docx-nya jadi {#peserta} di awal TR dan {/peserta} di akhir TR
    peserta: [
      {
        no: 1,
        nama_lengkap: "Dito Arya P.",
        gol: "III/b",
        nip: "199001012020121001",
        tujuan: "Palembang, Sumsel",
        tanggal_pelaksanaan: "18 s.d 21 April 2026"
      },
      {
        no: 2,
        nama_lengkap: "Budi Santoso",
        gol: "III/a",
        nip: "199201012022121002",
        tujuan: "Palembang, Sumsel",
        tanggal_pelaksanaan: "18 s.d 21 April 2026"
      }
    ]
  };

  try {
    console.log("Menjalankan pipeline DocxTemplater + CLI LibreOffice...");
    const start = Date.now();
    const pdfBuffer = await generatePdfFromDocx(templatePath, dummyData);
    const end = Date.now();
    
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`\n✅ Berhasil! File PDF dibuat dalam ${(end - start) / 1000} detik.`);
    console.log(`Disimpan di: ${outputPath}`);
  } catch (error) {
    console.error("❌ Gagal melakukan konversi:", error);
  }
}

testDocxTemplater();
