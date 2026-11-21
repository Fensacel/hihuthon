import type { Campus, MarketCategory, MarketOption } from "../types";

export interface MarketSeed {
  id: string;
  question: string;
  description: string;
  category: MarketCategory;
  campus: Campus | "All";
  options: MarketOption[];
  /** How long ago the market was created, in hours. */
  createdHoursAgo: number;
  /** Deadline relative to now, in hours (negative = already closed). */
  closesInHours: number;
  /** Relative popularity per option, used to generate realistic stakes. */
  weights: number[];
  /** Target total points staked in the seeded market. */
  pool: number;
  /** Winning option id when the outcome was already validated by an admin. */
  resolvedOptionId: string | null;
}

export const CATEGORY_OPTIONS: MarketCategory[] = [
  "Sports",
  "Campus Event",
  "Academic",
  "Community",
  "Fun",
];

export const CATEGORY_STYLES: Record<MarketCategory, string> = {
  Sports: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Campus Event": "bg-amber-50 text-amber-700 border-amber-200",
  Academic: "bg-sky-50 text-sky-700 border-sky-200",
  Community: "bg-brand-50 text-brand-700 border-brand-200",
  Fun: "bg-rose-50 text-rose-700 border-rose-200",
};

export function marketSeeds(): MarketSeed[] {
  return [
    {
      id: "m_futsal_cakrawala",
      question: "Siapa yang menang di Futsal Cakrawala Arena?",
      description:
        "Turnamen futsal antar prodi digelar Sabtu ini di lapangan Kemang. Prediksikan prodi yang membawa pulang trofi.",
      category: "Sports",
      campus: "All",
      options: [
        { id: "m_futsal_cakrawala_o1", label: "Teknik Informatika" },
        { id: "m_futsal_cakrawala_o2", label: "Manajemen" },
        { id: "m_futsal_cakrawala_o3", label: "Ilmu Komunikasi" },
        { id: "m_futsal_cakrawala_o4", label: "Sistem Informasi" },
      ],
      createdHoursAgo: 22,
      closesInHours: 30,
      weights: [3, 4, 2, 2],
      pool: 640,
      resolvedOptionId: null,
    },
    {
      id: "m_campusfest_100",
      question: "Apakah Campus Fest besok dihadiri lebih dari 100 orang?",
      description:
        "Campus Fest Kemang sudah dibuka sejak pagi. Pilih apakah jumlah pengunjung melewati 100 orang.",
      category: "Campus Event",
      campus: "Kemang",
      options: [
        { id: "m_campusfest_100_o1", label: "Ya, lebih dari 100 orang" },
        { id: "m_campusfest_100_o2", label: "Tidak, kurang dari 100 orang" },
      ],
      createdHoursAgo: 30,
      closesInHours: 18,
      weights: [7, 3],
      pool: 520,
      resolvedOptionId: null,
    },
    {
      id: "m_bizplan_2026",
      question: "Prodi mana yang memenangkan Kompetisi Business Plan 2026?",
      description:
        "Final Kompetisi Business Plan digelar Kamis depan. Empat prodi masuk babak akhir.",
      category: "Academic",
      campus: "All",
      options: [
        { id: "m_bizplan_2026_o1", label: "Bisnis Digital" },
        { id: "m_bizplan_2026_o2", label: "Manajemen" },
        { id: "m_bizplan_2026_o3", label: "Akuntansi" },
        { id: "m_bizplan_2026_o4", label: "Sistem Informasi" },
      ],
      createdHoursAgo: 12,
      closesInHours: 70,
      weights: [4, 3, 2, 2],
      pool: 430,
      resolvedOptionId: null,
    },
    {
      id: "m_kegiatan_minggu_ini",
      question: "Apakah ada kegiatan mahasiswa minggu ini di Kemang?",
      description:
        "Cek kalender komunitas: apakah minggu ini ada acara mahasiswa yang resmi terdaftar?",
      category: "Community",
      campus: "Kemang",
      options: [
        { id: "m_kegiatan_minggu_ini_o1", label: "Ya, ada" },
        { id: "m_kegiatan_minggu_ini_o2", label: "Tidak ada" },
      ],
      createdHoursAgo: 8,
      closesInHours: 40,
      weights: [6, 4],
      pool: 300,
      resolvedOptionId: null,
    },
    {
      id: "m_bem_ketua",
      question: "Siapa yang jadi Ketua BEM periode berikutnya?",
      description:
        "Pemilihan Ketua BEM memasuki tahap kampanye. Tiga kandidat sudah mendaftar.",
      category: "Community",
      campus: "All",
      options: [
        { id: "m_bem_ketua_o1", label: "Bagas Ananta" },
        { id: "m_bem_ketua_o2", label: "Dinda Larasati" },
        { id: "m_bem_ketua_o3", label: "Rania Pramesti" },
      ],
      createdHoursAgo: 40,
      closesInHours: 96,
      weights: [4, 3, 3],
      pool: 700,
      resolvedOptionId: null,
    },
    {
      id: "m_screening_hujan",
      question:
        "Akankah hujan menggagalkan screening film outdoor hari Jumat?",
      description:
        "Screening film outdoor di lapangan Kemang dimulai pukul 18.30. Pilih apakah hujan turun sebelum acara selesai.",
      category: "Fun",
      campus: "Kemang",
      options: [
        { id: "m_screening_hujan_o1", label: "Ya, diguyur hujan" },
        { id: "m_screening_hujan_o2", label: "Tidak, cerah sampai selesai" },
      ],
      createdHoursAgo: 6,
      closesInHours: 5,
      weights: [4, 6],
      pool: 260,
      resolvedOptionId: null,
    },
    {
      id: "m_demoday",
      question:
        "Berapa tim startup yang lolos Demo Day Inkubator Kampus?",
      description:
        "Inkubator kampus Sudirman menyeleksi 12 tim mahasiswa untuk tampil di Demo Day.",
      category: "Academic",
      campus: "Sudirman",
      options: [
        { id: "m_demoday_o1", label: "0 - 3 tim" },
        { id: "m_demoday_o2", label: "4 - 6 tim" },
        { id: "m_demoday_o3", label: "7 tim atau lebih" },
      ],
      createdHoursAgo: 14,
      closesInHours: 120,
      weights: [3, 5, 2],
      pool: 380,
      resolvedOptionId: null,
    },
    {
      id: "m_ml_turnamen",
      question: "Siapa juara e-sports Mobile Legends antar kampus?",
      description:
        "Turnamen Mobile Legends Kemang vs Sudirman berlangsung akhir pekan ini secara online.",
      category: "Sports",
      campus: "All",
      options: [
        { id: "m_ml_turnamen_o1", label: "Sudirman A" },
        { id: "m_ml_turnamen_o2", label: "Kemang A" },
        { id: "m_ml_turnamen_o3", label: "Tim Alumni" },
      ],
      createdHoursAgo: 10,
      closesInHours: 26,
      weights: [4, 4, 2],
      pool: 450,
      resolvedOptionId: null,
    },
    {
      id: "m_perpus_jam",
      question:
        "Apakah perpustakaan Sudirman buka sampai 22.00 akhir pekan ini?",
      description:
        "Jam operasional perpustakaan masih dalam pembahasan. Market ini sudah ditutup dan menunggu validasi admin.",
      category: "Community",
      campus: "Sudirman",
      options: [
        { id: "m_perpus_jam_o1", label: "Ya, buka sampai 22.00" },
        { id: "m_perpus_jam_o2", label: "Tidak, tutup seperti biasa" },
      ],
      createdHoursAgo: 60,
      closesInHours: -6,
      weights: [5, 5],
      pool: 210,
      resolvedOptionId: null,
    },
    {
      id: "m_basket_liga",
      question: "Apakah tim basket Kemang menang di Liga Kampus?",
      description:
        "Tim basket Kemang bertemu Sudirman di babak final Liga Kampus. Hasil sudah divalidasi admin.",
      category: "Sports",
      campus: "All",
      options: [
        { id: "m_basket_liga_o1", label: "Ya, Kemang menang" },
        { id: "m_basket_liga_o2", label: "Tidak, Sudirman menang" },
      ],
      createdHoursAgo: 96,
      closesInHours: -30,
      weights: [6, 4],
      pool: 480,
      resolvedOptionId: "m_basket_liga_o1",
    },
  ];
}
