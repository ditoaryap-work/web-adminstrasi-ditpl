import fs from 'fs';
import path from 'path';

export const TEMPLATE_DIR = path.join(process.cwd(), 'template');

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

export const getTemplatePath = (id: string): string | null => {
    const tpl = TEMPLATE_REGISTRY.find(t => t.id === id);
    if (!tpl) return null;
    
    const fullPath = path.join(TEMPLATE_DIR, tpl.filename);
    if (!fs.existsSync(fullPath)) return null;
    
    return fullPath;
};

export const saveTemplate = async (id: string, fileBuffer: ArrayBuffer): Promise<boolean> => {
    const tpl = TEMPLATE_REGISTRY.find(t => t.id === id);
    if (!tpl) throw new Error("Template ID tidak dikenali");

    if (!fs.existsSync(TEMPLATE_DIR)) {
        fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
    }

    const fullPath = path.join(TEMPLATE_DIR, tpl.filename);
    
    // Direct overwrite secara efisien, tidak perlu hapus sebelumnya (NodeJS overwrite bytes langsung)
    fs.writeFileSync(fullPath, Buffer.from(fileBuffer));
    return true;
};
