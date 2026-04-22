<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { formatIndonesianDatePlain } from '$lib/formatter';

	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Search, Plus, Filter, FileText, CheckCircle, Clock, Trash2, Edit } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();
	
	import type { Infer } from 'sveltekit-superforms';
	import type { SuratSchema } from '$lib/schemas/surat';

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting, message } = superForm<Infer<SuratSchema>>(data.form as any, {
		onResult: ({ result }) => {
			if (result.type === 'success') {
				isFormOpen = false;
				// Optional: emit toast success
			}
		}
	});

	let isFormOpen = $state(false);
	let isEditMode = $state(false);
	
	let searchQuery = $state('');
	let filterTipe = $state('Semua');

	// Reactive filtering
	let filteredList = $derived(data.suratList.filter((surat: any) => {
		const matchQuery = 
			(surat.perihal?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
			(surat.nomorSurat?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
			(surat.asalTujuan?.toLowerCase() || '').includes(searchQuery.toLowerCase());
		const matchFilter = filterTipe === 'Semua' || surat.tipeSurat === filterTipe;
		return matchQuery && matchFilter;
	}));

	function openForm(surat: any = null) {
		if (surat) {
			isEditMode = true;
			$form = {
				id: surat.id,
				tipeSurat: surat.tipeSurat,
				kategoriSurat: surat.kategoriSurat,
				sifatSurat: surat.sifatSurat,
				nomorSurat: surat.nomorSurat,
				tanggalMasuk: surat.tanggalMasuk ? new Date(surat.tanggalMasuk).toISOString().slice(0, 10) : '',
				tanggalSurat: surat.tanggalSurat ? new Date(surat.tanggalSurat).toISOString().slice(0, 10) : '',
				asalTujuan: surat.asalTujuan,
				perihal: surat.perihal,
				tglAcaraMulai: surat.tglAcaraMulai ? new Date(surat.tglAcaraMulai).toISOString().slice(0, 10) : null,
				tglAcaraSelesai: surat.tglAcaraSelesai ? new Date(surat.tglAcaraSelesai).toISOString().slice(0, 10) : null,
				tglDisposisi: surat.tglDisposisi ? new Date(surat.tglDisposisi).toISOString().slice(0, 10) : null,
				tindakLanjut: surat.tindakLanjut,
				disposisiKe: Array.isArray(surat.disposisiKe) ? surat.disposisiKe : [],
				fileSurat: null,
				fileNotulensi: null
			};
		} else {
			isEditMode = false;
			$form = {
				id: null,
				tipeSurat: 'Masuk',
				kategoriSurat: 'Surat Dinas',
				sifatSurat: 'Biasa',
				nomorSurat: '',
				tanggalMasuk: new Date().toISOString().slice(0, 10),
				tanggalSurat: new Date().toISOString().slice(0, 10),
				asalTujuan: '',
				perihal: '',
				tglAcaraMulai: null,
				tglAcaraSelesai: null,
				tglDisposisi: null,
				tindakLanjut: null,
				disposisiKe: [],
				fileSurat: null,
				fileNotulensi: null
			};
		}
		isFormOpen = true;
	}

</script>

<div class="space-y-6">
	<!-- HEADER & ACTIONS -->
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
		<div>
			<h1 class="text-2xl font-bold tracking-tight text-slate-900">Arsip Surat</h1>
			<p class="text-sm text-slate-500">Kelola dokumen surat masuk dan keluar Dit. PL.</p>
		</div>
		<Button 
			onclick={() => openForm()}
			class="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md hover:shadow-lg transition-all"
		>
			<Plus class="w-4 h-4 mr-2" />
			Tambah Arsip
		</Button>
	</div>

	<!-- FILTERS -->
	<div class="flex flex-col sm:flex-row gap-4">
		<div class="relative w-full sm:w-96">
			<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
				<Search class="w-4 h-4" />
			</div>
			<Input 
				type="text" 
				placeholder="Cari perihal, nomor, atau pengirim..." 
				bind:value={searchQuery}
				class="pl-10 rounded-xl border-slate-200 bg-white"
			/>
		</div>
		
		<select 
			bind:value={filterTipe}
			class="flex h-10 w-full sm:w-[180px] items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
		>
			<option value="Semua">Semua Tipe</option>
			<option value="Masuk">Surat Masuk</option>
			<option value="Keluar">Surat Keluar</option>
		</select>
	</div>

	<!-- DATA TABLE BENTO -->
	<div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
		<!-- Desktop View -->
		<div class="hidden sm:block">
			<Table.Root>
				<Table.Header class="bg-slate-50/80">
					<Table.Row>
						<Table.Head class="w-[50px]">#</Table.Head>
						<Table.Head class="w-[250px]">Perihal</Table.Head>
						<Table.Head>Surat</Table.Head>
						<Table.Head>Tujuan/Asal</Table.Head>
						<Table.Head>Tanggal</Table.Head>
						<Table.Head class="text-right">Aksi</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each filteredList as item, index}
						<Table.Row class="hover:bg-slate-50">
							<Table.Cell class="font-medium text-slate-500">{index + 1}</Table.Cell>
							<Table.Cell>
								<div class="flex flex-col gap-1">
									<span class="font-semibold text-slate-900 line-clamp-2">{item.perihal}</span>
									<div class="flex gap-2 items-center text-xs">
										<span class="px-2 py-0.5 rounded text-emerald-700 bg-emerald-100 font-medium">{item.tipeSurat}</span>
										<span class="text-slate-500">{item.sifatSurat}</span>
									</div>
								</div>
							</Table.Cell>
							<Table.Cell>
								<div class="flex flex-col text-sm">
									<span class="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded w-fit">{item.nomorSurat}</span>
									<span class="text-slate-500 mt-1">{item.kategoriSurat}</span>
								</div>
							</Table.Cell>
							<Table.Cell>
								<span class="text-sm font-medium text-slate-700">{item.asalTujuan}</span>
							</Table.Cell>
							<Table.Cell>
								<div class="flex flex-col gap-1 text-xs text-slate-500">
									<span class="flex gap-1 items-center">
										<Clock class="w-3 h-3 text-slate-400" />
										Surat: {formatIndonesianDatePlain(item.tanggalSurat)}
									</span>
									<span class="flex gap-1 items-center">
										<CheckCircle class="w-3 h-3 text-emerald-400" />
										Masuk: {formatIndonesianDatePlain(item.tanggalMasuk)}
									</span>
								</div>
							</Table.Cell>
							<Table.Cell class="text-right">
								<div class="flex justify-end gap-2">
									<Button variant="outline" size="icon" class="h-8 w-8 text-slate-600 hover:text-emerald-600 border-slate-200" onclick={() => openForm(item)}>
										<Edit class="w-4 h-4" />
									</Button>
									
									<form method="POST" action="?/delete" use:enhance>
										<input type="hidden" name="id" value={item.id} />
										<Button variant="outline" size="icon" type="submit" class="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border-slate-200">
											<Trash2 class="w-4 h-4" />
										</Button>
									</form>
								</div>
							</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={6} class="h-32 text-center text-slate-500">
								Tidak ada data arsip surat yang ditemukan.
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>

		<!-- Mobile Card View -->
		<div class="block sm:hidden divide-y divide-slate-100">
			{#each filteredList as item}
				<div class="p-4 flex flex-col gap-3">
					<div class="flex justify-between items-start gap-2">
						<span class="font-semibold text-sm line-clamp-2 leading-tight">{item.perihal}</span>
						<span class="px-2 py-0.5 rounded text-[10px] whitespace-nowrap {item.tipeSurat === 'Masuk' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}">
							{item.tipeSurat}
						</span>
					</div>
					<div class="flex gap-2 text-xs text-slate-500">
						<div class="bg-slate-100 px-2 py-1 rounded font-mono truncate max-w-[50%]">{item.nomorSurat}</div>
						<div class="bg-slate-50 border border-slate-100 px-2 py-1 rounded line-clamp-1">{item.asalTujuan}</div>
					</div>
					<div class="flex justify-between items-center mt-2 pt-2 border-t border-slate-50 border-dashed">
						<span class="text-[11px] text-slate-400">{formatIndonesianDatePlain(item.tanggalSurat)}</span>
						
						<div class="flex gap-1.5">
							<Button variant="outline" size="sm" class="h-7 w-7 p-0" onclick={() => openForm(item)}>
								<Edit class="w-3.5 h-3.5 text-slate-600" />
							</Button>
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="id" value={item.id} />
								<Button variant="outline" size="sm" type="submit" class="h-7 w-7 p-0 hover:bg-rose-50 border-rose-100 text-rose-500">
									<Trash2 class="w-3.5 h-3.5" />
								</Button>
							</form>
						</div>
					</div>
				</div>
			{:else}
				<div class="p-8 text-center text-sm text-slate-500">Data tidak ditemukan.</div>
			{/each}
		</div>
	</div>

	<!-- DIALOG FORM -->
	<Dialog.Root bind:open={isFormOpen}>
	<Dialog.Content class="sm:max-w-[700px] bg-white rounded-2xl border-0 overflow-hidden shadow-2xl h-[90vh] sm:h-auto overflow-y-auto w-[95vw]">
		<Dialog.Header class="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
			<Dialog.Title class="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
				{isEditMode ? 'Edit Arsip Surat' : 'Tambah Arsip Surat'}
			</Dialog.Title>
			<Dialog.Description class="text-slate-500 text-sm">
				Pastikan data yang dimasukkan sudah sesuai dengan dokumen fisik.
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/save" enctype="multipart/form-data" use:enhance class="p-6 overflow-y-auto">
			{#if $form?.id}
				<input type="hidden" name="id" value={$form.id} />
			{/if}

			{#if $message}
				<div class="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">
					{$message}
				</div>
			{/if}

			<div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
				<!-- Tipe & Sifat Surat -->
				<div class="space-y-2">
					<Label for="tipeSurat" class="text-slate-600 text-xs font-bold uppercase tracking-wider">Tipe Surat</Label>
					<select name="tipeSurat" bind:value={$form.tipeSurat} required class="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50">
						<option value="Masuk">Surat Masuk</option>
						<option value="Keluar">Surat Keluar</option>
					</select>
					{#if $errors.tipeSurat}<span class="text-[11px] text-red-500">{$errors.tipeSurat}</span>{/if}
				</div>

				<div class="space-y-2">
					<Label for="sifatSurat" class="text-slate-600 text-xs font-bold uppercase tracking-wider">Tipe/Sifat</Label>
					<select name="sifatSurat" bind:value={$form.sifatSurat} required class="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
						<option value="Biasa">Biasa</option>
						<option value="Penting">Penting</option>
						<option value="Rahasia">Rahasia</option>
						<option value="Sangat Rahasia">Sangat Rahasia</option>
					</select>
					{#if $errors.sifatSurat}<span class="text-[11px] text-red-500">{$errors.sifatSurat}</span>{/if}
				</div>

				<!-- Nomor & Kategori -->
				<div class="space-y-2 col-span-1 md:col-span-2">
					<Label for="nomorSurat" class="text-slate-600 text-xs font-bold uppercase tracking-wider">Nomor Surat</Label>
					<Input type="text" name="nomorSurat" bind:value={$form.nomorSurat} placeholder="KEMENTAN.123/2026/PL" class="rounded-xl border-slate-200" required />
					{#if $errors.nomorSurat}<span class="text-[11px] text-red-500">{$errors.nomorSurat}</span>{/if}
				</div>

				<div class="space-y-2">
					<Label for="kategoriSurat" class="text-slate-600 text-xs font-bold uppercase tracking-wider">Kategori Identitas</Label>
					<select name="kategoriSurat" bind:value={$form.kategoriSurat} required class="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
						<option value="Surat Dinas">Surat Dinas</option>
						<option value="Nota Dinas">Nota Dinas</option>
						<option value="Kawat">Kawat / Telegram</option>
						<option value="Undangan">Undangan</option>
						<option value="Lainnya">Lainnya</option>
					</select>
					{#if $errors.kategoriSurat}<span class="text-[11px] text-red-500">{$errors.kategoriSurat}</span>{/if}
				</div>

				<!-- Tanggal Masuk & Surat -->
				<div class="space-y-2">
					<Label for="tanggalSurat" class="text-slate-600 text-xs font-bold uppercase tracking-wider">Tanggal Surat</Label>
					<Input type="date" name="tanggalSurat" bind:value={$form.tanggalSurat} class="rounded-xl border-slate-200" required />
					{#if $errors.tanggalSurat}<span class="text-[11px] text-red-500">{$errors.tanggalSurat}</span>{/if}
				</div>
				
				<div class="space-y-2">
					<Label for="tanggalMasuk" class="text-slate-600 text-xs font-bold uppercase tracking-wider">Tanggal Masuk (Diterima)</Label>
					<Input type="date" name="tanggalMasuk" bind:value={$form.tanggalMasuk} class="rounded-xl border-slate-200" required />
					{#if $errors.tanggalMasuk}<span class="text-[11px] text-red-500">{$errors.tanggalMasuk}</span>{/if}
				</div>

				<!-- Asal/Tujuan & Perihal -->
				<div class="space-y-2 md:col-span-2">
					<Label for="asalTujuan" class="text-slate-600 text-xs font-bold uppercase tracking-wider">Asal / Tujuan</Label>
					<Input type="text" name="asalTujuan" bind:value={$form.asalTujuan} placeholder="Instansi/Dit/Orang Tujuan" class="rounded-xl border-slate-200" required />
					{#if $errors.asalTujuan}<span class="text-[11px] text-red-500">{$errors.asalTujuan}</span>{/if}
				</div>

				<div class="space-y-2 md:col-span-2">
					<Label for="perihal" class="text-slate-600 text-xs font-bold uppercase tracking-wider">Perihal</Label>
					<Textarea name="perihal" bind:value={$form.perihal} placeholder="Hal ringkas terkait isi surat" class="rounded-xl border-slate-200 min-h-[80px]" required />
					{#if $errors.perihal}<span class="text-[11px] text-red-500">{$errors.perihal}</span>{/if}
				</div>

				<!-- FILE UPLOADS -->
				<div class="md:col-span-2 mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-4">
					<Label class="text-slate-800 font-bold flex items-center gap-2">
						<FileText class="w-4 h-4 text-emerald-500" /> Dokumen Lampiran
					</Label>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="fileSurat" class="text-slate-500 text-xs font-semibold">File Surat (PDF/DOCX)</Label>
							<Input type="file" name="fileSurat" accept=".pdf,.doc,.docx" class="rounded-xl border-slate-200 bg-white" />
							<p class="text-[10px] text-slate-400 leading-tight">Biarkan kosong jika tidak mengupdate file baru.</p>
						</div>
						<div class="space-y-2">
							<Label for="fileNotulensi" class="text-slate-500 text-xs font-semibold">File Notulensi/Tindak Lanjut</Label>
							<Input type="file" name="fileNotulensi" accept=".pdf,.doc,.docx" class="rounded-xl border-slate-200 bg-white" />
						</div>
					</div>
				</div>

			</div>

			<!-- FOOTER ACTIONS -->
			<div class="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
				<Button type="button" variant="outline" class="rounded-xl border-slate-200" onclick={() => (isFormOpen = false)}>
					Batal
				</Button>
				<Button type="submit" class="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" disabled={$submitting}>
					{#if $submitting}
						<div class="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
						Menyimpan...
					{:else}
						Simpan Data
					{/if}
				</Button>
			</div>
		</form>
	</Dialog.Content>
	</Dialog.Root>

</div>
