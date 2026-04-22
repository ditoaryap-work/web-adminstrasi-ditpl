<script lang="ts">
	import { page } from '$app/state';
	import { appState } from '$lib/state/app.svelte';
	import { getMenuForRole } from '$lib/config/menu';
	import { LogOut, X } from 'lucide-svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	
	let { user } = $props();

	// Load dynamic menu based on current user role
	let activeRole = $derived(user?.role || '');
	let menuItems = $derived(getMenuForRole(activeRole));

	// Tentukan state route aktif
	let currentPath = $derived(page.url.pathname);
</script>

<!-- 
	RESPONSIVE DESIGN: 
	Desktop/Tablet: fixed left sidebar, always visible at min-w-[280px].
	Mobile/Small Tablet: Hidden by default, uses Sheet overlay when opened.
-->

<!-- DESKTOP SIDEBAR -->
<aside
	class="hidden border-r bg-zinc-950 text-zinc-50 lg:flex lg:w-72 lg:flex-col"
>
	<div class="flex h-16 items-center border-b border-zinc-800 px-6">
		<img src="/logo-pertanian.png" alt="Logo" class="mr-3 h-8 w-8" />
		<div class="flex flex-col">
			<span class="font-bold leading-tight">E-Office PL</span>
			<span class="text-[10px] text-zinc-400">Direktorat Perlindungan Lahan</span>
		</div>
	</div>

	<nav class="flex-1 overflow-y-auto p-4 space-y-1">
		{#each menuItems as item}
			<a
				href={item.path}
				class={cn(
					'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
					currentPath.startsWith(item.path)
						? 'bg-emerald-600 text-white'
						: 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
				)}
			>
				<item.icon class="h-5 w-5" />
				{item.name}
			</a>
		{/each}
	</nav>

	<div class="border-t border-zinc-800 p-4">
		<form method="POST" action="/logout">
			<Button
				variant="ghost"
				class="w-full justify-start gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white"
				type="submit"
			>
				<LogOut class="h-5 w-5" />
				Logout
			</Button>
		</form>
	</div>
</aside>

<!-- MOBILE DRAWER (Controlled by AppState) -->
<Sheet.Root
	bind:open={appState.isSidebarOpen}
>
	<Sheet.Content side="left" class="w-[85vw] max-w-[320px] bg-zinc-950 p-0 text-zinc-50 border-zinc-800 border-r">
		<div class="flex h-16 items-center justify-between border-b border-zinc-800 px-6">
			<div class="flex items-center">
				<img src="/logo-pertanian.png" alt="Logo" class="mr-3 h-8 w-8" />
				<span class="font-bold">E-Office PL</span>
			</div>
			<Button variant="ghost" size="icon" class="text-zinc-400 hover:text-white" onclick={() => appState.closeSidebar()}>
				<X class="h-5 w-5" />
			</Button>
		</div>

		<nav class="flex-1 overflow-y-auto p-4 space-y-1">
			{#each menuItems as item}
				<a
					href={item.path}
					onclick={() => appState.closeSidebar()}
					class={cn(
						'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
						currentPath.startsWith(item.path)
							? 'bg-emerald-600 text-white'
							: 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
					)}
				>
					<item.icon class="h-5 w-5" />
					{item.name}
				</a>
			{/each}
		</nav>

		<div class="absolute bottom-0 w-full border-t border-zinc-800 p-4">
			<form method="POST" action="/logout">
				<Button
					variant="ghost"
					class="w-full justify-start gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white"
					type="submit"
				>
					<LogOut class="h-5 w-5" />
					Logout
				</Button>
			</form>
		</div>
	</Sheet.Content>
</Sheet.Root>
