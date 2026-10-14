import React, { useState } from 'react';
import {
  Printer,
  Download,
  CalendarDays,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { ClassRoom, Student, AttendanceRecord, SchoolProfile, UserRole } from '../types';
import { exportMonthlyMatrixExcel } from '../utils/storage';

interface MonthlyRecapViewProps {
  classes: ClassRoom[];
  students: Student[];
  attendance: AttendanceRecord[];
  schoolProfile: SchoolProfile;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  onOpenPrintModal: (year: number, monthIndex: number) => void;
  assignedClassId?: string;
  userRole?: UserRole;
}

export const MonthlyRecapView: React.FC<MonthlyRecapViewProps> = ({
  classes,
  students,
  attendance,
  schoolProfile,
  selectedClassId,
  setSelectedClassId,
  onOpenPrintModal,
  assignedClassId,
  userRole = 'admin',
}) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-11

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const availableClasses = assignedClassId
    ? classes.filter((c) => c.id === assignedClassId)
    : classes;
  const currentClass = availableClasses.find((c) => c.id === selectedClassId) || availableClasses[0];
  const classStudents = students.filter((s) => s.classId === currentClass?.id);

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  // Handle excel export
  const handleExportExcel = () => {
    exportMonthlyMatrixExcel(
      currentClass,
      classStudents,
      attendance,
      selectedYear,
      selectedMonth,
      schoolProfile
    );
  };

  // Month records for this class
  const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const monthRecords = attendance.filter(
    (a) => a.classId === currentClass?.id && a.date.startsWith(monthPrefix)
  );

  return (
    <div className="space-y-5">
      {/* Top Filter and Actions Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label htmlFor="recap-class-select" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Pilih Kelas
              </label>
              {userRole === 'walikelas' ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs">
                  {currentClass?.name} ({currentClass?.homeroomTeacher})
                </div>
              ) : (
                <select
                  id="recap-class-select"
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
              <label htmlFor="recap-month-select" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Pilih Bulan
              </label>
              <select
                id="recap-month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-600 focus:outline-hidden"
              >
                {monthNames.map((name, index) => (
                  <option key={name} value={index}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="recap-year-select" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Pilih Tahun
              </label>
              <select
                id="recap-year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-600 focus:outline-hidden"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => onOpenPrintModal(selectedYear, selectedMonth)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 shadow-xs transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Rekap Resmi (PDF)</span>
            </button>
          </div>

        </div>

        {/* Info strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <span>
              Rekapitulasi Periode: <strong className="text-slate-800">{monthNames[selectedMonth]} {selectedYear}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>Wali Kelas: <strong className="text-slate-800">{currentClass.homeroomTeacher}</strong></span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Hadir (H)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span> Sakit (S)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-500"></span> Izin (I)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span> Alpa (A)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-purple-500"></span> Terlambat (T)
            </span>
          </div>
        </div>
      </div>

      {/* Matrix Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Matriks Presensi Harian - {currentClass.name}
            </h2>
            <p className="text-[11px] text-slate-400">
              Total {classStudents.length} siswa · Gulir horizontal untuk melihat semua tanggal
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {daysInMonth} Hari
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[11px] leading-tight text-slate-700">
            <thead>
              <tr className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
                <th rowSpan={2} className="border-r border-slate-200 px-2.5 py-2 text-center w-8">No</th>
                <th rowSpan={2} className="border-r border-slate-200 px-2.5 py-2 text-left w-20">NIS</th>
                <th rowSpan={2} className="border-r border-slate-200 px-3 py-2 text-left min-w-[170px]">Nama Siswa</th>
                <th rowSpan={2} className="border-r border-slate-200 px-2 py-2 text-center w-8">L/P</th>
                <th colSpan={daysInMonth} className="border-r border-slate-200 px-1 py-1 text-center bg-slate-100/70">
                  Tanggal {monthNames[selectedMonth]}
                </th>
                <th colSpan={5} className="border-r border-slate-200 px-1 py-1 text-center bg-slate-100/70">
                  Total
                </th>
                <th rowSpan={2} className="px-2.5 py-2 text-center w-14">
                  % Hadir
                </th>
              </tr>
              <tr className="bg-slate-50/70 text-[10px] border-b border-slate-200">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const isSunday = new Date(selectedYear, selectedMonth, day).getDay() === 0;
                  return (
                    <th
                      key={day}
                      className={`border-r border-slate-200 text-center w-6 py-1 ${
                        isSunday ? 'bg-rose-50 text-rose-600 font-bold' : 'text-slate-600'
                      }`}
                    >
                      {day}
                    </th>
                  );
                })}
                <th className="border-r border-slate-200 text-center w-6 text-emerald-700 font-bold bg-emerald-50/50">H</th>
                <th className="border-r border-slate-200 text-center w-6 text-amber-700 font-bold bg-amber-50/50">S</th>
                <th className="border-r border-slate-200 text-center w-6 text-sky-700 font-bold bg-sky-50/50">I</th>
                <th className="border-r border-slate-200 text-center w-6 text-rose-700 font-bold bg-rose-50/50">A</th>
                <th className="border-r border-slate-200 text-center w-6 text-purple-700 font-bold bg-purple-50/50">T</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth + 10} className="py-12 text-center text-slate-400">
                    Belum ada siswa di kelas ini.
                  </td>
                </tr>
              ) : (
                classStudents.map((student, idx) => {
                  const studentRecords = monthRecords.filter((a) => a.studentId === student.id);
                  let h = 0;
                  let s = 0;
                  let i = 0;
                  let a = 0;
                  let t = 0;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="border-r border-slate-200 text-center font-mono text-slate-400 py-1.5">
                        {idx + 1}
                      </td>
                      <td className="border-r border-slate-200 font-mono text-slate-500 px-2 py-1.5">
                        {student.nis}
                      </td>
                      <td className="border-r border-slate-200 px-3 py-1.5 font-semibold text-slate-900">
                        {student.name}
                      </td>
                      <td className="border-r border-slate-200 text-center text-slate-500 py-1.5">
                        {student.gender}
                      </td>

                      {/* Day cells */}
                      {Array.from({ length: daysInMonth }, (_, dIdx) => dIdx + 1).map((day) => {
                        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const rec = studentRecords.find((r) => r.date === dateStr);
                        const isSunday = new Date(selectedYear, selectedMonth, day).getDay() === 0;

                        let text = '';
                        let cellBg = '';

                        if (rec) {
                          if (rec.status === 'hadir') {
                            text = 'H';
                            cellBg = 'text-emerald-700 font-semibold bg-emerald-50/40';
                            h++;
                          } else if (rec.status === 'sakit') {
                            text = 'S';
                            cellBg = 'text-amber-700 font-bold bg-amber-100/70';
                            s++;
                          } else if (rec.status === 'izin') {
                            text = 'I';
                            cellBg = 'text-sky-700 font-bold bg-sky-100/70';
                            i++;
                          } else if (rec.status === 'alpa') {
                            text = 'A';
                            cellBg = 'text-rose-700 font-bold bg-rose-200/80';
                            a++;
                          } else if (rec.status === 'terlambat') {
                            text = 'T';
                            cellBg = 'text-purple-700 font-bold bg-purple-100/70';
                            t++;
                          }
                        } else if (isSunday) {
                          text = '-';
                          cellBg = 'bg-slate-100/50 text-slate-300';
                        }

                        return (
                          <td
                            key={day}
                            className={`border-r border-slate-200 text-center py-1 font-mono text-[10px] ${cellBg}`}
                          >
                            {text}
                          </td>
                        );
                      })}

                      {/* Totals */}
                      <td className="border-r border-slate-200 text-center font-mono font-bold text-emerald-700 bg-emerald-50/40 py-1.5">
                        {h}
                      </td>
                      <td className="border-r border-slate-200 text-center font-mono font-bold text-amber-700 bg-amber-50/40 py-1.5">
                        {s}
                      </td>
                      <td className="border-r border-slate-200 text-center font-mono font-bold text-sky-700 bg-sky-50/40 py-1.5">
                        {i}
                      </td>
                      <td className="border-r border-slate-200 text-center font-mono font-bold text-rose-700 bg-rose-50/40 py-1.5">
                        {a}
                      </td>
                      <td className="border-r border-slate-200 text-center font-mono font-bold text-purple-700 bg-purple-50/40 py-1.5">
                        {t}
                      </td>

                      {/* % Kehadiran */}
                      {(() => {
                        const total = h + s + i + a + t;
                        const rate = total > 0 ? Math.round(((h + t) / total) * 100) : 0;
                        return (
                          <td className="text-center font-mono font-bold text-slate-800 py-1.5">
                            {rate}%
                          </td>
                        );
                      })()}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-blue-600" />
            <span>Persentase dihitung dari perbandingan kehadiran terhadap hari efektif belajar.</span>
          </div>
          <button
            onClick={() => onOpenPrintModal(selectedYear, selectedMonth)}
            className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
          >
            <Printer className="h-3 w-3" />
            <span>Pratinjau Format Cetak Dokumen Resmi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
