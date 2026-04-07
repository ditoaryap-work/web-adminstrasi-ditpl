<template>
  <div class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-cover bg-center" style="background-image: url('https://www.transparenttextures.com/patterns/cubes.png')">
    <!-- Background Ornaments (Light) -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-kementan-green/10 blur-[120px] rounded-full animate-pulse"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-kementan-gold/20 blur-[120px] rounded-full animate-pulse" style="animation-delay: 1s"></div>

    <div 
      v-motion
      :initial="{ opacity: 0, scale: 0.9, y: 20 }"
      :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 600, ease: 'easeOut' } }"
      class="max-w-4xl w-full glass-card rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-[0_20px_50px_rgba(0,102,51,0.1)]"
    >
      <!-- Left Side - Visual -->
      <div class="md:w-1/2 bg-gradient-to-br from-kementan-green to-emerald-700 p-12 flex flex-col justify-between relative shadow-inner">
        <div class="absolute inset-0 opacity-10" style="background-image: url('https://www.transparenttextures.com/patterns/carbon-fibre.png')"></div>
        
        <div class="relative z-10">
          <div class="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 mb-8 shadow-xl">
            <ShieldCheck class="text-white" :size="32" />
          </div>
          <h1 class="text-4xl font-extrabold text-white leading-tight mb-4 drop-shadow-md">
            Portal <span class="text-kementan-gold">E-Office</span> <br /> 
            Satu Data Lahan
          </h1>
          <div class="h-1.5 w-20 bg-kementan-gold rounded-full shadow-sm"></div>
        </div>

        <div class="relative z-10 text-white/80 text-sm italic font-medium">
          "Mewujudkan Tata Kelola Administrasi PL yang Modern dan Terintegrasi"
        </div>
      </div>

      <!-- Right Side - Form -->
      <div class="md:w-1/2 bg-white/80 p-12 flex flex-col justify-center">
        <h2 class="text-2xl font-extrabold text-gray-800 mb-2">Otentikasi Admin</h2>
        <p class="text-gray-500 mb-10 text-sm font-medium">Silakan masukkan identitas keamanan Anda.</p>

        <form class="space-y-6" @submit.prevent="handleLogin">
          <transition name="shake">
            <div 
              v-if="errorMsg"
              class="bg-red-500/10 text-red-400 p-4 rounded-xl text-xs border border-red-500/20 flex items-center gap-3"
            >
              <div class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
              {{ errorMsg }}
            </div>
          </transition>

          <div class="space-y-1 relative">
            <label class="text-xs font-bold text-gray-600 uppercase tracking-widest ml-1">Username / Email</label>
            <div class="relative mt-1">
              <User class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
              <input 
                type="text" 
                v-model="username"
                class="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-gray-800 outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium placeholder:text-gray-400 shadow-sm"
                placeholder="admin.poksiA"
                required
              />
            </div>
          </div>

          <div class="space-y-1 relative">
            <label class="text-xs font-bold text-gray-600 uppercase tracking-widest ml-1">Kata Sandi</label>
            <div class="relative mt-1">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
              <input 
                type="password" 
                v-model="password"
                class="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-gray-800 outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium placeholder:text-gray-400 shadow-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full py-4 rounded-xl font-bold tracking-widest uppercase text-sm shadow-lg transition-all duration-300 flex justify-center items-center gap-3"
            :class="[
              isLoading 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-kementan-green text-white hover:bg-[#004d26] hover:shadow-[0_8px_20px_rgba(0,102,51,0.3)] hover:-translate-y-1 active:translate-y-0'
            ]"
          >
            <template v-if="isLoading">
              <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Memverifikasi...
            </template>
            <template v-else>Masuk Ke Sistem</template>
          </button>
        </form>

        <div class="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
          <span>v1.0 MVP Edition</span>
          <span>Ditjen Lahan & Irigasi</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { GAS_URL } from '../config/api'
import { Lock, User, ShieldCheck } from 'lucide-vue-next'

const router = useRouter()
const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMsg.value = ''

  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "LOGIN",
        username: username.value,
        password: password.value
      })
    })

    const result = await response.json()

    if (result.success) {
      localStorage.setItem('adminData', JSON.stringify(result.data))
      router.push('/dashboard')
    } else {
      errorMsg.value = result.message
    }
  } catch (err) {
    errorMsg.value = 'Gagal terhubung ke server database. Periksa koneksi internet Anda.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.shake-enter-active {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
