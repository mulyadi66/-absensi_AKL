import { ClassRoom, Student, AttendanceRecord, SchoolProfile } from '../types';

export const initialSchoolProfile: SchoolProfile = {
  name: 'SMP NEGERI 1 MERDEKA NUSANTARA',
  npsn: '20108942',
  address: 'Jl. Pemuda No. 128, RT 04/RW 02, Menteng',
  city: 'Jakarta Pusat',
  province: 'DKI Jakarta',
  headmaster: 'Drs. H. Mulyadi Kartodipuro, M.Pd.',
  headmasterNip: '19750812 199903 1 004',
  letterheadSubtitle: 'PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA\nDINAS PENDIDIKAN DAN KEBUDAYAAN',
};

export const initialClasses: ClassRoom[] = [
  {
    id: 'c-7a',
    name: 'Kelas VII-A',
    grade: '7',
    academicYear: '2024/2025',
    homeroomTeacher: 'Siti Rahmawati, S.Pd.',
    homeroomTeacherNip: '19830514 200801 2 011',
  },
  {
    id: 'c-7b',
    name: 'Kelas VII-B',
    grade: '7',
    academicYear: '2024/2025',
    homeroomTeacher: 'Ahmad Fauzi, S.Si.',
    homeroomTeacherNip: '19870921 201102 1 008',
  },
  {
    id: 'c-8a',
    name: 'Kelas VIII-A',
    grade: '8',
    academicYear: '2024/2025',
    homeroomTeacher: 'Dewi Lestari, M.Pd.',
    homeroomTeacherNip: '19810203 200604 2 007',
  },
];

