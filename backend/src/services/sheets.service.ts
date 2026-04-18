import { google } from 'googleapis';
import { db } from '../db';
import { perjadin, config, pegawai, sbm, users, spt, sptjm, surat } from '../db/schema';
import { eq, sql, desc } from 'drizzle-orm';

// Inisialisasi Auth menggunakan Service Account (Scope Sheets & Drive)
// Inisialisasi Auth menggunakan OAuth2 (Personal/Workspace Account - No Quota Limit)
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

/**
 * Mapping data dari object PostgreSQL (perjadin) ke format Flat Array (123+ kolom) 
 * sesuai dengan struktur legacy Google Sheets.
 */
export function mapToSheetRow(data: any): any[] {
  const row = new Array(124).fill('');

  // 0: id_perjadin
  row[0] = data.id || '';
  // 1-8: Identitas BPK
  row[1] = data.nomorSt || '';
  row[2] = data.asalInstansi || 'Direktorat PL';
  row[3] = data.nip || '';
  row[4] = data.nama || '';
  row[5] = data.pangkatGol || '';
  row[6] = data.gol || '';
  row[7] = data.maksudTujuan || '';
  row[8] = data.jumlahDibayar || 0;

  // 9-14: Tujuan & Waktu
  row[9] = data.tujuan1 || '';
  row[10] = data.tujuan2 || '';
  row[11] = data.tujuan3 || '';
  row[12] = data.lamaTugas || '';
  row[13] = data.tglBerangkat || '';
  row[14] = data.tglKembali || '';

  // 15-23: Uang Harian 1-3 (3 fields x 3)
  const uh = Array.isArray(data.uangHarian) ? data.uangHarian : [];
  for (let i = 0; i < 3; i++) {
    const item = uh[i] || {};
    const base = 15 + (i * 3);
    row[base] = item.perhari || '';
    row[base + 1] = item.hari || '';
    row[base + 2] = item.total || '';
  }

  // 24-59: Penginapan 1-9 (4 fields x 9)
  const htl = Array.isArray(data.penginapan) ? data.penginapan : [];
  for (let i = 0; i < 9; i++) {
    const item = htl[i] || {};
    const base = 24 + (i * 4);
    row[base] = item.nama || '';
    row[base + 1] = item.perhari || '';
    row[base + 2] = item.hari || '';
    row[base + 3] = item.total || '';
  }

  // 60-61: Extra columns (BPK)
  row[60] = data.trpExtraHari || '';
  row[61] = data.trpExtraTotal || '';

  // 62-70: Transport 1-3 (3 fields x 3)
  const trp = Array.isArray(data.transport) ? data.transport : [];
  for (let i = 0; i < 3; i++) {
    const item = trp[i] || {};
    const base = 62 + (i * 3);
    row[base] = item.perhari || '';
    row[base + 1] = item.hari || '';
    row[base + 2] = item.total || '';
  }

  // 71-84: Tiket Berangkat 1-2 (7 fields x 2)
  const tktB = Array.isArray(data.tiketBerangkat) ? data.tiketBerangkat : [];
  for (let i = 0; i < 2; i++) {
    const item = tktB[i] || {};
    const base = 71 + (i * 7);
    row[base] = item.tgl || '';
    row[base + 1] = item.dari || '';
    row[base + 2] = item.ke || '';
    row[base + 3] = item.maskapai || '';
    row[base + 4] = item.kode_booking || '';
    row[base + 5] = item.no_tiket || '';
    row[base + 6] = item.harga || '';
  }

  // 85-105: Tiket Pulang 1-3 (7 fields x 3)
  const tktP = Array.isArray(data.tiketPulang) ? data.tiketPulang : [];
  for (let i = 0; i < 3; i++) {
    const item = tktP[i] || {};
    const base = 85 + (i * 7);
    row[base] = item.tgl || '';
    row[base + 1] = item.dari || '';
    row[base + 2] = item.ke || '';
    row[base + 3] = item.maskapai || '';
    row[base + 4] = item.kode_booking || '';
    row[base + 5] = item.no_tiket || '';
    row[base + 6] = item.harga || '';
  }

  // 106-108: Biaya Lain
  row[106] = data.taksi || 0;
  row[107] = data.representasi || 0;
  row[108] = data.uangLainnya || 0;

  // 109-118: Sistem
  row[109] = data.noSpd || '';
  row[110] = data.noAkun || '';
  row[111] = data.jabatan || '';
  row[112] = data.tingkatBiaya || '';
  row[113] = data.kendaraan || '';
  row[114] = data.tglPerintah || '';
  row[115] = data.timPoksi || '';
  row[116] = data.fileLink || '';
  row[117] = data.fileBukti || '';
  row[118] = data.createdAt ? new Date(data.createdAt).toISOString() : '';

  // 119-123: Extended BPK
  row[119] = data.nomorLs || '';
  row[120] = data.kodeKapoksi || '';
  row[121] = data.kodeMak || '';
  row[122] = data.uraianPembayaran || '';
  row[123] = data.noUrutSpd || '';

  return row;
}

