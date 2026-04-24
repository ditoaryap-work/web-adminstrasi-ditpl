<script lang="ts">
	import {
		Plus,
		Search,
		Edit,
		Trash2,
		ChevronLeft,
		ChevronRight,
		FileSignature,
		Eye,
		Download,
		RefreshCw
	} from 'lucide-svelte';
	import {
		formatIndonesianDatePlain,
		formatIndonesianDateTimePlain,
		formatRupiah
	} from '$lib/formatter';
	import { cn } from '$lib/utils';
	import { fade, slide } from 'svelte/transition';
	import FilePreviewModal from '$lib/components/ui/FilePreviewModal.svelte';

	// Props
	let {
		sptjmList = [],
		onEdit,
		onRefresh
	}: {
		sptjmList: any[];
		onEdit: (item: any) => void;
		onRefresh?: () => void;
	} = $props();

	// State
	let searchQuery = $state('');
	let currentPage = $state(1);
	let isLoading = $state(false);
	const ITEMS_PER_PAGE = 10;

	let isPreviewOpen = $state(false);
	let currentPreviewUrl = $state('');

	function triggerDownload(url: string, filename: string) {
		const match = url.match(/\/d\/([^/]+)/);
		if (match && match[1]) {
			const downloadUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
			window.location.href = downloadUrl;
		} else {
			window.location.href = url;
		}
	}

	function openPreview(url: string) {
		currentPreviewUrl = url;
		isPreviewOpen = true;
	}

	function handleDelete(id: string) {
		const confirmed = confirm('Apakah Anda yakin ingin menghapus SPTJM ini?');
		if (confirmed) {
			const form = document.createElement('form');
			form.method = 'POST';
			form.action = '?/delete';

			const idInput = document.createElement('input');
			idInput.type = 'hidden';
			idInput.name = 'id';
			idInput.value = id;

			form.appendChild(idInput);
			document.body.appendChild(form);
			form.submit();
		}
	}

	// Derived state
	let filteredList = $derived(
		searchQuery.trim()
			? sptjmList.filter((s: any) => {
					const q = searchQuery.toLowerCase();
					const matchNama = (s.namaLengkap || '').toLowerCase().includes(q);
					const matchNip = (s.nip || '').toLowerCase().includes(q);
					const matchTujuan = (s.tujuan || '').toLowerCase().includes(q);
					return matchNama || matchNip || matchTujuan;
				})
			: sptjmList
	);

	let totalPages = $derived(Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1);
	let safePage = $derived(Math.min(currentPage, totalPages));
	let paginatedList = $derived(
		filteredList.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)
	);

	$effect(() => {
		if (searchQuery) currentPage = 1;
	});
</script>