export const initialStudents: Student[] = [
  // Kelas VII-A
  {
    id: 's-7a-01',
    classId: 'c-7a',
    nis: '24701',
    name: 'Aditya Pratama Putra',
    gender: 'L',
    parentName: 'Bambang Pratama',
    parentPhone: '081234567890',
  },
  {
    id: 's-7a-02',
    classId: 'c-7a',
    nis: '24702',
    name: 'Aisyah Putri Azzahra',
    gender: 'P',
    parentName: 'Rahmat Hidayat',
    parentPhone: '081298765432',
  },
  {
    id: 's-7a-03',
    classId: 'c-7a',
    nis: '24703',
    name: 'Bima Satria Wijaya',
    gender: 'L',
    parentName: 'Hendro Wijaya',
    parentPhone: '082145678912',
  },
  {
    id: 's-7a-04',
    classId: 'c-7a',
    nis: '24704',
    name: 'Cantika Dewi Maharani',
    gender: 'P',
    parentName: 'Agus Santoso',
    parentPhone: '085712345678',
  },
  {
    id: 's-7a-05',
    classId: 'c-7a',
    nis: '24705',
    name: 'Daffa Rizky Ramadhan',
    gender: 'L',
    parentName: 'Ir. Rudi Hartono',
    parentPhone: '081398761234',
  },
  {
    id: 's-7a-06',
    classId: 'c-7a',
    nis: '24706',
    name: 'Farhan Maulana Malik',
    gender: 'L',
    parentName: 'Drs. Supardi',
    parentPhone: '081223344556',
  },
  {
    id: 's-7a-07',
    classId: 'c-7a',
    nis: '24707',
    name: 'Gita Kirana Salsabila',
    gender: 'P',
    parentName: 'H. Anwar Ibrahim',
    parentPhone: '081567890123',
  },
  {
    id: 's-7a-08',
    classId: 'c-7a',
    nis: '24708',
    name: 'Hafiz Al-Ghifari',
    gender: 'L',
    parentName: 'Syamsul Bahri',
    parentPhone: '085234567891',
  },
  {
    id: 's-7a-09',
    classId: 'c-7a',
    nis: '24709',
    name: 'Indah Permatasari',
    gender: 'P',
    parentName: 'Joko Susilo',
    parentPhone: '081987654321',
  },
  {
    id: 's-7a-10',
    classId: 'c-7a',
    nis: '24710',
    name: 'Kaysan Rafif Danendra',
    gender: 'L',
    parentName: 'Eko Prasetyo',
    parentPhone: '081234567801',
  },
  {
    id: 's-7a-11',
    classId: 'c-7a',
    nis: '24711',
    name: 'Lathifah Nur Aini',
    gender: 'P',
    parentName: 'Muhamad Mansyur',
    parentPhone: '082212345678',
  },
  {
    id: 's-7a-12',
    classId: 'c-7a',
    nis: '24712',
    name: 'Muhammad Fadhil Akbar',
    gender: 'L',
    parentName: 'Kusworo',
    parentPhone: '081377889900',
  },
  {
    id: 's-7a-13',
    classId: 'c-7a',
    nis: '24713',
    name: 'Nabila Zahra Syahida',
    gender: 'P',
    parentName: 'Taufiq Ismail',
    parentPhone: '085811223344',
  },
  {
    id: 's-7a-14',
    classId: 'c-7a',
    nis: '24714',
    name: 'Rafi Arya Pangestu',
    gender: 'L',
    parentName: 'Gunawan Wibisono',
    parentPhone: '081255443322',
  },
  {
    id: 's-7a-15',
    classId: 'c-7a',
    nis: '24715',
    name: 'Zahra Amelia Putri',
    gender: 'P',
    parentName: 'Yayan Sofyan',
    parentPhone: '087812349876',
  },

  // Kelas VII-B
  {
    id: 's-7b-01',
    classId: 'c-7b',
    nis: '24716',
    name: 'Aldi Bagus Wicaksono',
    gender: 'L',
    parentName: 'Bagus Setyadi',
    parentPhone: '081234000111',
  },
  {
    id: 's-7b-02',
    classId: 'c-7b',
    nis: '24717',
    name: 'Anindita Cahya Kusuma',
    gender: 'P',
    parentName: 'Kusuma Wardana',
    parentPhone: '081234000222',
  },
  {
    id: 's-7b-03',
    classId: 'c-7b',
    nis: '24718',
    name: 'Bayu Danuarta',
    gender: 'L',
    parentName: 'Danuarta S.',
    parentPhone: '081234000333',
  },
  {
    id: 's-7b-04',
    classId: 'c-7b',
    nis: '24719',
    name: 'Citra Kirana Dewinta',
    gender: 'P',
    parentName: 'Dewinta W.',
    parentPhone: '081234000444',
  },
  {
    id: 's-7b-05',
    classId: 'c-7b',
    nis: '24720',
    name: 'Dimas Anggara',
    gender: 'L',
    parentName: 'Anggara Murti',
    parentPhone: '081234000555',
  },

  // Kelas VIII-A
  {
    id: 's-8a-01',
    classId: 'c-8a',
    nis: '23801',
    name: 'Arga Putra Yudha',
    gender: 'L',
    parentName: 'Yudha Pratama',
    parentPhone: '081234999111',
  },
  {
    id: 's-8a-02',
    classId: 'c-8a',
    nis: '23802',
    name: 'Bella Safitri',
    gender: 'P',
    parentName: 'Heri Safitri',
    parentPhone: '081234999222',
  },
  {
    id: 's-8a-03',
    classId: 'c-8a',
    nis: '23803',
    name: 'Candra Kirana',
    gender: 'L',
    parentName: 'Surya Kirana',
    parentPhone: '081234999333',
  },
  {
    id: 's-8a-04',
    classId: 'c-8a',
    nis: '23804',
    name: 'Dinda Ayu Lestari',
    gender: 'P',
    parentName: 'Sujatmiko',
    parentPhone: '081234999444',
  },
  {
    id: 's-8a-05',
    classId: 'c-8a',
    nis: '23805',
    name: 'Erlangga Saputra',
    gender: 'L',
    parentName: 'Saputra Jaya',
    parentPhone: '081234999555',
  },
];

// Helper to generate seed attendance records for the current month
export function generateInitialAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed
  const currentDay = today.getDate();

  // Generate for days 1 to currentDay (excluding Sundays)
  for (let day = 1; day <= currentDay; day++) {
    const d = new Date(year, month, day);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0) continue; // Skip Sunday

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    initialStudents.forEach((student, index) => {
      let status: 'hadir' | 'sakit' | 'izin' | 'alpa' | 'terlambat' = 'hadir';
      let notes = '';

      const seed = (index * 7 + day * 13) % 100;
      if (seed === 12) {
        status = 'sakit';
        notes = 'Demam dan flu';
      } else if (seed === 27) {
        status = 'izin';
        notes = 'Acara keluarga';
      } else if (seed === 43) {
        status = 'alpa';
        notes = 'Tanpa keterangan';
      } else if (seed === 78) {
        status = 'terlambat';
        notes = 'Kendala transportasi 15 menit';
      }

      records.push({
        id: `att-${student.id}-${dateStr}`,
        classId: student.classId,
        studentId: student.id,
        date: dateStr,
        status,
        notes,
      });
    });
  }

  return records;
}
