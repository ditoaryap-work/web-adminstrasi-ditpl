<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Header from '$lib/components/layout/Header.svelte';

	let { data, children } = $props();
</script>

<div class="flex h-screen overflow-hidden bg-zinc-50 text-zinc-900">
	<!-- Sidebar Responsif (Hidden di mobile, flex di desktop) -->
	<Sidebar user={data.user} />

	<!-- Main Content Area -->
	<div class="flex w-0 flex-1 flex-col overflow-hidden">
		<!-- Header Responsif (Hamburger di mobile) -->
		<Header user={data.user} />

		<main class="relative flex-1 overflow-y-auto focus:outline-none">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-6">
				{@render children()}
			</div>
		</main>
	</div>
</div>
