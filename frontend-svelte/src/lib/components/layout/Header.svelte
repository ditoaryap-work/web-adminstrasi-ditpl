<script lang="ts">
	import { appState } from '$lib/state/app.svelte';
	import { Menu, UserCircle, Bell, Settings, LogOut } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	let { user } = $props();
</script>

<header class="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
	<!-- Mobile Menu Toggle -->
	<Button
		variant="ghost"
		size="icon"
		class="-m-2.5 p-2.5 text-zinc-700 lg:hidden"
		onclick={() => appState.toggleSidebar()}
	>
		<span class="sr-only">Open sidebar</span>
		<Menu class="h-6 w-6" aria-hidden="true" />
	</Button>

	<!-- Separator for mobile -->
	<div class="h-6 w-px bg-zinc-200 lg:hidden" aria-hidden="true"></div>

	<!-- Header Content -->
	<div class="flex flex-1 items-center justify-between gap-x-4 self-stretch lg:gap-x-6">
		<div class="flex flex-1">
			<!-- Di sini bisa ditambah breadcrumb atau search bar kalau perlu -->
		</div>

		<div class="flex items-center gap-x-4 lg:gap-x-6">
			<!-- Notifikasi Placeholder -->
			<Button variant="ghost" size="icon" class="-m-2.5 p-2.5 text-zinc-400 hover:text-zinc-500">
				<span class="sr-only">View notifications</span>
				<Bell class="h-6 w-6" aria-hidden="true" />
			</Button>

			<!-- Separator -->
			<div class="hidden lg:block lg:h-6 lg:w-px lg:bg-zinc-200" aria-hidden="true"></div>

			<!-- User Profile Dropdown -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class="flex items-center gap-x-3 rounded-full hover:bg-zinc-50 p-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
					<UserCircle class="h-8 w-8 text-zinc-400 bg-zinc-100 rounded-full" />
					<span class="hidden lg:flex lg:items-center">
						<span class="text-sm font-semibold leading-6 text-zinc-900" aria-hidden="true">
							{user?.nama || user?.username || 'User'}
						</span>
					</span>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="w-56">
					<DropdownMenu.Label>
						<div class="flex flex-col space-y-1">
							<p class="text-sm font-medium leading-none">{user?.nama || user?.username || 'User'}</p>
							<p class="text-xs leading-none text-muted-foreground">{user?.role || 'Guest'}</p>
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
	</div>
</header>
