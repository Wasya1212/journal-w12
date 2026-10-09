import ExcelJS from 'exceljs';
import type { JournalData } from '../types/journal';

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

export async function exportJournalToExcel(journal: JournalData): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Електронний журнал учителя';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Журнал', {
    views: [
      {
        state: 'frozen',
        xSplit: 2, // Freeze columns A and B (№ and Student Name)
        ySplit: 5  // Freeze header rows
      }
    ],
    properties: {
      defaultRowHeight: 22
    }
  });

  // Color Palette
  const colors = {
    headerBg: '4F46E5',       // Primary indigo
    headerText: 'FFFFFF',
    dateBg: 'EEF2FF',         // Soft indigo
    dateText: '3730A3',
    topicBg: 'F8FAFC',        // Slate 50
    topicText: '334155',
    studentRowEven: 'FFFFFF',
    studentRowOdd: 'F8FAFC',
    border: 'CBD5E1',
    // Grades
    absenceBg: 'FFE4E6',      // Rose 100
    absenceText: '9F1239',    // Rose 800
    highBg: 'ECFDF5',         // Emerald 100
    highText: '065F46',       // Emerald 800
    sufficientBg: 'E0F2FE',   // Sky 100
    sufficientText: '075985', // Sky 800
    mediumBg: 'FEF3C7',       // Amber 100
    mediumText: '92400E',     // Amber 800
    initialBg: 'FFEDD5',      // Orange 100
    initialText: '9A3412',    // Orange 800
  };

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: colors.border } },
    left: { style: 'thin', color: { argb: colors.border } },
    bottom: { style: 'thin', color: { argb: colors.border } },
    right: { style: 'thin', color: { argb: colors.border } }
  };

  // --- Title Block ---
  sheet.mergeCells('A1', 'H1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'ЕЛЕКТРОННИЙ ЖУРНАЛ УЧИТЕЛЯ (1 КЛАС • НУШ)';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: '1E1B4B' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet.getRow(1).height = 28;

  sheet.mergeCells('A2', 'H2');
  const subjectCell = sheet.getCell('A2');
  subjectCell.value = `Навчальний предмет: ${journal.subject}`;
  subjectCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '4338CA' } };
  subjectCell.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet.getRow(2).height = 20;

  const now = new Date();
  const dateStr = now.toLocaleDateString('uk-UA') + ' ' + now.toLocaleTimeString('uk-UA');
  sheet.mergeCells('A3', 'H3');
  const metaCell = sheet.getCell('A3');
  metaCell.value = `Дата експорту: ${dateStr} | Учнів: ${journal.students.length} | Уроків: ${journal.lessons.length} | Оцінок: ${journal.grades.length}`;
  metaCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: '64748B' } };
  metaCell.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet.getRow(3).height = 18;

  // Empty row 4
  sheet.getRow(4).height = 10;

  // --- Header Rows (Row 5: Lesson Number, Row 6: Date, Row 7: Topic) ---
  sheet.getRow(5).height = 26;

  // Col A: #
  const hNum = sheet.getCell('A5');
  hNum.value = '№';
  hNum.font = { name: 'Calibri', size: 10, bold: true, color: { argb: colors.headerText } };
  hNum.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } };
  hNum.alignment = { vertical: 'middle', horizontal: 'center' };
  hNum.border = thinBorder;

  // Col B: Student Name
  const hName = sheet.getCell('B5');
  hName.value = "Прізвище та ім'я учня";
  hName.font = { name: 'Calibri', size: 10, bold: true, color: { argb: colors.headerText } };
  hName.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } };
  hName.alignment = { vertical: 'middle', horizontal: 'left' };
  hName.border = thinBorder;

  // Lesson Headers
  journal.lessons.forEach((lesson, idx) => {
    const colIndex = idx + 3; // 1-based, starting after A, B
    const cell = sheet.getRow(5).getCell(colIndex);
    cell.value = `№${lesson.lessonNumber}`;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: colors.headerText } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = thinBorder;
  });

  // Summary headers
  const totalLessonsCol = journal.lessons.length + 3;
  const hGrades = sheet.getRow(5).getCell(totalLessonsCol);
  hGrades.value = 'Оцінок';
  hGrades.font = { name: 'Calibri', size: 10, bold: true, color: { argb: colors.headerText } };
  hGrades.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } };
  hGrades.alignment = { vertical: 'middle', horizontal: 'center' };
  hGrades.border = thinBorder;

  const hAbsences = sheet.getRow(5).getCell(totalLessonsCol + 1);
  hAbsences.value = 'Пропусків';
  hAbsences.font = { name: 'Calibri', size: 10, bold: true, color: { argb: colors.headerText } };
  hAbsences.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EF4444' } };
  hAbsences.alignment = { vertical: 'middle', horizontal: 'center' };
  hAbsences.border = thinBorder;

  // Row 6: Dates
  sheet.getRow(6).height = 20;
  const dNum = sheet.getCell('A6');
  dNum.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.dateBg } };
  dNum.border = thinBorder;

  const dName = sheet.getCell('B6');
  dName.value = 'Дата уроку:';
  dName.font = { name: 'Calibri', size: 9, italic: true, color: { argb: colors.dateText } };
  dName.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.dateBg } };
  dName.alignment = { vertical: 'middle', horizontal: 'right' };
  dName.border = thinBorder;

  journal.lessons.forEach((lesson, idx) => {
    const colIndex = idx + 3;
    const cell = sheet.getRow(6).getCell(colIndex);
    cell.value = lesson.date;
    cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: colors.dateText } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.dateBg } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = thinBorder;
  });

  const dGrades = sheet.getRow(6).getCell(totalLessonsCol);
  dGrades.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.dateBg } };
  dGrades.border = thinBorder;

  const dAbsences = sheet.getRow(6).getCell(totalLessonsCol + 1);
  dAbsences.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.dateBg } };
  dAbsences.border = thinBorder;

  // --- Student Rows ---
  let currentRowIndex = 7;
  journal.students.forEach((student, sIdx) => {
    const row = sheet.getRow(currentRowIndex);
    row.height = 22;
    const isOdd = sIdx % 2 === 1;
    const rowBg = isOdd ? colors.studentRowOdd : colors.studentRowEven;

    // Col A: index
    const cNum = row.getCell(1);
    cNum.value = sIdx + 1;
    cNum.font = { name: 'Calibri', size: 10, color: { argb: '64748B' } };
    cNum.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
    cNum.alignment = { vertical: 'middle', horizontal: 'center' };
    cNum.border = thinBorder;

    // Col B: name
    const cName = row.getCell(2);
    cName.value = student.name;
    cName.font = { name: 'Calibri', size: 10, bold: true, color: { argb: '0F172A' } };
    cName.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
    cName.alignment = { vertical: 'middle', horizontal: 'left' };
    cName.border = thinBorder;

    // Grade values
    let totalGrades = 0;
    let totalAbsences = 0;

    journal.lessons.forEach((lesson, lIdx) => {
      const colIndex = lIdx + 3;
      const cell = row.getCell(colIndex);
      const grade = journal.grades.find(g => g.studentId === student.id && g.lessonId === lesson.id);

      cell.border = thinBorder;

      if (grade && grade.value) {
        const val = grade.value.trim();
        cell.value = val;
        cell.alignment = { vertical: 'middle', horizontal: 'center' };

        if (grade.comment) {
          cell.note = `Коментар: ${grade.comment}`;
        }

        const upper = val.toUpperCase();
        if (upper === 'Н' || upper === 'N' || upper === 'ХВ') {
          totalAbsences++;
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: colors.absenceText } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.absenceBg } };
        } else {
          totalGrades++;
          if (upper === 'В' || ['12', '11', '10'].includes(upper)) {
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: colors.highText } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.highBg } };
          } else if (upper === 'Д' || ['9', '8', '7'].includes(upper)) {
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: colors.sufficientText } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.sufficientBg } };
          } else if (upper === 'С' || ['6', '5', '4'].includes(upper)) {
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: colors.mediumText } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.mediumBg } };
          } else if (upper === 'П' || ['3', '2', '1'].includes(upper)) {
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: colors.initialText } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.initialBg } };
          } else {
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: '334155' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
          }
        }
      } else {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      }
    });

    // Summary cells
    const cellGrades = row.getCell(totalLessonsCol);
    cellGrades.value = totalGrades;
    cellGrades.font = { name: 'Calibri', size: 10, bold: true, color: { argb: '2563EB' } };
    cellGrades.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
    cellGrades.alignment = { vertical: 'middle', horizontal: 'center' };
    cellGrades.border = thinBorder;

    const cellAbsences = row.getCell(totalLessonsCol + 1);
    cellAbsences.value = totalAbsences;
    cellAbsences.font = { name: 'Calibri', size: 10, bold: true, color: { argb: totalAbsences > 0 ? 'DC2626' : '94A3B8' } };
    cellAbsences.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
    cellAbsences.alignment = { vertical: 'middle', horizontal: 'center' };
    cellAbsences.border = thinBorder;

    currentRowIndex++;
  });

  // Set Column Widths
  sheet.getColumn(1).width = 6;   // #
  sheet.getColumn(2).width = 28;  // Student name
  for (let c = 3; c <= journal.lessons.length + 2; c++) {
    sheet.getColumn(c).width = 11;
  }
  sheet.getColumn(totalLessonsCol).width = 12;
  sheet.getColumn(totalLessonsCol + 1).width = 13;

  // --- Worksheet 2: Календарне планування (Full Topics List) ---
  const topicsSheet = workbook.addWorksheet('Календарне планування', {
    properties: { defaultRowHeight: 22 }
  });

  topicsSheet.columns = [
    { header: '№ уроку', key: 'number', width: 10 },
    { header: 'Дата', key: 'date', width: 14 },
    { header: 'Тема уроку', key: 'topic', width: 85 }
  ];

  // Header styling for topics sheet
  topicsSheet.getRow(1).height = 26;
  ['A1', 'B1', 'C1'].forEach(cellRef => {
    const c = topicsSheet.getCell(cellRef);
    c.font = { name: 'Calibri', size: 10, bold: true, color: { argb: colors.headerText } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } };
    c.alignment = { vertical: 'middle', horizontal: cellRef === 'C1' ? 'left' : 'center' };
    c.border = thinBorder;
  });

  journal.lessons.forEach((l, idx) => {
    const row = topicsSheet.addRow({
      number: l.lessonNumber,
      date: l.date,
      topic: l.topic
    });
    row.height = 20;
    const isOdd = idx % 2 === 1;
    const bg = isOdd ? colors.studentRowOdd : colors.studentRowEven;

    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(1).font = { name: 'Calibri', size: 10, bold: true, color: { argb: '4338CA' } };
    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    row.getCell(1).border = thinBorder;

    row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(2).font = { name: 'Calibri', size: 10, color: { argb: '64748B' } };
    row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    row.getCell(2).border = thinBorder;

    row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
    row.getCell(3).font = { name: 'Calibri', size: 10, color: { argb: '0F172A' } };
    row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    row.getCell(3).border = thinBorder;
  });

  // Write and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const timestamp = formatTimestampForFilename();
  const fileName = `journal_${timestamp}.xlsx`;

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return fileName;
}
