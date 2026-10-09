import { ref, watch } from 'vue';
import type { JournalData, Student, Lesson, Grade } from '../types/journal';
import { INITIAL_LESSONS_PLAN, CURRICULUM_TITLE } from '../data/curriculum';
import { exportJournalToExcel } from '../utils/exportExcel';

const STORAGE_KEY = 'teacher_journal_storage_v1';

export const defaultStudents: Student[] = [
  { id: 's-1', name: 'Бойко Анна' },
  { id: 's-2', name: 'Коваленко Максим' },
  { id: 's-3', name: 'Кравченко Олександр' },
  { id: 's-4', name: 'Мельник Софія' },
  { id: 's-5', name: 'Олійник Вікторія' },
  { id: 's-6', name: 'Ткаченко Дарія' },
  { id: 's-7', name: 'Шевченко Денис' }
];

// Sample default grades for demonstration
export const defaultGrades: Grade[] = [
  { studentId: 's-1', lessonId: 'l-1', value: 'В', comment: 'Активна робота з Букварем' },
  { studentId: 's-1', lessonId: 'l-2', value: '11' },
  { studentId: 's-1', lessonId: 'l-3', value: 'В' },
  { studentId: 's-2', lessonId: 'l-1', value: 'Д' },
  { studentId: 's-2', lessonId: 'l-2', value: 'н', comment: 'Хворів' },
  { studentId: 's-2', lessonId: 'l-3', value: 'Д' },
  { studentId: 's-3', lessonId: 'l-1', value: 'В' },
  { studentId: 's-3', lessonId: 'l-2', value: '10' },
  { studentId: 's-4', lessonId: 'l-1', value: 'В' },
  { studentId: 's-4', lessonId: 'l-2', value: '12', comment: 'Відмінне каліграфічне письмо' },
  { studentId: 's-5', lessonId: 'l-1', value: 'Д' },
  { studentId: 's-5', lessonId: 'l-2', value: '9' },
  { studentId: 's-6', lessonId: 'l-1', value: 'В' },
  { studentId: 's-6', lessonId: 'l-2', value: '11' },
  { studentId: 's-7', lessonId: 'l-1', value: 'н', comment: 'Поважна причина' },
  { studentId: 's-7', lessonId: 'l-2', value: '10' },
];

export function getDefaultJournal(): JournalData {
  return {
    subject: CURRICULUM_TITLE,
    students: JSON.parse(JSON.stringify(defaultStudents)),
    lessons: JSON.parse(JSON.stringify(INITIAL_LESSONS_PLAN)),
    grades: JSON.parse(JSON.stringify(defaultGrades))
  };
}

// Global singleton state so all components share the exact same reactive instance
const journal = ref<JournalData>(loadInitialData());
const lastSaved = ref<Date>(new Date());
const toastMessage = ref<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

let toastTimer: any = null;
export function showToast(text: string, type: 'success' | 'error' | 'info' = 'success', duration = 3000) {
  if (toastTimer) clearTimeout(toastTimer);
  toastMessage.value = { type, text };
  toastTimer = setTimeout(() => {
    toastMessage.value = null;
  }, duration);
}

function loadInitialData(): JournalData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidJournalData(parsed)) {
        // Automatically extend with new curriculum lessons if previous local session had fewer
        if (parsed.lessons.length < INITIAL_LESSONS_PLAN.length) {
          const existingNumbers = new Set(parsed.lessons.map((l: any) => l.lessonNumber));
          let added = 0;
          for (const item of INITIAL_LESSONS_PLAN) {
            if (!existingNumbers.has(item.lessonNumber)) {
              parsed.lessons.push({ ...item });
              added++;
            }
          }
          if (added > 0) {
            parsed.lessons.sort((a: any, b: any) => a.lessonNumber - b.lessonNumber);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          }
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load journal from localStorage:', e);
  }
  return getDefaultJournal();
}

export function isValidJournalData(obj: any): obj is JournalData {
  if (!obj || typeof obj !== 'object') return false;
  if (typeof obj.subject !== 'string') return false;
  if (!Array.isArray(obj.students)) return false;
  if (!Array.isArray(obj.lessons)) return false;
  if (!Array.isArray(obj.grades)) return false;

  const validStudents = obj.students.every((s: any) => s && typeof s.id === 'string' && typeof s.name === 'string');
  const validLessons = obj.lessons.every((l: any) => l && typeof l.id === 'string' && typeof l.lessonNumber === 'number' && typeof l.date === 'string' && typeof l.topic === 'string');
  const validGrades = obj.grades.every((g: any) => g && typeof g.studentId === 'string' && typeof g.lessonId === 'string' && typeof g.value === 'string');

  return validStudents && validLessons && validGrades;
}

// Auto-sync to localStorage
watch(
  journal,
  (newData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      lastSaved.value = new Date();
    } catch (e) {
      console.error('Failed to save journal to localStorage:', e);
      showToast('Помилка збереження в LocalStorage', 'error');
    }
  },
  { deep: true }
);

