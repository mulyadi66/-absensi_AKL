import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { ClassRoom, Student, AttendanceRecord, SchoolProfile } from '../types';
import { exportMonthlyMatrixExcel } from '../utils/storage';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: ClassRoom;
  students: Student[];
  attendance: AttendanceRecord[];
  schoolProfile: SchoolProfile;
  year: number;
  monthIndex: number;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  classroom,
  students,
  attendance,
  schoolProfile,
  year,
  monthIndex,
}) => {
  if (!isOpen) return null;

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const monthName = monthNames[monthIndex];
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const handlePrint = () => {
    window.print();
  };

  const handleExcel = () => {
    exportMonthlyMatrixExcel(
      classroom,
      students,
      attendance,
      year,
      monthIndex,
      schoolProfile
    );
  };

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 print:p-0 print:static print:bg-white print:overflow-visible">
      {/* Floating Action Controls for Screen View */}
      <div className="no-print mx-auto max-w-5xl mb-4 flex items-center justify-between rounded-xl bg-slate-900 px-5 py-3 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <Printer className="h-5 w-5 text-blue-400" />
          <div>
            <span className="text-sm font-semibold">Pratinjau Cetak Rekapitulasi</span>
            <p className="text-xs text-slate-400">
              Format siap cetak A4/F4 Lanskap & Kompatibel &quot;Save to PDF&quot;
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExcel}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-xs transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak / Simpan PDF</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="mx-auto max-w-5xl rounded-xl bg-white p-8 shadow-2xl border border-slate-200 text-slate-900 print:max-w-none print:shadow-none print:border-none print:p-0">
        
        {/* Kop Surat Resmi */}
        <div className="text-center border-b-4 border-double border-slate-900 pb-3 mb-5">
          <p className="text-xs font-semibold tracking-widest uppercase text-slate-700 whitespace-pre-line">
            {schoolProfile.letterheadSubtitle}
          </p>
          <h1 className="text-xl font-bold tracking-tight uppercase text-slate-900 mt-0.5">
            {schoolProfile.name}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Alamat: {schoolProfile.address} | NPSN: {schoolProfile.npsn}
          </p>
        </div>

        {/* Title & Document Meta */}
        <div className="text-center mb-5">
          <h2 className="text-base font-bold uppercase tracking-wide text-slate-900 underline decoration-1 underline-offset-4">
            REKAPITULASI KEHADIRAN SISWA BULANAN
          </h2>
          <p className="text-xs font-semibold text-slate-700 mt-1">
            BULAN: {monthName.toUpperCase()} {year}
          </p>
        </div>

        <div className="flex justify-between items-end text-xs mb-3 font-medium text-slate-800">
          <div>
            <p>Kelas: <span className="font-bold">{classroom.name}</span></p>
            <p>Wali Kelas: <span className="font-bold">{classroom.homeroomTeacher}</span></p>
          </div>
          <div className="text-right">
            <p>Tahun Pelajaran: <span className="font-bold">{classroom.academicYear}</span></p>
            <p>Total Siswa: <span className="font-bold">{students.length} Orang</span></p>
          </div>
        </div>

        {/* Attendance Matrix Table */}
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse border border-slate-900 text-[10px] leading-tight">
            <thead>
              <tr className="bg-slate-100 text-slate-900">
                <th rowSpan={2} className="border border-slate-900 px-1 py-1 text-center w-6">No</th>
                <th rowSpan={2} className="border border-slate-900 px-1 py-1 text-center w-14">NIS</th>
                <th rowSpan={2} className="border border-slate-900 px-2 py-1 text-left min-w-[140px]">Nama Siswa</th>
                <th rowSpan={2} className="border border-slate-900 px-1 py-1 text-center w-6">L/P</th>
                <th colSpan={daysInMonth} className="border border-slate-900 px-1 py-0.5 text-center">
                  Tanggal ({monthName} {year})
                </th>
                <th colSpan={5} className="border border-slate-900 px-1 py-0.5 text-center">Rekap</th>
                <th rowSpan={2} className="border border-slate-900 px-1 py-1 text-center w-12">% Hadir</th>
              </tr>
              <tr className="bg-slate-50 text-[9px]">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const dateObj = new Date(year, monthIndex, day);
                  const isSunday = dateObj.getDay() === 0;
                  return (
                    <th
                      key={day}
                      className={`border border-slate-900 text-center w-4 py-0.5 ${
                        isSunday ? 'bg-red-100 text-red-700 font-bold' : ''
                      }`}
                    >
                      {day}
                    </th>
                  );
                })}
                <th className="border border-slate-900 text-center w-5 bg-emerald-50">H</th>
                <th className="border border-slate-900 text-center w-5 bg-amber-50">S</th>
                <th className="border border-slate-900 text-center w-5 bg-blue-50">I</th>
                <th className="border border-slate-900 text-center w-5 bg-rose-50">A</th>
                <th className="border border-slate-900 text-center w-5 bg-purple-50">T</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => {
                const studentRecords = attendance.filter(
                  (a) =>
                    a.studentId === student.id &&
                    a.date.startsWith(`${year}-${String(monthIndex + 1).padStart(2, '0')}`)
                );

                let hCount = 0;
                let sCount = 0;
                let iCount = 0;
                let aCount = 0;
                let tCount = 0;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/50">
                    <td className="border border-slate-900 text-center py-1">{idx + 1}</td>
                    <td className="border border-slate-900 text-center font-mono py-1">{student.nis}</td>
                    <td className="border border-slate-900 px-2 py-1 font-medium">{student.name}</td>
                    <td className="border border-slate-900 text-center py-1">{student.gender}</td>

                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const rec = studentRecords.find((r) => r.date === dateStr);
                      const isSunday = new Date(year, monthIndex, day).getDay() === 0;

                      let cellContent = '';
                      let cellClass = '';

                      if (rec) {
                        if (rec.status === 'hadir') {
                          cellContent = '•';
                          cellClass = 'text-emerald-700 font-bold';
                          hCount++;
                        } else if (rec.status === 'sakit') {
                          cellContent = 'S';
                          cellClass = 'text-amber-700 font-bold bg-amber-50';
                          sCount++;
                        } else if (rec.status === 'izin') {
                          cellContent = 'I';
                          cellClass = 'text-sky-700 font-bold bg-sky-50';
                          iCount++;
                        } else if (rec.status === 'alpa') {
                          cellContent = 'A';
                          cellClass = 'text-rose-700 font-bold bg-rose-100';
                          aCount++;
                        } else if (rec.status === 'terlambat') {
                          cellContent = 'T';
                          cellClass = 'text-purple-700 font-bold bg-purple-50';
                          tCount++;
                        }
                      } else if (isSunday) {
                        cellContent = '-';
                        cellClass = 'bg-red-50 text-red-300';
                      }

                      return (
                        <td
                          key={day}
                          className={`border border-slate-900 text-center py-0.5 ${cellClass}`}
                        >
                          {cellContent}
                        </td>
                      );
                    })}

                    {/* Rekap Totals */}
                    <td className="border border-slate-900 text-center font-bold font-mono text-emerald-800 bg-emerald-50/50">
                      {hCount}
                    </td>
                    <td className="border border-slate-900 text-center font-bold font-mono text-amber-800 bg-amber-50/50">
                      {sCount}
                    </td>
                    <td className="border border-slate-900 text-center font-bold font-mono text-blue-800 bg-blue-50/50">
                      {iCount}
                    </td>
                    <td className="border border-slate-900 text-center font-bold font-mono text-rose-800 bg-rose-50/50">
                      {aCount}
                    </td>
                    <td className="border border-slate-900 text-center font-bold font-mono text-purple-800 bg-purple-50/50">
                      {tCount}
                    </td>

                    {/* % Kehadiran */}
                    {(() => {
                      const totalRecorded = hCount + sCount + iCount + aCount + tCount;
                      const percentage =
                        totalRecorded > 0
                          ? Math.round(((hCount + tCount) / totalRecorded) * 100)
                          : 0;
                      return (
                        <td className="border border-slate-900 text-center font-bold font-mono py-1">
                          {percentage}%
                        </td>
                      );
                    })()}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend Notes */}
        <div className="mt-3 text-[10px] text-slate-600 flex items-center gap-4">
          <span className="font-bold text-slate-800">Keterangan:</span>
          <span>( • ) Hadir</span>
          <span>( S ) Sakit</span>
          <span>( I ) Izin</span>
          <span>( A ) Alpa</span>
          <span>( T ) Terlambat</span>
          <span>( - ) Libur / Akhir Pekan</span>
        </div>

        {/* Lembar Pengesahan & Tanda Tangan */}
        <div className="mt-8 grid grid-cols-2 text-xs text-slate-800 pt-4">
          <div className="text-left pl-6">
            <p>Mengetahui,</p>
            <p className="font-semibold">Kepala Sekolah</p>
            <div className="h-16"></div>
            <p className="font-bold underline uppercase">{schoolProfile.headmaster}</p>
            <p className="font-mono text-[11px]">NIP. {schoolProfile.headmasterNip}</p>
          </div>

          <div className="text-right pr-6">
            <p>{schoolProfile.city}, {todayStr}</p>
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
