<script setup lang="ts">
import { useJournal } from '../composables/useJournal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next';

const { toastMessage } = useJournal();
</script>

<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="toastMessage"
      class="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl backdrop-blur-md border text-sm font-medium transition-all max-w-md"
      :class="{
        'bg-emerald-500/95 text-white border-emerald-400': toastMessage.type === 'success',
        'bg-rose-500/95 text-white border-rose-400': toastMessage.type === 'error',
        'bg-sky-500/95 text-white border-sky-400': toastMessage.type === 'info'
      }"
    >
      <CheckCircle2 v-if="toastMessage.type === 'success'" class="w-5 h-5 shrink-0" />
      <AlertCircle v-else-if="toastMessage.type === 'error'" class="w-5 h-5 shrink-0" />
      <Info v-else class="w-5 h-5 shrink-0" />

      <span class="flex-1">{{ toastMessage.text }}</span>

      <button
        @click="toastMessage = null"
        class="p-1 hover:bg-white/20 rounded-lg transition-colors"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </Transition>
</template>
