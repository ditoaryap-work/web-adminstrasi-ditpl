<template>
  <div class="h-screen flex overflow-hidden font-sans">
    <!-- Mobile Overlay -->
    <transition name="fade">
      <div v-if="isSidebarOpen" class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        @click="isSidebarOpen = false" />
    </transition>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 lg:static lg:flex w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200 shadow-2xl shadow-black/5 flex-col z-50 transform transition-transform duration-300 ease-in-out"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">
      <div class="p-6 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md p-1.5 border border-gray-100">
            <img src="/logo-pertanian.png" alt="Logo Kementan"
              class="w-full h-full object-contain">
          </div>
          <div>
            <h2 class="text-lg font-extrabold tracking-tight text-gray-800 leading-none">
              E-OFFICE
            </h2>
            <span class="text-[9px] text-gray-500 font-bold tracking-[0.2em] uppercase">Dit. Lahan</span>
          </div>
        </div>
        <button class="lg:hidden text-gray-500" @click="isSidebarOpen = false">
          <X :size="24" />
        </button>
      </div>

      <nav class="flex-1 px-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
        <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-4 mt-2">
          Menu Utama
        </div>
        <NavItem to="/dashboard" :icon="LayoutDashboard" label="Dashboard" />
        <NavItem to="/spt" :icon="FileText" label="Surat Tugas (SPT)" />
        <NavItem to="/sptjm" :icon="FileSignature" label="SPTJM (Biaya Rill)" />
        <NavItem to="/kwitansi-spj" :icon="Receipt" label="Kwitansi & SPD" />
        <NavItem to="/arsip-surat" :icon="Inbox" label="Arsip Persuratan" />

        <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-4 mt-6">
          Database
        </div>
        <NavItem to="/pegawai" :icon="Users" label="Data Pegawai" />
        <NavItem v-if="adminProfile?.role === 'Super Admin'" to="/admin" :icon="Shield" label="Manajer Admin" />
        <NavItem v-if="adminProfile?.role === 'Super Admin'" to="/templates" :icon="FileCode" label="Sistem Template" />
        <NavItem to="/settings" :icon="Settings" label="Pengaturan Sistem" />
      </nav>

      <div class="p-4 mt-auto border-t border-gray-100">
        <button
          class="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-50 rounded-xl text-gray-600 hover:text-red-500 transition-all font-semibold text-sm"
          @click="handleLogout">
          <LogOut :size="18" />
          <span class="underline-offset-4">Keluar Sistem</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col relative z-10 w-full overflow-hidden h-screen">
      <header
        class="h-16 lg:h-20 bg-white/70 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 lg:px-10 shadow-sm z-30 shrink-0">
        <div class="flex items-center gap-4">
          <button class="lg:hidden text-gray-600 p-2" @click="isSidebarOpen = true">
            <Menu :size="24" />
          </button>
          <div class="h-8 w-[3px] bg-kementan-green rounded-full hidden md:block" />
          <h1 class="text-xs lg:text-sm font-bold tracking-widest text-gray-600 uppercase hidden sm:block">
            Dit. Penyediaan Lahan
          </h1>
        </div>

        <div v-if="adminProfile" class="flex items-center gap-3 lg:gap-4">
          <div class="text-right flex flex-col justify-center border-l border-gray-100 pl-4">
            <p class="text-xs lg:text-sm font-bold text-gray-800 leading-none mb-1 text-right">
              {{ adminProfile.namaAdmin }}
            </p>
            <span
              class="text-[9px] lg:text-[10px] text-kementan-green font-bold tracking-widest uppercase bg-kementan-green/10 px-2 py-0.5 rounded-full border border-kementan-green/20 self-end whitespace-nowrap">
              {{ adminProfile.timPoksi }}
            </span>
          </div>

          <div v-motion :initial="{ scale: 1 }" :hovered="{ scale: 1.05 }" class="relative group cursor-pointer"
            @click="router.push('/admin')">
            <div
              class="absolute -inset-1 bg-gradient-to-r from-kementan-green to-emerald-400 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-300" />
            <div
              class="relative w-9 h-9 lg:w-11 lg:h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-kementan-green to-emerald-600 text-white font-bold border-2 border-white shadow-sm text-sm lg:text-base selection-none">
              {{ adminProfile.namaAdmin?.charAt(0).toUpperCase() || 'A' }}
            </div>
          </div>
        </div>
      </header>

      <section class="p-4 lg:p-8 xl:p-10 overflow-y-auto flex-1 bg-transparent relative custom-scrollbar"
        style="-webkit-overflow-scrolling: touch;">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <div :key="$route.fullPath" class="h-full max-w-7xl mx-auto">
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  LayoutDashboard, FileText, FileSignature, Settings,
  LogOut, ChevronRight, Menu, X, Users, Inbox, Receipt, FileCode, RefreshCw, Shield
} from 'lucide-vue-next'
import { AdminData } from '../types/api'

import { useDataStore } from '../stores/useDataStore'
const dataStore = useDataStore()

const router = useRouter()
const route = useRoute()
const adminProfile = ref<AdminData | null>(null)
const isDev = import.meta.env.DEV
const isSidebarOpen = ref(false)

onMounted(() => {
  const storedData = localStorage.getItem('adminData')
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData)
      // CLEAN CODE: Robust Normalization for legacy and updated data structures
      adminProfile.value = {
        ...parsed,
        namaAdmin: parsed.namaAdmin || parsed.nama_admin || parsed.nama,
        role: parsed.role,
        timPoksi: parsed.timPoksi || parsed.tim_poksi
      }
    } catch (e) {
      console.error('Failed to parse admin data', e)
    }
  }
})

const handleLogout = () => {
  dataStore.resetStore()
  localStorage.removeItem('adminData')
  // Hard refresh to clear any remaining app state
  window.location.href = '/login'
}


// NavItem sebagai defineComponent agar isActive reaktif terhadap perubahan route
interface NavItemProps {
  to: string;
  icon: any;
  label: string;
}

const NavItem = defineComponent({
  name: 'NavItem',
  props: {
    to: { type: String, required: true },
    icon: { type: Object, required: true },
    label: { type: String, required: true },
  },
  setup(props) {
    const isActive = computed(() => route.path === props.to)

    const handleClick = () => {
      if (route.path === props.to) {
        window.dispatchEvent(new CustomEvent('sidebar-click-same', { detail: { path: props.to } }))
      }
      router.push(props.to as string)
      isSidebarOpen.value = false
    }

    return () => h('button', {
      onClick: handleClick,
      class: [
        'flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-300 group font-semibold',
        isActive.value
          ? 'bg-kementan-green/10 text-kementan-green border border-kementan-green/20 shadow-sm'
          : 'text-gray-700 hover:text-kementan-green hover:bg-gray-50'
      ].join(' ')
    }, [
      h('div', {
        class: (isActive.value ? 'scale-110 ' : 'group-hover:scale-110 ') + 'transition-transform duration-300'
      }, [
        h(props.icon, { size: 20 })
      ]),
      h('span', { class: 'flex-1 text-left text-sm' }, props.label),
      isActive.value ? h(ChevronRight, { size: 14, class: 'text-kementan-green' }) : null
    ])
  }
})
</script>

<style scoped>
/* Page Transitions */
.page-enter-active,
.page-leave-active {
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
