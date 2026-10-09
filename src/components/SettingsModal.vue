<script setup lang="ts">
import { ref, computed } from 'vue';
import { useJournal } from '../composables/useJournal';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Users,
  Calendar,
  Settings as SettingsIcon,
  RotateCcw,
  Info
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  onClose: () => void;
}>();

const {
  journal,
  addStudent,
  updateStudent,
  removeStudent,
  addLesson,
  updateLesson,
  removeLesson,
  resetToDefaults
} = useJournal();

const activeTab = ref<'students' | 'lessons' | 'general'>('students');

// Student state
const newStudentName = ref('');
const editingStudentId = ref<string | null>(null);
const editingStudentName = ref('');

// Lesson state
const newLessonNumber = ref<number | null>(null);
const newLessonDate = ref('');
const newLessonTopic = ref('');
const editingLessonId = ref<string | null>(null);
const editingLessonNumber = ref<number>(1);
const editingLessonDate = ref('');
const editingLessonTopic = ref('');

// Search queries inside modal
const studentSearch = ref('');
const lessonSearch = ref('');

const filteredStudents = computed(() => {
  const q = studentSearch.value.trim().toLowerCase();
  if (!q) return journal.value.students;
  return journal.value.students.filter(s => s.name.toLowerCase().includes(q));
});

const filteredLessons = computed(() => {
  const q = lessonSearch.value.trim().toLowerCase();
  if (!q) return journal.value.lessons;
  return journal.value.lessons.filter(
    l => l.topic.toLowerCase().includes(q) ||
         l.lessonNumber.toString().includes(q) ||
         l.date.includes(q)
  );
});

// Student Actions
function handleAddStudent() {
  if (!newStudentName.value.trim()) return;
  addStudent(newStudentName.value);
  newStudentName.value = '';
}

function startEditStudent(id: string, name: string) {
  editingStudentId.value = id;
  editingStudentName.value = name;
}

function saveEditStudent(id: string) {
  if (editingStudentName.value.trim()) {
    updateStudent(id, editingStudentName.value);
  }
  editingStudentId.value = null;
}

function handleDeleteStudent(id: string, name: string) {
  if (confirm(`Ви дійсно бажаєте видалити учня "${name}"? Усі виставлені оцінки учня буде видалено.`)) {
    removeStudent(id);
  }
}

// Lesson Actions
function handleAddLesson() {
  if (!newLessonTopic.value.trim()) return;
  const nextNum = newLessonNumber.value || (journal.value.lessons.length > 0
    ? Math.max(...journal.value.lessons.map(l => l.lessonNumber)) + 1
    : 1);
  const date = newLessonDate.value.trim() || new Date().toLocaleDateString('uk-UA');
  
  addLesson(date, newLessonTopic.value, nextNum);
  newLessonTopic.value = '';
  newLessonDate.value = '';
  newLessonNumber.value = null;
}

function startEditLesson(lesson: { id: string; lessonNumber: number; date: string; topic: string }) {
  editingLessonId.value = lesson.id;
  editingLessonNumber.value = lesson.lessonNumber;
  editingLessonDate.value = lesson.date;
  editingLessonTopic.value = lesson.topic;
}

function saveEditLesson(id: string) {
  if (editingLessonTopic.value.trim()) {
    updateLesson(id, {
      lessonNumber: editingLessonNumber.value,
      date: editingLessonDate.value,
      topic: editingLessonTopic.value
    });
  }
  editingLessonId.value = null;
}

function handleDeleteLesson(id: string, lessonNumber: number) {
  if (confirm(`Видалити урок №${lessonNumber}? Оцінки для цієї колонки будуть видалені.`)) {
    removeLesson(id);
  }
}

