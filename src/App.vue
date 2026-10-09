<script setup lang="ts">
import { ref } from 'vue';
import type { Student, Lesson } from './types/journal';
import HeaderBar from './components/HeaderBar.vue';
import JournalTable from './components/JournalTable.vue';
import GradeEditorModal from './components/GradeEditorModal.vue';
import SettingsModal from './components/SettingsModal.vue';
import ToastNotification from './components/ToastNotification.vue';

// Modal states
const isSettingsOpen = ref(false);

const isGradeEditorOpen = ref(false);
const activeStudent = ref<Student | null>(null);
const activeLesson = ref<Lesson | null>(null);

function handleSelectCell(student: Student, lesson: Lesson) {
  activeStudent.value = student;
  activeLesson.value = lesson;
  isGradeEditorOpen.value = true;
}

function handleCloseGradeEditor() {
  isGradeEditorOpen.value = false;
  activeStudent.value = null;
  activeLesson.value = null;
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
    <!-- Header -->
    <HeaderBar :onOpenSettings="() => isSettingsOpen = true" />

    <!-- Main Content: Journal Table -->
    <main class="flex-1 overflow-hidden">
      <JournalTable :onSelectCell="handleSelectCell" />
    </main>

    <!-- Modals -->
    <GradeEditorModal
      :isOpen="isGradeEditorOpen"
      :student="activeStudent"
      :lesson="activeLesson"
      :onClose="handleCloseGradeEditor"
    />

    <SettingsModal
      :isOpen="isSettingsOpen"
      :onClose="() => isSettingsOpen = false"
    />

    <!-- Global Floating Toasts -->
    <ToastNotification />
  </div>
</template>
