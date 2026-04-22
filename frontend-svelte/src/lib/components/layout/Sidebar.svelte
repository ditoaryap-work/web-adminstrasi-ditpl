<script lang="ts">
	import { page } from '$app/state';
	import { appState } from '$lib/state/app.svelte';
	import { getMenuForRole } from '$lib/config/menu';
	import { LogOut, X, ChevronRight } from 'lucide-svelte';
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

{#snippet navContent()}
	<div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-4 mt-2">
		Menu Utama
	</div>
	{#each menuItems as item, i}
		{@const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path))}
		<!-- Section headers for different groups -->
		{#if item.path === '/pegawai'}
			<div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-4 mt-6">
				Database
			</div>
		{/if}
		<a
			href={item.path}
			onclick={() => appState.closeSidebar()}
			class={cn(
				'flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-300 group font-semibold',
				isActive
					? 'bg-kementan-green/10 text-kementan-green border border-kementan-green/20 shadow-sm'
					: 'text-gray-700 hover:text-kementan-green hover:bg-gray-50'
			)}
		>
			<div class={cn('transition-transform duration-300', isActive ? 'scale-110' : 'group-hover:scale-110')}>
				<item.icon size={20} />
			</div>
			<span class="flex-1 text-left text-sm">{item.name}</span>
			{#if isActive}
				<ChevronRight size={14} class="text-kementan-green" />
			{/if}
		</a>
	{/each}
{/snippet}

<!-- DESKTOP SIDEBAR -->
<aside
	class="hidden lg:flex lg:w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200 shadow-2xl shadow-black/5 flex-col"
>
	<div class="p-6 flex items-center gap-3">
		<div
			class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md p-1.5 border border-gray-100"
		>
			<img src="/logo-pertanian.png" alt="Logo Kementan" class="w-full h-full object-contain" />
		</div>
		<div>
			<h2 class="text-lg font-extrabold tracking-tight text-gray-800 leading-none">
				E-OFFICE
			</h2>
			<span class="text-[9px] text-gray-500 font-bold tracking-[0.2em] uppercase">Dit. Lahan</span>
		</div>
	</div>

	<nav class="flex-1 px-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
		{@render navContent()}
	</nav>

	<div class="p-4 mt-auto border-t border-gray-100">
		<form method="POST" action="/logout">
			<button
				type="submit"
				class="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-50 rounded-xl text-gray-600 hover:text-red-500 transition-all font-semibold text-sm"
			>
				<LogOut size={18} />
				<span class="underline-offset-4">Keluar Sistem</span>
			</button>
		</form>
	</div>
</aside>

<!-- MOBILE DRAWER (Controlled by AppState) -->
<Sheet.Root
	bind:open={appState.isSidebarOpen}
>
	<Sheet.Content side="left" class="w-[85vw] max-w-[320px] bg-white/95 backdrop-blur-xl p-0 border-gray-200 border-r">
		<div class="p-6 flex justify-between items-center">
			<div class="flex items-center gap-3">
				<div
					class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md p-1.5 border border-gray-100"
				>
					<img src="/logo-pertanian.png" alt="Logo Kementan" class="w-full h-full object-contain" />
				</div>
				<div>
					<h2 class="text-lg font-extrabold tracking-tight text-gray-800 leading-none">
						E-OFFICE
					</h2>
					<span class="text-[9px] text-gray-500 font-bold tracking-[0.2em] uppercase">Dit. Lahan</span>
				</div>
			</div>
			<Button variant="ghost" size="icon" class="text-gray-500" onclick={() => appState.closeSidebar()}>
				<X class="h-5 w-5" />
			</Button>
		</div>

		<nav class="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
			{@render navContent()}
		</nav>

		<div class="absolute bottom-0 w-full p-4 border-t border-gray-100">
			<form method="POST" action="/logout">
				<button
					type="submit"
					class="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-50 rounded-xl text-gray-600 hover:text-red-500 transition-all font-semibold text-sm"
				>
					<LogOut size={18} />
					<span class="underline-offset-4">Keluar Sistem</span>
				</button>
			</form>
		</div>
	</Sheet.Content>
</Sheet.Root>
