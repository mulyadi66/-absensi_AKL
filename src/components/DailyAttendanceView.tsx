import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  MessageSquare,
  Sparkles,
  RotateCcw,
  Filter,
} from 'lucide-react';
import { ClassRoom, Student, AttendanceRecord, AttendanceStatus, UserRole } from '../types';

export type AttendanceFilterType =
  | 'all'
  | 'absent'
  | 'alpa'
  | 'sakit'
  | 'izin'
  | 'with_notes'
  | 'terlambat'
  | 'hadir';

interface DailyAttendanceViewProps {
  classes: ClassRoom[];
  students: Student[];
  attendance: AttendanceRecord[];
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  onUpdateAttendance: (classId: string, studentId: string, date: string, status: AttendanceStatus, notes?: string) => void;
  onBatchMarkAllHadir: (classId: string, date: string) => void;
  onResetClassDate: (classId: string, date: string) => void;
  onOpenWaModal: (student: Student, dateStr: string, status: AttendanceStatus, notes?: string) => void;
  assignedClassId?: string;
  userRole?: UserRole;
}

export const DailyAttendanceView: React.FC<DailyAttendanceViewProps> = ({
  classes,
  students,
  attendance,
  selectedClassId,
  setSelectedClassId,
  onUpdateAttendance,
  onBatchMarkAllHadir,
  onResetClassDate,
  onOpenWaModal,
  assignedClassId,
  userRole = 'admin',
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceFilterType>('all');

  const availableClasses = assignedClassId
    ? classes.filter((c) => c.id === assignedClassId)
    : classes;
  const currentClass = availableClasses.find((c) => c.id === selectedClassId) || availableClasses[0];
  const classStudents = students.filter((s) => s.classId === currentClass?.id);

  // Get records for current class and date
  const dateRecords = attendance.filter(
    (r) => r.classId === currentClass?.id && r.date === selectedDate
  );

  // Filter students by search and status filter
  const filteredStudents = classStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery);

    if (!matchesSearch) return false;

    const rec = dateRecords.find((r) => r.studentId === s.id);
    const status: AttendanceStatus = rec ? rec.status : 'hadir';
    const hasNotes = Boolean(rec?.notes && rec.notes.trim() !== '');

    switch (statusFilter) {
      case 'absent':
        return status === 'alpa' || status === 'sakit' || status === 'izin';
      case 'alpa':
        return status === 'alpa';
      case 'sakit':
        return status === 'sakit';
      case 'izin':
        return status === 'izin';
      case 'terlambat':
        return status === 'terlambat';
      case 'hadir':
        return status === 'hadir';
      case 'with_notes':
        return hasNotes;
      case 'all':
      default:
        return true;
    }
  });

  // Counts
  let hadirCount = 0;
  let sakitCount = 0;
  let izinCount = 0;
  let alpaCount = 0;
  let terlambatCount = 0;
  let withNotesCount = 0;

  classStudents.forEach((st) => {
    const rec = dateRecords.find((r) => r.studentId === st.id);
    if (rec) {
      if (rec.status === 'hadir') hadirCount++;
      else if (rec.status === 'sakit') sakitCount++;
      else if (rec.status === 'izin') izinCount++;
      else if (rec.status === 'alpa') alpaCount++;
      else if (rec.status === 'terlambat') terlambatCount++;

      if (rec.notes && rec.notes.trim() !== '') {
        withNotesCount++;
      }
    } else {
      // Default unrecorded is considered hadir
      hadirCount++;
    }
  });

  const absentTotal = sakitCount + izinCount + alpaCount;
  const totalRecorded = dateRecords.length;

  // Date step helper
  const handleStepDay = (delta: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + delta);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const formattedDate = new Date(selectedDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-5">
      {/* Top Filter & Date Selector Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: Class & Date Pickers */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label htmlFor="daily-class-select" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Pilih Kelas
              </label>
              {userRole === 'walikelas' ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs">
                  {currentClass?.name} ({currentClass?.homeroomTeacher})
                </div>
              ) : (
                <select
                  id="daily-class-select"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-600 focus:outline-hidden"
                >
                  {availableClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.homeroomTeacher})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="daily-date-input" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Tanggal Presensi
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleStepDay(-1)}
                  className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Hari Sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="relative">
                  <input
                    id="daily-date-input"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
                <button
                  onClick={() => handleStepDay(1)}
                  className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Hari Berikutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSetToday}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Hari Ini
                </button>
              </div>
            </div>
          </div>

          {/* Right: Quick Batch Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onBatchMarkAllHadir(currentClass.id, selectedDate)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>Tandai Semua Hadir</span>
            </button>

            <button
              onClick={() => onResetClassDate(currentClass.id, selectedDate)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title="Reset data presensi hari ini"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>

        </div>

        {/* Date context & status pills */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{formattedDate}</span>
            <span aria-hidden="true">·</span>
            <span>Wali Kelas: <strong className="text-slate-800">{currentClass.homeroomTeacher}</strong></span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-emerald-700 font-semibold">Hadir: {hadirCount}</span>
            <span className="text-amber-700 font-semibold">Sakit: {sakitCount}</span>
            <span className="text-sky-700 font-semibold">Izin: {izinCount}</span>
            <span className="text-rose-700 font-semibold">Alpa: {alpaCount}</span>
            <span className="text-purple-700 font-semibold">Terlambat: {terlambatCount}</span>
            <span className="text-slate-400">Total: {totalRecorded}/{classStudents.length}</span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {/* Table Toolbar with Filter Dropdown and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-800">
              Daftar Siswa {currentClass.name}
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              ({filteredStudents.length} dari {classStudents.length} siswa)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Dropdown */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <label htmlFor="daily-status-filter" className="sr-only">
                Filter Status Kehadiran
              </label>
              <select
                id="daily-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AttendanceFilterType)}
                className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer text-xs"
              >
                <option value="all">Semua Siswa ({classStudents.length})</option>
                <option value="absent">Tidak Hadir ({absentTotal})</option>
                <option value="alpa">Alpa Tanpa Keterangan ({alpaCount})</option>
                <option value="with_notes">Memiliki Catatan Khusus ({withNotesCount})</option>
                <option value="sakit">Sakit ({sakitCount})</option>
                <option value="izin">Izin ({izinCount})</option>
                <option value="terlambat">Terlambat ({terlambatCount})</option>
                <option value="hadir">Hadir ({hadirCount})</option>
              </select>
            </div>

            {/* Reset Filter Button if active */}
            {statusFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                title="Tampilkan semua siswa"
              >
                Reset Filter
              </button>
            )}

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200/70">
              <tr>
                <th className="px-4 py-3 w-10 text-center">No</th>
                <th className="px-3 py-3 w-28">NIS</th>
                <th className="px-4 py-3">Nama Siswa</th>
                <th className="px-3 py-3 w-12 text-center">L/P</th>
                <th className="px-4 py-3 min-w-[280px]">Status Kehadiran</th>
                <th className="px-4 py-3 min-w-[200px]">Catatan / Keterangan</th>
                <th className="px-4 py-3 w-28 text-center">Aksi Notifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-700">Tidak ada siswa yang sesuai filter.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {statusFilter !== 'all'
                        ? 'Coba ganti filter status kehadiran atau klik "Reset Filter".'
                        : 'Tidak ada data siswa ditemukan untuk kelas ini.'}
                    </p>
                    {statusFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setStatusFilter('all')}
                        className="mt-3 inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer"
                      >
                        Tampilkan Semua Siswa
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const record = dateRecords.find((r) => r.studentId === student.id);
                  const currentStatus: AttendanceStatus = record ? record.status : 'hadir';
                  const notes = record?.notes || '';

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        currentStatus === 'alpa'
                          ? 'bg-rose-50/30'
                          : currentStatus === 'sakit'
                          ? 'bg-amber-50/20'
                          : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-600 font-medium">
                        {student.nis}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{student.name}</div>
                        <div className="text-[11px] text-slate-400">
                          Wali: {student.parentName}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center font-medium text-slate-600">
                        {student.gender}
                      </td>

                      {/* Status Segmented Buttons */}
                      <td className="px-4 py-3">
                        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/80">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateAttendance(currentClass.id, student.id, selectedDate, 'hadir', notes)
                            }
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                              currentStatus === 'hadir'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Hadir
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateAttendance(currentClass.id, student.id, selectedDate, 'sakit', notes)
                            }
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                              currentStatus === 'sakit'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Sakit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateAttendance(currentClass.id, student.id, selectedDate, 'izin', notes)
                            }
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                              currentStatus === 'izin'
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Izin
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateAttendance(currentClass.id, student.id, selectedDate, 'alpa', notes)
                            }
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                              currentStatus === 'alpa'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Alpa
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateAttendance(currentClass.id, student.id, selectedDate, 'terlambat', notes)
                            }
                            className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                              currentStatus === 'terlambat'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Terlambat
                          </button>
                        </div>
                      </td>

                      {/* Notes input */}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Tambahkan keterangan (opsional)..."
                          value={notes}
                          onChange={(e) =>
                            onUpdateAttendance(
                              currentClass.id,
                              student.id,
                              selectedDate,
                              currentStatus,
                              e.target.value
                            )
                          }
                          className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 placeholder-slate-300 focus:border-blue-600 focus:outline-hidden"
                        />
                      </td>

                      {/* Quick WhatsApp Action */}
                      <td className="px-4 py-3 text-center">
                        {currentStatus !== 'hadir' ? (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenWaModal(student, selectedDate, currentStatus, notes)
                            }
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                            title="Kirim pesan pemberitahuan via WhatsApp"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>WA Wali</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer info */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Presensi tersimpan otomatis setiap kali status diubah.</span>
          </div>
          <span>Total {classStudents.length} Siswa Terdaftar</span>
        </div>
      </div>
    </div>
  );
};
