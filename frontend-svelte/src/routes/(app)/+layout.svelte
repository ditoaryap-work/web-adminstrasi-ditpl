<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Header from '$lib/components/layout/Header.svelte';

	let { data, children } = $props();
</script>

<div class="h-screen flex overflow-hidden font-sans">
	<!-- Sidebar Responsif -->
	<Sidebar user={data.user} />

	<!-- Main Content Area -->
	<main class="flex-1 flex flex-col relative z-10 w-full overflow-hidden h-screen">
		<!-- Header Responsif -->
		<Header user={data.user} />

		<section
			class="p-4 lg:p-8 xl:p-10 overflow-y-auto flex-1 bg-transparent relative custom-scrollbar"
			style="-webkit-overflow-scrolling: touch;"
		>
			<div class="h-full max-w-7xl mx-auto">
				{@render children()}
			</div>
		</section>
	</main>
</div>
