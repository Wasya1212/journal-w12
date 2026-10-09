<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Student, Lesson } from '../types/journal';
import { useJournal } from '../composables/useJournal';
import { X, Check, Trash2, MessageSquare, User, Calendar } from 'lucide-vue-next';

const props = defineProps<{
  student: Student | null;
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
}>();

const { getGrade, setGrade } = useJournal();

const currentValue = ref('');
const currentComment = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

watch(
  () => [props.student, props.lesson, props.isOpen],
  () => {
    if (props.student && props.lesson && props.isOpen) {
      const existing = getGrade(props.student.id, props.lesson.id);
      currentValue.value = existing?.value || '';
      currentComment.value = existing?.comment || '';
      setTimeout(() => {
        inputRef.value?.focus();
        inputRef.value?.select();
      }, 50);
    }
  },
  { immediate: true }
);

function applyQuickValue(val: string) {
  currentValue.value = val;
}

function handleSave() {
  if (props.student && props.lesson) {
    setGrade(props.student.id, props.lesson.id, currentValue.value, currentComment.value);
  }
  props.onClose();
}

function handleClear() {
  currentValue.value = '';
  currentComment.value = '';
  if (props.student && props.lesson) {
    setGrade(props.student.id, props.lesson.id, '', '');
  }
  props.onClose();
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    props.onClose();
  } else if (e.key === 'Enter' && !e.shiftKey) {
    handleSave();
  }
}
</script>

<template>
  <div
    v-if="isOpen && student && lesson"
    class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 overflow-y-auto"
    @click.self="onClose"
    @keydown="handleKeydown"
  >
    <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden transform transition-all my-auto">
      
      <!-- Header (Pinned top) -->
      <div class="px-5 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-slate-50 to-indigo-50/40 border-b border-slate-200 flex items-start justify-between shrink-0">
        <div>
          <div class="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
            <User class="w-4 h-4 text-indigo-500" />
            <span>{{ student.name }}</span>
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <Calendar class="w-3.5 h-3.5 text-slate-400" />
            <span>Урок №{{ lesson.lessonNumber }} ({{ lesson.date }})</span>
          </div>
          <p class="text-xs text-slate-600 line-clamp-1 mt-1 font-medium" :title="lesson.topic">
            {{ lesson.topic }}
          </p>
        </div>

        <button
          @click="onClose"
          class="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body (Scrollable if height exceeds screen) -->
      <div class="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto overscroll-contain flex-1">
        
        <!-- Primary Value Input -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Оцінка / Відмітка
          </label>
          <div class="relative">
            <input
              ref="inputRef"
              v-model="currentValue"
              type="text"
              placeholder="Введіть бал (1-12), рівень (В, Д, С, П) або 'н'"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-lg text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-center tracking-wide"
            />
          </div>
        </div>

        <!-- Quick Select Buttons -->
        <div class="space-y-3">
          <!-- Attendance -->
          <div>
            <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Відвідування
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="applyQuickValue('н')"
                class="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                :class="currentValue === 'н' 
                  ? 'bg-rose-500 text-white border-rose-600 shadow-sm' 
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'"
              >
                <span>н (Відсутній)</span>
              </button>

              <button
                type="button"
                @click="applyQuickValue('хв')"
                class="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                :class="currentValue === 'хв' 
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm' 
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'"
              >
                <span>хв (Хворів)</span>
              </button>
            </div>
          </div>

          <!-- NUSH Levels -->
          <div>
            <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Рівні оцінювання НУШ (1 клас)</span>
              <span class="text-[10px] text-indigo-600 font-normal">Вербальне/Рівневе</span>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <button
                type="button"
                @click="applyQuickValue('В')"
                class="px-3 py-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer"
                :class="currentValue === 'В' 
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'"
                title="Високий рівень"
              >
                В <span class="block text-[10px] font-normal opacity-90">Високий</span>
              </button>

              <button
                type="button"
                @click="applyQuickValue('Д')"
                class="px-3 py-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer"
                :class="currentValue === 'Д' 
                  ? 'bg-sky-600 text-white border-sky-700 shadow-sm' 
                  : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'"
                title="Достатній рівень"
              >
                Д <span class="block text-[10px] font-normal opacity-90">Достатній</span>
              </button>

              <button
                type="button"
                @click="applyQuickValue('С')"
                class="px-3 py-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer"
                :class="currentValue === 'С' 
                  ? 'bg-amber-600 text-white border-amber-700 shadow-sm' 
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'"
                title="Середній рівень"
              >
                С <span class="block text-[10px] font-normal opacity-90">Середній</span>
              </button>

              <button
                type="button"
                @click="applyQuickValue('П')"
                class="px-3 py-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer"
                :class="currentValue === 'П' 
                  ? 'bg-orange-600 text-white border-orange-700 shadow-sm' 
                  : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'"
                title="Початковий рівень"
              >
                П <span class="block text-[10px] font-normal opacity-90">Початковий</span>
              </button>
            </div>
          </div>

          <!-- 12-point scale -->
          <div>
            <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              12-бальна шкала
            </div>
            <div class="grid grid-cols-6 gap-1.5">
              <button
                v-for="val in ['12', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1']"
                :key="val"
                type="button"
                @click="applyQuickValue(val)"
                class="py-1.5 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer"
                :class="currentValue === val 
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs' 
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600'"
              >
                {{ val }}
              </button>
            </div>
          </div>
        </div>

        <!-- Optional Comment -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MessageSquare class="w-3.5 h-3.5 text-slate-400" />
            <span>Коментар до оцінки (опціонально)</span>
          </label>
          <input
            v-model="currentComment"
            type="text"
            placeholder="Наприклад: активний на уроці, не здав зошит..."
            class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

      </div>

      <!-- Footer Buttons (Pinned bottom) -->
      <div class="px-5 py-3 sm:px-6 sm:py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
        <button
          type="button"
          @click="handleClear"
          class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
        >
          <Trash2 class="w-4 h-4" />
          <span>Очистити</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="onClose"
            class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Скасувати
          </button>
          
          <button
            type="button"
            @click="handleSave"
            class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
          >
            <Check class="w-4 h-4" />
            <span>Зберегти</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