export function useJournal() {
  function getGrade(studentId: string, lessonId: string): Grade | undefined {
    return journal.value.grades.find(g => g.studentId === studentId && g.lessonId === lessonId);
  }

  function setGrade(studentId: string, lessonId: string, value: string, comment?: string) {
    const trimmed = value.trim();
    const existingIndex = journal.value.grades.findIndex(g => g.studentId === studentId && g.lessonId === lessonId);

    if (!trimmed) {
      if (existingIndex !== -1) {
        journal.value.grades.splice(existingIndex, 1);
      }
      return;
    }

    if (existingIndex !== -1) {
      journal.value.grades[existingIndex].value = trimmed;
      if (comment !== undefined) {
        journal.value.grades[existingIndex].comment = comment.trim() || undefined;
      }
    } else {
      journal.value.grades.push({
        studentId,
        lessonId,
        value: trimmed,
        comment: comment?.trim() || undefined
      });
    }
  }

  function addStudent(name: string): Student {
    const trimmed = name.trim();
    const newStudent: Student = {
      id: 's-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: trimmed
    };
    journal.value.students.push(newStudent);
    // Sort students by Ukrainian alphabetical order
    journal.value.students.sort((a, b) => a.name.localeCompare(b.name, 'uk'));
    showToast(`Учня "${newStudent.name}" додано`);
    return newStudent;
  }

  function updateStudent(id: string, name: string) {
    const student = journal.value.students.find(s => s.id === id);
    if (student) {
      student.name = name.trim();
      journal.value.students.sort((a, b) => a.name.localeCompare(b.name, 'uk'));
      showToast('Дані учня оновлено');
    }
  }

  function removeStudent(id: string) {
    const index = journal.value.students.findIndex(s => s.id === id);
    if (index !== -1) {
      const removed = journal.value.students.splice(index, 1)[0];
      // remove associated grades
      journal.value.grades = journal.value.grades.filter(g => g.studentId !== id);
      showToast(`Учня "${removed.name}" видалено`);
    }
  }

  function addLesson(date: string, topic: string, customNumber?: number): Lesson {
    const maxNum = journal.value.lessons.reduce((max, l) => Math.max(max, l.lessonNumber), 0);
    const newNum = customNumber || (maxNum + 1);
    const newLesson: Lesson = {
      id: 'l-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      lessonNumber: newNum,
      date: date.trim() || new Date().toLocaleDateString('uk-UA'),
      topic: topic.trim()
    };
    journal.value.lessons.push(newLesson);
    journal.value.lessons.sort((a, b) => a.lessonNumber - b.lessonNumber);
    showToast(`Урок №${newLesson.lessonNumber} додано`);
    return newLesson;
  }

  function updateLesson(id: string, updates: Partial<Omit<Lesson, 'id'>>) {
    const lesson = journal.value.lessons.find(l => l.id === id);
    if (lesson) {
      if (updates.lessonNumber !== undefined) lesson.lessonNumber = updates.lessonNumber;
      if (updates.date !== undefined) lesson.date = updates.date.trim();
      if (updates.topic !== undefined) lesson.topic = updates.topic.trim();
      journal.value.lessons.sort((a, b) => a.lessonNumber - b.lessonNumber);
      showToast('Дані уроку оновлено');
    }
  }

  function removeLesson(id: string) {
    const index = journal.value.lessons.findIndex(l => l.id === id);
    if (index !== -1) {
      const removed = journal.value.lessons.splice(index, 1)[0];
      journal.value.grades = journal.value.grades.filter(g => g.lessonId !== id);
      showToast(`Урок №${removed.lessonNumber} видалено`);
    }
  }

  function formatTimestampForFilename(d = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  }

  function exportToJson(): string {
    const timestamp = formatTimestampForFilename();
    const fileName = `journal_${timestamp}.json`;
    const dataStr = JSON.stringify(journal.value, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Журнал експортовано у файл ${fileName}`);
    return dataStr;
  }

  async function exportToExcel(): Promise<string | null> {
    try {
      const fileName = await exportJournalToExcel(journal.value);
      showToast(`Журнал експортовано у файл ${fileName}`);
      return fileName;
    } catch (err: any) {
      console.error('Excel export error:', err);
      showToast(`Помилка експорту в Excel: ${err?.message || 'Невідома помилка'}`, 'error');
      return null;
    }
  }

  async function importFromJson(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!isValidJournalData(parsed)) {
        throw new Error('Файл не відповідає схемі даних журналу (потрібні subject, students, lessons, grades)');
      }

      // Replace state in memory
      journal.value = parsed;
      // localStorage will update automatically via watcher
      showToast(`Успішно імпортовано: ${parsed.students.length} учнів, ${parsed.lessons.length} уроків`);
      return true;
    } catch (err: any) {
      console.error('Import error:', err);
      showToast(`Помилка імпорту: ${err?.message || 'Некоректний JSON'}`, 'error', 5000);
      return false;
    }
  }

  function resetToDefaults() {
    journal.value = getDefaultJournal();
    showToast('Журнал відновлено до дефолтного календарного планування');
  }

  return {
    journal,
    lastSaved,
    toastMessage,
    getGrade,
    setGrade,
    addStudent,
    updateStudent,
    removeStudent,
    addLesson,
    updateLesson,
    removeLesson,
    exportToJson,
    exportToExcel,
    importFromJson,
    resetToDefaults,
    showToast
  };
}
