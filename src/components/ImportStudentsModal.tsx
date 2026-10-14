import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  ClipboardPaste,
  Trash2,
} from 'lucide-react';
import { ClassRoom, Student } from '../types';
import {
  downloadStudentTemplateExcel,
  parseStudentsFromFile,
  parseStudentsFromRawText,
  ParsedStudentRow,
} from '../utils/storage';

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetClass: ClassRoom;
  onImportBatch: (
    classId: string,
    students: ParsedStudentRow[],
    replaceExisting: boolean
  ) => void;
}

export const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({
  isOpen,
  onClose,
  targetClass,
  onImportBatch,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [pasteText, setPasteText] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    try {
      const rows = await parseStudentsFromFile(file);
      setParsedRows(rows);
    } catch (err) {
      console.error('Error parsing file:', err);
      alert('Gagal membaca berkas. Pastikan format berkas Excel (.xlsx / .xls) atau CSV valid.');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  // Paste Text Parse Handler
  const handleParseText = () => {
    if (!pasteText.trim()) return;
    const rows = parseStudentsFromRawText(pasteText);
    setParsedRows(rows);
  };

  // Submit Handler
  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    onImportBatch(targetClass.id, parsedRows, replaceExisting);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Impor Data Siswa Sekaligus (Batch Import)
              </h3>
              <p className="text-xs text-slate-500">
                Target Kelas: <span className="font-semibold text-blue-700">{targetClass.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Top Options Tabs & Template Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Unggah File Excel/CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeTab === 'paste'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardPaste className="h-3.5 w-3.5" />
                <span>Salin & Tempel (Copy-Paste)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={downloadStudentTemplateExcel}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              <span>Unduh Format Template Excel</span>
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 hover:bg-blue-50/40 hover:border-blue-400 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-xs font-bold text-slate-800">
                  Klik untuk memilih file Excel (.xlsx, .xls) atau .CSV
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Kolom otomatis dikenali: NIS, Nama Lengkap, Jenis Kelamin (L/P), Nama Wali, No HP
                </span>
                {fileName && (
                  <div className="mt-3 flex items-center gap-1.5 rounded-md bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>File Terpilih: {fileName}</span>
                  </div>
                )}
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Tab 2: Copy Paste */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-700">
                Salin baris siswa langsung dari Microsoft Excel atau Google Sheets, lalu tempel di sini:
              </label>
              <textarea
                rows={5}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="24791	Budi Santoso	L	Santoso H.	081234567891&#10;24792	Dewi Anggraini	P	Rudy A.	081234567892"
                className="w-full rounded-lg border border-slate-200 p-3 text-xs font-mono text-slate-800 focus:border-blue-600 focus:outline-hidden"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParseText}
                  className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  Proses Teks & Periksa Data
                </button>
              </div>
            </div>
          )}

          {/* Preview Table of Parsed Students */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                    ✓
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">
                    Pratinjau Data: {parsedRows.length} Siswa Siap Diimpor
                  </h4>
                </div>

                {/* Import Option: Replace or Append */}
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                    className="rounded text-blue-600 cursor-pointer"
                  />
                  <span>Gantikan seluruh data siswa yang ada di kelas ini</span>
                </label>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="sticky top-0 bg-slate-100 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 w-8 text-center">No</th>
                      <th className="px-3 py-2 w-24">NIS</th>
                      <th className="px-3 py-2">Nama Siswa</th>
                      <th className="px-2 py-2 w-10 text-center">L/P</th>
                      <th className="px-3 py-2">Nama Wali</th>
                      <th className="px-3 py-2">No. HP</th>
                      <th className="px-2 py-2 w-8 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((st, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="px-3 py-1.5 text-center font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-1.5 font-mono font-medium text-slate-700">
                          {st.nis}
                        </td>
                        <td className="px-3 py-1.5 font-semibold text-slate-900">
                          {st.name}
                        </td>
                        <td className="px-2 py-1.5 text-center font-medium text-slate-600">
                          {st.gender}
                        </td>
                        <td className="px-3 py-1.5 text-slate-600">
                          {st.parentName}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-slate-600">
                          {st.parentPhone}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setParsedRows(parsedRows.filter((_, i) => i !== idx))
                            }
                            className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Hapus baris ini dari daftar impor"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {parsedRows.length === 0 && (
            <div className="rounded-lg bg-blue-50 p-3.5 border border-blue-200/60 text-xs text-blue-900 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Tips Impor Data Cepat:</p>
                <p className="mt-0.5 text-blue-800 leading-relaxed text-[11px]">
                  Anda dapat mengunduh <strong>Template Excel</strong> di atas, mengisinya dengan daftar siswa sekolah Anda, lalu mengunggahnya kembali. Atau, Anda bisa langsung meng-copy kolom dari Google Sheets dan menempelkannya di tab Salin & Tempel.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3.5">
          <div className="text-xs text-slate-500">
            {parsedRows.length > 0 ? (
              <span className="font-medium text-slate-700">
                {parsedRows.length} siswa akan ditambahkan ke {targetClass.name}
              </span>
            ) : (
              <span>Pilih file atau tempelkan data untuk memulai</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={parsedRows.length === 0}
              onClick={handleConfirmImport}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer ${
                parsedRows.length > 0
                  ? 'bg-blue-700 hover:bg-blue-800'
                  : 'bg-slate-300 cursor-not-allowed opacity-60'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Impor {parsedRows.length > 0 ? `${parsedRows.length} Siswa` : 'Data'} Sekarang</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
