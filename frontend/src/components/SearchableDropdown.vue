<template>
  <div ref="dropdownRef" class="relative">
    <label v-if="label" class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-1.5">
      {{ label }} <span v-if="required" class="text-red-400">*</span>
    </label>

    <!-- Trigger -->
    <button
      type="button"
      :disabled="disabled"
      @click="toggleDropdown"
      class="w-full flex items-center justify-between gap-2 border rounded-xl py-2.5 px-4 text-left transition-all duration-200"
      :class="[
        disabled
          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
          : isOpen
            ? 'bg-white border-kementan-green ring-4 ring-kementan-green/10 shadow-sm'
            : 'bg-white border-gray-300 hover:border-gray-400 shadow-sm'
      ]"
    >
      <span class="text-sm font-medium truncate" :class="selectedOption ? 'text-gray-800' : 'text-gray-400'">
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>
      <div class="flex items-center gap-1 shrink-0">
        <span 
          v-if="selectedOption && !disabled" 
          @click.stop="handleClear" 
          class="p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
        >
          <X :size="14" />
        </span>
        <ChevronDown 
          :size="18" 
          class="transition-transform duration-200"
          :class="isOpen ? 'rotate-180 text-kementan-green' : 'text-gray-400'"
        />
      </div>
    </button>

    <!-- Dropdown Panel -->
    <transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg shadow-black/8 z-50 overflow-hidden"
      >
        <!-- Search Input -->
        <div class="p-2 border-b border-gray-100">
          <div class="relative">
            <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref="inputRef"
              type="text"
              v-model="query"
              placeholder="Ketik nama untuk mencari..."
              class="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-kementan-green focus:bg-white transition-all placeholder:text-gray-400 font-medium"
              @keydown.esc="isOpen = false"
            />
          </div>
        </div>

        <!-- Options -->
        <div class="max-h-52 overflow-y-auto custom-scrollbar py-1">
          <template v-if="filtered.length > 0">
            <button
              v-for="opt in filtered.slice(0, 50)"
              :key="opt.value"
              type="button"
              @click="handleSelect(opt.value)"
              class="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors"
              :class="[
                opt.value === value
                  ? 'bg-kementan-green/5 text-kementan-green'
                  : 'text-gray-700 hover:bg-gray-50'
              ]"
            >
              <div class="min-w-0">
                <p class="text-sm font-medium truncate">{{ opt.label }}</p>
                <p v-if="opt.subtitle" class="text-[10px] text-gray-400 truncate">{{ opt.subtitle }}</p>
              </div>
              <Check v-if="opt.value === value" :size="16" class="text-kementan-green shrink-0 ml-2" />
            </button>
          </template>
          <div v-else class="px-4 py-6 text-center text-sm text-gray-400 font-medium">
            Tidak ditemukan hasil untuk "{{ query }}"
          </div>
        </div>
      </div>
    </transition>

    <!-- Hidden input for form validation -->
    <input
      v-if="required"
      tabindex="-1"
      autocomplete="off"
      style="position: absolute; opacity: 0; width: 0; height: 0;"
      :value="value"
      :required="required"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Search, ChevronDown, Check, X } from 'lucide-vue-next'

const props = defineProps({
  options: { type: Array, default: () => [] },
  value: { type: [String, Number], default: '' },
  placeholder: { type: String, default: 'Ketik untuk mencari...' },
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:value', 'change'])

const isOpen = ref(false)
const query = ref('')
const dropdownRef = ref(null)
const inputRef = ref(null)

const selectedOption = computed(() => 
  props.options.find(opt => opt.value === props.value)
)

const filtered = computed(() => {
  if (!query.value) return props.options
  const q = query.value.toLowerCase()
  return props.options.filter(opt =>
    opt.label.toLowerCase().includes(q) ||
    (opt.subtitle && opt.subtitle.toLowerCase().includes(q))
  )
})

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      nextTick(() => {
        inputRef.value?.focus()
      })
    }
  }
}

const handleSelect = (val) => {
  emit('update:value', val)
  emit('change', val)
  isOpen.value = false
  query.value = ''
}

const handleClear = () => {
  emit('update:value', '')
  emit('change', '')
  query.value = ''
}

// Close on click outside
const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false
    query.value = ''
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.15s ease-out, transform 0.15s ease-out;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
