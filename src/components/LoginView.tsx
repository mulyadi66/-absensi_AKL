import React, { useState, useId } from 'react';
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  School,
  ArrowRight,
  Lock,
  User,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { ClassRoom, Student, UserSession, UserRole, SchoolProfile } from '../types';

interface LoginViewProps {
  classes: ClassRoom[];
  students: Student[];
  schoolProfile: SchoolProfile;
  onLogin: (session: UserSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  classes,
  students,
  schoolProfile,
  onLogin,
}) => {
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Analyze identifier to detect role
  const detectRole = (input: string) => {
    const clean = input.trim().toLowerCase();
    if (!clean) return null;

    // 1. Admin check
    if (clean === 'admin' || clean === 'administrator' || clean.startsWith('admin_')) {
      return {
        role: 'admin' as UserRole,
        label: 'Administrator (Akses Penuh)',
        badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        icon: ShieldCheck,
      };
    }

    // 2. Student check by NIS
    const foundByNis = students.find((s) => s.nis.toLowerCase() === clean);
    if (foundByNis) {
      const cls = classes.find((c) => c.id === foundByNis.classId);
      return {
        role: 'siswa' as UserRole,
        label: `Siswa: ${foundByNis.name} (${cls?.name || 'Kelas'})`,
        badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
        icon: GraduationCap,
        student: foundByNis,
      };
    }

    // 3. Wali Kelas check by class code, teacher name, or NIP
    const foundClass = classes.find((c) => {
      const code = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const simpleName = c.name.toLowerCase();
      const teacher = c.homeroomTeacher.toLowerCase();
      const nip = (c.homeroomTeacherNip || '').replace(/[^0-9]/g, '');
      const cleanDigits = clean.replace(/[^0-9]/g, '');

      return (
        clean === `wali_${c.id.toLowerCase()}` ||
        clean === `wali_${code}` ||
        clean === `wali_${c.name.toLowerCase().replace(/\s+/g, '_')}` ||
        clean === code ||
        clean === 'walikelas' ||
        clean === 'guru' ||
        simpleName.includes(clean) ||
        (clean.length >= 3 && teacher.includes(clean)) ||
        (cleanDigits.length >= 6 && nip.includes(cleanDigits))
      );
    });

    if (foundClass) {
      return {
        role: 'walikelas' as UserRole,
        label: `Wali Kelas: ${foundClass.homeroomTeacher} (${foundClass.name})`,
        badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
        icon: UserCheck,
        classroom: foundClass,
      };
    }

    // 4. Student by name substring (if min 4 letters)
    if (clean.length >= 4) {
      const foundByName = students.find((s) => s.name.toLowerCase().includes(clean));
      if (foundByName) {
        const cls = classes.find((c) => c.id === foundByName.classId);
        return {
          role: 'siswa' as UserRole,
          label: `Siswa: ${foundByName.name} (${cls?.name || 'Kelas'})`,
          badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
          icon: GraduationCap,
          student: foundByName,
        };
      }
    }

    return null;
  };

  const detected = detectRole(identifier);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const clean = identifier.trim();
    if (!clean) {
      setErrorMessage('Silakan masukkan Username, Nama Wali Kelas, atau NIS Siswa.');
      return;
    }

    const roleInfo = detectRole(clean);

    if (!roleInfo) {
      setErrorMessage(
        `Akun "${clean}" tidak ditemukan. Gunakan "admin" untuk Administrator, nama/kode wali kelas (contoh: wali_7a), atau NIS siswa (contoh: ${
          students[0]?.nis || '24701'
        }).`
      );
      return;
    }

    if (roleInfo.role === 'admin') {
      onLogin({
        role: 'admin',
        username: 'admin',
        displayName: 'Administrator Sekolah',
      });
      return;
    }

    if (roleInfo.role === 'walikelas') {
      const targetClass = roleInfo.classroom || classes[0];
      onLogin({
        role: 'walikelas',
        username: `wali_${targetClass.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        displayName: targetClass.homeroomTeacher,
        classId: targetClass.id,
      });
      return;
    }

    if (roleInfo.role === 'siswa') {
      const targetStudent = roleInfo.student || students[0];
      onLogin({
        role: 'siswa',
        username: `siswa_${targetStudent.nis}`,
        displayName: targetStudent.name,
        classId: targetStudent.classId,
        studentId: targetStudent.id,
      });
      return;
    }
  };

  // Quick fill helper
  const handleQuickLogin = (role: UserRole, targetNis?: string, targetClassId?: string) => {
    setErrorMessage(null);
    if (role === 'admin') {
      setIdentifier('admin');
      setPassword('admin123');
      onLogin({
        role: 'admin',
        username: 'admin',
        displayName: 'Administrator Sekolah',
      });
    } else if (role === 'walikelas') {
      const target = classes.find((c) => c.id === targetClassId) || classes[0];
      const code = `wali_${target.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      setIdentifier(code);
      setPassword('123456');
      onLogin({
        role: 'walikelas',
        username: code,
        displayName: target.homeroomTeacher,
        classId: target.id,
      });
    } else if (role === 'siswa') {
      const target = students.find((s) => s.nis === targetNis) || students[0];
      setIdentifier(target.nis);
      setPassword(target.nis);
      onLogin({
        role: 'siswa',
        username: `siswa_${target.nis}`,
        displayName: target.name,
        classId: target.classId,
        studentId: target.id,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      {/* Header Branding */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/20">
            <School className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              {schoolProfile.name}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Sistem Presensi Digital & Rekap Absensi Terpadu
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Satu Pintu Masuk 3 Hak Akses</span>
        </div>
      </div>

      {/* Main Login Card (Single Unified Form) */}
      <div className="max-w-md mx-auto w-full my-auto py-8">
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
          {/* Card Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-3">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Masuk ke Sistem Presensi
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Satu form login untuk <strong>Admin</strong>, <strong>Wali Kelas</strong>, dan <strong>Siswa</strong>.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Identifier */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-blue-400" />
                  ID Pengguna / Username / NIS
                </label>
                {detected && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${detected.badgeColor}`}
                  >
                    <detected.icon className="h-3 w-3" />
                    <span>Terdeteksi</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Contoh: admin, wali_7a, atau 24701"
                  className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  autoFocus
                />
              </div>
              {/* Real-time detection feedback label */}
              {detected ? (
                <p className="mt-1.5 text-xs text-blue-300/90 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span>{detected.label}</span>
                </p>
              ) : identifier.trim() ? (
                <p className="mt-1.5 text-xs text-slate-400">
                  Tekan Masuk untuk memverifikasi akun Anda.
                </p>
              ) : null}
            </div>

            {/* Input Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-blue-400" />
                  Kata Sandi / PIN
                </label>
                <span className="text-[11px] text-slate-400">
                  Default: <span className="text-slate-300 font-mono">admin123 / 123456 / NIS</span>
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun"
                  className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-3.5 py-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 shadow-lg shadow-blue-600/30 transition-all cursor-pointer text-sm"
            >
              <span>Masuk ke Sistem</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo 1-Click Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-700/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-400" />
                Masuk Cepat 1-Klik (Uji Coba Hak Akses):
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="flex flex-col items-start p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-950/20 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 leading-tight group-hover:text-slate-300">
                  Full Akses Semua Data
                </span>
              </button>

              {/* Wali Kelas Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('walikelas', undefined, classes[0]?.id)}
                className="flex flex-col items-start p-2.5 rounded-xl bg-slate-900/90 border border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-950/20 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Wali Kelas</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 leading-tight group-hover:text-slate-300">
                  {classes[0]?.name || 'Kelas VII-A'}
                </span>
              </button>

              {/* Siswa Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('siswa', students[0]?.nis)}
                className="flex flex-col items-start p-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 hover:border-indigo-500/60 hover:bg-indigo-950/20 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Siswa</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 leading-tight group-hover:text-slate-300">
                  NIS: {students[0]?.nis || '24701'}
                </span>
              </button>
            </div>
          </div>

          {/* Access Rules Guide Accordion / Note */}
          <div className="mt-5 rounded-2xl bg-slate-900/60 border border-slate-700/60 p-3.5 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs">
              <Info className="h-3.5 w-3.5 text-blue-400" />
              <span>Panduan 3 Hak Akses Sistem:</span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-400 pl-4 list-disc">
              <li>
                <strong className="text-slate-300">Administrator:</strong> Ketik{' '}
                <code className="text-emerald-300 bg-slate-800 px-1 py-0.5 rounded">admin</code> —
                Kelola semua kelas, data siswa, input absensi, cetak laporan, & pengaturan.
              </li>
              <li>
                <strong className="text-slate-300">Wali Kelas:</strong> Ketik{' '}
                <code className="text-blue-300 bg-slate-800 px-1 py-0.5 rounded">wali_7a</code> atau nama guru —
                Hanya bisa mengelola dan melihat siswa di kelas binaannya.
              </li>
              <li>
                <strong className="text-slate-300">Siswa:</strong> Ketik NIS siswa (contoh:{' '}
                <code className="text-indigo-300 bg-slate-800 px-1 py-0.5 rounded">{students[0]?.nis || '24701'}</code>) —
                Hanya melihat rekapitulasi kehadiran dan catatan pribadinya.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-500 pt-4">
        &copy; {new Date().getFullYear()} {schoolProfile.name} &bull; NPSN: {schoolProfile.npsn} &bull; Sistem Presensi Terintegrasi
      </div>
    </div>
  );
};
