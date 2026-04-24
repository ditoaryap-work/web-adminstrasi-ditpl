<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { Plus, FileSignature } from 'lucide-svelte';
	import SptjmList from '$lib/components/sptjm/SptjmList.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Manajemen SPTJM | E-Office</title>
</svelte:head>

<div class="space-y-6 pb-12">
	<!-- Page Header -->
	<div class="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
		<div class="space-y-3">
			<div class="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 border border-emerald-100">
				<FileSignature size={16} class="text-kementan-green" />
				<span class="text-xs font-bold uppercase tracking-widest text-emerald-700">Pakta Integritas (SPTJM)</span>
			</div>
			<h1 class="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">Daftar Dokumen SPTJM</h1>
			<p class="text-sm font-medium text-gray-500 max-w-lg leading-relaxed">
				Kelola semua dokumen Surat Pernyataan Tanggung Jawab Mutlak (Biaya Riil).
			</p>
		</div>

		<button
			onclick={() => goto('/sptjm/create')}
			class="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3.5 bg-kementan-green text-white font-bold rounded-xl hover:bg-[#004d26] transition-all shadow-md shadow-kementan-green/20"
		>
			<Plus size={18} />
			<span class="text-sm uppercase tracking-widest">Buat SPTJM Baru</span>
		</button>
	</div>

	<!-- Main Content -->
	<SptjmList 
		sptjmList={data.sptjmList} 
		onEdit={(sptjm) => goto(`/sptjm/${sptjm.id}/edit`)} 
	/>
</div>
