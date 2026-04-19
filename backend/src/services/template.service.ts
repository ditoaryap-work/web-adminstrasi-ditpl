import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

// Production-ready: path relatif dari root project, bukan hardcode absolut
export const TEMPLATE_DIR = path.resolve(process.cwd(), 'template');

// --- Allowed Extensions & MIME Map ---
const ALLOWED_EXTENSIONS = ['.doc', '.docx', '.xls', '.xlsx'] as const;
type AllowedExt = typeof ALLOWED_EXTENSIONS[number];

const MIME_MAP: Record<AllowedExt, string> = {
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

// Magic bytes untuk validasi konten biner (bukan hanya ekstensi)
const MAGIC_BYTES: Record<string, number[]> = {
    // ZIP-based formats (.docx, .xlsx) — PK header
    'zip': [0x50, 0x4B, 0x03, 0x04],
    // OLE2 Compound files (.doc, .xls) — ÐÏà¡
    'ole2': [0xD0, 0xCF, 0x11, 0xE0],
};

// --- Registry ---
// acceptedTypes: ekstensi yang dibolehkan untuk template ini
export const TEMPLATE_REGISTRY = [
    { id: 'TPL_SPT_V1', filename: '1_Template_SPT_v1.docx', name: 'SPT v1 (1 Lembar)', module: 'SPT', acceptedTypes: ['.doc', '.docx'] as AllowedExt[] },
    { id: 'TPL_SPT_V2', filename: '2_Template_SPT_v2.docx', name: 'SPT v2 (Dengan Lampiran)', module: 'SPT', acceptedTypes: ['.doc', '.docx'] as AllowedExt[] },
    { id: 'TPL_SPJ', filename: '3_Template_SPJ', name: 'Format Kwitansi & SPJ', module: 'SPJ', acceptedTypes: ['.doc', '.docx', '.xls', '.xlsx'] as AllowedExt[] },
    { id: 'TPL_SPTJM', filename: '4_Template_SPTJM.docx', name: 'Format SPTJM', module: 'SPTJM', acceptedTypes: ['.doc', '.docx'] as AllowedExt[] },
];

export interface TemplateInfo {
    id: string;
    name: string;
    module: string;
    filename: string;
    exists: boolean;
    sizeKb: number;
    lastModified: string | null;
    acceptedTypes: string[];
}

// Max upload size: 10 MB (sudah lebih dari cukup untuk dokumen template)
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// --- Metadata Management (Custom Nama) ---
const METADATA_PATH = path.join(TEMPLATE_DIR, 'metadata.json');

const getMetadata = (): Record<string, { customName?: string }> => {
    try {
        if (fs.existsSync(METADATA_PATH)) {
            return JSON.parse(fs.readFileSync(METADATA_PATH, 'utf-8'));
        }
    } catch (e) {
        console.error('[Template Service] Gagal membaca metadata:', e);
    }
    return {};
};

const saveMetadata = (id: string, customName: string) => {
    const meta = getMetadata();
    meta[id] = { ...meta[id], customName };
    fs.writeFileSync(METADATA_PATH, JSON.stringify(meta, null, 2));
};

/**
 * Cari file yang cocok di disk, mendukung penamaan tanpa ekstensi (TPL_SPJ).
 * Karena TPL_SPJ bisa .docx ATAU .xlsx, kita scan filesystem.
 */
const findActualFile = (baseFilename: string): { fullPath: string; actualFilename: string } | null => {
    // Jika sudah punya ekstensi, cek langsung
    const ext = path.extname(baseFilename);
    if (ext) {
        const fullPath = path.join(TEMPLATE_DIR, baseFilename);
        if (fs.existsSync(fullPath)) return { fullPath, actualFilename: baseFilename };
        return null;
    }

    // Tanpa ekstensi: scan semua kemungkinan
    for (const allowedExt of ALLOWED_EXTENSIONS) {
        const candidate = baseFilename + allowedExt;
        const fullPath = path.join(TEMPLATE_DIR, candidate);
        if (fs.existsSync(fullPath)) return { fullPath, actualFilename: candidate };
    }
    return null;
};

/**
 * Mendapatkan MIME type berdasarkan ekstensi file.
 */
export const getMimeType = (filename: string): string => {
    const ext = path.extname(filename).toLowerCase() as AllowedExt;
    return MIME_MAP[ext] || 'application/octet-stream';
};

/**
 * Validasi magic bytes file untuk memastikan konten valid (bukan rename malware).
 */
export const validateFileContent = async (file: File): Promise<boolean> => {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer.slice(0, 4));

    const isZip = MAGIC_BYTES['zip'].every((b, i) => bytes[i] === b);
    const isOle2 = MAGIC_BYTES['ole2'].every((b, i) => bytes[i] === b);

    return isZip || isOle2;
};

/**
 * Validasi ekstensi file terhadap daftar yang diizinkan untuk template tertentu.
 */
export const validateExtension = (filename: string, templateId: string): { valid: boolean; ext: AllowedExt | null; message: string } => {
    const ext = path.extname(filename).toLowerCase() as AllowedExt;
    const tpl = TEMPLATE_REGISTRY.find(t => t.id === templateId);

    if (!tpl) return { valid: false, ext: null, message: 'Template ID tidak terdaftar.' };
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return { valid: false, ext: null, message: `Ekstensi "${ext}" tidak diizinkan. Hanya: ${ALLOWED_EXTENSIONS.join(', ')}` };
    }
    if (!tpl.acceptedTypes.includes(ext)) {
        return { valid: false, ext: null, message: `Template "${tpl.name}" hanya menerima: ${tpl.acceptedTypes.join(', ')}` };
    }

    return { valid: true, ext, message: 'OK' };
};

