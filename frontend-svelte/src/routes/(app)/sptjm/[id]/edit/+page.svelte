<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import SptjmForm from '$lib/components/sptjm/SptjmForm.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Edit SPTJM | E-Office</title>
</svelte:head>

<SptjmForm 
	initialData={data.initialData}
	superformData={data.form}
	isEditMode={true}
	pegawaiOptions={data.pegawaiOptions}
	pegawaiList={data.pegawaiList}
	sbmOptions={data.sbmOptions}
	sbmList={data.sbmList}
	onCancel={() => goto('/sptjm')}
	onSuccess={() => goto('/sptjm')}
/>
