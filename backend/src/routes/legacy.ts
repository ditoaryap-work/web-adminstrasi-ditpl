import { Hono } from 'hono';
import { db } from '../db';
import { pegawai, sbm, spt, sptjm, perjadin, config, users, arsipSurat } from '../db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { authMiddleware, JwtPayload } from '../middleware/auth';
import { generatePdfFromDocx } from '../services/pdf.service';
import { downloadTemplateToLocal, uploadBufferToDrive } from '../services/drive.service';
import fs from 'fs';

const formatTgl = (isoString?: string | null) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const formatRp = (num?: number | string | null) => {
  if (!num) return '0';
  return 'Rp ' + Number(num).toLocaleString('id-ID');
};

const terbilang = (angka: number): string => {
  const bilangan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  let val = Math.floor(Math.abs(angka));
  let trb = '';
  if (val === 0) return 'nol';
  if (val < 12) trb = bilangan[val];
  else if (val < 20) trb = terbilang(val - 10) + ' belas';
  else if (val < 100) trb = terbilang(Math.floor(val / 10)) + ' puluh ' + terbilang(val % 10);
  else if (val < 200) trb = 'seratus ' + terbilang(val - 100);
  else if (val < 1000) trb = terbilang(Math.floor(val / 100)) + ' ratus ' + terbilang(val % 100);
  else if (val < 2000) trb = 'seribu ' + terbilang(val - 1000);
  else if (val < 1000000) trb = terbilang(Math.floor(val / 1000)) + ' ribu ' + terbilang(val % 1000);
  else if (val < 1000000000) trb = terbilang(Math.floor(val / 1000000)) + ' juta ' + terbilang(val % 1000000);
  return trb.trim();
};

const legacyRouter = new Hono<{ Variables: { user: JwtPayload } }>();

legacyRouter.use('/*', authMiddleware);

