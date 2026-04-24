<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { ArrowLeft, Edit } from 'lucide-svelte';
	import SptForm from '$lib/components/spt/SptForm.svelte';
	import { toast } from 'svelte-sonner';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Edit SPT | E-Office</title>
</svelte:head>

<div class="space-y-6 pb-12">
	<!-- Breadcrumb -->
	<div class="flex items-center gap-3">
		<button 
			onclick={() => goto('/spt')} 
			class="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
		>
			<ArrowLeft size={16} /> Kembali ke Daftar
		</button>
	</div>

	<!-- Page Header -->
	<div class="mb-8">
		<div class="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-1.5 border border-amber-100 mb-3">
			<Edit size={16} class="text-amber-600" />
			<span class="text-xs font-bold uppercase tracking-widest text-amber-700">Edit Dokumen</span>
		</div>
		<h1 class="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">Edit SPT</h1>
		<p class="mt-2 text-sm font-medium text-gray-500 max-w-lg leading-relaxed">
			Perbarui informasi Surat Perintah Tugas untuk perjalanan dinas.
		</p>
	</div>

	<!-- Form Component -->
	<SptForm 
		initialData={data.spt}
		isEditMode={true}
		superformData={data.form}
		pegawaiOptions={data.pegawaiList.map((p: any) => ({
			value: String(p.id),
			label: p.namaLengkap,
			subtitle: `${p.nip || '-'} • ${p.jabatan || '-'}`
		}))}
		pegawaiList={data.pegawaiList}
		onCancel={() => goto('/spt')}
		onSuccess={() => {
			toast.success('SPT berhasil diperbarui!');
			goto('/spt');
		}}
	/>
</div>