/**
 * Sinkronisasi data SPJ ke sheet PERJADIN.
 * Mendukung penambahan baris baru atau update baris berdasarkan ID.
 */
export async function syncSpjToSheets(data: any) {
  if (!SPREADSHEET_ID) {
    console.warn('Sync GAGAL: SPREADSHEET_ID tidak ditemukan di .env');
    return;
  }

  const sheetName = 'PERJADIN';
  const rowData = mapToSheetRow(data);

  try {
    // 1. Cari apakah baris dengan ID ini sudah ada
    const range = `${sheetName}!A:A`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    const values = response.data.values || [];
    let rowIndex = -1;
    const targetId = String(data.id).trim();

    for (let i = 0; i < values.length; i++) {
        if (String(values[i][0]).trim() === targetId) {
            rowIndex = i + 1;
            break;
        }
    }

    if (rowIndex > 1) {
        // UPDATE: Gunakan update range
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A${rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [rowData] },
        });
        console.log(`[Sheets Sync] Row ID ${targetId} updated.`);
    } else {
        // APPEND: Tambah ke bawah
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [rowData] },
        });
        console.log(`[Sheets Sync] Row ID ${targetId} appended.`);
    }
  } catch (error) {
    console.error('[Sheets Sync Error]', error);
  }
}

/**
 * Menghapus data di Sheets berdasarkan ID.
 * (Biasanya hanya mengosongkan baris atau menandai status, tapi legacy menghapus row).
 */
export async function deleteSpjFromSheets(id: string) {
    if (!SPREADSHEET_ID) return;
    const sheetName = 'PERJADIN';
    
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A:A`,
        });
        const values = response.data.values || [];
        const targetId = String(id).trim();
        let rowIndex = -1;

        for (let i = 0; i < values.length; i++) {
            if (String(values[i][0]).trim() === targetId) {
                rowIndex = i + 1;
                break;
            }
        }

        if (rowIndex > 1) {
            // Hapus row memerlukan batchUpdate request
            const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
            const sheetId = spreadsheet.data.sheets?.find(s => s.properties?.title === sheetName)?.properties?.sheetId;
            
            if (sheetId !== undefined) {
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId: SPREADSHEET_ID,
                    requestBody: {
                        requests: [
                            {
                                deleteDimension: {
                                    range: {
                                        sheetId,
                                        dimension: 'ROWS',
                                        startIndex: rowIndex - 1,
                                        endIndex: rowIndex
                                    }
                                }
                            }
                        ]
                    }
                });
                console.log(`[Sheets Sync] Row ID ${targetId} deleted.`);
            }
        }
    } catch (error) {
        console.error('[Sheets Delete Error]', error);
    }
}

/**
 * Memperbarui Tab CONFIG di Google Sheets berdasarkan data dari PostgreSQL.
 * Sesuai arsitektur baru: Postgres adalah Source of Truth.
 */
export async function pushConfigToSheets() {
  if (!SPREADSHEET_ID) return;
  const sheetName = 'CONFIG';

  try {
    const allConfigs = await db.select().from(config);
    const rows = allConfigs.map(c => [
        c.timPoksi,
        c.folderIdSpt,
        c.folderIdSptjm,
        c.folderIdSuratMasuk,
        c.folderIdSuratKeluar,
        c.folderIdNotulensi,
        c.folderIdSpj
    ]);

    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A2`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: rows.length ? rows : [['']] },
    });
    console.log('[Config Push] Tab CONFIG updated with PostgreSQL data.');
  } catch (error) {
    console.error('[Config Push Error]', error);
  }
}

// ============================================
// MASTER PEGAWAI SYNC
// ============================================

export function mapPegawaiToSheet(data: any): any[] {
  return [
    data.kode || '',
    data.namaLengkap || '',
    data.nip || '',
    data.golongan || '',
    data.pangkatGolRuang || '',
    data.tingkatBiaya || '',
    data.jabatan || '',
    data.direktorat || '',
    data.poksi || ''
  ];
}

