<script lang="ts">
	import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, FileSignature, Eye, Download, RefreshCw } from 'lucide-svelte';
	import { formatIndonesianDatePlain, formatIndonesianDateTimePlain } from '$lib/formatter';
	import { cn } from '$lib/utils';
	import { fade, slide } from 'svelte/transition';
	import FilePreviewModal from '$lib/components/ui/FilePreviewModal.svelte';

	// Props
	let {
		sptList = [],
		onEdit,
		onRefresh
	}: {
		sptList: any[];
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

	// Actions (Mock for now, ideally download/preview happen via an API or target_blank)
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
		// In a real scenario we use form actions, but here we can emit an event or form trigger.
		const confirmed = confirm('Apakah Anda yakin ingin menghapus SPT ini?');
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
			? sptList.filter((s: any) => {
					const q = searchQuery.toLowerCase();
					const matchNo = (s.no || '').toLowerCase().includes(q);
					const matchTujuan = s.peserta?.some(
						(p: any) =>
							(p.tujuan || '').toLowerCase().includes(q) ||
							(p.namaLengkap || '').toLowerCase().includes(q)
					);
					return matchNo || matchTujuan;
				})
			: sptList
	);

	let totalPages = $derived(Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1);
	let safePage = $derived(Math.min(currentPage, totalPages));
	let paginatedList = $derived(
		filteredList.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)
	);

	// Watcher for search clearing
	$effect(() => {
		if (searchQuery) currentPage = 1;
	});
</script>

<div class="space-y-6">
	<!-- Filter & Search -->
	<div transition:slide class="glass-card p-4 rounded-2xl flex flex-col lg:flex-row gap-4 border border-white/40 shadow-sm">
		<div class="relative flex-1">
			<Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
			<input
				bind:value={searchQuery}
				type="text"
				placeholder="Cari berdasarkan nama peserta atau nomor surat..."
				class="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all shadow-sm text-sm font-medium placeholder:text-gray-400"
			/>
		</div>
		<button
			class="flex justify-center items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:text-kementan-green hover:border-kementan-green hover:bg-emerald-50 transition-all shadow-sm text-sm font-bold group"
			onclick={() => {
				isLoading = true;
				if (onRefresh) onRefresh();
				setTimeout(() => isLoading = false, 500);
			}}
		>
			<RefreshCw size={18} class={cn(isLoading && 'animate-spin text-kementan-green')} />
			<span class="hidden sm:inline">Refresh Data</span>
		</button>
	</div>

	<!-- Table Section -->
	<div class="glass-card rounded-3xl overflow-hidden shadow-md border border-gray-100 min-h-[400px] relative bg-white/80">
		<div class="overflow-x-auto custom-scrollbar">
			<table class="w-full text-left border-collapse min-w-[900px]">
				<thead>
					<tr class="bg-gray-50/80 text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-gray-200">
						<th class="py-5 px-6 w-[35%]">Identitas Dokumen</th>
						<th class="py-5 px-6 w-[35%]">Rincian Perjalanan</th>
						<th class="py-5 px-6 text-center">Aksi Dokumen</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100 bg-white/40">
					{#if paginatedList.length > 0}
						{#each paginatedList as spt (spt.id)}
							<tr
								transition:fade
								class="group hover:bg-emerald-50/40 transition-colors"
							>
								<!-- IDENTITAS DOKUMEN -->
								<td class="py-5 px-6 align-middle">
									<div class="flex items-center gap-4">
										<div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-kementan-green font-bold border border-emerald-100/50 text-xs shrink-0 shadow-sm">
											SPT
										</div>
										<div>
											<p class="text-sm font-extrabold text-gray-900 leading-tight mb-1 truncate max-w-[250px]" title={spt.no}>
												{spt.no || '[NOMOR BELUM DIISI]'}
											</p>
											<div class="flex items-center gap-2 mt-1.5">
												<span class="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 uppercase tracking-wider">
													{spt.peserta?.length || 0} Peserta
												</span>
												<p class="text-[9px] text-gray-500 font-medium italic border-l border-gray-200 pl-2">
													Dibuat: {spt.createdAt ? formatIndonesianDateTimePlain(spt.createdAt) : '-'}
												</p>
											</div>
										</div>
									</div>
								</td>

								<!-- RINCIAN PERJALANAN -->
								<td class="py-5 px-6 align-middle">
									<div class="space-y-2">
										<div class="flex flex-col">
											<span class="text-sm font-extrabold text-gray-900 truncate max-w-[250px]" title={spt.peserta?.[0]?.tujuan}>
												Tujuan: {spt.peserta?.[0]?.tujuan || '-'}
											</span>
										</div>
										<div class="flex items-center gap-2">
											<div class="inline-flex items-center px-2 py-1 rounded-md bg-gray-100/80 border border-gray-200">
												<span class="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
													{spt.tanggalSurat ? formatIndonesianDatePlain(spt.tanggalSurat) : '-'}
												</span>
											</div>
											<div class="inline-block px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-[8px] font-black text-emerald-700 uppercase tracking-widest shadow-sm">
												{spt.timPoksi || 'UMUM'}
											</div>
										</div>
									</div>
								</td>

								<!-- AKSI DOKUMEN -->
								<td class="py-4 px-6 text-center">
									<div class="flex items-center justify-center gap-2">
										<!-- View/Download Group -->
										{#if spt.fileLink}
											<div class="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-100 shadow-sm">
												<button
													type="button"
													class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-bold text-[10px] flex items-center gap-1.5 uppercase tracking-wider shadow-sm"
													title="Preview Dokumen"
													onclick={(e) => { e.preventDefault(); openPreview(spt.fileLink); }}
												>
													<Eye size={13} /> Preview
												</button>
												<button
													type="button"
													class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors font-bold text-[10px] flex items-center gap-1.5 uppercase tracking-wider border border-indigo-200 shadow-sm"
													title="Download File"
													onclick={(e) => { e.preventDefault(); triggerDownload(spt.fileLink, `SPT_${spt.no.replace(/\//g, '_')}`); }}
												>
													<Download size={13} /> Download
												</button>
											</div>
										{:else}
											<span class="text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
												Menunggu Draft
											</span>
										{/if}

										<!-- Edit/Delete Group -->
										<div class="flex items-center gap-2 ml-2 pl-3 border-l border-gray-100">
											<button
												type="button"
												class="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
												title="Edit SPT"
												onclick={(e) => { e.preventDefault(); onEdit(spt); }}
											>
												<Edit size={13} /> Edit
											</button>
											<button
												type="button"
												class="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
												title="Hapus SPT"
												onclick={(e) => { e.preventDefault(); handleDelete(spt.id); }}
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
									<div class="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-100 shadow-inner">
										<FileSignature size={36} />
									</div>
									<div>
										<p class="text-gray-800 font-extrabold uppercase tracking-widest text-sm mb-1">
											Data Tidak Ditemukan
										</p>
										<p class="text-gray-500 text-xs max-w-xs mx-auto">
											Belum ada data SPT yang sesuai dengan kriteria yang Anda cari.
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
			<div class="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
				<p class="text-xs text-gray-600 font-medium">
					Menampilkan <span class="font-bold text-gray-700">{(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredList.length)}</span> 
					dari <span class="font-bold text-gray-700">{filteredList.length}</span>
				</p>
				<div class="flex gap-2">
					<button
						disabled={safePage <= 1}
						class="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
						onclick={() => currentPage--}
					>
						<ChevronLeft size={16} />
					</button>
					<button
						disabled={safePage >= totalPages}
						class="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
