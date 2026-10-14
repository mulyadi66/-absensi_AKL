import React from 'react';
import {
  Calendar,
  Printer,
  School,
  Sparkles,
  LogOut,
  ShieldCheck,
  UserCheck,
  GraduationCap,
} from 'lucide-react';
import { ClassRoom, SchoolProfile, UserSession } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  classes: ClassRoom[];
  schoolProfile: SchoolProfile;
  currentSession: UserSession;
  onOpenPrintModal: () => void;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  selectedClassId,
  setSelectedClassId,
  classes,
  schoolProfile,
  currentSession,
  onOpenPrintModal,
  onOpenLoginModal,
  onLogout,
}) => {
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const isWaliKelas = currentSession.role === 'walikelas';
  const isSiswa = currentSession.role === 'siswa';
  const isAdmin = currentSession.role === 'admin';

  // Role info styling
  const roleBadge = {
    admin: {
      label: 'Admin',
      icon: ShieldCheck,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    walikelas: {
      label: 'Wali Kelas',
      icon: UserCheck,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    siswa: {
      label: 'Siswa',
      icon: GraduationCap,
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
  }[currentSession.role];

  const RoleIcon = roleBadge.icon;

  return (
    <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-6 border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur-md">
      {/* Zone 1: Single Brand element */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-white shadow-xs">
          <School className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
            PresensiSiswa
          </span>
          <div className="text-[11px] text-slate-500 whitespace-nowrap">
            {schoolProfile.name}
          </div>
        </div>
      </div>

      {/* Zone 2: Navigation links / Quick Context Switcher */}
      <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-medium text-slate-700">{todayFormatted}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Tahun Ajaran 2024/2025</span>
        </div>

        {/* Quick Class Selector in Header (Only shown for Admin or locked to assigned for Wali Kelas) */}
        {!isSiswa && (
          <div className="flex items-center gap-2">
            <label htmlFor="nav-class-select" className="text-xs text-slate-500 font-medium">
              Kelas:
            </label>
            {isWaliKelas ? (
              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs">
                {classes.find((c) => c.id === currentSession.classId)?.name || 'Kelas Saya'}
              </span>
            ) : (
              <select
                id="nav-class-select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:border-blue-600 focus:outline-hidden cursor-pointer"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.homeroomTeacher})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Zone 3: Actions + User Profile Session Badge */}
      <div className="flex items-center gap-3 shrink-0">
        {!isSiswa && (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPrintModal}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>Cetak Rekap</span>
            </button>

            <button
              onClick={() => setCurrentTab('daily')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentTab === 'daily'
                  ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-xs'
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-200" />
              <span>Input Presensi</span>
            </button>
          </div>
        )}

        {/* User Session Pill & Switch Account / Logout Buttons */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-xs font-bold text-slate-900 max-w-[140px] truncate">
              {currentSession.displayName}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${isAdmin ? 'bg-blue-600' : isWaliKelas ? 'bg-emerald-600' : 'bg-indigo-600'}`}></span>
              {roleBadge.label}
            </span>
          </div>

          <button
            onClick={onOpenLoginModal}
            className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            title="Ganti hak akses pengguna"
          >
            <RoleIcon className="h-3.5 w-3.5 text-slate-600" />
            <span>Ganti Akun</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
            title="Keluar dari sistem"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-600" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
