const months = [
	'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
	'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatIndonesianDatePlain(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        const day = String(d.getDate()).padStart(2, '0');
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        return `${day} ${month} ${year}`;
    } catch {
        return '';
    }
}

export function formatIndonesianDateTimePlain(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        const day = String(d.getDate()).padStart(2, '0');
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day} ${month} ${year} ${hours}:${minutes}`;
    } catch {
        return '';
    }
}

export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID').format(amount);
}
