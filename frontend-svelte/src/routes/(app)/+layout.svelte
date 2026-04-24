<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';

	let { data, children } = $props();
</script>

<div class="h-screen flex overflow-hidden font-sans bg-gray-50/50">
	<!-- Sidebar Responsif -->
	<Sidebar user={data.user} />

	<!-- Main Content Area -->
	<main class="flex-1 flex flex-col relative z-10 w-full overflow-hidden h-screen">
		<!-- Header Responsif -->
		<Header user={data.user} />

		<section
			class="p-4 lg:p-6 xl:p-8 overflow-y-auto flex-1 bg-transparent relative custom-scrollbar"
			style="-webkit-overflow-scrolling: touch;"
		>
			{#key $page.url.pathname}
				<div in:fade={{ duration: 200, delay: 50 }} out:fade={{ duration: 100 }}>
					{@render children()}
				</div>
			{/key}
		</section>
	</main>
</div>
