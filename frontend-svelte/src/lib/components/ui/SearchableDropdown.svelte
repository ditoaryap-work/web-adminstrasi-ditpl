<script lang="ts">
	import { onMount } from 'svelte';
	import { Search, ChevronDown, Check, X, RefreshCw } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { fade } from 'svelte/transition';

	// Types
	export interface DropdownOption {
		value: string | number;
		label: string;
		subtitle?: string;
	}

	// Props using Svelte 5 Runes
	let {
		options = [],
		value = $bindable(),
		placeholder = 'Pilih opsi...',
		label = '',
		required = false,
		disabled = false,
		isLoading = false,
		onchange
	}: {
		options: DropdownOption[];
		value: string | number;
		placeholder?: string;
		label?: string;
		required?: boolean;
		disabled?: boolean;
		isLoading?: boolean;
		onchange?: (val: string | number) => void;
	} = $props();

	// State
	let dropdownId = `dropdown-${Math.random().toString(36).substring(2, 9)}`;
	let isOpen = $state(false);
	let query = $state('');
	let inputRef: HTMLInputElement | null = $state(null);
	let dropdownRef: HTMLDivElement | null = $state(null);

	// Derived state
	let selectedOption = $derived(options.find((opt) => String(opt.value) === String(value)));
	let filtered = $derived(
		query
			? options.filter(
					(opt) =>
						opt.label.toLowerCase().includes(query.toLowerCase()) ||
						opt.subtitle?.toLowerCase().includes(query.toLowerCase())
				)
			: options
	);

	// Handlers
	function toggleDropdown() {
		if (!disabled) {
			isOpen = !isOpen;
			if (isOpen) {
				setTimeout(() => {
					inputRef?.focus();
				}, 50);
			} else {
				query = '';
			}
		}
	}

	function handleSelect(val: string | number) {
		value = val;
		if (onchange) onchange(val);
		isOpen = false;
		query = '';
	}

	function handleClear(e: Event) {
		e.stopPropagation();
		value = '';
		if (onchange) onchange('');
		query = '';
	}

	// Click outside handler
	function handleClickOutside(e: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
			isOpen = false;
			query = '';
		}
	}

	onMount(() => {
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	});
</script>

<div bind:this={dropdownRef} class="relative w-full">
	{#if label}
		<label for={dropdownId} class="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2 px-1">
			{label}
			{#if required}
				<span class="text-red-400">*</span>
			{/if}
		</label>
	{/if}

	<!-- Trigger Button -->
	<button
		id={dropdownId}
		type="button"
		{disabled}
		class={cn(
			'w-full flex items-center justify-between gap-2 border rounded-xl py-3.5 px-4 text-left transition-all duration-200 outline-none',
			disabled
				? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
				: isOpen
					? 'bg-white border-kementan-green ring-4 ring-kementan-green/10 shadow-sm'
					: 'bg-white border-gray-300 hover:border-gray-400 shadow-sm'
		)}
		onclick={toggleDropdown}
	>
		<span class={cn('text-sm font-medium truncate', selectedOption ? 'text-gray-800' : 'text-gray-400')}>
			{selectedOption ? selectedOption.label : placeholder}
		</span>
		<div class="flex items-center gap-1 shrink-0">
			{#if selectedOption && !disabled}
				<div
					role="button"
					tabindex="0"
					class="p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
					onclick={handleClear}
					onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClear(e as any)}
				>
					<X size={14} />
				</div>
			{/if}
			<ChevronDown
				size={18}
				class={cn('transition-transform duration-200', isOpen ? 'rotate-180 text-kementan-green' : 'text-gray-400')}
			/>
		</div>
	</button>

	<!-- Dropdown Panel -->
	{#if isOpen}
		<div
			transition:fade={{ duration: 150 }}
			class="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] overflow-hidden"
		>
			<!-- Search Input -->
			<div class="p-2 border-b border-gray-100 bg-gray-50/50">
				<div class="relative">
					<Search size={15} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
					<input
						bind:this={inputRef}
						bind:value={query}
						type="text"
						placeholder="Ketik untuk mencari..."
						class="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-kementan-green focus:ring-2 focus:ring-kementan-green/10 transition-all font-medium placeholder:text-gray-400"
						onkeydown={(e) => e.key === 'Escape' && (isOpen = false)}
					/>
				</div>
			</div>

			<!-- Options List -->
			<div class="max-h-52 overflow-y-auto custom-scrollbar py-1">
				{#if isLoading}
					<div class="px-4 py-6 text-center text-sm text-gray-400 font-medium flex flex-col items-center gap-2">
						<RefreshCw class="w-5 h-5 animate-spin text-kementan-green mx-auto" />
						<span>Memuat data...</span>
					</div>
				{:else if filtered.length > 0}
					<!-- Render max 50 items for performance -->
					{#each filtered.slice(0, 50) as opt (opt.value)}
						<button
							type="button"
							class={cn(
								'w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors',
								String(opt.value) === String(value)
									? 'bg-emerald-50 text-emerald-700'
									: 'text-gray-700 hover:bg-gray-50'
							)}
							onclick={() => handleSelect(opt.value)}
						>
							<div class="min-w-0">
								<p class="text-sm font-medium truncate">
									{opt.label}
								</p>
								{#if opt.subtitle}
									<p class="text-[10px] text-gray-400 truncate font-semibold mt-0.5">
										{opt.subtitle}
									</p>
								{/if}
							</div>
							{#if String(opt.value) === String(value)}
								<Check size={16} class="text-emerald-600 shrink-0 ml-2" />
							{/if}
						</button>
					{/each}
				{:else}
					<div class="px-4 py-6 text-center text-sm text-gray-400 font-medium">
						Tidak ditemukan hasil untuk "{query}"
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Hidden input for native form validation if required -->
	{#if required}
		<input required type="text" {value} class="absolute opacity-0 w-0 h-0 -z-10" tabindex="-1" />
	{/if}
</div>