export async function syncPegawaiToSheets(data: any) {
  if (!SPREADSHEET_ID) return;
  const sheetName = 'DATA_PEGAWAI';
  const rowData = mapPegawaiToSheet(data);
  const targetId = String(data.kode).trim(); // Gunakan Kode sebagai unique key di sheets

  try {
    const range = `${sheetName}!A:B`; // Ambil Kolom A & B untuk pencarian ganda
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range });
    const values = response.data.values || [];
    
    let rowIndex = -1;
    // 1. Cari berdasarkan KODE
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] && String(values[i][0]).trim() === targetId) {
        rowIndex = i + 1;
        break;
      }
    }

    // 2. Fallback: Cari berdasarkan NAMA (jika kode tidak ditemukan)
    if (rowIndex === -1 && data.namaLengkap) {
      for (let i = 0; i < values.length; i++) {
        if (values[i][1] && String(values[i][1]).trim() === String(data.namaLengkap).trim()) {
          rowIndex = i + 1;
          break;
        }
      }
    }

    if (rowIndex > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
      });
      console.log(`[Sheets Sync] Berhasil update baris ${rowIndex} untuk: ${data.namaLengkap}`);
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
      });
      console.log(`[Sheets Sync] Berhasil tambah baris baru untuk: ${data.namaLengkap}`);
    }
  } catch (error) {
    console.error('[Pegawai Sheets Sync Error]', error);
  }
}