// --- Public API ---

export const getTemplateList = (): TemplateInfo[] => {
    if (!fs.existsSync(TEMPLATE_DIR)) {
        fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
    }

    const metadata = getMetadata();

    return TEMPLATE_REGISTRY.map(tpl => {
        const found = findActualFile(tpl.filename);
        const meta = metadata[tpl.id];

        let sizeKb = 0;
        let lastModified = null;
        let actualFilename = tpl.filename;

        if (found) {
            const stats = fs.statSync(found.fullPath);
            sizeKb = parseFloat((stats.size / 1024).toFixed(2));
            lastModified = stats.mtime.toISOString();
            actualFilename = found.actualFilename;
        }

        return {
            id: tpl.id,
            name: meta?.customName || tpl.name,
            module: tpl.module,
            filename: actualFilename,
            exists: !!found,
            sizeKb,
            lastModified,
            acceptedTypes: tpl.acceptedTypes,
        };
    });
};

export const getTemplatePath = async (id: string, timPoksi?: string): Promise<string | null> => {
    const tpl = TEMPLATE_REGISTRY.find(t => t.id === id);
    if (!tpl) return null;

    // [1] Root master path — cari dengan flexible extension
    const masterFound = findActualFile(tpl.filename);
    if (masterFound) return masterFound.fullPath;

    // [2] Subfolder tim (fallback kustomisasi lokal)
    if (timPoksi) {
        const timDir = path.join(TEMPLATE_DIR, timPoksi.replace(/\s+/g, '_'));
        // Cari di subfolder tim
        const baseName = path.parse(tpl.filename).name;
        for (const ext of ALLOWED_EXTENSIONS) {
            const candidate = path.join(timDir, baseName + ext);
            if (fs.existsSync(candidate)) return candidate;
        }
    }

    console.warn(`[Template Service] Template ${id} tidak ditemukan secara lokal.`);
    return null;
};

export const saveTemplate = async (id: string, file: File): Promise<boolean> => {
    const tpl = TEMPLATE_REGISTRY.find(t => t.id === id);
    if (!tpl) throw new Error('Template ID tidak dikenali');

    if (!fs.existsSync(TEMPLATE_DIR)) {
        fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
    }

    // Validasi ukuran file
    if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error(`Ukuran file melebihi batas maksimum (${MAX_UPLOAD_BYTES / 1024 / 1024}MB).`);
    }

    // Validasi ekstensi
    const extCheck = validateExtension(file.name, id);
    if (!extCheck.valid || !extCheck.ext) {
        throw new Error(extCheck.message);
    }

    // Validasi konten biner (magic bytes)
    const isContentValid = await validateFileContent(file);
    if (!isContentValid) {
        throw new Error('Konten file tidak valid. File mungkin rusak atau bukan dokumen Office yang asli.');
    }

    // Tentukan nama file final: base dari registry + ekstensi dari file yang diupload
    const baseName = path.parse(tpl.filename).name;
    const finalFilename = baseName + extCheck.ext;
    const masterPath = path.join(TEMPLATE_DIR, finalFilename);

    // [CLEANUP] Hapus file lama dengan ekstensi berbeda untuk mencegah orphan
    // Contoh: user replace 3_Template_SPJ.docx dengan .xlsx → hapus versi .docx
    for (const ext of ALLOWED_EXTENSIONS) {
        const oldFile = path.join(TEMPLATE_DIR, baseName + ext);
        if (oldFile !== masterPath && fs.existsSync(oldFile)) {
            fs.unlinkSync(oldFile);
            console.log(`[Cleanup] Removed old template variant: ${baseName + ext}`);
        }
    }

    // Simpan file baru dengan Native Bun Write (streaming, zero-copy)
    await Bun.write(masterPath, file);
    console.log(`[TemplateManager] Master template ${id} updated → ${finalFilename}`);

    // [INVALIDATION] Hapus semua versi di subfolder tim
    try {
        const subdirs = fs.readdirSync(TEMPLATE_DIR, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory());

        for (const dir of subdirs) {
            for (const ext of ALLOWED_EXTENSIONS) {
                const teamFilePath = path.join(TEMPLATE_DIR, dir.name, baseName + ext);
                if (fs.existsSync(teamFilePath)) {
                    fs.unlinkSync(teamFilePath);
                    console.log(`[Cache Invalidation] Deleted team template: ${dir.name}/${baseName + ext}`);
                }
            }
        }
    } catch (err) {
        console.error('[Cache Invalidation Error]', err);
    }

    return true;
};

/**
 * Update metadata (label nama) untuk template tertentu.
 */
export const updateTemplateMeta = async (id: string, customName: string): Promise<boolean> => {
    const tpl = TEMPLATE_REGISTRY.find(t => t.id === id);
    if (!tpl) throw new Error('Template ID tidak dikenali');

    saveMetadata(id, customName);
    return true;
};

/**
 * Mengkompres semua template yang tersedia menjadi satu file ZIP.
 */
export const zipAllTemplates = async (): Promise<Buffer> => {
    const zip = new AdmZip();
    const list = getTemplateList();

    let count = 0;
    for (const tpl of list) {
        if (tpl.exists) {
            const found = findActualFile(tpl.filename);
            if (found) {
                zip.addLocalFile(found.fullPath);
                count++;
            }
        }
    }

    if (count === 0) throw new Error('Tidak ada file template untuk di-ZIP.');

    return zip.toBuffer();
};
