import fs from 'fs';
import path from 'path';
import { drive } from './drive.service';
import { db } from '../db';
import { config } from '../db/schema';
import { eq } from 'drizzle-orm';

export const TEMPLATE_DIR = path.resolve(__dirname, '../../template');

export const TEMPLATE_REGISTRY = [
    { id: 'TPL_SPT_V1', filename: '1_Template_SPT_v1.docx', name: 'SPT v1 (1 Lembar)', module: 'SPT' },
    { id: 'TPL_SPT_V2', filename: '2_Template_SPT_v2.docx', name: 'SPT v2 (Dengan Lampiran)', module: 'SPT' },
    { id: 'TPL_SPJ', filename: '3_Template_SPJ.docx', name: 'Format Kwitansi & SPJ', module: 'SPJ' },
    { id: 'TPL_SPTJM', filename: '4_Template_SPTJM.docx', name: 'Format SPTJM', module: 'SPTJM' },
];

export interface TemplateInfo {
    id: string;
    name: string;
    module: string;
    filename: string;
    exists: boolean;
    sizeKb: number;
    lastModified: string | null;
}

export const getTemplateList = (): TemplateInfo[] => {
    // Memastikan direktori tujuannya sudah dibuat secara lazim
    if (!fs.existsSync(TEMPLATE_DIR)) {
        fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
    }

    return TEMPLATE_REGISTRY.map(tpl => {
        const fullPath = path.join(TEMPLATE_DIR, tpl.filename);
        const exists = fs.existsSync(fullPath);
        
        let sizeKb = 0;
        let lastModified = null;

        if (exists) {
            const stats = fs.statSync(fullPath);
            // Mengubah byes ke Kilobytes
            sizeKb = parseFloat((stats.size / 1024).toFixed(2));
            lastModified = stats.mtime.toISOString(); // Timestamp terakhir edit
        }

        return {
            ...tpl,
            exists,
            sizeKb,
            lastModified
        };
    });
};

export const getTemplatePath = async (id: string, timPoksi?: string): Promise<string | null> => {
    const tpl = TEMPLATE_REGISTRY.find(t => t.id === id);
    if (!tpl) return null;
    
    // Path: template/[timPoksi]/[filename] atau template/[filename] (legacy fallback)
    // Path Master (Root) - Prioritas utama sebagai "Manual Override"
    const masterPath = path.join(TEMPLATE_DIR, tpl.filename);
    if (fs.existsSync(masterPath)) return masterPath;

    // Path Tim (Subfolder) - Jika tidak ada di root, cari di folder tim
    const timDir = timPoksi ? path.join(TEMPLATE_DIR, timPoksi.replace(/\s+/g, '_')) : null;
    const timPath = timDir ? path.join(timDir, tpl.filename) : null;

    if (timPath && fs.existsSync(timPath)) return timPath;

    // [2] Jika TIDAK ADA di kedua tempat, dan kita punya timPoksi, coba download dari GDrive
    if (timPoksi && timPath) {
        try {
            console.log(`[SmartSync] Template ${id} untuk ${timPoksi} tidak ditemukan. Mendownload dari GDrive...`);
            
            const timConfig = await db.select().from(config).where(eq(config.timPoksi, timPoksi)).limit(1);
            if (!timConfig[0]) return null;

            let driveFileId: string | null = null;
            if (id === 'TPL_SPT_V1') driveFileId = timConfig[0].templateIdSptV1;
            else if (id === 'TPL_SPT_V2') driveFileId = timConfig[0].templateIdSptV2;
            else if (id === 'TPL_SPTJM') driveFileId = timConfig[0].templateIdSptjm;
            else if (id === 'TPL_SPJ') driveFileId = timConfig[0].templateIdSpj;

            if (driveFileId) {
                await downloadFileFromDrive(driveFileId, timPath);
                return timPath;
            }
        } catch (err) {
            console.error(`[SmartSync Error] Gagal download template ${id}:`, err);
        }
    }
    
    return null;
};

/**
 * Utility: Download file dari GDrive ke path tujuan secara atomik
 */
const downloadFileFromDrive = async (fileId: string, destPath: string) => {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Deteksi tipe file (Google Doc vs Binary)
    const meta = await drive.files.get({ fileId, fields: 'mimeType' });
    const mimeType = meta.data.mimeType || '';

    const isGoogleDoc = mimeType === 'application/vnd.google-apps.document';
    
    if (isGoogleDoc) {
        const res = await drive.files.export(
            { fileId, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
            { responseType: 'arraybuffer' }
        );
        fs.writeFileSync(destPath, Buffer.from(res.data as ArrayBuffer));
    } else {
        const res = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'arraybuffer' }
        );
        fs.writeFileSync(destPath, Buffer.from(res.data as ArrayBuffer));
    }
    console.log(`[Drive] Downloaded ${fileId} to ${destPath}`);
};

/**
 * Paksa sinkronisasi ulang seluruh template dari Google Drive ke VPS lokal
 */
export const syncAllTemplatesFromDrive = async () => {
    const allConfigs = await db.select().from(config);
    console.log(`[Sync] Memulakan sinkronisasi ${allConfigs.length} tim...`);

    for (const conf of allConfigs) {
        const timDir = path.join(TEMPLATE_DIR, conf.timPoksi.replace(/\s+/g, '_'));
        
        const tasks = [
            { id: 'TPL_SPT_V1', driveId: conf.templateIdSptV1, filename: '1_Template_SPT_v1.docx' },
            { id: 'TPL_SPT_V2', driveId: conf.templateIdSptV2, filename: '2_Template_SPT_v2.docx' },
            { id: 'TPL_SPTJM', driveId: conf.templateIdSptjm, filename: '4_Template_SPTJM.docx' },
            { id: 'TPL_SPJ', driveId: conf.templateIdSpj, filename: '3_Template_SPJ.docx' },
        ];

        for (const task of tasks) {
            if (task.driveId) {
                const dest = path.join(timDir, task.filename);
                try {
                    await downloadFileFromDrive(task.driveId, dest);
                } catch (err) {
                    console.error(`[Sync Fail] Tim ${conf.timPoksi} - ${task.id}:`, err);
                }
            }
        }
    }
    return true;
};

export const saveTemplate = async (id: string, file: File): Promise<boolean> => {
    const tpl = TEMPLATE_REGISTRY.find(t => t.id === id);
    if (!tpl) throw new Error("Template ID tidak dikenali");

    if (!fs.existsSync(TEMPLATE_DIR)) {
        fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
    }

    const masterPath = path.join(TEMPLATE_DIR, tpl.filename);
    
    // [1] Simpan ke root folder sebagai master override dengan Native Bun Write
    await Bun.write(masterPath, file);
    console.log(`[TemplateManager] Master template ${id} updated specialized at ${masterPath}`);

    // [2] INVALIDATION CACHE: Hapus semua versi file ini di subfolder tim agar mereka menggunakan master baru
    try {
        const subdirs = fs.readdirSync(TEMPLATE_DIR, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory());
        
        for (const dir of subdirs) {
            const teamFilePath = path.join(TEMPLATE_DIR, dir.name, tpl.filename);
            if (fs.existsSync(teamFilePath)) {
                fs.unlinkSync(teamFilePath);
                console.log(`[Cache Invalidation] Deleted team-specific template for ${dir.name}: ${tpl.filename}`);
            }
        }
    } catch (err) {
        console.error("[Cache Invalidation Error] Gagal membersihkan cache tim:", err);
    }

    return true;
};
