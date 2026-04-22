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
		{ title: 'Total SPT', val: String(sptCount).padStart(2, '0'), icon: FileText, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20' },
		{ title: 'SPT Selesai', val: String(sptWithPdf).padStart(2, '0'), icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-gradient-to-br from-emerald-600/20 to-emerald-600/5', border: 'border-emerald-600/20' },
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
		<div class="xl:col-span-2 relative overflow-hidden bg-white/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 lg:p-10 border border-zinc-200 shadow-sm flex flex-col justify-center">
			<!-- Aksen background -->
			<div class="absolute top-0 right-0 w-64 h-64 bg-emerald-600/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
			<div class="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 blur-[40px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
			
			<div class="relative z-10">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 flex items-center justify-center text-emerald-700 border border-emerald-600/20 shadow-inner">
						<TrendingUp size={16} />
					</div>
					<span class="text-[10px] font-bold tracking-[0.3em] uppercase text-emerald-700">Sistem Aktif</span>
				</div>
				<h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-800 mb-2 leading-tight">
					Selamat Datang, <br>
					<span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 drop-shadow-sm">
						{user?.nama || user?.username || 'Admin'}
					</span>
				</h1>
				<p class="text-zinc-600 max-w-xl text-sm leading-relaxed mb-6 font-medium">
					Pantau seluruh arus administrasi Direktorat Perlindungan Lahan dalam satu layar kendali.
				</p>
			</div>
		</div>

		<!-- Simple Calendar Widget -->
		<div class="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-zinc-200 shadow-sm flex flex-col">
			<div class="flex items-center gap-3 mb-4">
				<div class="p-2.5 bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 text-emerald-700 rounded-xl border border-emerald-600/10 shadow-sm">
					<CalendarIcon size={20} />
				</div>
				<h2 class="text-lg font-extrabold text-zinc-800">Kalender</h2>
			</div>
			<div class="flex-1 flex items-center justify-center border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
				<div class="text-center">
					<p class="text-4xl font-black text-emerald-700 opacity-80">
						{currentDay}
					</p>
					<p class="text-xs font-bold text-zinc-600 uppercase tracking-widest mt-1">
						{currentMonthYear}
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
		{#each stats as stat}
			<div class="bg-white/60 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm group relative overflow-hidden">
				<div class="absolute top-0 right-0 w-24 h-24 blur-[20px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none {stat.bg}"></div>
				<div class="relative z-10 flex flex-col justify-between h-full">
					<div class="p-3 sm:p-3.5 rounded-2xl w-fit mb-5 sm:mb-7 shadow-sm border border-white/50 relative group-hover:scale-110 transition-transform duration-300 {stat.bg} {stat.color}">
						<div class="absolute inset-0 bg-white/20 rounded-2xl blur-[1px]"></div>
						<stat.icon size={22} class="relative z-10" />
					</div>
					<div>
						<p class="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
							{stat.title}
						</p>
						<div class="flex items-baseline gap-1.5 sm:gap-2">
							<h3 class="text-2xl sm:text-3xl font-extrabold text-zinc-800 tracking-tight">
								{stat.val}
							</h3>
							<span class="text-[9px] sm:text-[10px] text-zinc-500 font-bold hidden sm:inline">DOKUMEN</span>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Bottom Section: Quick Access -->
	<div class="bg-white/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm">
		<h2 class="text-sm font-extrabold text-zinc-800 uppercase tracking-wider mb-6">Akses Cepat</h2>
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			<a href="/spt" class="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-100/80 transition-all group">
				<div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 flex items-center justify-center text-emerald-700 group-hover:bg-gradient-to-br group-hover:from-emerald-600 group-hover:to-teal-500 group-hover:text-white transition-all shadow-sm shrink-0">
					<FileText size={18} />
				</div>
				<div>
					<p class="text-sm font-bold text-zinc-800">Surat Tugas</p>
					<p class="text-[10px] text-zinc-500 font-medium">Kelola SPT Direktorat</p>
				</div>
			</a>
			
			<a href="/sptjm" class="flex items-center gap-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100 hover:bg-blue-100/80 transition-all group">
				<div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center text-blue-600 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-blue-500 group-hover:text-white transition-all shadow-sm shrink-0">
					<FileEdit size={18} />
				</div>
				<div>
					<p class="text-sm font-bold text-zinc-800">SPTJM</p>
					<p class="text-[10px] text-zinc-500 font-medium">Biaya Rill Perjalanan</p>
				</div>
			</a>

			<a href="/pegawai" class="flex items-center gap-3 p-4 rounded-xl bg-orange-50/50 border border-orange-100 hover:bg-orange-100/80 transition-all group">
				<div class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center text-orange-600 group-hover:bg-gradient-to-br group-hover:from-orange-600 group-hover:to-orange-500 group-hover:text-white transition-all shadow-sm shrink-0">
					<Users size={18} />
				</div>
				<div>
					<p class="text-sm font-bold text-zinc-800">Master Pegawai</p>
					<p class="text-[10px] text-zinc-500 font-medium">Database Personel</p>
				</div>
			</a>
		</div>
	</div>
</div>
