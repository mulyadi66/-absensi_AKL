export type AttendanceStatus = 'hadir' | 'sakit' | 'izin' | 'alpa' | 'terlambat';

export interface Student {
  id: string;
  classId: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  parentName: string;
  parentPhone: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: string;
  academicYear: string;
  homeroomTeacher: string;
  homeroomTeacherNip: string;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
}

export interface SchoolProfile {
  name: string;
  npsn: string;
  address: string;
  city: string;
  province: string;
  headmaster: string;
  headmasterNip: string;
  letterheadSubtitle: string;
}

export interface AttendanceSummary {
  totalStudents: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  terlambat: number;
  attendanceRate: number; // percentage
}

export type UserRole = 'admin' | 'walikelas' | 'siswa';

export interface UserSession {
  role: UserRole;
  username: string;
  displayName: string;
  classId?: string; // For walikelas or siswa
  studentId?: string; // For siswa
}

