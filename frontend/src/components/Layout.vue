<template>
  <div class="h-screen flex overflow-hidden font-sans">
    
    <!-- Mobile Overlay -->
    <transition name="fade">
      <div 
        v-if="isSidebarOpen"
        class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        @click="isSidebarOpen = false"
      />
    </transition>

    <!-- Sidebar -->
    <aside 
      class="fixed inset-y-0 left-0 lg:static lg:flex w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200 shadow-2xl shadow-black/5 flex-col z-50 transform transition-transform duration-300 ease-in-out"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <div class="p-6 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md p-1.5 border border-gray-100">
            <img src="/Logo_Kementerian_Pertanian_Republik_Indonesia.svg (3).png" alt="Logo Kementan" class="w-full h-full object-contain" />
          </div>
          <div>
            <h2 class="text-lg font-extrabold tracking-tight text-gray-800 leading-none">E-OFFICE</h2>
            <span class="text-[9px] text-gray-500 font-bold tracking-[0.2em] uppercase">Dit. Lahan</span>
          </div>
        </div>
        <button class="lg:hidden text-gray-500" @click="isSidebarOpen = false">
           <X :size="24" />
        </button>
      </div>
      
      <nav class="flex-1 px-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
        <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-4 mt-2">Menu Utama</div>
        <NavItem to="/dashboard" :icon="LayoutDashboard" label="Dashboard" />
        <NavItem to="/spt" :icon="FileText" label="Surat Tugas (SPT)" />
        <NavItem to="/sptjm" :icon="FileSignature" label="SPTJM (Biaya Rill)" />
        
        <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-4 mt-6">Database</div>
        <NavItem to="/pegawai" :icon="Settings" label="Master Pegawai" />
        <NavItem to="/admin" :icon="Users" label="Manajer Admin" />
      </nav>

      <div class="p-4 mt-auto border-t border-gray-100">
        <button 
          @click="handleLogout"
          class="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-50 rounded-xl text-gray-500 hover:text-red-500 transition-all font-semibold text-sm"
        >
          <LogOut :size="18" />
          <span class="underline-offset-4">Keluar Sistem</span>
        </button>
      </div>
    </aside>
    
    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col relative z-10 w-full overflow-hidden h-screen">
      <header class="h-16 lg:h-20 bg-white/70 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 lg:px-10 shadow-sm z-30 shrink-0">
        <div class="flex items-center gap-4">
          <button class="lg:hidden text-gray-600 p-2" @click="isSidebarOpen = true">
            <Menu :size="24" />
          </button>
          <div class="h-8 w-[3px] bg-kementan-green rounded-full hidden md:block"></div>
          <h1 class="text-xs lg:text-sm font-bold tracking-widest text-gray-500 uppercase hidden sm:block">Dit. Penyediaan Lahan</h1>
        </div>
        
        <div v-if="adminProfile" class="flex items-center gap-3 lg:gap-4">
          <div class="text-right flex flex-col justify-center">
            <p class="text-xs lg:text-sm font-bold text-gray-800 leading-none mb-1">{{ adminProfile.nama_admin }}</p>
            <span class="text-[9px] lg:text-[10px] text-kementan-green font-bold tracking-widest uppercase bg-kementan-green/10 px-2 py-0.5 rounded-full border border-kementan-green/20 self-end whitespace-nowrap">
              {{ adminProfile.tim_poksi }}
            </span>
          </div>
          
          <div 
            v-motion
            :initial="{ scale: 1 }"
            :hovered="{ scale: 1.05 }"
            @click="router.push('/admin')" 
            class="relative group cursor-pointer"
          >
            <div class="absolute -inset-1 bg-gradient-to-r from-kementan-green to-emerald-400 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div 
              class="relative w-9 h-9 lg:w-11 lg:h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-kementan-green to-emerald-600 text-white font-bold border-2 border-white shadow-sm text-sm lg:text-base selection-none"
            >
              {{ adminProfile.nama_admin?.charAt(0).toUpperCase() || 'A' }}
            </div>
          </div>
        </div>
      </header>

      <section class="p-4 lg:p-8 xl:p-10 overflow-y-auto flex-1 bg-transparent relative custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <div :key="$route.path" class="h-full max-w-7xl mx-auto">
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { 
  LayoutDashboard, FileText, FileSignature, Settings, 
  LogOut, ChevronRight, Menu, X, Users 
} from 'lucide-vue-next'

const router = useRouter()
const adminProfile = ref(null)
const isSidebarOpen = ref(false)

onMounted(() => {
  const storedData = localStorage.getItem('adminData')
  if (storedData) {
    adminProfile.value = JSON.parse(storedData)
  }
})

const handleLogout = () => {
  localStorage.removeItem('adminData')
  router.push('/login')
}


// NavItem as a nested functional component
// Uses router.currentRoute.value.path for reactive highlighting
const NavItem = (props) => {
  const currentPath = router.currentRoute.value.path
  const isActive = currentPath === props.to
  
  return h('button', {
    onClick: () => {
      router.push(props.to)
      isSidebarOpen.value = false
    },
    class: `flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-300 group font-semibold ${
      isActive 
        ? 'bg-kementan-green/10 text-kementan-green border border-kementan-green/20 shadow-sm' 
        : 'text-gray-500 hover:text-kementan-green hover:bg-gray-50'
    }`
  }, [
    h('div', {
      class: `${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`
    }, [
      h(props.icon, { size: 20 })
    ]),
    h('span', { class: 'flex-1 text-left text-sm' }, props.label),
    isActive ? h(ChevronRight, { size: 14, class: 'text-kementan-green' }) : null
  ])
}
</script>

<style scoped>
/* Page Transitions */
.page-enter-active, .page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease, filter 0.3s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
  filter: blur(5px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  filter: blur(5px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
