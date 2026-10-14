import React, { useState, useEffect } from 'react';
import {
  ClassRoom,
  Student,
  AttendanceRecord,
  SchoolProfile,
  AttendanceStatus,
  UserSession,
} from './types';
import {
  loadAppState,
  saveAppState,
  exportBackupJSON,
  resetToDemoData,
  ParsedStudentRow,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DailyAttendanceView } from './components/DailyAttendanceView';
import { MonthlyRecapView } from './components/MonthlyRecapView';
import { ClassStudentManagementView } from './components/ClassStudentManagementView';
import { SettingsView } from './components/SettingsView';
import { QuickWaModal } from './components/QuickWaModal';
import { PrintReportModal } from './components/PrintReportModal';
import { LoginModal } from './components/LoginModal';
import { LoginView } from './components/LoginView';
import { StudentPortalView } from './components/StudentPortalView';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>({} as SchoolProfile);

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  // 3-Role User Session State (admin, walikelas, siswa)
  const [currentSession, setCurrentSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('presensi_user_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Persist or clear session in localStorage
  useEffect(() => {
    try {
      if (currentSession) {
        localStorage.setItem('presensi_user_session', JSON.stringify(currentSession));
      } else {
        localStorage.removeItem('presensi_user_session');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentSession]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Modals state
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printYear, setPrintYear] = useState<number>(new Date().getFullYear());
  const [printMonth, setPrintMonth] = useState<number>(new Date().getMonth());

  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waStudent, setWaStudent] = useState<Student | null>(null);
  const [waDate, setWaDate] = useState<string>('');
  const [waStatus, setWaStatus] = useState<AttendanceStatus>('alpa');
  const [waNotes, setWaNotes] = useState<string | undefined>('');

  // Load state on mount
  useEffect(() => {
    const loaded = loadAppState();
    setClasses(loaded.classes);
    setStudents(loaded.students);
    setAttendance(loaded.attendance);
    setSchoolProfile(loaded.profile);

    // Initial selected class based on session role
    if (currentSession?.role === 'walikelas' && currentSession?.classId) {
      setSelectedClassId(currentSession.classId);
    } else if (loaded.classes.length > 0) {
      setSelectedClassId(loaded.classes[0].id);
    }
    setDataLoaded(true);
  }, []);

  const handleLogin = (session: UserSession) => {
    setCurrentSession(session);
    setLoginModalOpen(false);

    if (session.role === 'walikelas' && session.classId) {
      setSelectedClassId(session.classId);
      setCurrentTab('dashboard');
    } else if (session.role === 'siswa') {
      if (session.classId) {
        setSelectedClassId(session.classId);
      }
    }
    showToast(
      `Berhasil masuk sebagai ${session.displayName} (${
        session.role === 'admin'
          ? 'Admin Full'
          : session.role === 'walikelas'
          ? 'Wali Kelas'
          : 'Siswa'
      }).`
    );
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('presensi_user_session');
    } catch (e) {
      console.error(e);
    }
    setCurrentSession(null);
    setLoginModalOpen(false);
    showToast('Anda telah berhasil keluar (logout) dari sistem presensi.');
  };

  // Save state on changes
  useEffect(() => {
    if (!dataLoaded) return;
    saveAppState({
      classes,
      students,
      attendance,
      profile: schoolProfile,
    });
  }, [classes, students, attendance, schoolProfile, dataLoaded]);

  // Attendance update
  const handleUpdateAttendance = (
    classId: string,
    studentId: string,
    date: string,
    status: AttendanceStatus,
    notes?: string
  ) => {
    setAttendance((prev) => {
      const existingIndex = prev.findIndex(
        (r) => r.classId === classId && r.studentId === studentId && r.date === date
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status,
          notes: notes !== undefined ? notes : updated[existingIndex].notes,
        };
        return updated;
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${studentId}-${date}`,
          classId,
          studentId,
          date,
          status,
          notes: notes || '',
        };
        return [...prev, newRecord];
      }
    });
  };

  // Batch mark all hadir for class and date
  const handleBatchMarkAllHadir = (classId: string, date: string) => {
    const classStudents = students.filter((s) => s.classId === classId);
    setAttendance((prev) => {
      const recordsMap = new Map<string, AttendanceRecord>();
      // Keep existing non-matching records
      prev.forEach((r) => {
        if (!(r.classId === classId && r.date === date)) {
          recordsMap.set(r.id, r);
        }
      });

      // Insert all students as hadir
      classStudents.forEach((student) => {
        const id = `att-${student.id}-${date}`;
        recordsMap.set(id, {
          id,
          classId,
          studentId: student.id,
          date,
          status: 'hadir',
          notes: '',
        });
      });

      return Array.from(recordsMap.values());
    });
    showToast(`Semua ${classStudents.length} siswa berhasil ditandai Hadir.`);
  };

  // Reset class date records
  const handleResetClassDate = (classId: string, date: string) => {
    setAttendance((prev) =>
      prev.filter((r) => !(r.classId === classId && r.date === date))
    );
    showToast('Presensi hari ini telah diatur ulang.');
  };

  // Class Management
  const handleAddClass = (newClassData: Omit<ClassRoom, 'id'>) => {
    const newId = `c-${Date.now().toString(36)}`;
    const newClass: ClassRoom = {
      ...newClassData,
      id: newId,
    };
    setClasses((prev) => [...prev, newClass]);
    setSelectedClassId(newId);
    showToast(`Kelas ${newClass.name} berhasil ditambahkan.`);
  };

  const handleUpdateClass = (updatedClass: ClassRoom) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === updatedClass.id ? updatedClass : c))
    );
    showToast(`Data kelas ${updatedClass.name} diperbarui.`);
  };

  const handleDeleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
    setStudents((prev) => prev.filter((s) => s.classId !== classId));
    setAttendance((prev) => prev.filter((a) => a.classId !== classId));
    const remaining = classes.filter((c) => c.id !== classId);
    if (remaining.length > 0) {
      setSelectedClassId(remaining[0].id);
    }
    showToast('Kelas dan seluruh data siswa terkait berhasil dihapus.');
  };

  // Student Management
  const handleAddStudent = (newStudentData: Omit<Student, 'id'>) => {
    const newId = `s-${Date.now().toString(36)}`;
    const newStudent: Student = {
      ...newStudentData,
      id: newId,
    };
    setStudents((prev) => [...prev, newStudent]);
    showToast(`Siswa ${newStudent.name} berhasil ditambahkan.`);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    showToast(`Data siswa ${updatedStudent.name} diperbarui.`);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setAttendance((prev) => prev.filter((a) => a.studentId !== studentId));
    showToast('Siswa berhasil dihapus dari sistem.');
  };

  const handleBatchImportStudents = (
    classId: string,
    importedStudents: ParsedStudentRow[],
    replaceExisting: boolean
  ) => {
    const targetClass = classes.find((c) => c.id === classId);
    const newStudentObjects: Student[] = importedStudents.map((row, idx) => ({
      ...row,
      id: `s-${Date.now().toString(36)}-${idx}`,
      classId,
    }));

    setStudents((prev) => {
      let filtered = prev;
      if (replaceExisting) {
        filtered = prev.filter((s) => s.classId !== classId);
      }
      return [...filtered, ...newStudentObjects];
    });

    showToast(
      `Berhasil mengimpor ${newStudentObjects.length} siswa ke ${targetClass?.name || 'kelas'}.`
    );
  };

  // School Profile Management
  const handleUpdateSchoolProfile = (newProfile: SchoolProfile) => {
    setSchoolProfile(newProfile);
    showToast('Profil sekolah dan kop surat berhasil disimpan.');
  };

  // Backup & Restore
  const handleExportBackup = () => {
    exportBackupJSON({
      classes,
      students,
      attendance,
      profile: schoolProfile,
    });
    showToast('Berkas cadangan JSON berhasil diunduh.');
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.classes && parsed.students && parsed.attendance && parsed.profile) {
          setClasses(parsed.classes);
          setStudents(parsed.students);
          setAttendance(parsed.attendance);
          setSchoolProfile(parsed.profile);
          if (parsed.classes.length > 0) {
            setSelectedClassId(parsed.classes[0].id);
          }
          showToast('Data berhasil dipulihkan dari cadangan!');
        } else {
          showToast('Format berkas JSON cadangan tidak valid.');
        }
      } catch (err) {
        console.error(err);
        showToast('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleResetDemo = () => {
    const fresh = resetToDemoData();
    setClasses(fresh.classes);
    setStudents(fresh.students);
    setAttendance(fresh.attendance);
    setSchoolProfile(fresh.profile);
    if (fresh.classes.length > 0) {
      setSelectedClassId(fresh.classes[0].id);
    }
    showToast('Data berhasil diatur ulang ke data demo bawaan.');
  };

  // Open modals
  const handleOpenWaModal = (
    student: Student,
    dateStr: string,
    status: AttendanceStatus,
    notes?: string
  ) => {
    setWaStudent(student);
    setWaDate(dateStr);
    setWaStatus(status);
    setWaNotes(notes);
    setWaModalOpen(true);
  };

  const handleOpenPrintModal = (year?: number, monthIndex?: number) => {
    if (year !== undefined && monthIndex !== undefined) {
      setPrintYear(year);
      setPrintMonth(monthIndex);
    } else {
      setPrintYear(new Date().getFullYear());
      setPrintMonth(new Date().getMonth());
    }
    setPrintModalOpen(true);
  };

  if (!dataLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-3" />
          <p className="text-xs font-medium text-slate-500">Memuat data presensi siswa...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show the comprehensive Login Screen
  if (!currentSession) {
    return (
      <div className="min-h-screen bg-slate-900 font-sans">
        <LoginView
          classes={classes}
          students={students}
          schoolProfile={schoolProfile}
          onLogin={handleLogin}
        />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const activeClassStudents = students.filter((s) => s.classId === activeClass?.id);

  // Unread alerts count for today's sidebar badge
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAlpaCount = attendance.filter(
    (a) => a.date === todayStr && a.status === 'alpa'
  ).length;

  // For Student Role
  const loggedStudent =
    students.find((s) => s.id === currentSession.studentId) ||
    students.find((s) => s.nis === currentSession.username.replace('siswa_', '')) ||
    students[0];
  const studentClass = classes.find((c) => c.id === loggedStudent?.classId) || classes[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedClassId={selectedClassId}
        setSelectedClassId={setSelectedClassId}
        classes={classes}
        schoolProfile={schoolProfile}
        currentSession={currentSession}
        onOpenPrintModal={() => handleOpenPrintModal()}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Body */}
      {currentSession.role === 'siswa' ? (
        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {loggedStudent && studentClass ? (
            <StudentPortalView
              student={loggedStudent}
              classroom={studentClass}
              attendance={attendance}
              schoolProfile={schoolProfile}
              onLogout={handleLogout}
            />
          ) : (
            <div className="text-center py-12 rounded-xl bg-white border border-slate-200">
              <p className="text-sm text-slate-500">Data siswa tidak ditemukan.</p>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Ganti Akun Siswa
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1">
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            unreadAlertsCount={todayAlpaCount}
            userRole={currentSession.role}
            currentSession={currentSession}
            onLogout={handleLogout}
          />

          <main className="flex-1 p-6 md:p-8 max-w-7xl">
            {currentTab === 'dashboard' && (
              <DashboardView
                classes={classes}
                students={students}
                attendance={attendance}
                schoolProfile={schoolProfile}
                selectedClassId={selectedClassId}
                setSelectedClassId={setSelectedClassId}
                assignedClassId={currentSession.role === 'walikelas' ? currentSession.classId : undefined}
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenWaModal={handleOpenWaModal}
              />
            )}

            {currentTab === 'daily' && (
              <DailyAttendanceView
                classes={classes}
                students={students}
                attendance={attendance}
                selectedClassId={selectedClassId}
                setSelectedClassId={setSelectedClassId}
                onUpdateAttendance={handleUpdateAttendance}
                onBatchMarkAllHadir={handleBatchMarkAllHadir}
                onResetClassDate={handleResetClassDate}
                onOpenWaModal={handleOpenWaModal}
                assignedClassId={currentSession.role === 'walikelas' ? currentSession.classId : undefined}
                userRole={currentSession.role}
              />
            )}

            {currentTab === 'monthly' && (
              <MonthlyRecapView
                classes={classes}
                students={students}
                attendance={attendance}
                schoolProfile={schoolProfile}
                selectedClassId={selectedClassId}
                setSelectedClassId={setSelectedClassId}
                onOpenPrintModal={handleOpenPrintModal}
                assignedClassId={currentSession.role === 'walikelas' ? currentSession.classId : undefined}
                userRole={currentSession.role}
              />
            )}

            {currentTab === 'students' && (
              <ClassStudentManagementView
                classes={classes}
                students={students}
                selectedClassId={selectedClassId}
                setSelectedClassId={setSelectedClassId}
                onAddClass={handleAddClass}
                onUpdateClass={handleUpdateClass}
                onDeleteClass={handleDeleteClass}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
                onImportBatchStudents={handleBatchImportStudents}
                assignedClassId={currentSession.role === 'walikelas' ? currentSession.classId : undefined}
                userRole={currentSession.role}
              />
            )}

            {currentTab === 'settings' && currentSession.role === 'admin' && (
              <SettingsView
                schoolProfile={schoolProfile}
                onUpdateSchoolProfile={handleUpdateSchoolProfile}
                onExportBackup={handleExportBackup}
                onImportBackup={handleImportBackup}
                onResetDemo={handleResetDemo}
              />
            )}
          </main>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}

      {/* WhatsApp Modal */}
      <QuickWaModal
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        student={waStudent}
        dateStr={waDate}
        status={waStatus}
        notes={waNotes}
        schoolProfile={schoolProfile}
      />

      {/* Official Print Report Modal */}
      {activeClass && (
        <PrintReportModal
          isOpen={printModalOpen}
          onClose={() => setPrintModalOpen(false)}
          classroom={activeClass}
          students={activeClassStudents}
          attendance={attendance}
          schoolProfile={schoolProfile}
          year={printYear}
          monthIndex={printMonth}
        />
      )}

      {/* 3 Hak Akses Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        classes={classes}
        students={students}
        schoolProfile={schoolProfile}
        onLogin={handleLogin}
        currentSession={currentSession}
      />
    </div>
  );
}
