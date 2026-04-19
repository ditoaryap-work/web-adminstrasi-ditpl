<template>
  <div
    class="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
    <!-- Background Ornaments (Pure CSS — no external deps) -->
    <div
      class="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-kementan-green/8 blur-[100px] rounded-full animate-pulse pointer-events-none" />
    <div
      class="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] bg-kementan-gold/15 blur-[100px] rounded-full animate-pulse pointer-events-none"
      style="animation-delay: 1.5s" />
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />

    <div v-motion :initial="{ opacity: 0, scale: 0.95, y: 16 }"
      :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 500, ease: 'easeOut' } }"
      class="w-full max-w-[420px] md:max-w-4xl">
      <!-- Mobile-Only Brand Header -->
      <div class="md:hidden text-center mb-6">
        <div
          class="inline-flex items-center gap-2.5 bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/80">
          <div
            class="w-8 h-8 rounded-lg bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-md p-1 border border-gray-100">
            <img src="/logo-pertanian.png" alt="Logo Kementan" class="w-full h-full object-contain drop-shadow-sm">
          </div>
          <span class="text-sm font-extrabold text-gray-800 tracking-tight">E-Office PL</span>
        </div>
      </div>

      <div
        class="bg-white/80 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-white/60 ring-1 ring-black/5">
        <!-- Left Side - Visual (Hidden on mobile) -->
        <div
          class="hidden md:flex md:w-[45%] bg-gradient-to-br from-kementan-green via-emerald-700 to-emerald-800 p-10 lg:p-12 flex-col justify-between relative overflow-hidden">
          <!-- Pattern overlay -->
          <div class="absolute inset-0 opacity-[0.06]"
            style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;20&quot; height=&quot;20&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Ccircle cx=&quot;1&quot; cy=&quot;1&quot; r=&quot;1&quot; fill=&quot;white&quot;/%3E%3C/svg%3E'); background-size: 20px 20px;" />

          <div class="relative z-10">
            <div
              class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-white/20 mb-8 shadow-xl p-2.5 relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 pointer-events-none" />
              <img src="/logo-pertanian.png" alt="Logo Kementan"
                class="w-full h-full object-contain drop-shadow-md z-10">
            </div>
            <h1 class="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-3">
              Portal <span class="text-kementan-gold">E-Office</span>
            </h1>
            <p class="text-lg font-bold text-white/90 leading-snug">
              Satu Data Lahan
            </p>
            <div class="h-1 w-16 bg-kementan-gold/80 rounded-full mt-4" />
          </div>

          <div class="relative z-10 text-white/60 text-xs font-medium leading-relaxed">
            Direktorat Penyediaan Lahan<br>
            Kementerian Pertanian RI
          </div>
        </div>

        <!-- Right Side - Form -->
        <div class="flex-1 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center">
          <h2 class="text-xl sm:text-2xl font-extrabold text-gray-800 mb-1">
            Masuk ke Sistem
          </h2>
          <p class="text-gray-600 mb-8 text-sm font-medium">
            Silakan masukkan akun admin Anda.
          </p>

          <form class="space-y-5" @submit.prevent="handleLogin">
            <transition name="shake">
              <div v-if="errorMsg"
                class="bg-red-50 text-red-600 p-3.5 rounded-xl text-xs border border-red-100 flex items-center gap-2.5 font-semibold">
                <AlertCircle :size="16" class="shrink-0" />
                {{ errorMsg }}
              </div>
            </transition>

            <div class="space-y-1.5">
              <label class="text-[11px] font-bold text-gray-600 uppercase tracking-widest ml-1">Username</label>
              <div class="relative">
                <User class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" :size="17" />
                <input v-model="username" type="text"
                  class="w-full bg-gray-50/80 border border-gray-300 rounded-xl py-3.5 pl-11 pr-4 text-gray-900 outline-none focus:bg-white focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium placeholder:text-gray-500 text-sm"
                  placeholder="admin.poksiA" required autocomplete="username">
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-[11px] font-bold text-gray-600 uppercase tracking-widest ml-1">Kata Sandi</label>
              <div class="relative">
                <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" :size="17" />
                <input v-model="password" :type="showPassword ? 'text' : 'password'"
                  class="w-full bg-gray-50/80 border border-gray-300 rounded-xl py-3.5 pl-11 pr-11 text-gray-900 outline-none focus:bg-white focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium placeholder:text-gray-500 text-sm"
                  placeholder="••••••••" required minlength="6" autocomplete="current-password">
                <button type="button"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-kementan-green transition-colors focus:outline-none"
                  tabindex="-1" :title="showPassword ? 'Sembunyikan' : 'Tampilkan'"
                  @click="showPassword = !showPassword">
                  <EyeOff v-if="showPassword" :size="17" />
                  <Eye v-else :size="17" />
                </button>
              </div>
              <p class="text-[10px] text-gray-500 mt-1.5 font-bold">
                Minimal 6 karakter.
              </p>
            </div>

            <button type="submit" :disabled="isLoading"
              class="w-full py-3.5 rounded-xl font-bold tracking-wide text-sm shadow-lg transition-all duration-300 flex justify-center items-center gap-2.5 mt-2"
              :class="[
                isLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-kementan-green text-white hover:bg-[#005529] hover:shadow-[0_8px_24px_rgba(0,102,51,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-md'
              ]">
              <template v-if="isLoading">
                <div class="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memverifikasi...
              </template>
              <template v-else>
                <LogIn :size="17" />
                Masuk ke Sistem
              </template>
            </button>
          </form>

          <div
            class="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
            <span>v1.0</span>
            <span>Dit. Penyediaan Lahan</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../config/api'
import { Lock, User, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  // Validasi sebelum submit
  if (!username.value.trim()) {
    errorMsg.value = 'Username tidak boleh kosong.'
    return
  }
  if (password.value.length < 6) {
    errorMsg.value = 'Kata sandi minimal 5 karakter.'
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  try {
    const response = await api.post('/api/auth/login', {
      username: username.value,
      password: password.value
    })

    const result = response.data

    if (result.status) {
      // Ingat: Token JWT berada di HttpOnly cookies yang dipassing otomatis
      // Kita hanya simpan metadata user yang bersifat public untuk render UI
      localStorage.setItem('adminData', JSON.stringify({
        ...result.data,
        timPoksi: result.data.timPoksi // Mapping case from backend
      }))
      router.push('/dashboard')
    } else {
      errorMsg.value = result.message || 'Login gagal.'
    }
  } catch (error: any) {
    errorMsg.value = error.response?.data?.message || 'Gagal terhubung ke server backend.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.shake-enter-active {
  animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both;
}

@keyframes shake {

  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>
