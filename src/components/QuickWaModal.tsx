import React, { useState } from 'react';
import { X, Send, Copy, Check, MessageSquare } from 'lucide-react';
import { Student, AttendanceStatus, SchoolProfile } from '../types';

interface QuickWaModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  dateStr: string;
  status: AttendanceStatus;
  notes?: string;
  schoolProfile: SchoolProfile;
}

export const QuickWaModal: React.FC<QuickWaModalProps> = ({
  isOpen,
  onClose,
  student,
  dateStr,
  status,
  notes,
  schoolProfile,
}) => {
  if (!isOpen || !student) return null;

  const [copied, setCopied] = useState(false);

  const statusLabel = {
    hadir: 'Hadir',
    sakit: 'Sakit',
    izin: 'Izin',
    alpa: 'Tidak Hadir (Alpa / Tanpa Keterangan)',
    terlambat: 'Terlambat Masuk Sekolah',
  }[status];

  const dateFormatted = new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const notesText = notes && notes.trim() !== '' ? `\nKeterangan: *${notes.trim()}*` : '';

  const defaultMessage = `Yth. Bapak/Ibu Wali dari *${student.name}*,\n\nKami dari *${schoolProfile.name}* menginformasikan bahwa ananda pada:\nHari/Tanggal: *${dateFormatted}*\nStatus Kehadiran: *${statusLabel}*${notesText}\n\nMohon konfirmasi atau hubungi wali kelas jika ada informasi yang perlu disampaikan. Terima kasih atas perhatian dan kerja samanya.`;

  const [messageText, setMessageText] = useState(defaultMessage);

  let cleanPhone = student.parentPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.substring(1);
  }

  const handleOpenWhatsApp = () => {
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Kirim Pemberitahuan WhatsApp
              </h3>
              <p className="text-xs text-slate-500">
                Pemberitahuan resmi kehadiran ke orang tua/wali murid
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/60">
            <div>
              <span className="text-slate-400">Nama Siswa:</span>
              <p className="font-semibold text-slate-800">{student.name}</p>
            </div>
            <div>
              <span className="text-slate-400">Wali & No. HP:</span>
              <p className="font-semibold text-slate-800">
                {student.parentName} ({student.parentPhone})
              </p>
            </div>
            <div>
              <span className="text-slate-400">Tanggal:</span>
              <p className="font-medium text-slate-700">{dateFormatted}</p>
            </div>
            <div>
              <span className="text-slate-400">Status Absensi:</span>
              <span className="inline-block font-semibold text-rose-600">
                {statusLabel}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Pratinjau Pesan (Dapat Disesuaikan):
            </label>
            <textarea
              rows={6}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden font-sans leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>Salin Teks</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Buka WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
