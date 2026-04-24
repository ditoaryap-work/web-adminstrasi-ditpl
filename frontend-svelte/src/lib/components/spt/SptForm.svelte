<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { fade, slide, fly, scale as svelteScale } from 'svelte/transition';
	import {
		ChevronLeft,
		Trash2,
		Users,
		FileText,
		ChevronDown,
		Zap,
		MapPin,
		Calendar,
		Save,
		RefreshCw,
		CheckCircle,
		Eye,
		Download
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import SearchableDropdown from '$lib/components/ui/SearchableDropdown.svelte';
	import FilePreviewModal from '$lib/components/ui/FilePreviewModal.svelte';
	import { toast } from 'svelte-sonner';

	// Props
	let {
		initialData,
		isEditMode = false,
		superformData,
		pegawaiOptions = [],
		pegawaiList = [],
		onCancel,
		onSuccess
	}: {
		initialData?: any;
		isEditMode?: boolean;
		superformData: any;
		pegawaiOptions: any[];
		pegawaiList: any[];
		onCancel: () => void;
		onSuccess: () => void;
	} = $props();

	// Initialize Superform
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(superformData, {
		dataType: 'json',
		onSubmit: ({ cancel }) => {
			if ($form.peserta.length === 0) {
				toast.error('Gagal', { description: 'Harap tambahkan minimal 1 peserta dalam SPT ini.' });
				cancel();
			}
		},
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success(isEditMode ? 'SPT berhasil diperbarui' : 'SPT berhasil dibuat');
				successData = result.data?.savedData;
			} else if (result.type === 'failure') {
				const msg = result.data?.message || 'Terjadi kesalahan saat menyimpan data.';
				toast.error('Gagal', { description: msg });
			}
		}
	});

	// Populate form if we have initialData and it's edit mode
	$effect(() => {
		if (isEditMode && initialData) {
			$form.id = initialData.id;
			$form.no = initialData.no || '';
			$form.maksudPerjalanan = initialData.maksudPerjalanan || '';
			$form.kegiatan = initialData.kegiatan || '';
			$form.mak = initialData.mak || '';
			$form.tanggalSurat = initialData.tanggalSurat || '';
			$form.peserta = initialData.peserta || [];
		} else {
			$form.id = undefined;
			$form.no = '';
			$form.maksudPerjalanan = '';
			$form.kegiatan = '';
			$form.mak = '';
			$form.tanggalSurat = '';
			$form.peserta = [];
		}
	});

	// Local State
	let participantSelector = $state('');
	let isBulkFill = $state(false);
	let bulkTujuan = $state('');
	let bulkTanggal = $state('');

	// Handlers
	function addParticipant(value: string | number) {
		if (!value) return;
		const peg = pegawaiList.find((p: any) => String(p.id) === String(value));
		if (!peg) return;

		// Prevent duplicates
		if ($form.peserta.some((p: any) => p.namaLengkap === peg.namaLengkap)) {
			toast.error('Peserta Sudah Ada', { description: `${peg.namaLengkap} sudah ada dalam daftar peserta.` });
			participantSelector = '';
			return;
		}

		$form.peserta = [
			...$form.peserta,
			{
				namaLengkap: peg.namaLengkap,
				nip: peg.nip || '-',
				jabatan: peg.jabatan || '',
				pangkatGol: peg.golongan || '-',
				tujuan: bulkTujuan || '',
				tanggalPelaksanaan: bulkTanggal || '',
				lamanya: '',
				tanggalMulai: '',
				tanggalSelesai: ''
			}
		];
		participantSelector = '';
	}

	function removeParticipant(index: number) {
		$form.peserta = $form.peserta.filter((_: any, i: number) => i !== index);
	}

	function applyBulkFill() {
		$form.peserta = $form.peserta.map((p: any) => ({
			...p,
			tujuan: bulkTujuan || p.tujuan,
			tanggalPelaksanaan: bulkTanggal || p.tanggalPelaksanaan
		}));
	}

	function clearBulk() {
		bulkTujuan = '';
		bulkTanggal = '';
		applyBulkFill();
		isBulkFill = false;
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
		<ChevronLeft size={16} /> Kembali ke Daftar
	</button>

	<form method="POST" action="?/save" use:enhance class="glass-card rounded-[2rem] shadow-xl border border-white/50 overflow-hidden bg-white/80">
		<div class="bg-gradient-to-r from-emerald-700 to-kementan-green px-10 py-8 text-white relative">
			<div class="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
				<FileText size={200} />
			</div>
			<div class="relative z-10">
				<h2 class="text-3xl font-extrabold tracking-tight">
					{isEditMode ? 'Edit Dokumen SPT' : 'Buat Surat Perintah Tugas Baru'}
				</h2>
				<p class="text-emerald-50/90 font-medium text-sm mt-2 max-w-md leading-relaxed">
					Dokumen penugasan resmi untuk perjalanan dinas. Pastikan setiap detail SPT sudah sesuai dengan SK Direktur.
				</p>
			</div>
		</div>

		<div class="p-10 space-y-12">
			<!-- INFORMASI DASAR -->
			<div class="space-y-6">
				<div class="flex items-center gap-3 border-b border-gray-100 pb-4">
					<div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner border border-emerald-100">
						<FileText size={20} />
					</div>
					<div>
						<h4 class="text-sm font-extrabold text-gray-900 tracking-widest uppercase">
							Informasi Dasar Dokumen
						</h4>
						<p class="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Detail utama surat penugasan</p>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div class="space-y-2">
						<label for="no" class="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
							Nomor Surat <span class="text-red-400">*</span>
						</label>
						<input
							id="no"
							bind:value={$form.no}
							type="text"
							class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:bg-white transition-all font-bold placeholder:text-slate-400/70"
							placeholder="Contoh: 147.6/TU-040/J.4/11/2025"
						/>
						{#if $errors.no}<p class="text-xs text-red-500 font-medium px-2">{$errors.no}</p>{/if}
					</div>
					<div class="space-y-2">
						<label for="tanggalSurat" class="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
							Tanggal Surat <span class="text-red-400">*</span>
						</label>
						<input
							id="tanggalSurat"
							bind:value={$form.tanggalSurat}
							type="date"
							class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:bg-white transition-all font-bold text-gray-800"
						/>
						{#if $errors.tanggalSurat}<p class="text-xs text-red-500 font-medium px-2">{$errors.tanggalSurat}</p>{/if}
					</div>
				</div>

				<div class="space-y-6">
					<div class="space-y-2">
						<label for="maksudPerjalanan" class="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
							Maksud Perjalanan / Dasar Penugasan <span class="text-red-400">*</span>
						</label>
						<textarea
							id="maksudPerjalanan"
							bind:value={$form.maksudPerjalanan}
							rows="3"
							class="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-5 text-sm outline-none focus:border-kementan-green focus:bg-white transition-all font-bold leading-relaxed placeholder:text-slate-400/70 custom-scrollbar"
							placeholder="Jelaskan tujuan dan landasan hukum kegiatan penugasan ini..."
						></textarea>
						{#if $errors.maksudPerjalanan}<p class="text-xs text-red-500 font-medium px-2">{$errors.maksudPerjalanan}</p>{/if}
					</div>

					<div class="space-y-2">
						<label for="kegiatan" class="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
							Kegiatan <span class="text-red-400">*</span>
						</label>
						<input
							id="kegiatan"
							bind:value={$form.kegiatan}
							type="text"
							class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:bg-white transition-all font-bold placeholder:text-slate-400/70"
							placeholder="Contoh: Bimbingan Teknis Sistem Informasi 2025"
						/>
						{#if $errors.kegiatan}<p class="text-xs text-red-500 font-medium px-2">{$errors.kegiatan}</p>{/if}
					</div>

					<div class="space-y-2">
						<label for="mak" class="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
							MAK (Mata Anggaran Keluaran) <span class="text-red-400">*</span>
						</label>
						<input
							id="mak"
							bind:value={$form.mak}
							type="text"
							class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:bg-white transition-all font-bold placeholder:text-slate-400/70"
							placeholder="Contoh: MAK 7012.EAH.001.054.A.524111"
						/>
						{#if $errors.mak}<p class="text-xs text-red-500 font-medium px-2">{$errors.mak}</p>{/if}
					</div>
                </div>
			</div>

			<!-- PESERTA PENUGASAN -->
			<div class="space-y-6">
				<div class="flex items-center justify-between border-b border-gray-100 pb-4">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner border border-indigo-100">
							<Users size={20} />
						</div>
						<div>
							<h4 class="text-sm font-extrabold text-gray-900 tracking-widest uppercase">
								Peserta Penugasan
							</h4>
							<p class="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Daftar pegawai yang ditugaskan</p>
						</div>
					</div>
					<div
						class={cn(
							'px-4 py-2 rounded-xl text-[10px] font-black tracking-widest flex items-center gap-2 shadow-sm border',
							$form.peserta.length > 5
								? 'bg-orange-50 text-orange-700 border-orange-200'
								: 'bg-emerald-50 text-emerald-700 border-emerald-200'
						)}
					>
						<FileText size={14} />
						<span>{$form.peserta.length > 5 ? '2 Halaman' : '1 Halaman'}</span>
					</div>
				</div>

				<!-- Search Dropdown Tambah Peserta -->
				<div class="bg-gradient-to-r from-emerald-50 to-emerald-100/30 rounded-[2rem] p-6 border border-emerald-100/50 shadow-sm">
					<SearchableDropdown
						bind:value={participantSelector}
						label="+ Tambah Peserta Penugasan"
						options={pegawaiOptions}
						placeholder="Ketik nama atau NIP pegawai (Auto-complete)..."
						onchange={addParticipant}
					/>
				</div>
                {#if $errors.peserta && typeof $errors.peserta === 'string'}
                    <p class="text-xs text-red-500 font-medium px-2">{$errors.peserta}</p>
                {/if}

				<!-- Auto Fill Section -->
				{#if $form.peserta.length > 1}
					<div
						transition:slide
						class="rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md"
					>
						<button
							type="button"
							class="w-full flex items-center justify-between px-8 py-6 bg-slate-50/60 hover:bg-slate-100/80 transition-all outline-none"
							onclick={() => (isBulkFill = !isBulkFill)}
						>
							<div class="flex items-center gap-5">
								<div
									class={cn(
										'w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 border',
										isBulkFill ? 'rotate-[360deg] bg-kementan-green text-white border-kementan-green shadow-md shadow-kementan-green/20' : 'bg-emerald-50 text-kementan-green border-emerald-100'
									)}
								>
									<Zap size={20} />
								</div>
								<div class="text-left space-y-1">
									<span class="block text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Auto Fill Panel</span>
									<span class="block text-[10px] text-slate-500 font-bold uppercase">Sinkronkan Tujuan & Waktu Peserta Secara Massal</span>
								</div>
							</div>
							<div class="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase transition-all hover:border-emerald-500 hover:text-emerald-700 flex items-center gap-2 shadow-sm">
								<span>{isBulkFill ? 'Tutup Panel' : 'Buka Panel'}</span>
								<ChevronDown size={14} class={cn('transition-transform duration-500', isBulkFill && 'rotate-180')} />
							</div>
						</button>

						{#if isBulkFill}
							<div transition:slide class="p-8 pt-4 bg-slate-50/40 space-y-6 border-t border-slate-100">
								<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
									<div class="space-y-3">
										<label class="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
											<MapPin size={14} class="text-emerald-600" /> Lokasi Tujuan Serentak
										</label>
										<input
											bind:value={bulkTujuan}
											type="text"
											class="w-full bg-white border border-slate-200 rounded-xl py-4 px-5 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all font-bold placeholder:text-slate-400/70 shadow-sm"
											placeholder="Ketik lokasi tujuan utama..."
											oninput={applyBulkFill}
										/>
									</div>
									<div class="space-y-3">
										<label class="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
											<Calendar size={14} class="text-emerald-600" /> Waktu Pelaksanaan Serentak
										</label>
										<input
											bind:value={bulkTanggal}
											type="text"
											class="w-full bg-white border border-slate-200 rounded-xl py-4 px-5 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all font-bold placeholder:text-slate-400/70 shadow-sm"
											placeholder="Contoh: 12 - 14 Maret 2025"
											oninput={applyBulkFill}
										/>
									</div>
								</div>

								<div class="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-200/50 gap-4 mt-6">
									<p class="text-[10px] text-slate-400 font-medium italic">
										*Perubahan lokasi dan waktu di atas akan langsung diterapkan (overwrite) ke semua peserta terdaftar.
									</p>
									<button
										type="button"
										onclick={clearBulk}
										class="px-5 py-2.5 rounded-xl text-[10px] font-black text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 uppercase tracking-widest transition-all flex items-center gap-2 shrink-0"
									>
										<Trash2 size={14} /> Bersihkan & Tutup
									</button>
								</div>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Daftar Peserta -->
				{#if $form.peserta.length > 0}
					<div class="space-y-5" transition:fade={{ duration: 200 }}>
						{#each $form.peserta as p, idx}
							<div class="group bg-white rounded-2xl border border-slate-200 p-8 relative hover:border-emerald-400 hover:shadow-lg transition-all duration-300">
								<!-- Hapus Btn -->
								<button
									type="button"
									class="absolute top-6 right-6 w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm border border-transparent hover:border-rose-100"
									onclick={() => removeParticipant(idx)}
									title="Hapus peserta ini"
								>
									<Trash2 size={16} />
								</button>

								<div class="flex flex-col lg:flex-row gap-10 lg:pr-12">
									<!-- Identitas -->
									<div class="flex-1 lg:max-w-[320px]">
										<div class="flex items-center gap-4 mb-5">
											<div class="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-600 to-kementan-green text-white flex items-center justify-center text-sm font-black shadow-md shadow-emerald-200">
												{idx + 1}
											</div>
											<h5 class="text-[15px] font-black text-slate-800 leading-tight">
												{p.namaLengkap}
											</h5>
										</div>
										<div class="grid grid-cols-1 gap-3 ml-14">
											<div class="flex items-center gap-3">
												<span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] w-8">NIP</span>
												<span class="text-xs text-slate-700 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{p.nip || '-'}</span>
											</div>
											<div class="flex items-center gap-3">
												<span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] w-8">Gol</span>
												<span class="px-2.5 py-1 rounded-lg bg-indigo-50 text-[10px] text-indigo-700 font-black border border-indigo-100/50 uppercase">
													{p.pangkatGol || '-'}
												</span>
											</div>
											<div class="flex items-start gap-3">
												<span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] w-8 mt-1">Jab</span>
												<span class="text-xs text-slate-600 font-medium leading-relaxed italic">{p.jabatan || '-'}</span>
											</div>
										</div>
									</div>

									<!-- Input Lokasi & Tanggal -->
									<div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full lg:border-l lg:border-slate-100 lg:pl-10 pt-6 lg:pt-0 border-t border-slate-100 sm:border-t-0">
										<div class="space-y-3">
											<label class="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
												<MapPin size={14} class="text-emerald-600" /> Lokasi Tujuan
											</label>
											<input
												bind:value={$form.peserta[idx].tujuan}
												type="text"
												class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold placeholder:text-slate-400/70 shadow-sm focus:ring-4 focus:ring-emerald-500/10"
												placeholder="Contoh: Bogor, Jawa Barat"
												required
											/>
										</div>
										<div class="space-y-3">
											<label class="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
												<Calendar size={14} class="text-emerald-600" /> Waktu Pelaksanaan
											</label>
											<input
												bind:value={$form.peserta[idx].tanggalPelaksanaan}
												type="text"
												class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold placeholder:text-slate-400/70 shadow-sm focus:ring-4 focus:ring-emerald-500/10"
												placeholder="Contoh: 12 - 14 Mar 2025"
												required
											/>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- FOOTER ACTIONS -->
			<div class="pt-10 border-t border-gray-100 flex gap-4 mt-12 bg-white sticky bottom-0 z-20 pb-4">
				<button
					type="button"
					class="px-8 py-4 bg-white text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm w-40 border border-gray-200 shadow-sm"
					onclick={onCancel}
				>
					Batal
				</button>
				<button
					type="submit"
					disabled={$submitting}
					class="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-600 to-kementan-green text-white font-black rounded-xl hover:shadow-[0_0_20px_rgba(0,102,51,0.4)] transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-sm uppercase tracking-widest shadow-lg shadow-kementan-green/20"
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
	</form>
</div>

<!-- FULLSCREEN LOADING OVERLAY -->
{#if $submitting}
	<div class="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" transition:fade={{ duration: 200 }}>
		<div class="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center max-w-md w-full text-center border border-emerald-100" transition:slide>
			<div class="w-16 h-16 bg-emerald-50 text-kementan-green rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-emerald-100">
				<RefreshCw size={32} class="animate-spin" />
			</div>
			<h3 class="text-xl font-extrabold text-gray-900 mb-3 tracking-tight">Memproses Dokumen SPT</h3>
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
				Dokumen SPT <strong class="text-slate-700">{successData.no || 'Baru'}</strong> berhasil diterbitkan dan tersimpan di Google Drive.
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
				Kembali ke Daftar SPT
			</button>
		</div>
	</div>
{/if}

<FilePreviewModal bind:isOpen={isPreviewOpen} fileUrl={previewUrl} />