export async function fetchAndSyncPegawai() {
  if (!SPREADSHEET_ID) return;
  const sheetName = 'DATA_PEGAWAI';

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A2:I`,
    });

    const rows = response.data.values || [];
    for (const row of rows) {
      const [kode, namaLengkap, nip, golongan, pangkatGolRuang, tingkatBiaya, jabatan, direktorat, poksi] = row;
      if (!namaLengkap) continue;

      // Sanitasi: Ubah string kosong menjadi null agar tidak melanggar unique constraint NIP
      const sanitizedNip = nip && nip.trim() !== '' ? nip.trim() : null;
      const sanitizedKode = kode && kode.trim() !== '' ? kode.trim() : null;

      await db.insert(pegawai).values({
        kode: sanitizedKode, 
        namaLengkap: namaLengkap.trim(), 
        nip: sanitizedNip, 
        golongan: golongan || null, 
        pangkatGolRuang: pangkatGolRuang || null, 
        tingkatBiaya: tingkatBiaya || null, 
        jabatan: jabatan || null, 
        direktorat: direktorat || null, 
        poksi: poksi || null
      }).onConflictDoUpdate({
        // Gunakan NAMA LENGKAP sebagai fallback target jika Kode/NIP bermasalah, 
        // tapi di schema.ts kita butuh target yang bertipe unique index.
        // Kita gunakan NIP dulu, tapi pastikan sudah null jika kosong.
        target: pegawai.nip,
        set: { 
          kode: sanitizedKode, 
          namaLengkap: namaLengkap.trim(), 
          golongan: golongan || null, 
          pangkatGolRuang: pangkatGolRuang || null, 
          tingkatBiaya: tingkatBiaya || null, 
          jabatan: jabatan || null, 
          direktorat: direktorat || null, 
          poksi: poksi || null 
        }
      });
    }
    console.log(`[Pegawai Sync] ${rows.length} records synced to PostgreSQL.`);
  } catch (error) {
    console.error('[Pegawai Fetch Sync Error]', error);
  }
}

/**
 * Menghapus rujukan pegawai di Google Sheets berdasarkan NIP.
 */
export async function deletePegawaiFromSheets(kode: string) {
  if (!SPREADSHEET_ID || !kode) return;
  const sheetName = 'DATA_PEGAWAI';
  const targetId = String(kode).trim();

  try {
    const range = `${sheetName}!A:A`; // Kode di kolom A
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range });
    const values = response.data.values || [];
    
    let rowIndex = -1;
    for (let i = 0; i < values.length; i++) {
      if (String(values[i][0]).trim() === targetId) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex > 1) {
      const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
      const sheetId = spreadsheet.data.sheets?.find(s => s.properties?.title === sheetName)?.properties?.sheetId;
      
      if (sheetId !== undefined) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [{
              deleteDimension: {
                range: {
                  sheetId,
                  dimension: 'ROWS',
                  startIndex: rowIndex - 1,
                  endIndex: rowIndex
                }
              }
            }]
          }
        });
        console.log(`[Sheets Sync] Pegawai NIP ${targetId} deleted.`);
      }
    }
  } catch (error) {
    console.error('[Pegawai Sheets Delete Error]', error);
  }
}

// ============================================
// SBM SYNC
// ============================================

export function mapSbmToSheet(data: any): any[] {
  // Mapping balik dari format DB + JSONB ke flat 24 kolom
  const ext = data.data || {};
  return [
    ext.noKec || '',
    ext.ibuKotaKabupaten || '',
    ext.kabupatenKota || '',
    ext.prov || '',
    data.kecKab || '',
    ext.tujuan2 || '',
    ext.tujuan1 || '',
    ext.prov1 || '',
    ext.tujuanPesawat || '',
    data.uangHarian || '',
    ext.es1 || '',
    ext.es2 || '',
    data.uangPenginapan || '', // Biasanya Es III/IV/Gol IV di DB kita simpan ke uangPenginapan utama
    ext.es4 || '',
    ext.fb || '',
    ext.fd || '',
    ext.pBisnis || '',
    ext.pEkonomi || '',
    ext.airportTax || '',
    ext.taxiJakarta || '',
    ext.taxiDaerah || '',
    ext.b || '',
    ext.dlmKota || '',
    ext.diklat || ''
  ];
}

export async function syncSbmToSheets(data: any) {
  if (!SPREADSHEET_ID) return;
  const sheetName = 'SBM';
  const rowData = mapSbmToSheet(data);
  const targetId = String(data.kecKab).trim(); // Gunakan Kec_Kab sebagai unique key

  try {
    const range = `${sheetName}!E:E`; // Kec_Kab di Kolom E
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range });
    const values = response.data.values || [];
    
    let rowIndex = -1;
    for (let i = 0; i < values.length; i++) {
      if (String(values[i][0]).trim() === targetId) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex > 1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
      });
    }
  } catch (error) {
    console.error('[SBM Sheets Sync Error]', error);
  }
}

export async function fetchAndSyncSbm() {
  if (!SPREADSHEET_ID) return;
  const sheetName = 'SBM';

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A2:X`,
    });

    const rows = response.data.values || [];
    for (const row of rows) {
      const [
        noKec, ibuKotaKabupaten, kabupatenKota, prov, kecKab, tujuan2, tujuan1, prov1, tujuanPesawat, 
        uangHarian, es1, es2, es3, es4, fb, fd, pBisnis, pEkonomi, airportTax, taxiJakarta, taxiDaerah, b, dlmKota, diklat
      ] = row;

      if (!kecKab) continue;

      await db.insert(sbm).values({
        kecKab,
        uangHarian: uangHarian?.replace(/[^\d]/g, '') || '0',
        uangPenginapan: es3?.replace(/[^\d]/g, '') || '0', // Mapping default Es III ke uangPenginapan
        golongan: 'IV', // Default
        pesawat: !!pEkonomi,
        data: {
          noKec, ibuKotaKabupaten, kabupatenKota, prov, tujuan2, tujuan1, prov1, tujuanPesawat,
          es1, es2, es4, fb, fd, pBisnis, pEkonomi, airportTax, taxiJakarta, taxiDaerah, b, dlmKota, diklat
        }
      }).onConflictDoUpdate({
        target: sbm.kecKab,
        set: {
          uangHarian: uangHarian?.replace(/[^\d]/g, '') || '0',
          uangPenginapan: es3?.replace(/[^\d]/g, '') || '0',
          data: {
            noKec, ibuKotaKabupaten, kabupatenKota, prov, tujuan2, tujuan1, prov1, tujuanPesawat,
            es1, es2, es4, fb, fd, pBisnis, pEkonomi, airportTax, taxiJakarta, taxiDaerah, b, dlmKota, diklat
          }
        }
      });
    }
    console.log(`[SBM Sync] ${rows.length} records synced to PostgreSQL.`);
  } catch (error) {
    console.error('[SBM Fetch Sync Error]', error);
  }
}

/**
 * Menghapus rujukan SBM di Google Sheets berdasarkan Kec_Kab.
 */
