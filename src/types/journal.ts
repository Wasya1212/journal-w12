export interface Student {
  id: string;
  name: string;
}

export interface Lesson {
  id: string;
  lessonNumber: number;
  date: string;
  topic: string;
}

export interface Grade {
  studentId: string;
  lessonId: string;
  value: string;
  comment?: string;
}

export interface JournalData {
  subject: string;
  students: Student[];
  lessons: Lesson[];
  grades: Grade[];
}
