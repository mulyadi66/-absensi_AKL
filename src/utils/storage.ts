import * as XLSX from 'xlsx';
import {
  ClassRoom,
  Student,
  AttendanceRecord,
  SchoolProfile,
  AttendanceStatus,
} from '../types';
import {
  initialClasses,
  initialStudents,
  initialSchoolProfile,
  generateInitialAttendance,
} from '../data/initialData';

const STORAGE_KEYS = {
  CLASSES: 'presensi_classes_v1',
  STUDENTS: 'presensi_students_v1',
  ATTENDANCE: 'presensi_attendance_v1',
  PROFILE: 'presensi_profile_v1',
};

export interface AppStateData {
  classes: ClassRoom[];
  students: Student[];
  attendance: AttendanceRecord[];
  profile: SchoolProfile;
}

export function loadAppState(): AppStateData {
  try {
    const rawClasses = localStorage.getItem(STORAGE_KEYS.CLASSES);
    const rawStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const rawAttendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    const rawProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);

    const classes: ClassRoom[] = rawClasses ? JSON.parse(rawClasses) : initialClasses;
    const students: Student[] = rawStudents ? JSON.parse(rawStudents) : initialStudents;
    const attendance: AttendanceRecord[] = rawAttendance
      ? JSON.parse(rawAttendance)
      : generateInitialAttendance();
    const profile: SchoolProfile = rawProfile
      ? JSON.parse(rawProfile)
      : initialSchoolProfile;

    return { classes, students, attendance, profile };
  } catch (error) {
    console.error('Failed to parse state from localStorage, falling back to initial data', error);
    return {
      classes: initialClasses,
      students: initialStudents,
      attendance: generateInitialAttendance(),
      profile: initialSchoolProfile,
    };
  }
}

export function saveAppState(data: AppStateData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(data.classes));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data.attendance));
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
  } catch (error) {
    console.error('Failed to save state to localStorage', error);
  }
}

export function resetToDemoData(): AppStateData {
  const freshData: AppStateData = {
    classes: initialClasses,
    students: initialStudents,
    attendance: generateInitialAttendance(),
    profile: initialSchoolProfile,
  };
  saveAppState(freshData);
  return freshData;
}

export function exportBackupJSON(data: AppStateData): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `backup_presensi_siswa_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function createWhatsAppUrl(
  studentName: string,
  parentPhone: string,
  schoolName: string,
  dateStr: string,
  status: AttendanceStatus,
  notes?: string
): string {
  // Clean phone number: replace leading 0 with 62
  let cleanPhone = parentPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.substring(1);
  }

  const statusLabel = {
    hadir: 'Hadir',
    sakit: 'Sakit',
    izin: 'Izin',
    alpa: 'Tidak Hadir (Alpa / Tanpa Keterangan)',
    terlambat: 'Terlambat Masuk Sekolah',
  }[status];

  const dateFormatted = new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const notesText = notes && notes.trim() !== '' ? `\nKeterangan: *${notes.trim()}*` : '';

  const message = `Yth. Bapak/Ibu Orang Tua / Wali Murid dari *${studentName}*,\n\nKami dari pihak *${schoolName}* menginformasikan bahwa pada:\nHari/Tanggal: *${dateFormatted}*\nStatus Kehadiran: *${statusLabel}*${notesText}\n\nMohon konfirmasi atau koordinasi dengan Wali Kelas apabila terdapat kekeliruan atau keperluan lebih lanjut.\n\nTerima kasih atas perhatian dan kerja samanya.\nWassalamu'alaikum Wr. Wb.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// Export Monthly Matrix to XLSX spreadsheet
