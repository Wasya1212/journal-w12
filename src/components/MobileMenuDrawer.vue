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
  FileSpreadsheet,
  X
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  onClose: () => void;
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
    props.onClose();
  }
}

function handleExportClick() {
  exportToJson();
  props.onClose();
}

async function handleExportExcelClick() {
  await exportToExcel();
  props.onClose();
}

function handleOpenSettingsClick() {
  props.onClose();
  props.onOpenSettings();
}

function handleResetClick() {
  if (confirm('Ви впевнені, що хочете скинути дані журналу до початкових? Усі поточні оцінки буде перезаписано.')) {
    resetToDefaults();
    props.onClose();
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end"
      @click.self="onClose"
    >
      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <div
          v-if="isOpen"
          class="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto"
        >
          <!-- Top Area -->
          <div class="p-5 space-y-5">
            <!-- Header with close button -->
            <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
                  <BookOpen class="w-5 h-5" />
                </div>
                <div>
                  <h2 class="text-base font-bold text-slate-900 leading-tight">
                    Електронний журнал
                  </h2>
                  <div class="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      1 клас • НУШ
                    </span>
                    <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/60">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Збережено</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                @click="onClose"
                class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Закрити меню"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Subject Title -->
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Навчальний курс
              </span>
              <p class="text-xs font-semibold text-slate-700 leading-relaxed">
                {{ journal.subject }}
              </p>
            </div>

            <!-- Stats Overview -->
            <div>
              <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Статистика журналу
              </span>
              <div class="grid grid-cols-3 gap-2">
                <div class="bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 text-center">
                  <GraduationCap class="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                  <div class="text-base font-bold text-slate-900 leading-none">
                    {{ journal.students.length }}
                  </div>
                  <div class="text-[10px] text-slate-500 mt-0.5">Учнів</div>
                </div>

                <div class="bg-sky-50/60 p-2.5 rounded-xl border border-sky-100 text-center">
                  <CalendarDays class="w-4 h-4 text-sky-600 mx-auto mb-1" />
                  <div class="text-base font-bold text-slate-900 leading-none">
                    {{ journal.lessons.length }}
                  </div>
                  <div class="text-[10px] text-slate-500 mt-0.5">Уроків</div>
                </div>

                <div class="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 text-center">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <div class="text-base font-bold text-slate-900 leading-none">
                    {{ journal.grades.length }}
                  </div>
                  <div class="text-[10px] text-slate-500 mt-0.5">Оцінок</div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-2.5 pt-2">
              <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Дії з журналом
              </span>

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
                class="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 shadow-xs transition-all cursor-pointer"
              >
                <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <Upload class="w-4 h-4" />
                </div>
                <div class="text-left flex-1">
                  <div>Імпорт з JSON</div>
                  <div class="text-[11px] text-slate-400 font-normal">Відновити дані з файлу</div>
                </div>
              </button>

              <!-- Export JSON Button -->
              <button
                @click="handleExportClick"
                class="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-indigo-700 bg-indigo-50/60 border border-indigo-200/80 hover:bg-indigo-100/80 active:bg-indigo-100 shadow-xs transition-all cursor-pointer"
              >
                <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Download class="w-4 h-4" />
                </div>
                <div class="text-left flex-1">
                  <div>Експорт в JSON</div>
                  <div class="text-[11px] text-indigo-500 font-normal">Завантажити бекап даних з міткою часу</div>
                </div>
              </button>

              <!-- Export Excel Button -->
              <button
                @click="handleExportExcelClick"
                class="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-emerald-800 bg-emerald-50/80 border border-emerald-300 hover:bg-emerald-100/90 active:bg-emerald-100 shadow-xs transition-all cursor-pointer"
              >
                <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <FileSpreadsheet class="w-4 h-4" />
                </div>
                <div class="text-left flex-1">
                  <div class="flex items-center gap-1.5">
                    <span>Експорт в Excel</span>
                    <span class="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-200/70 text-emerald-900 rounded">.XLSX</span>
                  </div>
                  <div class="text-[11px] text-emerald-700/80 font-normal">Застилізована таблиця + планування</div>
                </div>
              </button>

              <!-- Settings Button -->
              <button
                @click="handleOpenSettingsClick"
                class="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <Settings class="w-4 h-4" />
                </div>
                <div class="text-left flex-1">
                  <div>Налаштування журналу</div>
                  <div class="text-[11px] text-indigo-200 font-normal">Учні, уроки, планування</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Bottom Area: Reset & Close -->
          <div class="p-5 border-t border-slate-100 bg-slate-50 space-y-3">
            <button
              @click="handleResetClick"
              class="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Скинути до вихідних даних</span>
            </button>

            <button
              @click="onClose"
              class="w-full py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Закрити меню
            </button>
          </div>

        </div>
      </Transition>
    </div>
  </Transition>
</template>
