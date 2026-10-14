import React, { useState } from 'react';
import {
  Building2,
  Download,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { SchoolProfile } from '../types';

interface SettingsViewProps {
  schoolProfile: SchoolProfile;
  onUpdateSchoolProfile: (profile: SchoolProfile) => void;
  onExportBackup: () => void;
  onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetDemo: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  schoolProfile,
  onUpdateSchoolProfile,
  onExportBackup,
  onImportBackup,
  onResetDemo,
}) => {
  const [profile, setProfile] = useState<SchoolProfile>(schoolProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Pengaturan Sekolah & Manajemen Data
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur informasi resmi sekolah untuk Kop Surat laporan PDF dan kelola pencadangan data sistem.
        </p>
      </div>

      {/* School Profile Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Profil Sekolah & Kop Surat Resmi
            </h2>
            <p className="text-xs text-slate-500">
              Informasi ini akan tercetak otomatis pada header dan lembar pengesahan tanda tangan PDF.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Header Kop Atas (Kementerian / Pemerintah Daerah):
            </label>
            <textarea
              rows={2}
              value={profile.letterheadSubtitle}
              onChange={(e) =>
                setProfile({ ...profile, letterheadSubtitle: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
              placeholder="PEMERINTAH DAERAH PROVINSI ...&#10;DINAS PENDIDIKAN"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Nama Resmi Sekolah:
              </label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                placeholder="SMP NEGERI 1 MERDEKA"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                NPSN (Nomor Pokok Sekolah Nasional):
              </label>
              <input
                type="text"
                required
                value={profile.npsn}
                onChange={(e) =>
                  setProfile({ ...profile, npsn: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-mono text-slate-800 focus:border-blue-600 focus:outline-hidden"
                placeholder="20108942"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Alamat Lengkap Sekolah:
            </label>
            <input
              type="text"
              required
              value={profile.address}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
              placeholder="Jl. Pemuda No. 128, Menteng"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Kota / Kabupaten Titimangsa:
              </label>
              <input
                type="text"
                required
                value={profile.city}
                onChange={(e) =>
                  setProfile({ ...profile, city: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
                placeholder="Jakarta Pusat"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Provinsi:
              </label>
              <input
                type="text"
                value={profile.province}
                onChange={(e) =>
                  setProfile({ ...profile, province: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
                placeholder="DKI Jakarta"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Nama Lengkap Kepala Sekolah:
              </label>
              <input
                type="text"
                required
                value={profile.headmaster}
                onChange={(e) =>
                  setProfile({ ...profile, headmaster: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                placeholder="Drs. H. Mulyadi Kartodipuro, M.Pd."
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                NIP Kepala Sekolah:
              </label>
              <input
                type="text"
                required
                value={profile.headmasterNip}
                onChange={(e) =>
                  setProfile({ ...profile, headmasterNip: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-mono text-slate-800 focus:border-blue-600 focus:outline-hidden"
                placeholder="19750812 199903 1 004"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {savedSuccess ? (
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Pengaturan berhasil disimpan!</span>
              </div>
            ) : <span />}

            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-800 shadow-xs transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Profil Sekolah</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup and Restore Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Cadangkan & Pulihkan Data (Backup & Restore)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Simpan salinan data presensi ke komputer Anda sebagai file JSON atau pulihkan data dari file cadangan sebelumnya.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Export JSON */}
          <div className="rounded-lg border border-slate-200 p-4 bg-slate-50 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800">Unduh Cadangan (Backup)</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Unduh seluruh data kelas, siswa, dan riwayat presensi dalam format JSON.
              </p>
            </div>
            <button
              type="button"
              onClick={onExportBackup}
              className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh File Cadangan</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="rounded-lg border border-slate-200 p-4 bg-slate-50 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800">Pulihkan Data (Restore)</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Unggah berkas JSON cadangan untuk memulihkan seluruh data yang tersimpan.
              </p>
            </div>
            <label className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors">
              <Upload className="h-3.5 w-3.5" />
              <span>Unggah File JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={onImportBackup}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset Demo Data */}
          <div className="rounded-lg border border-rose-200 p-4 bg-rose-50/40 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-rose-800 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Reset ke Data Demo</span>
              </h3>
              <p className="text-[11px] text-rose-600/80 mt-1">
                Mengembalikan data awal percontohan untuk demonstrasi dan uji coba.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3.5 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Data Demo</span>
            </button>
          </div>
        </div>

        {/* In-app Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Konfirmasi Reset Data
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      Apakah Anda yakin ingin mengatur ulang data ke data demo bawaan? Data presensi dan perubahan data siswa yang telah Anda masukkan akan diganti dengan data contoh awal.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50 px-5 py-3">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetConfirm(false);
                    onResetDemo();
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 shadow-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Ya, Reset Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
