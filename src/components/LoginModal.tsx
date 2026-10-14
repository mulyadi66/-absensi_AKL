import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  School,
  ArrowRight,
  Lock,
  User,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Zap,
  Info,
} from 'lucide-react';
import { ClassRoom, Student, UserSession, UserRole, SchoolProfile } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  classes: ClassRoom[];
  students: Student[];
  schoolProfile: SchoolProfile;
  onLogin: (session: UserSession) => void;
  currentSession: UserSession | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  classes,
  students,
  schoolProfile,
  onLogin,
  currentSession,
}) => {
  if (!isOpen) return null;

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
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
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
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
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
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
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
      if (onClose) onClose();
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
      if (onClose) onClose();
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
      if (onClose) onClose();
      return;
    }
  };

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
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <School className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {currentSession ? 'Ganti Akun Pengguna' : 'Masuk ke Sistem'}
              </h3>
              <p className="text-xs text-slate-300">
                Satu form login untuk 3 hak akses
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-blue-600" />
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
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Contoh: admin, wali_7a, atau 24701"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                autoFocus
              />
              {detected ? (
                <p className="mt-1.5 text-xs text-blue-700 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>{detected.label}</span>
                </p>
              ) : identifier.trim() ? (
                <p className="mt-1.5 text-xs text-slate-500">
                  Tekan Masuk untuk memverifikasi akun Anda.
                </p>
              ) : null}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-blue-600" />
                  Kata Sandi / PIN
                </label>
                <span className="text-[11px] text-slate-400">
                  Default: <span className="text-slate-600 font-mono">admin123 / 123456 / NIS</span>
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 shadow-sm transition-colors cursor-pointer text-sm"
            >
              <span>Masuk ke Sistem</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo 1-Click Buttons */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-2">
              <Zap className="h-3 w-3 text-amber-500" />
              Pilih Cepat Akun Demo (1-Klik):
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-emerald-600">Full Akses</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('walikelas', undefined, classes[0]?.id)}
                className="p-2 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1 text-xs font-bold text-blue-800">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Wali Kelas</span>
                </div>
                <div className="text-[10px] text-blue-600 truncate">{classes[0]?.name || 'VII-A'}</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('siswa', students[0]?.nis)}
                className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1 text-xs font-bold text-indigo-800">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Siswa</span>
                </div>
                <div className="text-[10px] text-indigo-600 truncate">NIS: {students[0]?.nis || '24701'}</div>
              </button>
            </div>
          </div>

          {/* Quick guide notes */}
          <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700 flex items-center gap-1">
              <Info className="h-3 w-3 text-blue-600" />
              <span>Panduan Akun:</span>
            </div>
            <div>&bull; <strong>Admin:</strong> username <code className="text-slate-800">admin</code></div>
            <div>&bull; <strong>Wali Kelas:</strong> username <code className="text-slate-800">wali_7a</code> atau nama guru</div>
            <div>&bull; <strong>Siswa:</strong> NIS siswa seperti <code className="text-slate-800">{students[0]?.nis || '24701'}</code></div>
          </div>
        </div>
      </div>
    </div>
  );
};
