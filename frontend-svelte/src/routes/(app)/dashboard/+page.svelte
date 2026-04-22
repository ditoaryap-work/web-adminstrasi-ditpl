<script lang="ts">
	import { 
		TrendingUp, Calendar as CalendarIcon, 
		FileText, CheckCircle, FileEdit, CheckSquare, Users 
	} from 'lucide-svelte';
	
	let { data } = $props();

	// Derived state dari SSR load
	let user = $derived(data.user);
	let sptList = $derived(data.sptList || []);
	let sptjmList = $derived(data.sptjmList || []);

	// Perhitungan statistik
	let sptCount = $derived(sptList.length);
	let sptWithPdf = $derived(sptList.filter((s: any) => s.fileLink).length);
	
	let sptjmCount = $derived(sptjmList.length);
	let sptjmWithPdf = $derived(sptjmList.filter((s: any) => s.fileLink || s.documentLink).length);

	// Date calculations
	let now = new Date();
	let currentDay = now.getDate();
	let currentMonthYear = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

	let stats = $derived([
		{ title: 'Total SPT', val: String(sptCount).padStart(2, '0'), icon: FileText, color: 'text-kementan-green', bg: 'bg-gradient-to-br from-kementan-green/20 to-kementan-green/5', border: 'border-kementan-green/20' },
		{ title: 'SPT Selesai', val: String(sptWithPdf).padStart(2, '0'), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20' },
		{ title: 'Total SPTJM', val: String(sptjmCount).padStart(2, '0'), icon: FileEdit, color: 'text-blue-600', bg: 'bg-gradient-to-br from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20' },
		{ title: 'SPTJM Selesai', val: String(sptjmWithPdf).padStart(2, '0'), icon: CheckSquare, color: 'text-orange-600', bg: 'bg-gradient-to-br from-orange-500/20 to-orange-500/5', border: 'border-orange-500/20' }
	]);
</script>

<svelte:head>
	<title>Dashboard — E-Office Dit. PL</title>
</svelte:head>

<div class="space-y-8 pb-10">
	<!-- Top Section: Welcome & Calendar -->
	<div class="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
		<!-- Welcome Section -->
		<div class="xl:col-span-2 relative overflow-hidden glass-card rounded-3xl p-6 sm:p-8 lg:p-10 border-gray-200 shadow-md flex flex-col justify-center animate-fade-slide-in">
			<div class="absolute top-0 right-0 w-64 h-64 bg-kementan-green/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
			<div class="absolute bottom-0 left-0 w-64 h-64 bg-kementan-gold/5 blur-[40px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
			
			<div class="relative z-10">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-kementan-green/20 to-kementan-green/5 flex items-center justify-center text-kementan-green border border-kementan-green/20 shadow-inner">
						<TrendingUp size={16} />
					</div>
					<span class="text-[10px] font-bold tracking-[0.3em] uppercase text-kementan-green">Sistem Aktif</span>
				</div>
				<h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 mb-2 leading-tight">
					Selamat Datang, <br />
					<span class="text-transparent bg-clip-text bg-gradient-to-r from-kementan-green to-emerald-600 drop-shadow-sm">
						{user?.nama || user?.username || 'Admin'}
					</span>
				</h1>
				<p class="text-gray-700 max-w-xl text-sm leading-relaxed mb-6 font-medium">
					Pantau seluruh arus administrasi Direktorat Penyediaan Lahan dalam satu layar kendali.
				</p>
			</div>
		</div>

		<!-- Simple Calendar Widget -->
		<div class="glass-card rounded-3xl p-6 border-gray-200 shadow-md flex flex-col animate-fade-slide-in" style="animation-delay: 100ms">
			<div class="flex items-center gap-3 mb-4">
				<div class="p-2.5 bg-gradient-to-br from-kementan-green/20 to-kementan-green/5 text-kementan-green rounded-xl border border-kementan-green/10 shadow-sm">
					<CalendarIcon size={20} />
				</div>
				<h2 class="text-lg font-extrabold text-gray-800">Kalender</h2>
			</div>
			<div class="flex-1 flex items-center justify-center border border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
				<div class="text-center">
					<p class="text-4xl font-black text-kementan-green opacity-80">
						{currentDay}
					</p>
					<p class="text-xs font-bold text-gray-700 uppercase tracking-widest mt-1">
						{currentMonthYear}
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
		{#each stats as stat, i}
			<div
				class="glass-card p-4 sm:p-6 rounded-2xl border group relative overflow-hidden {stat.border} animate-fade-slide-in"
				style="animation-delay: {200 + i * 50}ms"
			>
				<div
					class="absolute top-0 right-0 w-24 h-24 blur-[20px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none {stat.bg}"
				></div>
				<div class="relative z-10 flex flex-col justify-between h-full">
					<div
						class="p-3 sm:p-3.5 rounded-2xl w-fit mb-5 sm:mb-7 shadow-sm border border-white/50 relative group-hover:scale-110 transition-transform duration-300 {stat.bg} {stat.color}"
					>
						<div class="absolute inset-0 bg-white/20 rounded-2xl blur-[1px]"></div>
						<stat.icon size={22} class="relative z-10" />
					</div>
					<div>
						<p class="text-[9px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">
							{stat.title}
						</p>
						<div class="flex items-baseline gap-1.5 sm:gap-2">
							<h3 class="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
								{stat.val}
							</h3>
							<span class="text-[9px] sm:text-[10px] text-gray-700 font-bold hidden sm:inline">DOKUMEN</span>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Bottom Section: Quick Access -->
	<div class="glass-card rounded-3xl p-6 sm:p-8 border-gray-200 shadow-md animate-fade-slide-in" style="animation-delay: 300ms">
		<h2 class="text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-6">Akses Cepat</h2>
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
			<a href="/spt" class="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/80 border border-emerald-100 hover:bg-emerald-100 transition-all group">
				<div class="w-10 h-10 rounded-lg bg-gradient-to-br from-kementan-green/20 to-kementan-green/5 flex items-center justify-center text-kementan-green group-hover:bg-gradient-to-br group-hover:from-kementan-green group-hover:to-emerald-600 group-hover:text-white transition-all shadow-sm shrink-0">
					<FileText size={18} />
				</div>
				<div>
					<p class="text-sm font-bold text-gray-800">Surat Tugas</p>
					<p class="text-[10px] text-gray-700 font-medium">Kelola SPT Direktorat</p>
				</div>
			</a>
			
			<a href="/sptjm" class="flex items-center gap-3 p-4 rounded-xl bg-blue-50/80 border border-blue-100 hover:bg-blue-100 transition-all group">
				<div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center text-blue-600 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white transition-all shadow-sm shrink-0">
					<FileEdit size={18} />
				</div>
				<div>
					<p class="text-sm font-bold text-gray-800">SPTJM</p>
					<p class="text-[10px] text-gray-700 font-medium">Biaya Rill Perjalanan</p>
				</div>
			</a>

			<a href="/pegawai" class="flex items-center gap-3 p-4 rounded-xl bg-orange-50/80 border border-orange-100 hover:bg-orange-100 transition-all group">
				<div class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center text-orange-600 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-orange-600 group-hover:text-white transition-all shadow-sm shrink-0">
					<Users size={18} />
				</div>
				<div>
					<p class="text-sm font-bold text-gray-800">Master Pegawai</p>
					<p class="text-[10px] text-gray-700 font-medium">Database Personel</p>
				</div>
			</a>
		</div>
	</div>
</div>