<div class="space-y-6">
	<!-- Filter & Search -->
	<div
		transition:slide
		class="glass-card flex flex-col gap-4 rounded-2xl border border-white/40 p-4 shadow-sm lg:flex-row"
	>
		<div class="relative flex-1">
			<Search class="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={18} />
			<input
				bind:value={searchQuery}
				type="text"
				placeholder="Cari berdasarkan nama pegawai, NIP, atau tujuan..."
				class="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-12 text-sm font-medium text-gray-900 shadow-sm transition-all outline-none placeholder:text-gray-400 focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10"
			/>
		</div>
		<button
			class="group flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-kementan-green hover:bg-emerald-50 hover:text-kementan-green"
			onclick={() => {
				isLoading = true;
				if (onRefresh) onRefresh();
				setTimeout(() => (isLoading = false), 500);
			}}
		>
			<RefreshCw size={18} class={cn(isLoading && 'animate-spin text-kementan-green')} />
			<span class="hidden sm:inline">Refresh Data</span>
		</button>
	</div>

	<!-- Table Section -->
	<div
		class="glass-card relative min-h-[400px] overflow-hidden rounded-3xl border border-gray-100 bg-white/80 shadow-md"
	>
		<div class="custom-scrollbar overflow-x-auto">
			<table class="w-full min-w-[900px] border-collapse text-left">
				<thead>
					<tr
						class="border-b border-gray-200 bg-gray-50/80 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase"
					>
						<th class="w-[35%] px-6 py-5">Identitas Pegawai</th>
						<th class="w-[35%] px-6 py-5">Detail SPTJM & Biaya</th>
						<th class="px-6 py-5 text-center">Aksi Dokumen</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100 bg-white/40">
					{#if paginatedList.length > 0}
						{#each paginatedList as sptjm (sptjm.id)}
							<tr transition:fade class="group transition-colors hover:bg-emerald-50/40">
								<!-- IDENTITAS PEGAWAI -->
								<td class="px-6 py-5 align-middle">
									<div class="flex items-center gap-4">
										<div
											class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-100/50 bg-gradient-to-br from-emerald-100 to-emerald-50 text-xs font-bold text-kementan-green shadow-sm"
										>
											PJ
										</div>
										<div>
											<p
												class="mb-1 max-w-[250px] truncate text-sm leading-tight font-extrabold text-gray-900"
												title={sptjm.namaLengkap}
											>
												{sptjm.namaLengkap || '-'}
											</p>
											<div class="mt-1.5 flex items-center gap-2">
												<span
													class="rounded-md border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[9px] font-bold tracking-wider text-indigo-700 uppercase"
												>
													{sptjm.nip || 'Non-NIP'}
												</span>
												<p
													class="border-l border-gray-200 pl-2 text-[9px] font-medium text-gray-500 italic"
												>
													Dibuat: {sptjm.createdAt
														? formatIndonesianDateTimePlain(sptjm.createdAt)
														: '-'}
												</p>
											</div>
										</div>
									</div>
								</td>

								<!-- DETAIL SPTJM & BIAYA -->
								<td class="px-6 py-5 align-middle">
									<div class="space-y-2">
										<div class="flex flex-col">
											<span
												class="max-w-[250px] truncate text-sm font-extrabold text-gray-900"
												title={sptjm.tujuan}
											>
												Tujuan: {sptjm.tujuan || '-'}
											</span>
										</div>
										<div class="flex items-center gap-2">
											<div
												class="inline-flex items-center rounded-md border border-gray-200 bg-gray-100/80 px-2 py-1"
											>
												<span class="text-[9px] font-bold tracking-widest text-gray-600 uppercase">
													Total: {formatRupiah(Number(sptjm.totalBiaya || 0))}
												</span>
											</div>
											<div
												class="inline-block rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-[8px] font-black tracking-widest text-emerald-700 uppercase shadow-sm"
											>
												{sptjm.timPoksi || 'UMUM'}
											</div>
										</div>
									</div>
								</td>

								<!-- AKSI DOKUMEN -->
								<td class="px-6 py-4 text-center">
									<div class="flex items-center justify-center gap-2">
										<!-- View/Download Group -->
										{#if sptjm.fileLink}
											<div
												class="flex items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 p-1.5 shadow-sm"
											>
												<button
													type="button"
													class="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-sm transition-colors hover:bg-blue-700"
													title="Preview Dokumen"
													onclick={(e) => {
														e.preventDefault();
														openPreview(sptjm.fileLink);
													}}
												>
													<Eye size={13} /> Preview
												</button>
												<button
													type="button"
													class="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[10px] font-bold tracking-wider text-indigo-700 uppercase shadow-sm transition-colors hover:bg-indigo-100"
													title="Download File"
													onclick={(e) => {
														e.preventDefault();
														triggerDownload(
															sptjm.fileLink,
															`SPTJM_${sptjm.namaLengkap?.replace(/\s/g, '_')}`
														);
													}}
												>
													<Download size={13} /> Download
												</button>
											</div>
										{:else}
											<span
												class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-[10px] font-bold tracking-widest text-gray-600 uppercase"
											>
												Menunggu Draft
											</span>
										{/if}

										<!-- Edit/Delete Group -->
										<div class="ml-2 flex items-center gap-2 border-l border-gray-100 pl-3">
											<button
												type="button"
												class="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold tracking-wider text-emerald-700 uppercase shadow-sm transition-colors hover:bg-emerald-100"
												title="Edit SPTJM"
												onclick={(e) => {
													e.preventDefault();
													onEdit(sptjm);
												}}
											>
												<Edit size={13} /> Edit
											</button>
											<button
												type="button"
												class="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[10px] font-bold tracking-wider text-rose-700 uppercase shadow-sm transition-colors hover:bg-rose-100"
												title="Hapus SPTJM"
												onclick={(e) => {
													e.preventDefault();
													handleDelete(sptjm.id);
												}}
											>
												<Trash2 size={13} /> Hapus
											</button>
										</div>
									</div>
								</td>
							</tr>
						{/each}
					{:else}
						<tr>
							<td colspan="3" class="py-16 text-center">
								<div class="flex flex-col items-center gap-4 py-8">
									<div
										class="flex h-20 w-20 items-center justify-center rounded-full border border-gray-100 bg-gray-50 text-gray-300 shadow-inner"
									>
										<FileSignature size={36} />
									</div>
									<div>
										<p class="mb-1 text-sm font-extrabold tracking-widest text-gray-800 uppercase">
											Data Tidak Ditemukan
										</p>
										<p class="mx-auto max-w-xs text-xs text-gray-500">
											Belum ada data SPTJM yang sesuai dengan kriteria yang Anda cari.
										</p>
									</div>
								</div>
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if filteredList.length > 0}
			<div
				class="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4"
			>
				<p class="text-xs font-medium text-gray-600">
					Menampilkan <span class="font-bold text-gray-700"
						>{(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(
							safePage * ITEMS_PER_PAGE,
							filteredList.length
						)}</span
					>
					dari <span class="font-bold text-gray-700">{filteredList.length}</span>
				</p>
				<div class="flex gap-2">
					<button
						disabled={safePage <= 1}
						class="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
						onclick={() => currentPage--}
					>
						<ChevronLeft size={16} />
					</button>
					<button
						disabled={safePage >= totalPages}
						class="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
						onclick={() => currentPage++}
					>
						<ChevronRight size={16} />
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<FilePreviewModal bind:isOpen={isPreviewOpen} fileUrl={currentPreviewUrl} />
