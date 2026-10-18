import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Search,
  ExternalLink,
  ShieldCheck,
  Building2,
  Users,
  DollarSign,
  ShoppingCart,
  Warehouse,
  ShoppingBag,
  Sliders
} from 'lucide-react';

interface SopItem {
  id: string;
  divisionId: string;
  divisionName: string;
  title: string;
  code: string;
  lastUpdated: string;
  role: string;
  steps: string[];
  keyRules: string[];
}

export const SopInfoCenterTab: React.FC = () => {
  const { theme } = useApp();
  const isLight = theme === 'light';

  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSopId, setActiveSopId] = useState<string | null>(null);

  // Baca divisi aktif jika diarahkan langsung dari klik "View SOP" kartu Home
  useEffect(() => {
    const directDivision = localStorage.getItem('jacs_sop_active_division');
    if (directDivision) {
      setSelectedDivision(directDivision);
      localStorage.removeItem('jacs_sop_active_division');
    }
  }, []);

  const divisionsList = [
    { id: 'ALL', name: 'Semua Divisi', icon: BookOpen, color: 'text-pink-400' },
    { id: 'master', name: 'Master Data', icon: Building2, color: 'text-cyan-400' },
    { id: 'executive', name: 'Executive & GM', icon: ShieldCheck, color: 'text-purple-400' },
    { id: 'hr', name: 'Human Resources', icon: Users, color: 'text-blue-400' },
    { id: 'finance', name: 'Finance & Akuntansi', icon: DollarSign, color: 'text-emerald-400' },
    { id: 'purchasing', name: 'Purchasing & PO', icon: ShoppingCart, color: 'text-amber-400' },
    { id: 'warehouse', name: 'Warehouse & Stok', icon: Warehouse, color: 'text-indigo-400' },
    { id: 'pos', name: 'Kasir & POS', icon: ShoppingBag, color: 'text-rose-400' },
  ];

  const sopDatabase: SopItem[] = [
    {
      id: 'SOP-POS-001',
      divisionId: 'pos',
      divisionName: 'Point of Sale (POS)',
      title: 'Prosedur Buka Kasir, Shift & Setoran Kas Tunai',
      code: 'SOP/POS/01/2026',
      lastUpdated: '18 Okt 2026',
      role: 'Kasir & Frontliner',
      steps: [
        'Pilih nomor terminal kasir aktif (Kasir 01 s/d 04) dan input PIN kasir (1234).',
        'Input modal kas awal (cash float) laci kasir dan verifikasi fisik uang pecahan.',
        'Lakukan transaksi pemindaian barcode produk dengan teliti pada setiap item.',
        'Saat pergantian shift, jalankan menu Tutup Shift, hitung total uang fisik di laci kasir, lalu cocokkan dengan rekonsiliasi sistem.'
      ],
      keyRules: [
        'Dilarang meninggalkan laci kasir dalam keadaan tidak terkunci saat istirahat.',
        'Pembatalan transaksi (Void) wajib menggunakan PIN otorisasi Supervisor / Store GM.',
        'Selisih kas fisik lebih/kurang di atas Rp 5.000 wajib dicatat di form berita acara kasir.'
      ]
    },
    {
      id: 'SOP-PUR-001',
      divisionId: 'purchasing',
      divisionName: 'Purchasing & Procurement',
      title: 'Alur Draf Purchase Request (PR) & Penerbitan Purchase Order (PO)',
      code: 'SOP/PUR/01/2026',
      lastUpdated: '18 Okt 2026',
      role: 'Purchasing Officer & Staff',
      steps: [
        'Periksa tab "Draf Permintaan / PR" untuk melihat item yang mencapai batas minimum stok (ROP).',
        'Lakukan seleksi vendor supplier terdaftar dengan penawaran harga modal dan termin pembayaran terbaik.',
        'Kirim draf PR ke antrean Approval Queue Manajerial (Store GM).',
        'Setelah disetujui (Status: APPROVED), klik tombol hijau "Proses PO" untuk menerbitkan faktur PO resmi.'
      ],
      keyRules: [
        'Dilarang memproses PO kepada vendor yang belum memiliki status aktif di Master Supplier.',
        'Nilai PO di atas Rp 10.000.000 wajib melampirkan minimal 2 dokumen penawaran harga perbandingan.'
      ]
    },
    {
      id: 'SOP-WRH-001',
      divisionId: 'warehouse',
      divisionName: 'Warehouse & Inventory',
      title: 'Penerimaan Fisik Barang (Goods Receipt) & Rekonsiliasi Stok',
      code: 'SOP/WRH/01/2026',
      lastUpdated: '18 Okt 2026',
      role: 'Warehouse Lead & Staff Gudang',
      steps: [
        'Cocokkan fisik barang kiriman supplier dengan Surat Jalan (DO) dan dokumen PO sistem.',
        'Periksa tanggal kadaluarsa (Expired Date) minimal 6 bulan sebelum batas konsumsi.',
        'Klik konfirmasi "Goods Receipt" di modul Gudang/Purchasing untuk menambah stok fisik secara otomatis.',
        'Tempatkan barang pada rak dan zonasi lokasi yang sesuai pada kartu master produk.'
      ],
      keyRules: [
        'Barang cacat atau kemasan rusak wajib langsung ditolak (Return to Vendor) sebelum penerimaan disahkan.',
        'Seluruh mutasi keluar/masuk wajib terdata idempoten di riwayat kartu stok gudang.'
      ]
    },
    {
      id: 'SOP-EXC-001',
      divisionId: 'executive',
      divisionName: 'Executive & Managerial',
      title: 'Otorisasi Persetujuan Pengadaan (Approval Queue) & Evaluasi KPI',
      code: 'SOP/EXC/01/2026',
      lastUpdated: '18 Okt 2026',
      role: 'Store General Manager & Direksi',
      steps: [
        'Buka modul Executive & Managerial menggunakan PIN otorisasi.',
        'Tinjau tab "Approval Queue" untuk memeriksa draf PR yang berstatus PENDING dari gudang/purchasing.',
        'Evaluasi margin laba kategori dan histori perputaran barang (Stock Turnover).',
        'Klik tombol "Setujui (Approve)" untuk merilis pengadaan atau "Tolak (Reject)" dengan menyertakan alasan.'
      ],
      keyRules: [
        'Persetujuan wajib mempertimbangkan posisi saldo kas tunai dan proyeksi kewajiban hutang usaha (AP).',
        'Review evaluasi margin per divisi wajib disahkan setiap hari Senin pada rapat koordinasi manajerial.'
      ]
    },
    {
      id: 'SOP-FIN-001',
      divisionId: 'finance',
      divisionName: 'Finance & Accounting',
      title: 'Rekonsiliasi Kas POS, Buku Hutang/Piutang & Arus Kas',
      code: 'SOP/FIN/01/2026',
      lastUpdated: '18 Okt 2026',
      role: 'Finance & Accounting Lead',
      steps: [
        'Lakukan audit fisik uang setoran kas kasir shift pagi dan shift malam.',
        'Validasi pencatatan hutang dagang (AP) atas dokumen Goods Receipt yang telah diverifikasi gudang.',
        'Catat seluruh beban operasional harian (listrik, air, gaji, perawatan) ke jurnal kas keluar.',
        'Susun laporan posisi kas bersih dan neraca laba-rugi periodik toko.'
      ],
      keyRules: [
        'Seluruh pengeluaran kas wajib disertai bukti kuitansi atau nota sah bertanda tangan.',
        'Penutupan buku kas harian wajib selesai sebelum pukul 23:59 WITA setiap hari kerja.'
      ]
    },
    {
      id: 'SOP-HR-001',
      divisionId: 'hr',
      divisionName: 'Human Resources',
      title: 'Manajemen Shift Kerja, Absensi, Cuti & Penggajian (Payroll)',
      code: 'SOP/HR/01/2026',
      lastUpdated: '18 Okt 2026',
      role: 'HR Lead & People Operations',
      steps: [
        'Kelola jadwal giliran kerja (shift) kasir dan tim staf toko secara merata.',
        'Validasi kehadiran log absensi harian, izin sakit, dan pengajuan cuti tahunan.',
        'Hitung kalkulasi komisi penjualan kasir (1% omzet POS) dan insentif lembur.',
        'Terbitkan slip gaji resmi ber-kop profil Khansa Swalayan pada periode tutup buku payroll.'
      ],
      keyRules: [
        'Data master karyawan wajib tersinkronisasi 100% dengan akun terminal kasir dan profil penanggung jawab modul.',
        'Pengajuan cuti wajib diajukan minimal 3 hari sebelum tanggal pelaksanaan (kecuali keadaan darurat).'
      ]
    },
    {
      id: 'SOP-MST-001',
      divisionId: 'master',
      divisionName: 'Master Data & Catalog',
      title: 'Pendaftaran Barcode Produk, Struktur Kategori & Harga Jual Bertingkat',
      code: 'SOP/MST/01/2026',
      lastUpdated: '18 Okt 2026',
      role: 'Master Data Officer',
      steps: [
        'Daftarkan produk baru dengan kode barcode EAN unik 13 digit atau serial SKU.',
        'Tetapkan kategori barang, brand manufaktur, dan lokasi rak pajang toko.',
        'Input HPP modal barang dan tentukan harga jual bertingkat (Retail, Grosir, Distributor).',
        'Tetapkan batas minimum stok aman (Reorder Point / ROP) untuk pemicu otomatis purchasing.'
      ],
      keyRules: [
        'Dilarang mendaftarkan kode barcode ganda untuk dua item produk yang berbeda.',
        'Setiap perubahan harga jual wajib melalui penyesuaian label barcode rak fisik sebelum kasir beroperasi.'
      ]
    }
  ];

  const filteredSops = sopDatabase.filter((sop) => {
    const matchDivision = selectedDivision === 'ALL' || sop.divisionId === selectedDivision;
    const matchSearch =
      sop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sop.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sop.divisionName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDivision && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Info Center */}
      <div
        className={`p-6 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#161b22] border-[#30363d]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_20px_rgba(0,242,254,0.25)] shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg tracking-tight">
                  Pusat Informasi &amp; Standar Operasional Prosedur (SOP)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  STANDARD OPERATING PROCEDURE
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Panduan baku alur kerja operasional 6 divisi ritel Khansa Swalayan, alur otorisasi manajerial, dan protokol kasir.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari SOP, divisi, atau kata kunci..."
                className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0d1117] border-gray-700 text-white'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Filter Divisi Tab Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1">
          {divisionsList.map((div) => {
            const Icon = div.icon;
            const isActive = selectedDivision === div.id;
            return (
              <button
                key={div.id}
                type="button"
                onClick={() => setSelectedDivision(div.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    : 'bg-[#0d1117] text-gray-400 hover:text-white border border-[#30363d]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : div.color}`} />
                <span>{div.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daftar Kartu SOP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSops.map((sop) => {
          const isExpanded = activeSopId === sop.id;
          return (
            <div
              key={sop.id}
              className={`p-5 rounded-2xl border transition-all ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#161b22] border-[#30363d]'
              }`}
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      {sop.code}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">{sop.divisionName}</span>
                  </div>
                  <h3 className="font-bold text-sm text-white mt-1.5 leading-snug">{sop.title}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400 py-3 border-b border-gray-800/60 font-mono">
                <div>
                  Peran Pelaksana: <span className="text-gray-200 font-sans font-semibold">{sop.role}</span>
                </div>
                <div className="text-right">
                  Revisi: <span className="text-cyan-400">{sop.lastUpdated}</span>
                </div>
              </div>

              {/* Tahapan Prosedur */}
              <div className="pt-3 space-y-2">
                <div className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Tahapan Pelaksanaan:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-gray-400 leading-relaxed">
                  {sop.steps.map((st, i) => (
                    <li key={i} className="pl-1">
                      <span className="text-gray-300">{st}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Aturan Kritis & Batasan */}
              <div className="mt-3 pt-3 border-t border-gray-800/60 space-y-1.5">
                <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Poin Kritis &amp; Larangan:</span>
                </div>
                <ul className="space-y-1 text-[11px] text-gray-400">
                  {sop.keyRules.map((kr, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{kr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSops.length === 0 && (
        <div className="text-center py-12 rounded-2xl border border-gray-800 bg-black/20 text-gray-400 text-xs">
          Tidak ditemukan dokumen SOP yang sesuai dengan pencarian atau divisi yang dipilih.
        </div>
      )}
    </div>
  );
};
