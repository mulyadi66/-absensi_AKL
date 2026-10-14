import React from 'react';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { ClassRoom, Student, AttendanceRecord, SchoolProfile, AttendanceStatus } from '../types';

interface DashboardViewProps {
  classes: ClassRoom[];
  students: Student[];
  attendance: AttendanceRecord[];
  schoolProfile: SchoolProfile;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  assignedClassId?: string;
  onNavigateTab: (tab: string) => void;
  onOpenWaModal: (student: Student, dateStr: string, status: AttendanceStatus, notes?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  classes,
  students,
  attendance,
  schoolProfile,
  selectedClassId,
  setSelectedClassId,
  assignedClassId,
  onNavigateTab,
  onOpenWaModal,
}) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayFormatted = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const displayClasses = assignedClassId
    ? classes.filter((c) => c.id === assignedClassId)
    : classes;
  const displayStudents = assignedClassId
    ? students.filter((s) => s.classId === assignedClassId)
    : students;
  const displayAttendance = assignedClassId
    ? attendance.filter((r) => r.classId === assignedClassId)
    : attendance;

  // Calculate stats for today across relevant classes
  const todayRecords = displayAttendance.filter((r) => r.date === todayStr);

  const totalRegisteredStudents = displayStudents.length;
  const hadirToday = todayRecords.filter((r) => r.status === 'hadir').length;
  const sakitToday = todayRecords.filter((r) => r.status === 'sakit').length;
  const izinToday = todayRecords.filter((r) => r.status === 'izin').length;
  const alpaToday = todayRecords.filter((r) => r.status === 'alpa').length;
  const terlambatToday = todayRecords.filter((r) => r.status === 'terlambat').length;

  const totalAbsenRecorded = hadirToday + sakitToday + izinToday + alpaToday + terlambatToday;
  const attendanceRate = totalAbsenRecorded > 0 ? Math.round(((hadirToday + terlambatToday) / totalAbsenRecorded) * 100) : 0;

  // Students with 'alpa' today or recently needing attention
  const recentAlerts = todayRecords
    .filter((r) => r.status === 'alpa' || r.status === 'sakit')
    .map((r) => {
      const student = students.find((s) => s.id === r.studentId);
      const cls = classes.find((c) => c.id === r.classId);
      return {
        record: r,
        student,
        cls,
      };
    })
    .filter((item) => item.student !== undefined);

  return (
    <div className="space-y-6">
      {/* Welcome Banner / Overview */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
              <span>Sistem Presensi Siswa Terintegrasi</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Selamat Datang, Bapak/Ibu Pendidik
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Pantau kehadiran harian, kelola presensi per kelas, dan unduh rekap bulanan untuk <span className="font-semibold text-slate-700">{schoolProfile.name}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('daily')}
              className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-800 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>Input Presensi Hari Ini</span>
            </button>
            <button
              onClick={() => onNavigateTab('monthly')}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <FileText className="h-4 w-4 text-slate-500" />
              <span>Rekap Bulanan</span>
            </button>
          </div>
        </div>

        {/* Date context */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">{todayFormatted}</span>
          <span aria-hidden="true">·</span>
          <span>Status Input: {totalAbsenRecorded} dari {totalRegisteredStudents} siswa tercatat hari ini</span>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Siswa</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight font-mono tabular-nums text-slate-900">
            {totalRegisteredStudents}
          </p>
          <span className="text-[11px] text-slate-400">Terdaftar aktif</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Kehadiran</span>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight font-mono tabular-nums text-emerald-700">
            {attendanceRate}%
          </p>
          <span className="text-[11px] text-slate-400">{hadirToday} siswa hadir</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sakit (S)</span>
            <span className="text-xs font-bold text-amber-600">S</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight font-mono tabular-nums text-amber-600">
            {sakitToday}
          </p>
          <span className="text-[11px] text-slate-400">Perlu istirahat</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Izin (I)</span>
            <span className="text-xs font-bold text-sky-600">I</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight font-mono tabular-nums text-sky-600">
            {izinToday}
          </p>
          <span className="text-[11px] text-slate-400">Dengan surat/kabar</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Alpa (A)</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight font-mono tabular-nums text-rose-600">
            {alpaToday}
          </p>
          <span className="text-[11px] text-slate-400">Tanpa keterangan</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Terlambat (T)</span>
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight font-mono tabular-nums text-purple-600">
            {terlambatToday}
          </p>
          <span className="text-[11px] text-slate-400">Masuk setelah jam</span>
        </div>
      </div>

      {/* Main Grid: Per-Class Status & Attention Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Status Tiap Kelas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Ringkasan Kehadiran Tiap Kelas
            </h2>
            <button
              onClick={() => onNavigateTab('students')}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Kelola Kelas & Siswa</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayClasses.map((cls) => {
              const classStudents = students.filter((s) => s.classId === cls.id);
              const classTodayRecords = todayRecords.filter((r) => r.classId === cls.id);
              const classHadir = classTodayRecords.filter((r) => r.status === 'hadir' || r.status === 'terlambat').length;
              const classAlpa = classTodayRecords.filter((r) => r.status === 'alpa').length;
              const classSakitIzin = classTodayRecords.filter((r) => r.status === 'sakit' || r.status === 'izin').length;
              const rate = classTodayRecords.length > 0 ? Math.round((classHadir / classStudents.length) * 100) : 0;
              const isSelected = selectedClassId === cls.id;

              return (
                <div
                  key={cls.id}
                  className={`rounded-xl border bg-white p-5 shadow-2xs transition-all ${
                    isSelected ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{cls.name}</h3>
                      <p className="text-xs text-slate-500">Wali: {cls.homeroomTeacher}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {classStudents.length} Siswa
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs border-y border-slate-100 py-2.5">
                    <span className="text-slate-500">Tingkat Hadir Hari Ini</span>
                    <span className="font-mono font-bold text-slate-900">{rate}%</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-700 font-medium">H: {classHadir}</span>
                      <span className="text-amber-700 font-medium">S/I: {classSakitIzin}</span>
                      <span className="text-rose-700 font-medium">A: {classAlpa}</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedClassId(cls.id);
                        onNavigateTab('daily');
                      }}
                      className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <span>Buka Absen</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Siswa Perlu Perhatian & Notifikasi WA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span>Siswa Tidak Hadir Hari Ini</span>
              {recentAlerts.length > 0 && (
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                  {recentAlerts.length}
                </span>
              )}
            </h2>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs divide-y divide-slate-100 min-h-[300px]">
            {recentAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
                <p className="text-xs font-semibold text-slate-800">Semua Siswa Tercatat Hadir</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Tidak ada siswa berstatus alpa atau sakit hari ini.</p>
              </div>
            ) : (
              recentAlerts.map(({ record, student, cls }) => (
                <div key={record.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{student?.name}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span>{cls?.name}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold capitalize text-rose-600">
                          {record.status}
                        </span>
                        {record.notes && <span>({record.notes})</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Wali: {student?.parentName} ({student?.parentPhone})
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        student &&
                        onOpenWaModal(student, record.date, record.status, record.notes)
                      }
                      title="Kirim pesan WhatsApp ke orang tua murid"
                      className="flex items-center gap-1 shrink-0 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 text-[11px] font-semibold transition-colors"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>WA Wali</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
