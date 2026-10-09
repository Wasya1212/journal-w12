<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import type { Student, Lesson } from '../types/journal';
import { useJournal } from '../composables/useJournal';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  UserPlus
} from 'lucide-vue-next';

const props = defineProps<{
  onSelectCell: (student: Student, lesson: Lesson) => void;
}>();

const { journal, getGrade, addStudent, updateStudent, removeStudent } = useJournal();

const studentQuery = ref('');
const tableScrollRef = ref<HTMLDivElement | null>(null);

// Inline Add Student State
const isAddingStudent = ref(false);
const newStudentName = ref('');
const addStudentInputRef = ref<HTMLInputElement | null>(null);

// Inline Edit Student State
const editingStudentId = ref<string | null>(null);
const editingStudentName = ref('');
const editStudentInputRef = ref<HTMLInputElement | null>(null);

const filteredStudents = computed(() => {
  const q = studentQuery.value.trim().toLowerCase();
  if (!q) return journal.value.students;
  return journal.value.students.filter(s => s.name.toLowerCase().includes(q));
});

// Calculate stats per student
function getStudentStats(studentId: string) {
  const grades = journal.value.grades.filter(g => g.studentId === studentId);
  const absences = grades.filter(g => g.value.toLowerCase() === 'н' || g.value.toLowerCase() === 'хв').length;
  const gradeCount = grades.length - absences;
  return {
    total: grades.length,
    absences,
    gradeCount
  };
}

// Styling for different grade values
function getGradeBadgeClass(val: string): string {
  const upper = val.toUpperCase().trim();
  if (upper === 'Н' || upper === 'N') {
    return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
  }
  if (upper === 'ХВ') {
    return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
  }
  if (upper === 'В' || ['12', '11', '10'].includes(upper)) {
    return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
  }
  if (upper === 'Д' || ['9', '8', '7'].includes(upper)) {
    return 'bg-sky-100 text-sky-800 border-sky-300 font-bold';
  }
  if (upper === 'С' || ['6', '5', '4'].includes(upper)) {
    return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
  }
  if (upper === 'П' || ['3', '2', '1'].includes(upper)) {
    return 'bg-orange-100 text-orange-800 border-orange-300 font-bold';
  }
  return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
}

// Quick horizontal scrolling
function scrollTable(direction: 'left' | 'right') {
  if (!tableScrollRef.value) return;
  const offset = 450;
  tableScrollRef.value.scrollBy({
    left: direction === 'left' ? -offset : offset,
    behavior: 'smooth'
  });
}

function scrollToBeginning() {
  if (!tableScrollRef.value) return;
  tableScrollRef.value.scrollTo({ left: 0, behavior: 'smooth' });
}

function scrollToEnd() {
  if (!tableScrollRef.value) return;
  tableScrollRef.value.scrollTo({ left: tableScrollRef.value.scrollWidth, behavior: 'smooth' });
}

function handleCellKeydown(e: KeyboardEvent, student: Student, lesson: Lesson) {
  if (e.key === 'Enter' || e.key === ' ' || e.key.length === 1) {
    props.onSelectCell(student, lesson);
  }
}

// Student Management Functions
async function startAddStudent() {
  isAddingStudent.value = true;
  newStudentName.value = '';
  await nextTick();
  addStudentInputRef.value?.focus();
}

function handleAddStudentSubmit() {
  if (newStudentName.value.trim()) {
    addStudent(newStudentName.value);
    newStudentName.value = '';
    isAddingStudent.value = false;
  }
}

function cancelAddStudent() {
  isAddingStudent.value = false;
  newStudentName.value = '';
}

async function startEditStudent(student: Student) {
  editingStudentId.value = student.id;
  editingStudentName.value = student.name;
  await nextTick();
  editStudentInputRef.value?.focus();
  editStudentInputRef.value?.select();
}

function handleSaveEditStudent(id: string) {
  if (editingStudentName.value.trim()) {
    updateStudent(id, editingStudentName.value);
  }
  editingStudentId.value = null;
  editingStudentName.value = '';
}

function cancelEditStudent() {
  editingStudentId.value = null;
  editingStudentName.value = '';
}