export async function deleteSbmFromSheets(kecKab: string) {
  if (!SPREADSHEET_ID || !kecKab) return;
  const sheetName = 'SBM';
  const targetId = String(kecKab).trim();

  try {
    const range = `${sheetName}!E:E`; // Kec_Kab di kolom E
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range });
    const values = response.data.values || [];
    
    let rowIndex = -1;
    for (let i = 0; i < values.length; i++) {
      if (String(values[i][0]).trim() === targetId) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex > 1) {
      const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
      const sheetId = spreadsheet.data.sheets?.find(s => s.properties?.title === sheetName)?.properties?.sheetId;
      
      if (sheetId !== undefined) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [{
              deleteDimension: {
                range: {
                  sheetId,
                  dimension: 'ROWS',
                  startIndex: rowIndex - 1,
                  endIndex: rowIndex
                }
              }
            }]
          }
        });
        console.log(`[Sheets Sync] SBM ${targetId} deleted.`);
      }
    }
  } catch (error) {
    console.error('[SBM Sheets Delete Error]', error);
  }
}

// ============================================
// SPT, SPTJM, & SURAT MAPPING
// ============================================

export function mapSptToSheet(data: any): any[] {
    return [
        data.id || '',
        data.no || '',
        data.tanggalSurat || '',
        data.maksudPerjalanan || '',
        JSON.stringify(data.peserta || []),
        data.pesertaCount || 0,
        data.timPoksi || '',
        data.fileLink || '',
        data.mak || '',
        data.createdAt ? new Date(data.createdAt).toISOString() : '',
        data.kegiatan || ''
    ];
}

export function mapSptjmToSheet(data: any): any[] {
    return [
        data.id || '',
        data.namaLengkap || '',
        data.nip || '',
        data.jabatan || '',
        data.tujuan || '',
        data.tanggalPerjalanan || '',
        data.tanggalKembali || '',
        data.tiketBerangkat || 0,
        data.tiketPulang || 0,
        data.biayaSbm || 0,
        data.totalBiaya || 0,
        data.tanggalTtd || '',
        data.timPoksi || '',
        data.fileLink || '',
        data.createdAt ? new Date(data.createdAt).toISOString() : ''
    ];
}

export function mapSuratToSheet(data: any): any[] {
    return [
        data.id || '',
        data.timPoksi || '',
        data.tipeSurat || '',
        data.kategoriSurat || '',
        data.sifatSurat || '',
        data.nomorSurat || '',
        data.tanggalMasuk || '',
        data.tanggalSurat || '',
        data.asalTujuan || '',
        data.perihal || '',
        data.tglAcaraMulai || '',
        data.tglAcaraSelesai || '',
        JSON.stringify(data.disposisiKe || []),
        data.tglDisposisi || '',
        data.tindakLanjut || '',
        data.fileSurat || '',
        data.fileNotulensi || '',
        data.createdAt ? new Date(data.createdAt).toISOString() : ''
    ];
}

export function mapAdminToSheet(data: any): any[] {
  return [
    data.username || '',
    '[TERENKRIPSI]',
    data.nama_admin || data.nama || '',
    data.tim_poksi || data.timPoksi || '',
    data.last_login ? new Date(data.last_login).toISOString() : '',
    data.role || 'Admin'
  ];
}

export async function syncAdminToSheets(data: any) {
  if (!SPREADSHEET_ID) return;
  const sheetName = 'DATA_ADMIN';
  const rowData = mapAdminToSheet(data);
  const targetId = String(data.username).trim();

  try {
    const range = `${sheetName}!A:A`; // Username di Kolom A
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range });
    const values = response.data.values || [];
    
    let rowIndex = -1;
    for (let i = 0; i < values.length; i++) {
        const cellValue = values[i][0];
        if (cellValue && String(cellValue).trim() === targetId) {
            rowIndex = i + 1;
            break;
        }
    }

    if (rowIndex > 1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
      });
      console.log(`[Sheets Sync] Admin @${targetId} updated.`);
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
      });
      console.log(`[Sheets Sync] Admin @${targetId} appended.`);
    }
  } catch (error) {
    console.error('[Admin Sheets Sync Error]', error);
  }
}

export async function deleteAdminFromSheets(username: string) {
  if (!SPREADSHEET_ID || !username) return;
  const sheetName = 'DATA_ADMIN';
  const targetId = String(username).trim();

  try {
    const range = `${sheetName}!A:A`;
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range });
    const values = response.data.values || [];
    
    let rowIndex = -1;
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] && String(values[i][0]).trim() === targetId) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex > 1) {
      const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
      const sheetId = spreadsheet.data.sheets?.find(s => s.properties?.title === sheetName)?.properties?.sheetId;
      
      if (sheetId !== undefined) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [{
              deleteDimension: {
                range: {
                  sheetId,
                  dimension: 'ROWS',
                  startIndex: rowIndex - 1,
                  endIndex: rowIndex
                }
              }
            }]
          }
        });
        console.log(`[Sheets Sync] Admin @${targetId} deleted from Sheets.`);
      }
    }
  } catch (error) {
    console.error('[Admin Sheets Delete Error]', error);
  }
}

