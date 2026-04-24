<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { slide, fade, scale as svelteScale } from 'svelte/transition';
	import {
		ChevronLeft,
		Save,
		RefreshCw,
		CheckCircle,
		Eye,
		Download,
		Search,
		Plus
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import SearchableDropdown from '$lib/components/ui/SearchableDropdown.svelte';
	import FilePreviewModal from '$lib/components/ui/FilePreviewModal.svelte';
	import { toast } from 'svelte-sonner';
	import { formatRupiah } from '$lib/formatter';

	let {
		initialData,
		isEditMode = false,
		superformData,
		pegawaiOptions = [],
		pegawaiList = [],
		sbmOptions = [],
		sbmList = [],
		onCancel,
		onSuccess
	}: {
		initialData?: any;
		isEditMode?: boolean;
		superformData: any;
		pegawaiOptions: any[];
		pegawaiList: any[];
		sbmOptions: any[];
		sbmList: any[];
		onCancel: () => void;
		onSuccess: () => void;
	} = $props();

	// Initialize Superform
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(superformData, {
		dataType: 'json',
		onSubmit: ({ cancel }) => {
			if (!$form.namaLengkap) {
				toast.error('Gagal', { description: 'Pilih pegawai terlebih dahulu.' });
				cancel();
			}
		},
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success(isEditMode ? 'SPTJM berhasil diperbarui' : 'SPTJM berhasil dibuat');
				successData = result.data?.savedData;
			} else if (result.type === 'failure') {
				const msg = result.data?.message || 'Terjadi kesalahan saat menyimpan data.';
				toast.error('Gagal', { description: msg });
			}
		}
	});

	$effect(() => {
		if (isEditMode && initialData) {
			$form.id = initialData.id;
			$form.namaLengkap = initialData.namaLengkap || '';
			$form.nip = initialData.nip || '';
			$form.jabatan = initialData.jabatan || '';
			$form.tujuan = initialData.tujuan || '';
			$form.tanggalPerjalanan = initialData.tanggalPerjalanan || '';
			$form.tanggalKembali = initialData.tanggalKembali || '';
			$form.tiketBerangkat = initialData.tiketBerangkat || '';
			$form.tiketPulang = initialData.tiketPulang || '';
			$form.biayaSbm = initialData.biayaSbm || '';
			$form.totalBiaya = initialData.totalBiaya || '';
			$form.tanggalTtd = initialData.tanggalTtd || '';
		} else {
			$form.id = undefined;
			$form.namaLengkap = '';
			$form.nip = '';
			$form.jabatan = '';
			$form.tujuan = '';
			$form.tanggalPerjalanan = '';
			$form.tanggalKembali = '';
			$form.tiketBerangkat = '';
			$form.tiketPulang = '';
			$form.biayaSbm = '';
			$form.totalBiaya = '';
			$form.tanggalTtd = '';
		}
	});

	let selectedPegawaiId = $state('');
	let sbmQuery = $state('');
	let selectedSbm = $state<any>(null);

	function handlePegawaiChange(id: string | number) {
		const strId = String(id);
		selectedPegawaiId = strId;
		if (strId) {
			const peg = pegawaiList.find((p: any) => String(p.id) === strId);
			if (peg) {
				$form.namaLengkap = peg.namaLengkap;
				$form.nip = peg.nip || '-';
				$form.jabatan = peg.jabatan;
			}
		} else {
			$form.namaLengkap = '';
			$form.nip = '';
			$form.jabatan = '';
		}
	}

	$effect(() => {
		if (!sbmQuery) {
			selectedSbm = null;
		} else {
			const item = sbmList.find((s: any) => String(s.id) === String(sbmQuery));
			if (item) {
				const extraData = item.data || {};
				selectedSbm = {
					...item,
					tujuanLengkap: item.kecKab,
					tiketEkonomi: extraData.tiketEkonomi || extraData.pEkonomi || 0,
					tiketBisnis: extraData.tiketBisnis || extraData.pBisnis || 0,
					taxiJakarta: extraData.taxiJakarta || 0,
					taxiDaerah: extraData.taxiDaerah || 0,
					uangHarian: item.uangHarian || 0
				};
			} else {
				selectedSbm = null;
			}
		}
	});

	function handleApplySbm() {
		if (!selectedSbm) return;
		$form.tujuan = selectedSbm.tujuanLengkap || $form.tujuan;
		$form.biayaSbm = selectedSbm.tiketEkonomi?.toString() || '';
	}

	function parseNumber(val: any): number {
		if (typeof val === 'number') return val;
		if (!val) return 0;
		const s = String(val).trim();
		const cleanStr = s.replace(/\./g, '');
		const num = parseInt(cleanStr.replace(/\D/g, ''), 10);
		return isNaN(num) ? 0 : num;
	}

	let formattedTiketBerangkat = $state('');
	let formattedTiketPulang = $state('');
	let formattedBiayaSbm = $state('');

	$effect(() => {
		formattedTiketBerangkat = parseNumber($form.tiketBerangkat) ? new Intl.NumberFormat('id-ID').format(parseNumber($form.tiketBerangkat)) : '';
		formattedTiketPulang = parseNumber($form.tiketPulang) ? new Intl.NumberFormat('id-ID').format(parseNumber($form.tiketPulang)) : '';
		formattedBiayaSbm = parseNumber($form.biayaSbm) ? new Intl.NumberFormat('id-ID').format(parseNumber($form.biayaSbm)) : '';
		
		$form.totalBiaya = (parseNumber($form.tiketBerangkat) + parseNumber($form.tiketPulang)).toString();
	});

	function updateField(field: 'tiketBerangkat' | 'tiketPulang' | 'biayaSbm', val: string) {
		const num = parseInt(val.replace(/\D/g, ''), 10);
		$form[field] = isNaN(num) ? '' : num.toString();
	}

	let successData = $state<any>(null);
	let isPreviewOpen = $state(false);
	let previewUrl = $state('');

	function handlePreview(url: string | null) {
		if (url) {
			previewUrl = url;
			isPreviewOpen = true;
		} else {
			toast.error('Gagal', { description: 'Dokumen belum tersedia.' });
		}
	}

	function handleDownload(url: string | null) {
		if (!url) {
			toast.error('Gagal', { description: 'Dokumen belum tersedia.' });
			return;
		}
		const match = url.match(/\/d\/([^/]+)/);
		if (match && match[1]) {
			const downloadUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
			window.location.href = downloadUrl;
		} else {
			window.location.href = url;
		}
	}