legacyRouter.post('/', async (c) => {
  const body = await c.req.json();
  const { action, ...payload } = body;
  const user = c.get('user');

  /**
   * @systematic-debugging: Strategi Ekstraksi Payload
   * Frontend lama sering mengirim data di dalam properti 'data' (misal: { action: 'SAVE', data: {...} })
   * Kita harus sanggup mengambil data baik dari root maupun dari properti 'data'.
   */
  const actualData = payload.data || payload;

  try {
    switch (action) {
      // --- GET ACTIONS (Sourcing PURELY from PostgreSQL) ---
      case 'GET_PEGAWAI':
      case 'GET_PEGAWAI_LIST': {
        const list = await db.select().from(pegawai).orderBy(desc(pegawai.createdAt));
        // Remap to legacy snake_case expected by frontend Vue components
        const mappedList = list.map(p => ({
          ...p,
          nama_lengkap: p.namaLengkap,
          pangkat_gol: p.pangkatGolRuang,
          tingkat_biaya: p.tingkatBiaya
        }));
        return c.json({ status: true, data: mappedList });
      }

      case 'GET_SBM': {
        const list = await db.select().from(sbm).orderBy(desc(sbm.createdAt));
        const mappedList = list.map(s => {
          const rawData: any = s.data || {};
          
          // Parsing nominal angka (contoh: "3.808.000" menjadi 3808000)
          const parseRupiah = (val: any) => {
             if (!val) return 0;
             return Number(String(val).replace(/\./g, '')) || 0;
          };

          return {
            ...s,
            ibu_kota: s.kecKab,
            tujuan_lengkap: rawData.tujuan2 || s.kecKab,
            uang_harian: s.uangHarian,
            uang_penginapan: s.uangPenginapan,
            tiket_bisnis: parseRupiah(rawData.pBisnis),
            tiket_ekonomi: parseRupiah(rawData.pEkonomi),
            taxi_jakarta: parseRupiah(rawData.taxiJakarta),
            taxi_daerah: parseRupiah(rawData.taxiDaerah)
          };
        });
        return c.json({ status: true, data: mappedList });
      }

      case 'GET_SPT_LIST': {
        const query = db.select().from(spt).orderBy(desc(spt.createdAt));
        const targetTim = payload.tim_poksi || user.timPoksi;
        if (user.role !== 'Super Admin') {
          query.where(eq(spt.timPoksi, targetTim));
        }
        const list = await query;
        const mappedList = list.map(s => ({
          ...s,
          id_spt: s.id,
          tanggal_surat: s.tanggalSurat,
          maksud_perjalanan: s.maksudPerjalanan,
          peserta_count: s.pesertaCount,
          tim_poksi: s.timPoksi,
          file_link: s.fileLink,
          created_at: s.createdAt
        }));
        return c.json({ status: true, data: mappedList });
      }

      case 'GET_SPTJM_LIST': {
        const query = db.select().from(sptjm).orderBy(desc(sptjm.createdAt));
        const targetTim = payload.tim_poksi || user.timPoksi;
        if (user.role !== 'Super Admin') {
          query.where(eq(sptjm.timPoksi, targetTim));
        }
        const list = await query;
        const mappedList = list.map(s => ({
          ...s,
          id_sptjm: s.id,
          nama_lengkap: s.namaLengkap,
          tanggal_perjalanan: s.tanggalPerjalanan,
          tanggal_kembali: s.tanggalKembali,
          tiket_berangkat: s.tiketBerangkat,
          tiket_pulang: s.tiketPulang,
          biaya_sbm: s.biayaSbm,
          total_biaya: s.totalBiaya,
          tanggal_ttd: s.tanggalTtd,
          tim_poksi: s.timPoksi,
          file_link: s.fileLink,
          created_at: s.createdAt
        }));
        return c.json({ status: true, data: mappedList });
      }

      case 'GET_SURAT_LIST': {
        const list = await db.select().from(arsipSurat).orderBy(desc(arsipSurat.createdAt));
        return c.json({ status: true, data: list });
      }

      case 'GET_SPJ_LIST': {
        const list = await db.select().from(perjadin).orderBy(desc(perjadin.createdAt));
        return c.json({ status: true, data: list });
      }

      case 'GET_ADMIN_LIST': {
        const list = await db.select().from(users).orderBy(desc(users.createdAt));
        return c.json({ status: true, data: list });
      }

      // --- SAVE ACTIONS (CRUD ONLY to PostgreSQL) ---
      // Trigger Sheets Sync ditiadakan di sini (sesuai instruksi: Sync via Tombol Manual)
      case 'SAVE_PEGAWAI': {
        const { id, id_pegawai, ...data } = actualData;
        const targetId = id || id_pegawai;
        
        if (data.nip && String(data.nip).trim() === '') data.nip = null;
        
        let result;
        if (targetId) {
          result = await db.update(pegawai).set(data).where(eq(pegawai.id, targetId)).returning();
        } else {
          result = await db.insert(pegawai).values(data).returning();
        }
        return c.json({ status: true, data: result[0] });
      }

      case 'SAVE_SPT': {
        const { id, id_spt, createdAt, updatedAt, created_at, updated_at, ...data } = actualData;
        const targetId = id || id_spt;
        const pesertaCount = Array.isArray(data.peserta) ? data.peserta.length : 0;
        
        const dbPayload = {
          no: data.no,
          tanggalSurat: data.tanggal_surat ? new Date(data.tanggal_surat).toISOString() : null,
          kegiatan: data.kegiatan,
          maksudPerjalanan: data.maksud_perjalanan,
          mak: data.mak,
          peserta: data.peserta,
          pesertaCount: pesertaCount,
          notulensi: data.notulensi,
          timPoksi: user.timPoksi,
          fileLink: data.file_link
        };

        let sptData;
        if (targetId) {
          const result = await db.update(spt).set({ ...dbPayload, updatedAt: new Date() }).where(eq(spt.id, targetId)).returning();
          sptData = result[0];
        } else {
          const result = await db.insert(spt).values(dbPayload).returning();
          sptData = result[0];
        }

        // PDF Generation
        try {
          const configRes = await db.select().from(config).where(eq(config.timPoksi, user.timPoksi)).limit(1);
          const timCfg = configRes[0];
          if (timCfg && timCfg.templateIdSptV1 && timCfg.folderIdSpt) {
            const p0 = Array.isArray(sptData.peserta) && sptData.peserta.length > 0 ? (sptData.peserta[0] as any) : {};
            const pdfPayloadSpt = {
              nomor_surat: sptData.no || '',
              maksud_perjalanan: sptData.maksudPerjalanan || '',
              kegiatan: sptData.kegiatan || '',
              mak: sptData.mak || '',
              tanggal_surat: formatTgl(sptData.tanggalSurat),
              nama_lengkap: p0.nama_lengkap || p0.namaLengkap || '',
              gol: p0.golongan || p0.pangkat_gol || '',
              nip: p0.nip || '',
              tujuan: p0.tujuan || '',
              tanggal_pelaksanaan: p0.tanggal_pelaksanaan || ''
            };

            const tmpPath = await downloadTemplateToLocal(timCfg.templateIdSptV1, `legacy_spt_${sptData.id}.docx`);
            const pdfBuf = await generatePdfFromDocx(tmpPath, pdfPayloadSpt);
            const driveLink = await uploadBufferToDrive(pdfBuf, 'application/pdf', `SPT_${sptData.id}.pdf`, timCfg.folderIdSpt);
            await db.update(spt).set({ fileLink: driveLink ?? null }).where(eq(spt.id, sptData.id));
            (sptData as any).fileLink = driveLink ?? null;
            if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
          }
        } catch (e) { console.error('PDF Error:', e); }

        const mappedResult = {
          ...sptData,
          id_spt: sptData.id,
          tanggal_surat: sptData.tanggalSurat,
          maksud_perjalanan: sptData.maksudPerjalanan,
          peserta_count: sptData.pesertaCount,
          tim_poksi: sptData.timPoksi,
          file_link: sptData.fileLink,
          created_at: sptData.createdAt
        };

        return c.json({ status: true, data: mappedResult });
      }

      case 'SAVE_SPTJM': {
        const { id, id_sptjm, createdAt, updatedAt, created_at, updated_at, ...data } = actualData;
        const targetId = id || id_sptjm;
        
        const dbPayload = {
          namaLengkap: data.nama_lengkap,
          nip: data.nip,
          jabatan: data.jabatan,
          tujuan: data.tujuan,
          tanggalPerjalanan: data.tanggal_perjalanan ? new Date(data.tanggal_perjalanan).toISOString() : null,
          tanggalKembali: data.tanggal_kembali ? new Date(data.tanggal_kembali).toISOString() : null,
          tiketBerangkat: data.tiket_berangkat ? String(data.tiket_berangkat) : null,
          tiketPulang: data.tiket_pulang ? String(data.tiket_pulang) : null,
          biayaSbm: data.biaya_sbm ? String(data.biaya_sbm) : null,
          totalBiaya: data.total_biaya ? String(data.total_biaya) : null,
          tanggalTtd: data.tanggal_ttd ? new Date(data.tanggal_ttd).toISOString() : null,
          timPoksi: user.timPoksi,
          fileLink: data.file_link
        };

        let resultData;
        if (targetId) {
          const res = await db.update(sptjm).set({ ...dbPayload, updatedAt: new Date() }).where(eq(sptjm.id, targetId)).returning();
          resultData = res[0];
        } else {
          const res = await db.insert(sptjm).values(dbPayload).returning();
          resultData = res[0];
        }

        // PDF Generation SPTJM
        try {
          const configRes = await db.select().from(config).where(eq(config.timPoksi, user.timPoksi)).limit(1);
          const timCfg = configRes[0];
          if (timCfg && timCfg.templateIdSptjm && timCfg.folderIdSptjm) {
            const pdfPayloadSptjm = {
              "Nama Lengkap": resultData.namaLengkap || '',
              "NIP": resultData.nip || '',
              "Jabatan": resultData.jabatan || '',
              "Tujuan": resultData.tujuan || '',
              "Tanggal": formatTgl(resultData.tanggalPerjalanan) + ' s/d ' + formatTgl(resultData.tanggalKembali),
              "Total": formatRp(resultData.totalBiaya),
              "Terbilang": terbilang(Number(resultData.totalBiaya || 0)) + ' rupiah',
              "Tiket Berangkat": formatRp(resultData.tiketBerangkat),
              "Tiket Pulang": formatRp(resultData.tiketPulang),
              "Biaya SBM": formatRp(resultData.biayaSbm),
              "Tanggal TTD": formatTgl(resultData.tanggalTtd),
              "Nama": resultData.namaLengkap || '',
              "NIP BAWAH": resultData.nip || '',
            };

            const tmpPath = await downloadTemplateToLocal(timCfg.templateIdSptjm, `legacy_sptjm_${resultData.id}.docx`);
            const pdfBuf = await generatePdfFromDocx(tmpPath, pdfPayloadSptjm);
            const driveLink = await uploadBufferToDrive(pdfBuf, 'application/pdf', `SPTJM_${resultData.id}.pdf`, timCfg.folderIdSptjm);
            await db.update(sptjm).set({ fileLink: driveLink ?? null }).where(eq(sptjm.id, resultData.id));
            (resultData as any).fileLink = driveLink ?? null;
            if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
          }
        } catch (e) { console.error('PDF Error:', e); }

        const mappedSptjm = {
          ...resultData,
          id_sptjm: resultData.id,
          nama_lengkap: resultData.namaLengkap,
          tanggal_perjalanan: resultData.tanggalPerjalanan,
          tanggal_kembali: resultData.tanggalKembali,
          tiket_berangkat: resultData.tiketBerangkat,
          tiket_pulang: resultData.tiketPulang,
          biaya_sbm: resultData.biayaSbm,
          total_biaya: resultData.totalBiaya,
          tanggal_ttd: resultData.tanggalTtd,
          tim_poksi: resultData.timPoksi,
          file_link: resultData.fileLink,
          created_at: resultData.createdAt
        };

        return c.json({ status: true, data: mappedSptjm });
      }

      case 'UPDATE_NOTULENSI': {
        const { id, id_spt, notulensi } = actualData;
        const targetId = id || id_spt;
        const result = await db.update(spt).set({ notulensi: notulensi ?? null }).where(eq(spt.id, targetId)).returning();
        return c.json({ status: true, data: result[0] });
      }

      // --- DELETE ACTIONS ---
      case 'DELETE_PEGAWAI': {
        const targetId = payload.id || payload.id_pegawai;
        await db.delete(pegawai).where(eq(pegawai.id, targetId));
        return c.json({ status: true });
      }
      case 'DELETE_SPT': {
        const targetId = payload.id || payload.id_spt;
        await db.delete(spt).where(eq(spt.id, targetId));
        return c.json({ status: true });
      }
      case 'DELETE_SPTJM': {
        const targetId = payload.id || payload.id_sptjm;
        await db.delete(sptjm).where(eq(sptjm.id, targetId));
        return c.json({ status: true });
      }

      default:
        return c.json({ status: false, message: `Action '${action}' mapping error.` }, 400);
    }
  } catch (error: any) {
    console.error(`[Legacy Handler Fix Error] Action: ${action}`, error);
    return c.json({ status: false, message: error.message }, 500);
  }
});

export default legacyRouter;
