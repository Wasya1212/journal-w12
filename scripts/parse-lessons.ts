import fs from 'fs';
import path from 'path';
import { INITIAL_LESSONS_PLAN, CURRICULUM_TITLE } from '../src/data/curriculum';

/**
 * Helper script to generate and verify initialLessons.json
 * Source: EDUC.com.ua / Scribd "Календарне планування. Українська мова. Буквар 1 клас" (М. Вашуленко, О. Вашуленко)
 */

export function saveLessonsToFile() {
  const targetDir = path.resolve(process.cwd(), 'src/data');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const targetPath = path.join(targetDir, 'initialLessons.json');
  fs.writeFileSync(targetPath, JSON.stringify(INITIAL_LESSONS_PLAN, null, 2), 'utf-8');
  console.log(`Saved ${INITIAL_LESSONS_PLAN.length} lessons for "${CURRICULUM_TITLE}" to ${targetPath}`);
}

saveLessonsToFile();
