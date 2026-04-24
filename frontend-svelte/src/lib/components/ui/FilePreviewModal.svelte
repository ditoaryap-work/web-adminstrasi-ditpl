<script lang="ts">
	import { FileText, ExternalLink, X, Download } from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';

	let { isOpen = $bindable(false), fileUrl } = $props<{ isOpen: boolean; fileUrl: string }>();

	let isFrameLoading = $state(true);

	$effect(() => {
		if (isOpen) isFrameLoading = true;
	});

	let previewUrl = $derived.by(() => {
		const url = fileUrl || '';
		
		const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
		if (driveMatch) {
			return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
		}
		
		if (url.includes('docs.google.com')) {
			return url.replace(/\/(edit|view).*/, '/preview');
		}
		
		if (url.startsWith('http')) {
			return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
		}
		
		return url;
	});

	let displayUrl = $derived(fileUrl ? (fileUrl.length > 60 ? fileUrl.substring(0, 57) + '...' : fileUrl) : '');

	function getDownloadUrl(url: string) {
		if (!url) return '';
		const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
		if (driveMatch) {
			return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
		}
		return url;
	}

	function handleClose() {
		isOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div
		class="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm"
		transition:fade={{ duration: 150 }}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="absolute inset-0" onclick={handleClose}></div>

		<div
			transition:scale={{ start: 0.95, duration: 200 }}
			class="bg-white rounded-2xl shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col relative z-10 h-[90vh]"
			style="max-height: 95vh"
		>
			<!-- Header -->
			<div class="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 bg-gray-50/80 shrink-0">
				<div class="flex items-center gap-3 min-w-0">
					<div class="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
						<FileText size={18} class="stroke-[2.5]" />
					</div>
					<div class="min-w-0">
						<h3 class="font-extrabold text-sm text-gray-800 tracking-wide truncate">Preview Dokumen</h3>
						<p class="text-[10px] text-gray-400 font-medium truncate">{displayUrl}</p>
					</div>
				</div>
				<div class="flex items-center gap-2 shrink-0">
					<a
						href={getDownloadUrl(fileUrl)}
						class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
						title="Download file ini"
					>
						<Download size={14} />
						<span>Download</span>
					</a>
					<a
						href={fileUrl}
						target="_blank"
						rel="noopener"
						class="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-bold hover:bg-gray-200 transition-colors hidden sm:flex"
						title="Buka di tab baru"
					>
						<ExternalLink size={12} />
						<span class="hidden sm:inline">Buka Tab</span>
					</a>
					<button
						class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl ml-1"
						title="Tutup Preview"
						onclick={handleClose}
					>
						<X size={20} />
					</button>
				</div>
			</div>

			<!-- Content -->
			<div class="flex-1 relative bg-gray-100 min-h-0 h-[70vh]">
				<!-- Loading State -->
				{#if isFrameLoading}
					<div class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/90 z-10">
						<div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
						<p class="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">Memuat Preview...</p>
					</div>
				{/if}

				<!-- iframe Preview -->
				<iframe
					src={previewUrl}
					class="w-full h-full border-0"
					allow="autoplay"
					title="Dokumen Preview"
					onload={() => isFrameLoading = false}
				></iframe>
			</div>
		</div>
	</div>
{/if}
