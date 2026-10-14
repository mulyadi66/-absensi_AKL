import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  Phone,
  X,
  AlertTriangle,
  Info,
  Upload,
  FileSpreadsheet,
} from 'lucide-react';
import { ClassRoom, Student, UserRole } from '../types';
import { ImportStudentsModal } from './ImportStudentsModal';
import { ParsedStudentRow } from '../utils/storage';

interface ClassStudentManagementViewProps {
  classes: ClassRoom[];
  students: Student[];
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  onAddClass: (newClass: Omit<ClassRoom, 'id'>) => void;
  onUpdateClass: (cls: ClassRoom) => void;
  onDeleteClass: (classId: string) => void;
  onAddStudent: (newStudent: Omit<Student, 'id'>) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onImportBatchStudents: (
    classId: string,
    students: ParsedStudentRow[],
    replaceExisting: boolean
  ) => void;
  assignedClassId?: string;
  userRole?: UserRole;
}

interface DeleteTarget {
  type: 'student' | 'class';
  id: string;
  name: string;
  extraInfo?: string;
}

export const ClassStudentManagementView: React.FC<ClassStudentManagementViewProps> = ({
  classes,
  students,
  selectedClassId,
  setSelectedClassId,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onImportBatchStudents,
  assignedClassId,
  userRole = 'admin',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const isWaliKelas = userRole === 'walikelas';

  const displayedClasses = assignedClassId
    ? classes.filter((c) => c.id === assignedClassId)
    : classes;

  // Modals state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // In-app Delete Confirmation Modal (Replaces window.confirm for iframe reliability)
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteTarget | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Forms state
  const [className, setClassName] = useState('');
  const [classGrade, setClassGrade] = useState('7');
  const [classAcademicYear, setClassAcademicYear] = useState('2024/2025');
  const [classTeacher, setClassTeacher] = useState('');
  const [classTeacherNip, setClassTeacherNip] = useState('');

  const [studentName, setStudentName] = useState('');
  const [studentNis, setStudentNis] = useState('');
  const [studentGender, setStudentGender] = useState<'L' | 'P'>('L');
  const [studentParentName, setStudentParentName] = useState('');
  const [studentParentPhone, setStudentParentPhone] = useState('');

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === currentClass?.id);

  const filteredStudents = classStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery) ||
      s.parentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open class modal
  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassName('');
    setClassGrade('7');
    setClassAcademicYear('2024/2025');
    setClassTeacher('');
    setClassTeacherNip('');
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (cls: ClassRoom) => {
    setEditingClass(cls);
    setClassName(cls.name);
    setClassGrade(cls.grade);
    setClassAcademicYear(cls.academicYear);
    setClassTeacher(cls.homeroomTeacher);
    setClassTeacherNip(cls.homeroomTeacherNip);
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    if (editingClass) {
      onUpdateClass({
        ...editingClass,
        name: className.trim(),
        grade: classGrade,
        academicYear: classAcademicYear.trim(),
        homeroomTeacher: classTeacher.trim(),
        homeroomTeacherNip: classTeacherNip.trim(),
      });
    } else {
      onAddClass({
        name: className.trim(),
        grade: classGrade,
        academicYear: classAcademicYear.trim(),
        homeroomTeacher: classTeacher.trim(),
        homeroomTeacherNip: classTeacherNip.trim(),
      });
    }
    setIsClassModalOpen(false);
  };

  // Trigger delete class
  const handleRequestDeleteClass = (cls: ClassRoom) => {
    if (classes.length <= 1) {
      setErrorNotice('Tidak dapat menghapus kelas. Sistem harus memiliki minimal satu kelas aktif.');
      return;
    }
    const count = students.filter((s) => s.classId === cls.id).length;
    setDeleteConfirm({
      type: 'class',
      id: cls.id,
      name: cls.name,
      extraInfo: `Terdapat ${count} siswa di dalam kelas ini. Menghapus kelas akan menghapus seluruh data siswa serta riwayat absensi yang terkait secara permanen.`,
    });
  };

  // Trigger delete student
  const handleRequestDeleteStudent = (st: Student) => {
    setDeleteConfirm({
      type: 'student',
      id: st.id,
      name: st.name,
      extraInfo: `NIS: ${st.nis} · Kelas: ${currentClass.name}`,
    });
  };

  // Execute confirmed delete
  const handleExecuteDelete = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'student') {
      onDeleteStudent(deleteConfirm.id);
    } else if (deleteConfirm.type === 'class') {
      onDeleteClass(deleteConfirm.id);
      setIsClassModalOpen(false);
    }
    setDeleteConfirm(null);
  };

  // Open student modal
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentName('');
    setStudentNis('');
    setStudentGender('L');
    setStudentParentName('');
    setStudentParentPhone('08');
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (st: Student) => {
    setEditingStudent(st);
    setStudentName(st.name);
    setStudentNis(st.nis);
    setStudentGender(st.gender);
    setStudentParentName(st.parentName);
    setStudentParentPhone(st.parentPhone);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentNis.trim()) return;

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        name: studentName.trim(),
        nis: studentNis.trim(),
        gender: studentGender,
        parentName: studentParentName.trim(),
        parentPhone: studentParentPhone.trim(),
      });
    } else {
      onAddStudent({
        classId: currentClass.id,
        name: studentName.trim(),
        nis: studentNis.trim(),
        gender: studentGender,
        parentName: studentParentName.trim(),
        parentPhone: studentParentPhone.trim(),
      });
    }
    setIsStudentModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Class Selector Strip */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Manajemen Data Siswa & Kelas
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola rombongan belajar, wali kelas, dan daftar siswa dengan mudah. Hapus atau edit data secara instan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isWaliKelas && (
              <button
                onClick={handleOpenAddClass}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Kelas</span>
              </button>
            )}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
              title="Unggah file Excel/CSV atau tempel daftar siswa langsung"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Impor Data Siswa (Excel/CSV)</span>
            </button>
            <button
              onClick={handleOpenAddStudent}
              className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Siswa</span>
            </button>
          </div>
        </div>

        {/* Classes Horizontal Tabs */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto border-t border-slate-100 pt-4 pb-1">
          {displayedClasses.map((cls) => {
            const count = students.filter((s) => s.classId === cls.id).length;
            const isSelected = selectedClassId === cls.id;
            return (
              <div
                key={cls.id}
                className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedClassId(cls.id)}
                  className="flex items-center gap-2 text-left cursor-pointer"
                >
                  <BookOpen className={`h-3.5 w-3.5 ${isSelected ? 'text-blue-700' : 'text-slate-400'}`} />
                  <div>
                    <span className="font-bold">{cls.name}</span>
                    <span className="ml-1 text-[11px] text-slate-500 font-mono">({count})</span>
                  </div>
                </button>
                <div className="flex items-center gap-1 border-l border-slate-200/80 pl-1.5 ml-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditClass(cls)}
                    className="text-slate-400 hover:text-blue-600 p-1 rounded-md hover:bg-white transition-colors cursor-pointer"
                    title="Edit data kelas"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  {classes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRequestDeleteClass(cls)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus kelas ini"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Class Profile Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{currentClass.name}</h2>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Tingkat {currentClass.grade} · {currentClass.academicYear}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Wali Kelas: <strong className="text-slate-700">{currentClass.homeroomTeacher}</strong> (NIP: {currentClass.homeroomTeacherNip || '-'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, NIS, wali..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            {!isWaliKelas && classes.length > 1 && (
              <button
                type="button"
                onClick={() => handleRequestDeleteClass(currentClass)}
                className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors whitespace-nowrap cursor-pointer shrink-0"
                title="Hapus rombongan belajar kelas ini"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Kelas</span>
              </button>
            )}
          </div>
        </div>

        {/* Student List Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 w-10 text-center">No</th>
                <th className="px-3 py-2.5 w-24">NIS</th>
                <th className="px-4 py-2.5">Nama Lengkap Siswa</th>
                <th className="px-3 py-2.5 w-12 text-center">L/P</th>
                <th className="px-4 py-2.5">Nama Orang Tua / Wali</th>
                <th className="px-4 py-2.5">No. HP / WhatsApp Wali</th>
                <th className="px-4 py-2.5 w-28 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600">Tidak ada data siswa ditemukan.</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Klik tombol &quot;Tambah Siswa&quot; untuk menambahkan siswa baru ke kelas ini.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-center font-mono text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-3 font-mono font-medium text-slate-700">
                      {st.nis}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {st.name}
                    </td>
                    <td className="px-3 py-3 text-center font-medium text-slate-600">
                      {st.gender}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {st.parentName || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-mono text-slate-600">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{st.parentPhone || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditStudent(st)}
                          className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors cursor-pointer shadow-2xs"
                          title="Edit Data Siswa"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRequestDeleteStudent(st)}
                          className="flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
                          title="Hapus Siswa dari Kelas"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-App Confirmation Modal for Deletion */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Konfirmasi Hapus {deleteConfirm.type === 'student' ? 'Siswa' : 'Kelas'}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Apakah Anda yakin ingin menghapus{' '}
                    <strong className="text-slate-900 font-semibold">&quot;{deleteConfirm.name}&quot;</strong>?
                  </p>
                  {deleteConfirm.extraInfo && (
                    <div className="mt-2.5 rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800 border border-amber-200/70">
                      {deleteConfirm.extraInfo}
                    </div>
                  )}
                  <p className="mt-2 text-[11px] text-slate-400">
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50 px-5 py-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 shadow-xs transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Ya, Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error / Information Notice Modal */}
      {errorNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Perhatian</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  {errorNotice}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setErrorNotice(null)}
                className="rounded-lg bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Modal */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-800">
                {editingClass ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsClassModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Kelas (Contoh: Kelas VII-A):</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
                  placeholder="e.g. Kelas IX-B"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tingkat / Grade:</label>
                  <input
                    type="text"
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
                    placeholder="e.g. 7, 8, atau 9"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tahun Ajaran:</label>
                  <input
                    type="text"
                    value={classAcademicYear}
                    onChange={(e) => setClassAcademicYear(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
                    placeholder="e.g. 2024/2025"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Wali Kelas Lengkap:</label>
                <input
                  type="text"
                  value={classTeacher}
                  onChange={(e) => setClassTeacher(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
                  placeholder="e.g. Siti Nurhaliza, S.Pd."
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">NIP Wali Kelas:</label>
                <input
                  type="text"
                  value={classTeacherNip}
                  onChange={(e) => setClassTeacherNip(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono text-slate-800 focus:border-blue-600 focus:outline-hidden"
                  placeholder="e.g. 19850101 201001 2 012"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {editingClass && classes.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsClassModalOpen(false);
                      handleRequestDeleteClass(editingClass);
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus Kelas</span>
                  </button>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsClassModalOpen(false)}
                    className="rounded-lg px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-700 px-4 py-1.5 font-semibold text-white hover:bg-blue-800 shadow-xs cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-800">
                {editingStudent ? 'Edit Data Siswa' : `Tambah Siswa Baru ke ${currentClass.name}`}
              </h3>
              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nomor Induk Siswa (NIS):</label>
                <input
                  type="text"
                  required
                  value={studentNis}
                  onChange={(e) => setStudentNis(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
                  placeholder="e.g. 24701"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Lengkap Siswa:</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
                  placeholder="Nama sesuai akta / kartu keluarga"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Jenis Kelamin:</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="L"
                      checked={studentGender === 'L'}
                      onChange={() => setStudentGender('L')}
                      className="text-blue-600 cursor-pointer"
                    />
                    <span>Laki-Laki (L)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="P"
                      checked={studentGender === 'P'}
                      onChange={() => setStudentGender('P')}
                      className="text-blue-600 cursor-pointer"
                    />
                    <span>Perempuan (P)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nama Orang Tua / Wali:</label>
                  <input
                    type="text"
                    value={studentParentName}
                    onChange={(e) => setStudentParentName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
                    placeholder="e.g. Bambang Trihatmojo"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">No. WhatsApp Wali:</label>
                  <input
                    type="tel"
                    value={studentParentPhone}
                    onChange={(e) => setStudentParentPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
                    placeholder="081234567890"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="rounded-lg px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-700 px-4 py-1.5 font-semibold text-white hover:bg-blue-800 shadow-xs cursor-pointer"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Students Modal */}
      <ImportStudentsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        targetClass={currentClass}
        onImportBatch={onImportBatchStudents}
      />
    </div>
  );
};
