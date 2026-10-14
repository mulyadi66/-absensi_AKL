import React from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  CalendarDays,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { UserRole, UserSession } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  unreadAlertsCount?: number;
  userRole?: UserRole;
  currentSession?: UserSession;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  unreadAlertsCount = 0,
  userRole = 'admin',
  currentSession,
  onLogout,
}) => {
  const isWaliKelas = userRole === 'walikelas';

  const menuItems = [
    {
      id: 'dashboard',
      label: isWaliKelas ? 'Dashboard Kelas Saya' : 'Dashboard Ringkasan',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'daily',
      label: isWaliKelas ? 'Input Absensi Kelas' : 'Input Absensi Harian',
      icon: CheckCircle2,
      badge: unreadAlertsCount > 0 ? `${unreadAlertsCount} Alpa` : null,
    },
    {
      id: 'monthly',
      label: 'Rekapitulasi Bulanan',
      icon: CalendarDays,
      badge: null,
    },
    {
      id: 'students',
      label: isWaliKelas ? 'Daftar Siswa Kelas' : 'Data Siswa & Kelas',
      icon: Users,
      badge: null,
    },
    ...(!isWaliKelas
      ? [
          {
            id: 'settings',
            label: 'Pengaturan & Backup',
            icon: Settings,
            badge: null,
          },
        ]
      : []),
  ];

  return (
    <aside className="no-print w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between py-5 px-3 min-h-[calc(100vh-61px)]">
      <div>
        <div className="px-3 mb-4">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
            {isWaliKelas ? 'Menu Wali Kelas' : 'Menu Utama'}
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? 'text-blue-700' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer: User identity & Logout Button */}
      <div className="pt-4 border-t border-slate-100 px-2 space-y-3">
        {currentSession && (
          <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className={`p-1.5 rounded-lg shrink-0 ${isWaliKelas ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                {isWaliKelas ? <UserCheck className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              </div>
              <div className="overflow-hidden leading-tight">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {currentSession.displayName}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {isWaliKelas ? 'Wali Kelas' : 'Administrator'}
                </p>
              </div>
            </div>
          </div>
        )}

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            title="Keluar dari sistem presensi"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar (Logout)</span>
          </button>
        )}

        <div className="rounded-lg bg-slate-50/60 p-2.5 border border-slate-200/60 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-0.5">
            <HelpCircle className="h-3 w-3 text-blue-600" />
            <span>{isWaliKelas ? 'Wewenang Guru' : 'Bantuan Cepat'}</span>
          </div>
          <p className="leading-snug">
            {isWaliKelas
              ? 'Data kelas dan presensi Anda tersimpan aman dan terisolasi.'
              : 'Gunakan ekspor Excel atau PDF untuk laporan berkala dinas/sekolah.'}
          </p>
        </div>
      </div>
    </aside>
  );
};