function handleReset() {
  if (confirm('Скинути журнал до вихідного стану (78 спарсених уроків з підручника Вашуленка та 7 учнів)? Усі поточні зміни буде перезаписано.')) {
    resetToDefaults();
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
    @click.self="onClose"
  >
    <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
      
      <!-- Modal Header -->
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <SettingsIcon class="w-4 h-4" />
          </div>
          <h2 class="text-base sm:text-lg font-bold text-slate-900">
            Налаштування журналу
          </h2>
        </div>

        <button
          @click="onClose"
          class="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Tabs Navigation -->
      <div class="px-6 bg-white border-b border-slate-200 flex gap-1 shrink-0">
        <button
          @click="activeTab = 'students'"
          class="px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer"
          :class="activeTab === 'students' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'"
        >
          <Users class="w-4 h-4" />
          <span>Список учнів ({{ journal.students.length }})</span>
        </button>

        <button
          @click="activeTab = 'lessons'"
          class="px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer"
          :class="activeTab === 'lessons' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'"
        >
          <Calendar class="w-4 h-4" />
          <span>Календарне планування / Уроки ({{ journal.lessons.length }})</span>
        </button>

        <button
          @click="activeTab = 'general'"
          class="px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer"
          :class="activeTab === 'general' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'"
        >
          <Info class="w-4 h-4" />
          <span>Загальні параметри</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        
        <!-- ================= TAB: STUDENTS ================= -->
        <div v-if="activeTab === 'students'" class="space-y-6">
          
          <!-- Add Student Form -->
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Додати нового учня
            </h3>
            <form @submit.prevent="handleAddStudent" class="flex flex-col sm:flex-row gap-2">
              <input
                v-model="newStudentName"
                type="text"
                placeholder="Прізвище та ім'я учня (наприклад: Шевченко Тарас)"
                class="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <button
                type="submit"
                class="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus class="w-4 h-4" />
                <span>Додати</span>
              </button>
            </form>
          </div>

          <!-- Students List Header & Search -->
          <div class="flex items-center justify-between gap-3">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Список учнів у журналі
            </span>
            <input
              v-model="studentSearch"
              type="text"
              placeholder="Пошук учня..."
              class="w-48 sm:w-64 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <!-- Students List Table -->
          <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            <div
              v-for="(student, index) in filteredStudents"
              :key="student.id"
              class="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <span class="w-6 text-center text-xs font-semibold text-slate-400">
                  {{ index + 1 }}
                </span>

                <!-- Editing mode -->
                <div v-if="editingStudentId === student.id" class="flex items-center gap-2 flex-1">
                  <input
                    v-model="editingStudentName"
                    type="text"
                    class="flex-1 px-3 py-1 text-sm bg-white border border-indigo-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    @keyup.enter="saveEditStudent(student.id)"
                  />
                  <button
                    @click="saveEditStudent(student.id)"
                    class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    title="Зберегти"
                  >
                    <Check class="w-4 h-4" />
                  </button>
                  <button
                    @click="editingStudentId = null"
                    class="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
                    title="Скасувати"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>

                <!-- Display mode -->
                <div v-else class="flex items-center gap-2 flex-1 min-w-0">
                  <span class="text-sm font-semibold text-slate-800 truncate">
                    {{ student.name }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div v-if="editingStudentId !== student.id" class="flex items-center gap-1 shrink-0">
                <button
                  @click="startEditStudent(student.id, student.name)"
                  class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Редагувати ім'я"
                >
                  <Edit2 class="w-4 h-4" />
                </button>
                <button
                  @click="handleDeleteStudent(student.id, student.name)"
                  class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Видалити учня"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div v-if="filteredStudents.length === 0" class="p-8 text-center text-sm text-slate-400">
              Учнів не знайдено.
            </div>
          </div>
        </div>

        <!-- ================= TAB: LESSONS ================= -->
        <div v-if="activeTab === 'lessons'" class="space-y-6">
          
          <!-- Add Lesson Form -->
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Додати урок до планування
            </h3>
            <form @submit.prevent="handleAddLesson" class="space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div>
                  <label class="block text-[11px] font-semibold text-slate-500 mb-1">№ уроку</label>
                  <input
                    v-model.number="newLessonNumber"
                    type="number"
                    min="1"
                    :placeholder="String(journal.lessons.length + 1)"
                    class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-slate-500 mb-1">Дата</label>
                  <input
                    v-model="newLessonDate"
                    type="text"
                    placeholder="ДД.ММ.РРРР"
                    class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-[11px] font-semibold text-slate-500 mb-1">Тема уроку</label>
                  <input
                    v-model="newLessonTopic"
                    type="text"
                    placeholder="Наприклад: Читання. Звук [а], буква А..."
                    class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
              
              <div class="flex justify-end">
                <button
                  type="submit"
                  class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus class="w-4 h-4" />
                  <span>Додати урок</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Lessons Search & Count -->
          <div class="flex items-center justify-between gap-3">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Перелік уроків ({{ filteredLessons.length }} із {{ journal.lessons.length }})
            </span>
            <input
              v-model="lessonSearch"
              type="text"
              placeholder="Пошук за темою, датою..."
              class="w-48 sm:w-64 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <!-- Lessons List -->
          <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100 max-h-96 overflow-y-auto">
            <div
              v-for="lesson in filteredLessons"
              :key="lesson.id"
              class="p-3 flex items-start justify-between gap-3 hover:bg-slate-50/70 transition-colors"
            >
              <!-- Editing Lesson -->
              <div v-if="editingLessonId === lesson.id" class="flex-1 space-y-2">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label class="block text-[10px] text-slate-500">№ уроку</label>
                    <input
                      v-model.number="editingLessonNumber"
                      type="number"
                      class="w-full px-2 py-1 text-xs bg-white border rounded"
                    />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-500">Дата</label>
                    <input
                      v-model="editingLessonDate"
                      type="text"
                      class="w-full px-2 py-1 text-xs bg-white border rounded"
                    />
                  </div>
                  <div class="sm:col-span-3">
                    <label class="block text-[10px] text-slate-500">Тема</label>
                    <input
                      v-model="editingLessonTopic"
                      type="text"
                      class="w-full px-2 py-1 text-xs bg-white border rounded"
                    />
                  </div>
                </div>
                <div class="flex justify-end gap-2 pt-1">
                  <button
                    @click="editingLessonId = null"
                    class="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded"
                  >
                    Скасувати
                  </button>
                  <button
                    @click="saveEditLesson(lesson.id)"
                    class="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded"
                  >
                    Зберегти
                  </button>
                </div>
              </div>

              <!-- Display Lesson -->
              <div v-else class="flex items-start gap-3 flex-1 min-w-0">
                <span class="inline-flex items-center justify-center min-w-8 px-1.5 py-0.5 text-xs font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 shrink-0">
                  №{{ lesson.lessonNumber }}
                </span>
                <span class="text-xs text-slate-400 font-medium shrink-0 pt-0.5">
                  {{ lesson.date }}
                </span>
                <p class="text-xs text-slate-700 font-medium leading-relaxed">
                  {{ lesson.topic }}
                </p>
              </div>

              <!-- Lesson Actions -->
              <div v-if="editingLessonId !== lesson.id" class="flex items-center gap-1 shrink-0 ml-2">
                <button
                  @click="startEditLesson(lesson)"
                  class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Редагувати урок"
                >
                  <Edit2 class="w-4 h-4" />
                </button>
                <button
                  @click="handleDeleteLesson(lesson.id, lesson.lessonNumber)"
                  class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Видалити урок"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div v-if="filteredLessons.length === 0" class="p-8 text-center text-sm text-slate-400">
              Уроків не знайдено.
            </div>
          </div>
        </div>

        <!-- ================= TAB: GENERAL ================= -->
        <div v-if="activeTab === 'general'" class="space-y-6">
          <!-- Subject Name -->
          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Назва навчального предмета / курсу
            </h3>
            <input
              v-model="journal.subject"
              type="text"
              class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            <p class="text-xs text-slate-500">
              Відображається в заголовку журналу та при експорті звіту в JSON.
            </p>
          </div>

          <!-- Reset Section -->
          <div class="bg-rose-50/70 border border-rose-200 p-5 rounded-xl space-y-3">
            <h3 class="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-2">
              <RotateCcw class="w-4 h-4 text-rose-600" />
              <span>Скидання даних до початкових</span>
            </h3>
            <p class="text-xs text-rose-700 leading-relaxed">
              Це перезапише всі оцінки, список учнів та уроків початковим спарсеним календарним плануванням підручника «Українська мова. Буквар» (М. Вашуленко, EDUC.com.ua).
            </p>
            <button
              @click="handleReset"
              class="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-700 bg-white border border-rose-300 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Відновити вихідні дані</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
        <button
          @click="onClose"
          class="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Готово
        </button>
      </div>

    </div>
  </div>
</template>