function handleRemoveStudent(student: Student) {
  if (confirm(`Ви дійсно бажаєте видалити учня "${student.name}" із журналу?\nУсі оцінки цього учня також буде видалено.`)) {
    removeStudent(student.id);
  }
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-80px)]">
    
    <!-- Table Controls Bar -->
    <div class="px-4 sm:px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
      
      <!-- Student Filter Search & Quick Add Button -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <div class="relative w-56 sm:w-72">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="studentQuery"
            type="text"
            placeholder="Пошук учня за прізвищем..."
            class="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        <button
          @click="startAddStudent"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl text-indigo-700 bg-indigo-50 border border-indigo-200/80 hover:bg-indigo-100 hover:border-indigo-300 active:bg-indigo-200/70 shadow-xs transition-all cursor-pointer"
          title="Додати нового учня до списку журналу"
        >
          <UserPlus class="w-4 h-4 text-indigo-600" />
          <span>+ Додати учня</span>
        </button>

        <span v-if="studentQuery" class="text-xs text-slate-500">
          Знайдено: {{ filteredStudents.length }}
        </span>
      </div>

      <!-- Navigation & Scrolling shortcuts -->
      <div class="flex items-center gap-2">
        <span class="hidden md:inline text-xs text-slate-400 font-medium mr-1">
          Навігація по уроках:
        </span>
        <button
          @click="scrollToBeginning"
          class="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          title="До першого уроку"
        >
          Початок
        </button>
        <button
          @click="scrollTable('left')"
          class="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Прокрутити ліворуч"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <button
          @click="scrollTable('right')"
          class="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Прокрутити праворуч"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
        <button
          @click="scrollToEnd"
          class="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          title="До останнього уроку"
        >
          Кінець
        </button>
      </div>

    </div>

    <!-- Main Table Container with Sticky Column & Smooth Scroll -->
    <div
      ref="tableScrollRef"
      class="flex-1 overflow-auto bg-slate-100/50 table-container relative select-none"
    >
      <table class="border-separate border-spacing-0 min-w-full text-left">
        
        <!-- Table Header -->
        <thead class="sticky top-0 z-20 bg-slate-50">
          <tr>
            <!-- Sticky Student Header (Left Column) -->
            <th class="sticky left-0 z-30 bg-slate-100 border-b-2 border-r-2 border-slate-300 px-4 py-3 min-w-[280px] max-w-[320px] shadow-sm">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Список учнів
                  </span>
                  <span class="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {{ journal.students.length }}
                  </span>
                </div>

                <button
                  @click="startAddStudent"
                  class="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                  title="Швидко додати учня"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>Додати</span>
                </button>
              </div>
            </th>

            <!-- Lesson Columns Headers -->
            <th
              v-for="lesson in journal.lessons"
              :key="lesson.id"
              class="border-b-2 border-r border-slate-300 px-2 py-2 min-w-[140px] max-w-[150px] bg-slate-50 hover:bg-indigo-50/40 transition-colors group relative cursor-help"
            >
              <div class="flex flex-col gap-1">
                <!-- Lesson Number & Date -->
                <div class="flex items-center justify-between gap-1">
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100/80 text-indigo-800 border border-indigo-200">
                    №{{ lesson.lessonNumber }}
                  </span>
                  <span class="text-[11px] font-medium text-slate-500">
                    {{ lesson.date }}
                  </span>
                </div>

                <!-- Lesson Topic Preview -->
                <div
                  class="text-[11px] text-slate-700 font-medium line-clamp-2 leading-tight h-7 overflow-hidden"
                  :title="lesson.topic"
                >
                  {{ lesson.topic }}
                </div>
              </div>

              <!-- Sleek Dropdown Tooltip on Hover -->
              <div class="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 hidden group-hover:block z-40 w-64 p-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs pointer-events-none">
                <div class="flex items-center justify-between text-indigo-300 font-semibold mb-1">
                  <span>Урок №{{ lesson.lessonNumber }}</span>
                  <span>{{ lesson.date }}</span>
                </div>
                <p class="text-slate-200 leading-relaxed font-normal">
                  {{ lesson.topic }}
                </p>
              </div>
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="divide-y divide-slate-200 bg-white">
          <tr
            v-for="(student, sIdx) in filteredStudents"
            :key="student.id"
            class="hover:bg-indigo-50/20 transition-colors group"
          >
            <!-- Sticky Student Name & Quick Stats + Action Buttons -->
            <td class="sticky left-0 z-10 bg-white group-hover:bg-indigo-50/40 border-r-2 border-b border-slate-300 px-3.5 py-2.5 shadow-sm transition-colors">
              
              <!-- Inline Editing Mode -->
              <div v-if="editingStudentId === student.id" class="flex items-center gap-1.5">
                <input
                  ref="editStudentInputRef"
                  v-model="editingStudentName"
                  type="text"
                  class="flex-1 px-2.5 py-1 text-xs sm:text-sm font-semibold bg-white border-2 border-indigo-500 rounded-lg focus:outline-none shadow-xs"
                  @keyup.enter="handleSaveEditStudent(student.id)"
                  @keyup.esc="cancelEditStudent"
                />
                <button
                  @click="handleSaveEditStudent(student.id)"
                  class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  title="Зберегти ім'я"
                >
                  <Check class="w-4 h-4" />
                </button>
                <button
                  @click="cancelEditStudent"
                  class="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Скасувати"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>

              <!-- Normal Display Mode -->
              <div v-else class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2.5 flex-1 min-w-0">
                  <span class="w-5 text-center text-xs font-semibold text-slate-400 shrink-0">
                    {{ sIdx + 1 }}
                  </span>
                  <div class="flex-1 min-w-0">
                    <div class="text-xs sm:text-sm font-semibold text-slate-900 truncate" :title="student.name">
                      {{ student.name }}
                    </div>
                    <!-- Mini Stats Indicator -->
                    <div class="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                      <span v-if="getStudentStats(student.id).absences > 0" class="text-rose-600 font-medium">
                        Пропусків: {{ getStudentStats(student.id).absences }}
                      </span>
                      <span v-else class="text-slate-400">
                        Оцінок: {{ getStudentStats(student.id).gradeCount }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Hover Quick Actions for Student (Edit / Delete) -->
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                  <button
                    @click.stop="startEditStudent(student)"
                    class="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                    title="Редагувати ім'я учня"
                  >
                    <Edit2 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click.stop="handleRemoveStudent(student)"
                    class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    title="Видалити учня зі списку"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </td>

            <!-- Grade Cells for Each Lesson -->
            <td
              v-for="lesson in journal.lessons"
              :key="lesson.id"
              tabindex="0"
              @click="onSelectCell(student, lesson)"
              @keydown="handleCellKeydown($event, student, lesson)"
              class="border-r border-b border-slate-200 p-1 text-center h-12 relative cursor-pointer hover:bg-indigo-100/50 focus:bg-indigo-100/70 focus:outline-none transition-colors"
            >
              <!-- Cell Content -->
              <div class="w-full h-full flex items-center justify-center relative">
                <template v-if="getGrade(student.id, lesson.id)">
                  <span
                    class="inline-flex items-center justify-center min-w-7 h-7 px-1.5 rounded-lg text-xs border transition-transform hover:scale-110"
                    :class="getGradeBadgeClass(getGrade(student.id, lesson.id)!.value)"
                    :title="getGrade(student.id, lesson.id)?.comment || getGrade(student.id, lesson.id)?.value"
                  >
                    {{ getGrade(student.id, lesson.id)!.value }}
                  </span>

                  <!-- Comment Indicator Dot -->
                  <span
                    v-if="getGrade(student.id, lesson.id)?.comment"
                    class="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"
                    :title="'Коментар: ' + getGrade(student.id, lesson.id)?.comment"
                  ></span>
                </template>

                <!-- Empty Cell Hover State -->
                <span
                  v-else
                  class="opacity-0 group-hover:opacity-40 text-slate-300 hover:text-indigo-600 text-xs font-bold"
                >
                  +
                </span>
              </div>
            </td>
          </tr>

          <!-- Inline Add Student Form Row -->
          <tr v-if="isAddingStudent" class="bg-indigo-50/30">
            <td class="sticky left-0 z-10 bg-indigo-50/70 border-r-2 border-b border-slate-300 px-3.5 py-2.5 shadow-sm">
              <form @submit.prevent="handleAddStudentSubmit" class="flex items-center gap-1.5">
                <input
                  ref="addStudentInputRef"
                  v-model="newStudentName"
                  type="text"
                  placeholder="Введіть ПІБ нового учня..."
                  class="flex-1 px-2.5 py-1 text-xs sm:text-sm font-medium bg-white border-2 border-indigo-500 rounded-lg focus:outline-none shadow-xs"
                  @keyup.esc="cancelAddStudent"
                />
                <button
                  type="submit"
                  class="p-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                  title="Додати учня"
                >
                  <Check class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  @click="cancelAddStudent"
                  class="p-1.5 text-slate-500 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                  title="Скасувати"
                >
                  <X class="w-4 h-4" />
                </button>
              </form>
            </td>
            <td :colspan="journal.lessons.length" class="border-b border-r border-slate-200 bg-slate-50/40 text-xs text-slate-400 px-4 italic">
              Новий учень з'явиться в загальному списку та автоматично впорядкується за алфавітом.
            </td>
          </tr>

          <!-- Quick "+ Додати учня" prompt row at bottom of table -->
          <tr v-else-if="filteredStudents.length > 0">
            <td class="sticky left-0 z-10 bg-slate-50 hover:bg-indigo-50/40 border-r-2 border-b border-slate-300 px-4 py-2 transition-colors">
              <button
                @click="startAddStudent"
                class="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer py-1 w-full"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>+ Додати ще одного учня</span>
              </button>
            </td>
            <td :colspan="journal.lessons.length" class="border-b border-slate-200 bg-slate-50/20"></td>
          </tr>

          <!-- Empty State -->
          <tr v-if="filteredStudents.length === 0 && !isAddingStudent">
            <td :colspan="journal.lessons.length + 1" class="text-center py-12 text-sm text-slate-400">
              <p>Учнів за вашим запитом не знайдено.</p>
              <button
                @click="startAddStudent"
                class="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus class="w-4 h-4" />
                <span>Додати першого учня</span>
              </button>
            </td>
          </tr>
        </tbody>

      </table>
    </div>

    <!-- Bottom Status / Hint Bar -->
    <div class="px-6 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <span class="inline-flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>В / 10-12 (Високий)</span>
        </span>
        <span class="inline-flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
          <span>Д / 7-9 (Достатній)</span>
        </span>
        <span class="inline-flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>С / 4-6 (Середній)</span>
        </span>
        <span class="inline-flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>н (Пропуск)</span>
        </span>
      </div>

      <div class="hidden sm:flex items-center gap-2 text-slate-400">
        <span>Наведіть на учня, щоб відредагувати (✏️) або видалити (🗑️) зі списку</span>
      </div>
    </div>

  </div>
</template>
