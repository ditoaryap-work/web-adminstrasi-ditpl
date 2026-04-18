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