</script>

<div class="max-w-5xl mx-auto space-y-6 pb-12" in:fade={{ duration: 200 }}>
	<button
		type="button"
		class="flex items-center gap-2 text-gray-500 hover:text-kementan-green transition-colors font-bold text-xs bg-white px-5 py-2.5 rounded-xl border border-gray-200 w-max shadow-sm"
		onclick={onCancel}
	>
		<ChevronLeft size={16} /> Kembali ke Daftar SPTJM
	</button>

	<form method="POST" action="?/save" use:enhance>
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- FORM UTAMA -->
			<div class="lg:col-span-2 glass-card rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-white/80">
				<div class="bg-gradient-to-r from-kementan-green to-emerald-700 px-8 py-6 text-white relative">
					<div class="relative z-10">
						<h2 class="text-2xl font-extrabold">
							{isEditMode ? 'Edit Dokumen SPTJM' : 'Rekam Bukti Tanggungjawab'}
						</h2>
						<p class="text-emerald-100 font-medium text-sm mt-1">
							Lengkapi form sesuai rincian perjalanan dinas sebenarnya.
						</p>
					</div>
				</div>

				<div class="p-8 space-y-8">
					<!-- Identitas -->
					<div class="space-y-5">
						<h4 class="text-xs font-bold text-kementan-green tracking-widest uppercase border-b border-gray-100 pb-2">
							Identitas Pelaksana
						</h4>
						<SearchableDropdown
							bind:value={selectedPegawaiId}
							label="Pilih Pegawai (Ketik untuk mencari)"
							options={pegawaiOptions}
							placeholder="Contoh: Budi Santoso..."
							onchange={handlePegawaiChange}
						/>
						{#if $errors.namaLengkap}<p class="text-xs text-red-500">Pilih pegawai terlebih dahulu.</p>{/if}

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
							<div>
								<label for="nip" class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">NIP</label>
								<input
									id="nip"
									type="text"
									readonly
									bind:value={$form.nip}
									class="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-600 outline-none"
									placeholder="Otomatis"
								/>
							</div>
							<div>
								<label for="jabatan" class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Jabatan</label>
								<input
									id="jabatan"
									type="text"
									readonly
									bind:value={$form.jabatan}
									class="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-600 outline-none truncate"
									placeholder="Otomatis"
								/>
							</div>
						</div>
					</div>

					<!-- Ketentuan Perjalanan -->
					<div class="space-y-5">
						<h4 class="text-xs font-bold text-kementan-green tracking-widest uppercase border-b border-gray-100 pb-2">
							Ketentuan Perjalanan
						</h4>
						<div>
							<label for="tujuan" class="block text-xs font-bold text-gray-600 uppercase mb-1.5">
								Tujuan Perjalanan <span class="text-red-400">*</span>
							</label>
							<input
								id="tujuan"
								bind:value={$form.tujuan}
								type="text"
								class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium"
								placeholder="Contoh: Bogor, Jawa Barat"
							/>
							{#if $errors.tujuan}<p class="text-xs text-red-500">Tujuan wajib diisi.</p>{/if}
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
							<div>
								<label for="tanggalPerjalanan" class="block text-xs font-bold text-gray-600 uppercase mb-1.5">
									Mulai Tanggal <span class="text-red-400">*</span>
								</label>
								<input
									id="tanggalPerjalanan"
									bind:value={$form.tanggalPerjalanan}
									type="date"
									class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium"
								/>
							</div>
							<div>
								<label for="tanggalKembali" class="block text-xs font-bold text-gray-600 uppercase mb-1.5">
									Selesai Tanggal <span class="text-red-400">*</span>
								</label>
								<input
									id="tanggalKembali"
									bind:value={$form.tanggalKembali}
									type="date"
									class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium"
								/>
							</div>
						</div>
					</div>

					<!-- Rincian Nominal -->
					<div class="space-y-5">
						<h4 class="text-xs font-bold text-kementan-green tracking-widest uppercase border-b border-gray-100 pb-2">
							Rincian Nominal Riil
						</h4>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
							<div>
								<label for="tiketBerangkat" class="block text-[10px] font-bold text-gray-600 uppercase mb-1.5">Tiket Berangkat (Rp)</label>
								<input
									id="tiketBerangkat"
									type="text"
									value={formattedTiketBerangkat}
									class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green font-medium"
									placeholder="contoh: 1.500.000"
									oninput={(e) => updateField('tiketBerangkat', e.currentTarget.value)}
								/>
							</div>
							<div>
								<label for="tiketPulang" class="block text-[10px] font-bold text-gray-600 uppercase mb-1.5">Tiket Pulang (Rp)</label>
								<input
									id="tiketPulang"
									type="text"
									value={formattedTiketPulang}
									class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green font-medium"
									placeholder="contoh: 1.500.000"
									oninput={(e) => updateField('tiketPulang', e.currentTarget.value)}
								/>
							</div>
							<div>
								<label for="biayaSbm" class="block text-[10px] font-bold text-gray-600 uppercase mb-1.5">
									Biaya Tiket Pesawat (Ekonomi SBM - Rp)
								</label>
								<input
									id="biayaSbm"
									type="text"
									value={formattedBiayaSbm}
									class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-blue-500 font-medium"
									placeholder="Otomatis dari CEK SBM"
									oninput={(e) => updateField('biayaSbm', e.currentTarget.value)}
								/>
							</div>
							<div>
								<label for="totalBiaya" class="block text-[10px] font-bold text-gray-600 uppercase mb-1.5">Total Keseluruhan</label>
								<div class="relative">
									<input
										id="totalBiaya"
										type="text"
										readonly
										value={'Rp ' + formatRupiah(parseNumber($form.totalBiaya))}
										class="w-full bg-emerald-50 border border-emerald-200 rounded-xl py-3 px-4 text-sm font-bold text-emerald-800 outline-none"
									/>
									<span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-emerald-600 font-bold">
										OTOMATIS
									</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Penandatanganan -->
					<div class="space-y-5">
						<h4 class="text-xs font-bold text-kementan-green tracking-widest uppercase border-b border-gray-100 pb-2">
							Penandatanganan
						</h4>
						<div class="md:w-1/2">
							<label for="tanggalTtd" class="block text-xs font-bold text-gray-600 uppercase mb-1.5">
								Tanggal Surat Dibuat <span class="text-red-400">*</span>
							</label>
							<input
								id="tanggalTtd"
								bind:value={$form.tanggalTtd}
								type="date"
								class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green font-medium"
							/>
						</div>
					</div>

					<div class="pt-6 border-t border-gray-100 flex gap-4">
						<button
							type="button"
							class="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm w-40"
							onclick={onCancel}
						>
							Batal
						</button>
						<button
							type="submit"
							disabled={$submitting || !$form.nip}
							class="flex-1 px-6 py-3.5 bg-kementan-green text-white font-bold rounded-xl hover:bg-[#004d26] transition-colors flex justify-center items-center gap-2 shadow-md shadow-kementan-green/20 disabled:opacity-70 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
						>
							{#if $submitting}
								<RefreshCw size={18} class="animate-spin" />
								<span>Dalam Proses...</span>
							{:else}
								<Save size={18} /> Simpan & Generate
							{/if}
						</button>
					</div>
				</div>
			</div>

			<!-- SBM LOOKUP PANEL -->
			<div class="space-y-4">
				<div class="glass-card rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-6 bg-white/80">
					<div class="flex items-center gap-2 text-blue-600 mb-4 border-b border-gray-100 pb-3">
						<Search size={18} />
						<h3 class="font-extrabold text-sm uppercase tracking-wider">Cek Data SBM</h3>
					</div>

					<div class="space-y-4">
						<SearchableDropdown
							bind:value={sbmQuery}
							label="Ketik Nama Kota/Kabupaten"
							options={sbmOptions}
							placeholder="Contoh: Bogor"
						/>

						{#if selectedSbm}
							<div transition:fade class="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-4 mt-4">
								<div>
									<p class="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Tujuan Spesifik</p>
									<p class="text-sm font-bold text-blue-900 leading-tight">
										{selectedSbm.tujuanLengkap || "-"}
									</p>
								</div>
								<div class="pt-3 border-t border-blue-100/50">
									<p class="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Tiket Ekonomi SBM</p>
									<p class="text-2xl font-black text-blue-600">
										Rp {formatRupiah(selectedSbm.tiketEkonomi)}
									</p>
									<p class="text-[9px] text-blue-400 font-medium mt-1">*Nilai referensi untuk perbandingan SPTJM</p>
								</div>

								<button
									type="button"
									class="w-full mt-2 py-3 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
									onclick={handleApplySbm}
								>
									<Plus size={14} /> Terapkan ke Form
								</button>
							</div>
						{:else}
							<div transition:fade class="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center mt-4">
								<p class="text-[10px] text-gray-400 font-medium leading-relaxed uppercase tracking-wider">
									Cari kota tujuan untuk melihat referensi biaya perjalanan sesuai standar (SBM).
								</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</form>
</div>

<!-- FULLSCREEN LOADING OVERLAY -->
{#if $submitting}
	<div class="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" transition:fade={{ duration: 200 }}>
		<div class="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center max-w-md w-full text-center border border-emerald-100" transition:slide>
			<div class="w-16 h-16 bg-emerald-50 text-kementan-green rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-emerald-100">
				<RefreshCw size={32} class="animate-spin" />
			</div>
			<h3 class="text-xl font-extrabold text-gray-900 mb-3 tracking-tight">Memproses Dokumen SPTJM</h3>
			<p class="text-sm text-gray-500 font-medium leading-relaxed">
				Sistem sedang menyusun dokumen PDF dan mengunggahnya ke Google Drive. Mohon tunggu beberapa saat...
			</p>
		</div>
	</div>
{/if}

<!-- SUCCESS MODAL OVERLAY -->
{#if successData && !$submitting}
	<div class="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" transition:fade={{ duration: 200 }}>
		<div
			transition:svelteScale={{ start: 0.95, duration: 300 }}
			class="bg-white rounded-[2rem] shadow-2xl p-8 sm:p-10 w-full max-w-md flex flex-col items-center text-center relative overflow-hidden ring-1 ring-black/5"
		>
			<!-- Decorative Background -->
			<div class="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
			<div class="absolute -top-24 -left-24 w-48 h-48 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

			<!-- Success Icon -->
			<div class="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 relative z-10 border border-emerald-100 shadow-sm">
				<CheckCircle size={40} strokeWidth={2.5} />
			</div>
			
			<h3 class="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight relative z-10">Generate Selesai!</h3>
			<p class="text-sm text-slate-500 font-medium leading-relaxed mb-8 relative z-10 px-4">
				Dokumen SPTJM <strong class="text-slate-700">{successData.no || 'Baru'}</strong> berhasil diterbitkan dan tersimpan di Google Drive.
			</p>

			<!-- Action Buttons -->
			<div class="flex items-center justify-center gap-3 w-full relative z-10">
				<button
					type="button"
					onclick={() => handlePreview(successData.fileLink)}
					class="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold text-xs flex items-center justify-center gap-2 uppercase tracking-wider shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
				>
					<Eye size={14} /> Preview
				</button>
				<button
					type="button"
					onclick={() => handleDownload(successData.fileLink)}
					class="flex-1 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all font-bold text-xs flex items-center justify-center gap-2 uppercase tracking-wider border border-indigo-200 shadow-sm hover:-translate-y-0.5 cursor-pointer"
				>
					<Download size={14} /> Download
				</button>
			</div>
			
			<button
				type="button"
				onclick={onSuccess}
				class="mt-4 px-4 py-2.5 w-full bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all font-bold text-xs uppercase tracking-wider border border-slate-200 shadow-sm hover:-translate-y-0.5 cursor-pointer relative z-10"
			>
				Kembali ke Daftar SPTJM
			</button>
		</div>
	</div>
{/if}

<FilePreviewModal bind:isOpen={isPreviewOpen} fileUrl={previewUrl} />
