/**
 * Mengonversi angka menjadi teks terbilang bahasa Indonesia.
 */
export function numberToTerbilang(n: number): string {
    if (n < 0) return "Minus " + numberToTerbilang(Math.abs(n));
    if (n === 0) return "Nol";

    const units = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    let result = "";

    if (n < 12) {
        result = units[n];
    } else if (n < 20) {
        result = numberToTerbilang(n - 10) + " Belas";
    } else if (n < 100) {
        result = numberToTerbilang(Math.floor(n / 10)) + " Puluh " + numberToTerbilang(n % 10);
    } else if (n < 200) {
        result = "Seratus " + numberToTerbilang(n - 100);
    } else if (n < 1000) {
        result = numberToTerbilang(Math.floor(n / 100)) + " Ratus " + numberToTerbilang(n % 100);
    } else if (n < 2000) {
        result = "Seribu " + numberToTerbilang(n - 1000);
    } else if (n < 1000000) {
        result = numberToTerbilang(Math.floor(n / 1000)) + " Ribu " + numberToTerbilang(n % 1000);
    } else if (n < 1000000000) {
        result = numberToTerbilang(Math.floor(n / 1000000)) + " Juta " + numberToTerbilang(n % 1000000);
    } else if (n < 1000000000000) {
        result = numberToTerbilang(Math.floor(n / 1000000000)) + " Miliar " + numberToTerbilang(n % 1000000000);
    }

    return result.replace(/\s+/g, " ").trim();
}

/**
 * Format Rupiah dengan pemisah ribuan
 */
export function formatRupiah(n: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(n).replace("Rp", "Rp.");
}

/**
 * Format tanggal Indonesia: Hari, Tanggal Bulan Tahun
 * Contoh: Senin, 19 April 2026
 */
export function formatIndonesianDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "-";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;

        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

        const dayName = days[date.getDay()];
        const dayNum = date.getDate();
        const monthName = months[date.getMonth()];
        const year = date.getFullYear();

        return `${dayName}, ${dayNum} ${monthName} ${year}`;
    } catch {
        return dateStr;
    }
}

/**
 * Format tanggal Indonesia tanpa nama hari: Tanggal Bulan Tahun
 * Contoh: 19 April 2026
 */
export function formatIndonesianDatePlain(dateStr: string | null | undefined): string {
    if (!dateStr) return "-";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;

        const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

        const dayNum = date.getDate();
        const monthName = months[date.getMonth()];
        const year = date.getFullYear();

        return `${dayNum} ${monthName} ${year}`;
    } catch {
        return dateStr;
    }
}

/**
 * Format range tanggal Indonesia ringkas:
 * 1. 11 s/d 14 Maret 2026 (Bulan & Tahun sama)
 * 2. 25 Maret s/d 3 April 2026 (Bulan beda, Tahun sama)
 * 3. 28 Des 2025 s/d 2 Jan 2026 (Tahun beda)
 */
export function formatIndonesianDateRange(startStr: string | null | undefined, endStr: string | null | undefined): string {
    if (!startStr && !endStr) return "-";
    if (!startStr) return formatIndonesianDatePlain(endStr);
    if (!endStr) return formatIndonesianDatePlain(startStr);

    try {
        const d1 = new Date(startStr);
        const d2 = new Date(endStr);

        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
            return `${startStr} s/d ${endStr}`;
        }

        const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

        const day1 = d1.getDate();
        const month1 = months[d1.getMonth()];
        const year1 = d1.getFullYear();

        const day2 = d2.getDate();
        const month2 = months[d2.getMonth()];
        const year2 = d2.getFullYear();

        // 1. Tahun & Bulan sama
        if (year1 === year2 && month1 === month2) {
            if (day1 === day2) return `${day1} ${month1} ${year1}`;
            return `${day1} s/d ${day2} ${month2} ${year2}`;
        }

        // 2. Tahun sama, Bulan beda
        if (year1 === year2) {
            return `${day1} ${month1} s/d ${day2} ${month2} ${year2}`;
        }

        // 3. Tahun beda
        return `${day1} ${month1} ${year1} s/d ${day2} ${month2} ${year2}`;
        
    } catch {
        return `${startStr} s/d ${endStr}`;
    }
}
