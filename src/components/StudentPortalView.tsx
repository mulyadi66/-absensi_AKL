import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  User,
  GraduationCap,
  Sparkles,
  Info,
  CalendarDays,
  LogOut,
} from 'lucide-react';
import { ClassRoom, Student, AttendanceRecord, SchoolProfile, AttendanceStatus } from '../types';

interface StudentPortalViewProps {
  student: Student;
  classroom: ClassRoom;
  attendance: AttendanceRecord[];
  schoolProfile: SchoolProfile;
  onLogout: () => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  student,
  classroom,
  attendance,
  schoolProfile,
  onLogout,
}) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-11

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const studentMonthRecords = attendance.filter(
    (a) => a.studentId === student.id && a.date.startsWith(monthPrefix)
  );

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  let hadirCount = 0;
  let sakitCount = 0;
  let izinCount = 0;
  let alpaCount = 0;
  let terlambatCount = 0;

  studentMonthRecords.forEach((r) => {
    if (r.status === 'hadir') hadirCount++;
    else if (r.status === 'sakit') sakitCount++;
    else if (r.status === 'izin') izinCount++;
    else if (r.status === 'alpa') alpaCount++;
    else if (r.status === 'terlambat') terlambatCount++;
  });

  const totalRecorded = hadirCount + sakitCount + izinCount + alpaCount + terlambatCount;
  const attendanceRate = totalRecorded > 0 ? Math.round(((hadirCount + terlambatCount) / totalRecorded) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Student Banner */}
      <div className="no-print rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
              <GraduationCap className="h-8 w-8 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-blue-200">
                <span>Portal Pantau Kehadiran Siswa</span>
                <span aria-hidden="true">·</span>
                <span>{schoolProfile.name}</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
                {student.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-blue-100">
                <span className="font-mono bg-white/10 px-2.5 py-0.5 rounded-md">
                  NIS: {student.nis}
                </span>
                <span>Kelas: <strong>{classroom.name}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Wali Kelas: <strong>{classroom.homeroomTeacher}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Wali Murid: <strong>{student.parentName}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Rekap Siswa</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 shadow-xs transition-colors cursor-pointer"
              title="Keluar dari akun siswa"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Sheet (Appears on print or screen) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Kop on Print only */}
        <div className="print-only text-center border-b-2 border-slate-900 pb-3 mb-4">
          <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-700 whitespace-pre-line">
            {schoolProfile.letterheadSubtitle}
          </p>
          <h2 className="text-base font-bold uppercase text-slate-900">
            {schoolProfile.name}
          </h2>
          <p className="text-[9px] text-slate-600">
            {schoolProfile.address} | NPSN: {schoolProfile.npsn}
          </p>
          <h3 className="text-sm font-bold uppercase mt-2 underline">
            LEMBAR REKAPITULASI KEHADIRAN SISWA
          </h3>
          <div className="mt-2 text-xs flex justify-between font-medium">
            <span>Nama: <strong>{student.name}</strong> (NIS: {student.nis})</span>
            <span>Kelas: <strong>{classroom.name}</strong> · Periode: <strong>{monthNames[selectedMonth]} {selectedYear}</strong></span>
          </div>
        </div>

        {/* Filter Month & Year Bar */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Riwayat Kehadiran Bulanan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau rekapitulasi kehadiran Anda secara transparan setiap harinya.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-600 focus:outline-hidden cursor-pointer"
            >
              {monthNames.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-600 focus:outline-hidden cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Attendance KPI Cards for the Student */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <span className="text-xs font-medium text-slate-500">Persentase</span>
            <p className="mt-1.5 text-2xl font-bold font-mono text-blue-700">
              {attendanceRate}%
            </p>
            <span className="text-[11px] text-slate-400">Kehadiran</span>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <span className="text-xs font-semibold text-emerald-800">Hadir (H)</span>
            <p className="mt-1.5 text-2xl font-bold font-mono text-emerald-700">
              {hadirCount}
            </p>
            <span className="text-[11px] text-emerald-600">Hari Masuk</span>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <span className="text-xs font-semibold text-amber-800">Sakit (S)</span>
            <p className="mt-1.5 text-2xl font-bold font-mono text-amber-700">
              {sakitCount}
            </p>
            <span className="text-[11px] text-amber-600">Hari Sakit</span>
          </div>

          <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4">
            <span className="text-xs font-semibold text-sky-800">Izin (I)</span>
            <p className="mt-1.5 text-2xl font-bold font-mono text-sky-700">
              {izinCount}
            </p>
            <span className="text-[11px] text-sky-600">Hari Izin</span>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
            <span className="text-xs font-semibold text-rose-800">Alpa (A)</span>
            <p className="mt-1.5 text-2xl font-bold font-mono text-rose-700">
              {alpaCount}
            </p>
            <span className="text-[11px] text-rose-600">Tanpa Keterangan</span>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4">
            <span className="text-xs font-semibold text-purple-800">Terlambat (T)</span>
            <p className="mt-1.5 text-2xl font-bold font-mono text-purple-700">
              {terlambatCount}
            </p>
            <span className="text-[11px] text-purple-600">Hari Masuk</span>
          </div>
        </div>

        {/* Daily Calendar Matrix for This Student */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              <span>Kalender Presensi {monthNames[selectedMonth]} {selectedYear}</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Total {daysInMonth} Hari
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((dayName, idx) => (
              <div
                key={dayName}
                className={`py-1.5 font-bold text-[11px] rounded-md ${
                  idx === 0 ? 'text-rose-600 bg-rose-50/60' : 'text-slate-500 bg-slate-100'
                }`}
              >
                {dayName}
              </div>
            ))}

            {/* Empty slots for first day of month */}
            {(() => {
              const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay();
              return Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-16 rounded-lg bg-slate-50/40 border border-slate-100" />
              ));
            })()}

            {/* Actual Days */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const rec = studentMonthRecords.find((r) => r.date === dateStr);
              const isSunday = new Date(selectedYear, selectedMonth, day).getDay() === 0;

              let statusText = 'Belum Ada';
              let badgeColor = 'bg-slate-100 text-slate-400';
              let statusLabel = '-';

              if (rec) {
                if (rec.status === 'hadir') {
                  statusText = 'Hadir';
                  badgeColor = 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold';
                  statusLabel = 'H';
                } else if (rec.status === 'sakit') {
                  statusText = 'Sakit';
                  badgeColor = 'bg-amber-100 text-amber-800 border border-amber-300 font-bold';
                  statusLabel = 'S';
                } else if (rec.status === 'izin') {
                  statusText = 'Izin';
                  badgeColor = 'bg-sky-100 text-sky-800 border border-sky-300 font-bold';
                  statusLabel = 'I';
                } else if (rec.status === 'alpa') {
                  statusText = 'Alpa';
                  badgeColor = 'bg-rose-100 text-rose-800 border border-rose-300 font-bold';
                  statusLabel = 'A';
                } else if (rec.status === 'terlambat') {
                  statusText = 'Terlambat';
                  badgeColor = 'bg-purple-100 text-purple-800 border border-purple-300 font-bold';
                  statusLabel = 'T';
                }
              } else if (isSunday) {
                statusText = 'Libur Akhir Pekan';
                badgeColor = 'bg-rose-50 text-rose-400';
                statusLabel = 'Libur';
              }

              return (
                <div
                  key={day}
                  className={`flex flex-col justify-between p-2 rounded-lg border transition-all min-h-[64px] ${
                    isSunday
                      ? 'border-rose-100 bg-rose-50/30'
                      : rec?.status === 'alpa'
                      ? 'border-rose-200 bg-rose-50/50'
                      : rec?.status === 'sakit'
                      ? 'border-amber-200 bg-amber-50/40'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold ${isSunday ? 'text-rose-600' : 'text-slate-700'}`}>
                      {day}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${badgeColor}`}>
                      {statusLabel}
                    </span>
                  </div>

                  {rec?.notes ? (
                    <p className="text-[9px] text-slate-500 text-left line-clamp-1 italic mt-1" title={rec.notes}>
                      {rec.notes}
                    </p>
                  ) : (
                    <div />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Attendance Log for this Month */}
        <div className="pt-2">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Rincian Catatan Kehadiran
          </h3>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 w-10 text-center">No</th>
                  <th className="px-4 py-2.5 w-40">Tanggal</th>
                  <th className="px-4 py-2.5 w-32">Status Kehadiran</th>
                  <th className="px-4 py-2.5">Catatan / Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentMonthRecords.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Belum ada data presensi yang dicatat pada bulan ini.
                    </td>
                  </tr>
                ) : (
                  studentMonthRecords.map((r, idx) => {
                    const dObj = new Date(r.date);
                    const dateFormatted = dObj.toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    });

                    let statusBadge = 'bg-emerald-100 text-emerald-800';
                    let label = 'Hadir';

                    if (r.status === 'sakit') {
                      statusBadge = 'bg-amber-100 text-amber-800';
                      label = 'Sakit';
                    } else if (r.status === 'izin') {
                      statusBadge = 'bg-sky-100 text-sky-800';
                      label = 'Izin';
                    } else if (r.status === 'alpa') {
                      statusBadge = 'bg-rose-100 text-rose-800';
                      label = 'Alpa (Tanpa Keterangan)';
                    } else if (r.status === 'terlambat') {
                      statusBadge = 'bg-purple-100 text-purple-800';
                      label = 'Terlambat';
                    }

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-2.5 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-800">{dateFormatted}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${statusBadge}`}>
                            {label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">{r.notes || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Print Signatures */}
        <div className="print-only pt-8 grid grid-cols-2 text-xs text-slate-800">
          <div>
            <p>Mengetahui,</p>
            <p className="font-semibold">Orang Tua / Wali Murid</p>
            <div className="h-16"></div>
            <p className="font-bold underline uppercase">{student.parentName}</p>
          </div>
          <div className="text-right">
            <p>{schoolProfile.city}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-semibold">Wali Kelas {classroom.name}</p>
            <div className="h-16"></div>
            <p className="font-bold underline uppercase">{classroom.homeroomTeacher}</p>
            <p className="font-mono text-[11px]">NIP. {classroom.homeroomTeacherNip}</p>
          </div>
        </div>

      </div>
    </div>
  );
};
