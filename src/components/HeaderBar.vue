<script setup lang="ts">
import { ref } from 'vue';
import { useJournal } from '../composables/useJournal';
import {
  Download,
  Upload,
  Settings,
  BookOpen,
  GraduationCap,
  CalendarDays,
  CheckCircle2,
  RotateCcw,
  FileSpreadsheet
} from 'lucide-vue-next';

defineProps<{
  onOpenSettings: () => void;
}>();

const { journal, exportToJson, exportToExcel, importFromJson, resetToDefaults } = useJournal();
const fileInputRef = ref<HTMLInputElement | null>(null);

function handleImportClick() {
  fileInputRef.value?.click();
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    await importFromJson(file);
    target.value = '';
  }
}

function handleReset() {
  if (confirm('Ви впевнені, що хочете скинути дані журналу до початкових? Усі поточні оцінки буде замінено на дефолтні.')) {
    resetToDefaults();
  }
}
</script>

<template>
  <header class="desktop-only-header bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
    <div class="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        <!-- Logo and Subject Info -->
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
            <BookOpen class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <h1 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Електронний журнал учителя
              </h1>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                1 клас • НУШ
              </span>
              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/60" title="Автоматичне збереження в браузері">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Збережено</span>
              </span>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 font-medium truncate max-w-xl mt-0.5" :title="journal.subject">
              {{ journal.subject }}
            </p>
          </div>
        </div>

        <!-- Right: Stats & Action Buttons -->
        <div class="flex items-center flex-wrap gap-2.5 sm:gap-3">
          <!-- Quick Stats Pills -->
          <div class="hidden xl:flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs text-slate-600">
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white shadow-xs font-medium">
              <GraduationCap class="w-3.5 h-3.5 text-indigo-600" />
              <span>Учнів: <strong class="text-slate-900">{{ journal.students.length }}</strong></span>
            </div>
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white shadow-xs font-medium">
              <CalendarDays class="w-3.5 h-3.5 text-sky-600" />
              <span>Уроків: <strong class="text-slate-900">{{ journal.lessons.length }}</strong></span>
            </div>
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white shadow-xs font-medium">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
              <span>Оцінок: <strong class="text-slate-900">{{ journal.grades.length }}</strong></span>
            </div>
          </div>

          <!-- Hidden File Input for Import -->
          <input
            ref="fileInputRef"
            type="file"
            accept=".json,application/json"
            class="hidden"
            @change="handleFileChange"
          />

          <!-- Import Button -->
          <button
            @click="handleImportClick"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 active:bg-slate-100 shadow-xs transition-all cursor-pointer"
            title="Завантажити журнал з JSON-файлу"
          >
            <Upload class="w-4 h-4 text-slate-500" />
            <span>Імпорт з JSON</span>
          </button>

          <!-- Export JSON Button -->
          <button
            @click="exportToJson"
            class="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl text-indigo-700 bg-indigo-50 border border-indigo-200/90 hover:bg-indigo-100/80 active:bg-indigo-100 shadow-xs transition-all cursor-pointer"
            title="Завантажити поточний стан журналу у JSON з датою та часом (journal_YYYY-MM-DD_HH-mm-ss.json)"
          >
            <Download class="w-4 h-4 text-indigo-600" />
            <span>JSON</span>
          </button>

          <!-- Export Excel Button -->
          <button
            @click="exportToExcel"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100/80 active:bg-emerald-100 shadow-xs transition-all cursor-pointer group"
            title="Експортувати застилізований Excel (.xlsx) файл із закріпленими шапками, кольоровими оцінками та календарним плануванням"
          >
            <FileSpreadsheet class="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span>Excel (.xlsx)</span>
          </button>

          <!-- Settings Button -->
          <button
            @click="onOpenSettings"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-200 transition-all cursor-pointer"
            title="Налаштування уроків, учнів та предмету"
          >
            <Settings class="w-4 h-4" />
            <span class="hidden sm:inline">Налаштування</span>
          </button>

          <!-- Reset Button -->
          <button
            @click="handleReset"
            class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Скинути журнал до початкового стану"
          >
            <RotateCcw class="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  </header>
</template>
