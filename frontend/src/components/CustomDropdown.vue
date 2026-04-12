<template>
  <div
    ref="dropdownRef"
    class="relative"
  >
    <label
      v-if="label"
      class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-1.5"
    >
      {{ label }} <span
        v-if="required"
        class="text-red-400"
      >*</span>
    </label>

    <!-- Trigger Button -->
    <button
      type="button"
      :disabled="disabled"
      class="w-full flex items-center justify-between gap-3 border rounded-xl py-2.5 px-4 text-left transition-all duration-200"
      :class="[
        disabled 
          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
          : isOpen 
            ? 'bg-white border-kementan-green ring-4 ring-kementan-green/10 shadow-sm' 
            : 'bg-white border-gray-300 hover:border-gray-400 shadow-sm'
      ]"
      @click="toggleDropdown"
    >
      <span
        class="text-sm font-medium truncate"
        :class="selectedOption ? 'text-gray-800' : 'text-gray-400'"
      >
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>
      <ChevronDown 
        :size="18" 
        class="shrink-0 transition-transform duration-200"
        :class="isOpen ? 'rotate-180 text-kementan-green' : 'text-gray-400'"
      />
    </button>

    <!-- Dropdown List -->
    <transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg shadow-black/8 z-50 overflow-hidden"
      >
        <div class="py-1 max-h-80 overflow-y-auto custom-scrollbar">
          <button
            v-for="opt in options"
            :key="opt.value"
            type="button"
            class="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm font-medium transition-colors"
            :class="[
              opt.value === value 
                ? 'bg-kementan-green/5 text-kementan-green' 
                : 'text-gray-700 hover:bg-gray-50'
            ]"
            @click="selectOption(opt.value)"
          >
            <span>{{ opt.label }}</span>
            <Check
              v-if="opt.value === value"
              :size="16"
              class="text-kementan-green shrink-0"
            />
          </button>
        </div>
      </div>
    </transition>

    <!-- Hidden native input for form validation -->
    <input
      v-if="required"
      tabindex="-1"
      autocomplete="off"
      style="position: absolute; opacity: 0; width: 0; height: 0;"
      :value="value"
      :required="required"
    >
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDown, Check } from 'lucide-vue-next'

interface DropdownOption {
  value: string | number;
  label: string;
}

const props = withDefaults(defineProps<{
  options?: DropdownOption[];
  value?: string | number;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}>(), {
  options: () => [],
  value: '',
  placeholder: 'Pilih opsi...',
  label: '',
  required: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:value', val: string | number): void;
  (e: 'change', val: string | number): void;
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const selectedOption = computed(() => 
  props.options.find(opt => opt.value === props.value)
)

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const selectOption = (val: string | number) => {
  emit('update:value', val)
  emit('change', val)
  isOpen.value = false
}

// Close on click outside
const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false
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
