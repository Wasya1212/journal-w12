<script setup lang="ts">
import { ref } from 'vue';
import type { Student, Lesson } from './types/journal';
import HeaderBar from './components/HeaderBar.vue';
import JournalTable from './components/JournalTable.vue';
import GradeEditorModal from './components/GradeEditorModal.vue';
import SettingsModal from './components/SettingsModal.vue';
import MobileMenuDrawer from './components/MobileMenuDrawer.vue';
import ToastNotification from './components/ToastNotification.vue';

// Modal states
const isSettingsOpen = ref(false);
const isMobileMenuOpen = ref(false);

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
  <div class="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
    <!-- Header (Visible only on Desktop / Tablet md+) -->
    <HeaderBar :onOpenSettings="() => isSettingsOpen = true" />

    <!-- Main Content: Journal Table (Fills full screen on mobile) -->
    <main class="flex-1 min-h-0 overflow-hidden flex flex-col">
      <JournalTable
        :onSelectCell="handleSelectCell"
        :onOpenMobileMenu="() => isMobileMenuOpen = true"
      />
    </main>

    <!-- Mobile Drawer for Header items (Burger menu) -->
    <MobileMenuDrawer
      :isOpen="isMobileMenuOpen"
      :onClose="() => isMobileMenuOpen = false"
      :onOpenSettings="() => isSettingsOpen = true"
    />

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