export async function batchPushAllToSheets() {
  if (!SPREADSHEET_ID) return;
  console.log('[Batch Sync] Memulai proses sync massal DB -> Sheets...');

  try {
    // 1. Ambil seluruh data dari Postgres secara paralel untuk performa maksimal
    const [allPegawai, allAdmin, allSbm, allSpj, allSpt, allSptjm, allSurat, allConfigs] = await Promise.all([
      db.select().from(pegawai).orderBy(sql`CAST(NULLIF(${pegawai.kode}, '') AS INTEGER) ASC`),
      db.select().from(users).orderBy(desc(users.createdAt)),
      db.select().from(sbm).orderBy(desc(sbm.id)),
      db.select().from(perjadin).orderBy(desc(perjadin.createdAt)),
      db.select().from(spt).orderBy(desc(spt.createdAt)),
      db.select().from(sptjm).orderBy(desc(sptjm.createdAt)),
      db.select().from(surat).orderBy(desc(surat.createdAt)),
      db.select().from(config)
    ]);

    // 2. Mapping data ke format Flat Array (Sesuai DOCS_ARCHITECTURE.md)
    const rowsPegawai = allPegawai.map(mapPegawaiToSheet);
    const rowsAdmin = allAdmin.map(a => [
      a.username || '', 
      '[TERENKRIPSI]', 
      a.nama || '', 
      a.timPoksi || '', 
      a.lastLogin ? a.lastLogin.toISOString() : '', 
      a.role || ''
    ]);
    const rowsSbm = allSbm.map(mapSbmToSheet);
    const rowsSpj = allSpj.map(mapToSheetRow);
    const rowsSpt = allSpt.map(mapSptToSheet);
    const rowsSptjm = allSptjm.map(mapSptjmToSheet);
    const rowsSurat = allSurat.map(mapSuratToSheet);
    const rowsConfig = allConfigs.map(c => [
        c.timPoksi, 
        c.folderIdSpt, 
        c.folderIdSptjm, 
        c.folderIdSuratMasuk, 
        c.folderIdSuratKeluar, 
        c.folderIdNotulensi, 
        c.folderIdSpj
    ]);

    // 3. Clear existing data (A2 to end) di seluruh tab utama agar tidak ada data basi
    console.log('[Batch Sync] Membersihkan data lama di Sheets...');
    await sheets.spreadsheets.values.batchClear({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        ranges: [
          "DATA_ADMIN!A2:F",
          "CONFIG!A2:G",
          "SBM!A2:X",
          "DATA_PEGAWAI!A2:I",
          "SPT!A2:K",
          "SPTJM!A2:O",
          "SURAT!A2:R",
          "PERJADIN!A2:DU"
        ]
      }
    });
    
    // 4. Batch Update data baru ke seluruh tab
    console.log('[Batch Sync] Menulis data baru ke 8 Tab...');
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: [
          { range: "DATA_ADMIN!A2:F", values: rowsAdmin.length ? rowsAdmin : [['']] },
          { range: "CONFIG!A2:G", values: rowsConfig.length ? rowsConfig : [['']] },
          { range: "SBM!A2:X", values: rowsSbm.length ? rowsSbm : [['']] },
          { range: "DATA_PEGAWAI!A2:I", values: rowsPegawai.length ? rowsPegawai : [['']] },
          { range: "SPT!A2:K", values: rowsSpt.length ? rowsSpt : [['']] },
          { range: "SPTJM!A2:O", values: rowsSptjm.length ? rowsSptjm : [['']] },
          { range: "SURAT!A2:R", values: rowsSurat.length ? rowsSurat : [['']] },
          { range: "PERJADIN!A2:DU", values: rowsSpj.length ? rowsSpj : [['']] }
        ] as any[]
      }
    });

    console.log('[Batch Sync] Sinkronisasi massal seluruh modul (8 Tab) berhasil diselesaikan.');
  } catch (error: any) {
    console.error('[Batch Sync Error]', error?.response?.data || error);
    throw error;
  }
}
