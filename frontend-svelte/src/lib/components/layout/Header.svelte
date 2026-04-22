<script lang="ts">
	import { appState } from '$lib/state/app.svelte';
	import { Menu, LogOut } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	let { user } = $props();

	let userInitial = $derived((user?.nama || user?.username || 'A').charAt(0).toUpperCase());
</script>

<header
	class="h-16 lg:h-20 bg-white/70 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 lg:px-10 shadow-sm z-30 shrink-0"
>
	<div class="flex items-center gap-4">
		<!-- Mobile Menu Toggle -->
		<button class="lg:hidden text-gray-600 p-2" onclick={() => appState.toggleSidebar()}>
			<span class="sr-only">Open sidebar</span>
			<Menu size={24} />
		</button>
		<div class="h-8 w-[3px] bg-kementan-green rounded-full hidden md:block"></div>
		<h1 class="text-xs lg:text-sm font-bold tracking-widest text-gray-600 uppercase hidden sm:block">
			Dit. Penyediaan Lahan
		</h1>
	</div>

	{#if user}
		<div class="flex items-center gap-3 lg:gap-4">
			<div class="text-right flex flex-col justify-center border-l border-gray-100 pl-4">
				<p class="text-xs lg:text-sm font-bold text-gray-800 leading-none mb-1 text-right">
					{user.nama || user.username || 'User'}
				</p>
				<span
					class="text-[9px] lg:text-[10px] text-kementan-green font-bold tracking-widest uppercase bg-kementan-green/10 px-2 py-0.5 rounded-full border border-kementan-green/20 self-end whitespace-nowrap"
				>
					{user.timPoksi || user.role || 'Admin'}
				</span>
			</div>

			<!-- Avatar with Dropdown -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class="relative group cursor-pointer focus:outline-none">
					<div
						class="absolute -inset-1 bg-gradient-to-r from-kementan-green to-emerald-400 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-300"
					></div>
					<div
						class="relative w-9 h-9 lg:w-11 lg:h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-kementan-green to-emerald-600 text-white font-bold border-2 border-white shadow-sm text-sm lg:text-base select-none"
					>
						{userInitial}
					</div>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="w-56">
					<DropdownMenu.Label>
						<div class="flex flex-col space-y-1">
							<p class="text-sm font-medium leading-none">{user.nama || user.username || 'User'}</p>
							<p class="text-xs leading-none text-muted-foreground">{user.role || 'Guest'}</p>
						</div>
					</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<form method="POST" action="/logout">
						<DropdownMenu.Item class="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600">
							<LogOut class="mr-2 h-4 w-4" />
							<span>Logout</span>
							<button type="submit" class="hidden" aria-label="Submit Logout"></button>
						</DropdownMenu.Item>
					</form>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	{/if}
</header>