export function exportMonthlyMatrixExcel(
  classroom: ClassRoom,
  students: Student[],
  attendance: AttendanceRecord[],
  year: number,
  monthIndex: number, // 0-11
  schoolProfile: SchoolProfile
): void {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const monthName = monthNames[monthIndex];
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Header rows
  const rows: any[][] = [];
  rows.push([schoolProfile.name]);
  rows.push([`REKAPITULASI KEHADIRAN SISWA BULANAN - ${monthName.toUpperCase()} ${year}`]);
  rows.push([`Kelas: ${classroom.name}`, `Tahun Ajaran: ${classroom.academicYear}`, `Wali Kelas: ${classroom.homeroomTeacher}`]);
  rows.push([]); // empty row

  // Table Column Headers
  const headerRow: string[] = ['No', 'NIS', 'Nama Siswa', 'L/P'];
  for (let d = 1; d <= daysInMonth; d++) {
    headerRow.push(String(d));
  }
  headerRow.push('H', 'S', 'I', 'A', 'T', '% Kehadiran');
  rows.push(headerRow);

  // Student rows
  students.forEach((student, idx) => {
    const studentRecords = attendance.filter(
      (a) => a.studentId === student.id && a.date.startsWith(`${year}-${String(monthIndex + 1).padStart(2, '0')}`)
    );

    let h = 0;
    let s = 0;
    let i = 0;
    let a = 0;
    let t = 0;

    const row: any[] = [
      idx + 1,
      student.nis,
      student.name,
      student.gender,
    ];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const rec = studentRecords.find((r) => r.date === dateStr);
      if (rec) {
        if (rec.status === 'hadir') {
          row.push('H');
          h++;
        } else if (rec.status === 'sakit') {
          row.push('S');
          s++;
        } else if (rec.status === 'izin') {
          row.push('I');
          i++;
        } else if (rec.status === 'alpa') {
          row.push('A');
          a++;
        } else if (rec.status === 'terlambat') {
          row.push('T');
          t++;
        }
      } else {
        // Check if Sunday
        const dObj = new Date(year, monthIndex, day);
        if (dObj.getDay() === 0) {
          row.push('-');
        } else {
          row.push('');
        }
      }
    }

    const totalRecorded = h + s + i + a + t;
    const rate = totalRecorded > 0 ? Math.round(((h + t) / totalRecorded) * 100) : 0;

    row.push(h, s, i, a, t, `${rate}%`);
    rows.push(row);
  });

  // Footer notes and signatures
  rows.push([]);
  rows.push(['Keterangan Kode: H = Hadir, S = Sakit, I = Izin, A = Alpa, T = Terlambat']);
  rows.push([]);
  rows.push(['Mengetahui,', '', '', '', `${schoolProfile.city}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`]);
  rows.push(['Kepala Sekolah', '', '', '', 'Wali Kelas']);
  rows.push([]);
  rows.push([]);
  rows.push([schoolProfile.headmaster, '', '', '', classroom.homeroomTeacher]);
  rows.push([`NIP. ${schoolProfile.headmasterNip}`, '', '', '', `NIP. ${classroom.homeroomTeacherNip}`]);

  // Create workbook
  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // Column widths
  worksheet['!cols'] = [
    { wch: 4 },  // No
    { wch: 10 }, // NIS
    { wch: 28 }, // Nama
    { wch: 4 },  // L/P
    ...Array(daysInMonth).fill({ wch: 3 }), // Days
    { wch: 4 },  // H
    { wch: 4 },  // S
    { wch: 4 },  // I
    { wch: 4 },  // A
    { wch: 4 },  // T
    { wch: 12 }, // %
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap ${classroom.name}`);
  const cleanClassName = classroom.name.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(workbook, `Rekap_Absensi_${cleanClassName}_${monthName}_${year}.xlsx`);
}

export type ParsedStudentRow = Omit<Student, 'id' | 'classId'>;

// Download template Excel for import (Only NIS, without NISN)
export function downloadStudentTemplateExcel(): void {
  const templateRows = [
    ['NIS', 'Nama Lengkap', 'Jenis Kelamin (L/P)', 'Nama Wali Murid', 'No. WhatsApp Wali'],
    ['24791', 'Budi Santoso', 'L', 'Santoso H.', '081234567891'],
    ['24792', 'Dewi Anggraini', 'P', 'Rudy Anggraini', '081234567892'],
    ['24793', 'Muhammad Rizky', 'L', 'Ahmad Fadli', '081234567893'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(templateRows);
  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 28 },
    { wch: 20 },
    { wch: 24 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Siswa');
  XLSX.writeFile(workbook, 'Template_Import_Siswa_Presensi.xlsx');
}

// Normalize gender
function normalizeGender(val: any): 'L' | 'P' {
  const str = String(val || '').trim().toUpperCase();
  if (str.startsWith('P') || str.includes('PEREMPUAN') || str.includes('WANITA')) {
    return 'P';
  }
  return 'L';
}

// Parse student records from Excel or CSV file (NIS only)
export async function parseStudentsFromFile(file: File): Promise<ParsedStudentRow[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to array of arrays
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (rawRows.length < 2) return [];

  // Find header indices
  const headerRow = rawRows[0].map((h) => String(h || '').trim().toLowerCase());
  
  let nisCol = headerRow.findIndex((h) => h === 'nis' || h.startsWith('nis ') || h.includes('induk') || h.includes('nisn'));
  let nameCol = headerRow.findIndex((h) => h.includes('nama'));
  let genderCol = headerRow.findIndex((h) => h.includes('kelamin') || h.includes('jk') || h.includes('l/p') || h === 'gender');
  let parentCol = headerRow.findIndex((h) => h.includes('wali') || h.includes('orang tua') || h.includes('ortu'));
  let phoneCol = headerRow.findIndex((h) => h.includes('hp') || h.includes('wa') || h.includes('telepon') || h.includes('kontak') || h.includes('phone'));

  // Fallbacks if headers didn't match standard keywords
  if (nisCol === -1) nisCol = 0; // Usually col 1
  if (nameCol === -1) nameCol = 1; // Usually col 2
  if (genderCol === -1) genderCol = 2;
  if (parentCol === -1) parentCol = 3;
  if (phoneCol === -1) phoneCol = 4;

  const results: ParsedStudentRow[] = [];

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length === 0) continue;

    const rawName = String(row[nameCol] || '').trim();
    if (!rawName) continue; // Skip empty rows

    const rawNis = String(row[nisCol] || '').trim();
    const rawGender = normalizeGender(row[genderCol]);
    const rawParent = String(row[parentCol] || '').trim();
    const rawPhone = String(row[phoneCol] || '').replace(/[^0-9]/g, '').trim();

    results.push({
      nis: rawNis || `24${String(i).padStart(3, '0')}`,
      name: rawName,
      gender: rawGender,
      parentName: rawParent || 'Orang Tua / Wali',
      parentPhone: rawPhone || '08',
    });
  }

  return results;
}

// Parse students from copy-pasted text (TSV / CSV format)
export function parseStudentsFromRawText(text: string): ParsedStudentRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) return [];

  const results: ParsedStudentRow[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Detect tab or semicolon or comma separator
    let cols: string[] = [];
    if (line.includes('\t')) {
      cols = line.split('\t').map((c) => c.trim());
    } else if (line.includes(';')) {
      cols = line.split(';').map((c) => c.trim());
    } else if (line.includes(',')) {
      cols = line.split(',').map((c) => c.trim());
    } else {
      cols = [line];
    }

    // Skip potential header row
    const firstColLower = cols[0].toLowerCase();
    if (firstColLower === 'nis' || firstColLower === 'nisn' || firstColLower === 'no' || firstColLower.includes('nama')) {
      continue;
    }

    let nis = '';
    let name = '';
    let gender: 'L' | 'P' = 'L';
    let parentName = '';
    let parentPhone = '';

    if (cols.length >= 5) {
      nis = cols[0];
      name = cols[1];
      gender = normalizeGender(cols[2]);
      parentName = cols[3];
      parentPhone = cols[4];
    } else if (cols.length === 4) {
      nis = cols[0];
      name = cols[1];
      gender = normalizeGender(cols[2]);
      parentPhone = cols[3];
    } else if (cols.length === 3) {
      nis = cols[0];
      name = cols[1];
      gender = normalizeGender(cols[2]);
    } else if (cols.length === 2) {
      nis = cols[0];
      name = cols[1];
    } else if (cols.length === 1 && cols[0]) {
      name = cols[0];
    }

    if (name.trim()) {
      results.push({
        nis: nis.trim() || `24${String(i + 1).padStart(3, '0')}`,
        name: name.trim(),
        gender,
        parentName: parentName.trim() || 'Orang Tua / Wali',
        parentPhone: parentPhone.replace(/[^0-9]/g, '') || '08',
      });
    }
  }

  return results;
}

