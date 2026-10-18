import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveNavModule } from '../../types';
import { QuickAuthModal } from '../auth/QuickAuthModal';
import { getReactiveNeonGlowStyle } from '../../utils/neonGlow';
import { DIVISIONS_TRANSLATIONS } from '../../utils/translations';
import {
  Users,
  Briefcase,
  CreditCard,
  ShoppingBag,
  Boxes,
  Store,
  X,
  Layers,
  CheckCircle2,
  ChevronRight,
  Info,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  BookOpen,
  Lock,
} from 'lucide-react';

interface RoleModuleData {
  id: string;
  order: string;
  title: string;
  subTitle: string;
  colorHex: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  summary: string;
  objectives: string[];
  sopSteps: { step: number; title: string; desc: string }[];
  targetNav: ActiveNavModule;
  sopCategory: string;
}

export const HomeModule: React.FC = () => {
  const { setActiveNav, businessProfile, currentLanguage, userRole } = useApp();
  const isEn = currentLanguage === 'en';
  const t = DIVISIONS_TRANSLATIONS[currentLanguage] || DIVISIONS_TRANSLATIONS.id;

  const [activeSopModal, setActiveSopModal] = useState<RoleModuleData | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingNav, setPendingNav] = useState<ActiveNavModule | null>(null);
  const [pendingNavTitle, setPendingNavTitle] = useState<string>('');

  const modulesList: RoleModuleData[] = [
    {
      id: 'executive',
      order: '01',
      title: isEn ? 'Executive & Management' : 'Eksekutif & Manajerial',
      subTitle: isEn ? 'KPIs, Gross Margin, Risk & Approval Queue' : 'KPI, Margin & Antrean Persetujuan',
      colorHex: '#8B5CF6',
      icon: Briefcase,
      summary: isEn
        ? 'Central command cockpit for real-time gross margin analytics, operational burn rates, and multi-tier approval authorizations.'
        : 'Pusat kendali eksekutif untuk analitik margin kotor, laju kas operasional, dan otoritas persetujuan bertingkat.',
      objectives: [
        isEn ? 'Audit live store EBITDA and gross profit margins' : 'Audit margin laba kotor dan performa EBITDA swalayan secara real-time',
        isEn ? 'Authorize urgent capital expenditure and restock requisitions' : 'Otorisasi pengajuan pembelian darurat dan restock barang modal',
        isEn ? 'Monitor cash conversion cycle & inventory turnover' : 'Pantau siklus konversi kas dan perputaran persediaan barang',
      ],
      sopSteps: [
        {
          step: 1,
          title: isEn ? 'Daily Telemetry Review' : 'Tinjauan Telemetri Harian',
          desc: isEn
            ? 'Inspect consolidated sales vs COGS variance before noon'
            : 'Periksa variansi penjualan konsolidasian terhadap HPP sebelum siang hari',
        },
        {
          step: 2,
          title: isEn ? 'Queue Processing' : 'Proses Antrean Persetujuan',
          desc: isEn
            ? 'Authorize or reject pending PRs over limit threshold'
            : 'Setujui atau tolak pengajuan pembelian (PR) yang melampaui batas toleransi',
        },
        {
          step: 3,
          title: isEn ? 'Cash Policy Audit' : 'Audit Kebijakan Kas',
          desc: isEn
            ? 'Verify cash-to-bank reconciliation alongside Finance Lead'
            : 'Verifikasi rekonsiliasi kas-ke-bank bersama Penanggung Jawab Keuangan',
        },
      ],
      targetNav: 'executive',
      sopCategory: 'EXECUTIVE',
    },
    {
      id: 'hr',
      order: '02',
      title: isEn ? 'HR & Personnel' : 'SDM & Personalia',
      subTitle: isEn ? 'Attendance, Payroll, Overtime & Leave Records' : 'Staf, Presensi & Cuti',
      colorHex: '#EC4899',
      icon: Users,
      summary: isEn
        ? 'Store personnel management, shift scheduling, verified attendance logs, and automatic payroll calculation.'
        : 'Pengelolaan staf swalayan, penjadwalan shift kerja, presensi terverifikasi, dan perhitungan gaji berkala.',
      objectives: [
        isEn ? 'Track cashier & floor staff biometric shift check-ins' : 'Rekam presensi shift tim kasir dan staf gudang/lantai toko',
        isEn ? 'Maintain compliant store staffing ratios across trading hours' : 'Jaga rasio jumlah staf aktif sesuai jam sibuk operasional toko',
        isEn ? 'Automate overtime calculations and net payroll disbursements' : 'Otomatisasi kalkulasi lembur dan pencairan gaji bersih staf',
      ],
      sopSteps: [
        {
          step: 1,
          title: isEn ? 'Shift Roster Audit' : 'Audit Jadwal Shift',
          desc: isEn
            ? 'Publish weekly shift schedules with balanced register coverage'
            : 'Terbitkan jadwal kerja mingguan dengan penempatan kasir yang seimbang',
        },
        {
          step: 2,
          title: isEn ? 'Timecard Validation' : 'Validasi Kartu Jam Kerja',
          desc: isEn
            ? 'Review biometric anomalies, late marks, and approved leaves'
            : 'Tinjau selisih presensi, keterlambatan, dan pengajuan cuti resmi',
        },
        {
          step: 3,
          title: isEn ? 'Payroll Run Verification' : 'Verifikasi Payroll Bulanan',
          desc: isEn
            ? 'Audit net payroll summaries before dispatching to Accounts Payable'
            : 'Audit rekapitulasi gaji bersih sebelum diteruskan ke Buku Hutang Usaha',
        },
      ],
      targetNav: 'hr',
      sopCategory: 'HR_PAYROLL',
    },
    {
      id: 'finance',
      order: '03',
      title: isEn ? 'Finance & Accounting' : 'Keuangan & Akuntansi',
      subTitle: isEn ? 'Cash Flow, AP/AR, Tax Ledger & General Journal' : 'Kas, AP/AR & Arus Kas',
      colorHex: '#10B981',
      icon: CreditCard,
      summary: isEn
        ? 'Real-time general ledger, supplier accounts payable aging, register cash reconciliation, and compliant financial statements.'
        : 'Buku besar akuntansi, analisis umur hutang pemasok, rekonsiliasi kas register, dan laporan keuangan komprehensif.',
      objectives: [
        isEn ? 'Reconcile daily point-of-sale cash drops with bank deposits' : 'Rekonsiliasi setoran kas harian kasir dengan mutasi rekening bank',
        isEn ? 'Manage supplier credit terms to protect store working capital' : 'Kelola jatuh tempo hutang supplier untuk mengamankan likuiditas toko',
        isEn ? 'Generate real-time P&L, Balance Sheet, and Trial Balance reports' : 'Sajikan laporan Laba Rugi, Neraca, dan Arus Kas secara otomatis',
      ],
      sopSteps: [
        {
          step: 1,
          title: isEn ? 'Register Cash Balancing' : 'Balancing Kas Register',
          desc: isEn
            ? 'Match POS terminal settlement slips against vault receipts'
            : 'Cocokkan bukti settlement POS dengan fisik kas di brankas toko',
        },
        {
          step: 2,
          title: isEn ? 'AP Due Review' : 'Tinjauan Hutang Jatuh Tempo',
          desc: isEn
            ? 'Prioritize supplier invoices reaching discount eligibility limits'
            : 'Prioritaskan pelunasan faktur supplier yang memiliki termin diskon',
        },
        {
          step: 3,
          title: isEn ? 'Trial Balance Audit' : 'Audit Neraca Saldo',
          desc: isEn
            ? 'Ensure all inventory valuation movements balance with general ledger'
            : 'Pastikan seluruh mutasi persediaan tercatat seimbang di buku besar',
        },
      ],
      targetNav: 'finance',
      sopCategory: 'FINANCE_ACCOUNTING',
    },
    {
      id: 'purchasing',
      order: '04',
      title: isEn ? 'Procurement & Purchasing' : 'Pengadaan Barang',
      subTitle: isEn ? 'Purchase Requests, Official POs & Vendor Terms' : 'Pengajuan, Pesanan Pembelian & Penerimaan Barang',
      colorHex: '#F59E0B',
      icon: ShoppingBag,
      summary: isEn
        ? 'Supplier contract management, purchase order generation, lead-time tracking, and automated restock workflows.'
        : 'Manajemen kontrak pemasok, penerbitan PO resmi, pemantauan waktu kirim, dan pengadaan barang restock.',
      objectives: [
        isEn ? 'Procure merchandise at optimal wholesale margins and discounts' : 'Dapatkan harga beli grosir terbaik dan termin pembayaran yang fleksibel',
        isEn ? 'Prevent stockouts by triggering auto-purchase recommendations' : 'Cegah kekosongan rak dengan rekomendasi restock berbasis kuota minimum',
        isEn ? 'Maintain vendor delivery punctuality and quality compliance' : 'Evaluasi ketepatan jadwal kirim serta kualitas barang dari mitra pemasok',
      ],
      sopSteps: [
        {
          step: 1,
          title: isEn ? 'Need Analysis' : 'Analisa Kebutuhan Restock',
          desc: isEn
            ? 'Review warehouse low-stock alerts and safety buffer thresholds'
            : 'Tinjau peringatan stok menipis dan batas aman persediaan barang',
        },
        {
          step: 2,
          title: isEn ? 'PO Issuance & Dispatch' : 'Penerbitan Dokumen PO',
          desc: isEn
            ? 'Generate official Purchase Order and forward to approved vendor'
            : 'Buat PO resmi setelah disetujui dan kirimkan ke pemasok terdaftar',
        },
        {
          step: 3,
          title: isEn ? 'Delivery Monitoring' : 'Monitoring Pengiriman',
          desc: isEn
            ? 'Track vendor fulfillment status and coordinate receiving dock'
            : 'Pantau status pengiriman vendor dan koordinasikan penerimaan gudang',
        },
      ],
      targetNav: 'purchasing',
      sopCategory: 'PURCHASING_PROCUREMENT',
    },
    {
      id: 'warehouse',
      order: '05',
      title: isEn ? 'Warehouse & Inventory' : 'Gudang & Inventori',
      subTitle: isEn ? 'Receiving, Multi-Location Stock & Stock Opname' : 'SKU, Mutasi & Stok Opname',
      colorHex: '#06B6D4',
      icon: Boxes,
      summary: isEn
        ? 'Goods receipt inspection, stock opname reconciliation, shelf replenishment, and loss prevention control.'
        : 'Pemeriksaan penerimaan barang, stok opname berkala, pengisian rak pajang, dan pencegahan selisih barang.',
      objectives: [
        isEn ? 'Execute accurate physical receiving against PO delivery orders' : 'Periksa fisik barang masuk sesuai Surat Jalan dan PO yang disetujui',
        isEn ? 'Conduct periodic rolling stock opname to maintain 99%+ accuracy' : 'Lakukan stok opname berkala demi menjaga akurasi stok fisik di atas 99%',
        isEn ? 'Manage product shelf placement and expiry date rotations (FEFO)' : 'Atur penataan rak dan rotasi masa kadaluwarsa (FEFO / First Expired First Out)',
      ],
      sopSteps: [
        {
          step: 1,
          title: isEn ? 'Inbound Inspection' : 'Pemeriksaan Barang Masuk',
          desc: isEn
            ? 'Verify batch codes, expiry dates, and seal integrity upon arrival'
            : 'Periksa kesesuaian fisik, tanggal kadaluwarsa, dan kondisi kemasan',
        },
        {
          step: 2,
          title: isEn ? 'Stock Opname Execution' : 'Pelaksanaan Stok Opname',
          desc: isEn
            ? 'Scan physical shelf inventory and log adjustment variance notes'
            : 'Pindai barcode barang di rak dan rekam selisih fisik ke sistem',
        },
        {
          step: 3,
          title: isEn ? 'Shelf Restock Transfer' : 'Transfer Pajangan Rak',
          desc: isEn
            ? 'Transfer verified backroom goods to active front retail shelves'
            : 'Pindahkan stok dari gudang penyimpanan ke rak etalase swalayan',
        },
      ],
      targetNav: 'warehouse',
      sopCategory: 'WAREHOUSE_INVENTORY',
    },
    {
      id: 'pos',
      order: '06',
      title: isEn ? 'Point of Sale (POS)' : 'Kasir & Penjualan (POS)',
      subTitle: isEn ? 'Fast Cashier, Barcode Scanning & Receipt Printing' : 'Transaksi Kasir & Cetak Struk Penjualan',
      colorHex: '#EF4444',
      icon: Store,
      summary: isEn
        ? 'High-throughput retail checkout, barcode scanner integration, split payments (Cash, QRIS, Debit), and digital receipting.'
        : 'Terminal transaksi kasir cepat, pemindaian barcode, multi-pembayaran (Tunai, QRIS, Transfer), dan pencetakan struk belanja.',
      objectives: [
        isEn ? 'Maintain sub-minute customer checkout speed at cashier counters' : 'Pertahankan kecepatan transaksi kasir di bawah satu menit per pelanggan',
        isEn ? 'Accept hybrid tenders: Cash, QRIS, Card, and Store Loyalty points' : 'Dukung berbagai metode bayar: Tunai, QRIS, Kartu Debit, dan Poin Member',
        isEn ? 'Print clear fiscal transaction receipts and update live inventory' : 'Cetak struk belanja resmi dan potong persediaan stok secara langsung',
      ],
      sopSteps: [
        {
          step: 1,
          title: isEn ? 'Shift Opening' : 'Buka Shift & Modal Kasir',
          desc: isEn
            ? 'Input starting cash drawer float and test receipt printer feed'
            : 'Masukkan modal uang kembalian dan uji fungsi printer struk kasir',
        },
        {
          step: 2,
          title: isEn ? 'Checkout Transaction' : 'Transaksi Penjualan',
          desc: isEn
            ? 'Scan items, apply wholesale discount rules, and confirm payment'
            : 'Pindai barcode barang, terapkan harga grosir/member, dan proses bayar',
        },
        {
          step: 3,
          title: isEn ? 'Shift Closing & X-Report' : 'Tutup Shift & Rekap Kas',
          desc: isEn
            ? 'Generate daily register summary and submit sealed cash pouch'
            : 'Cetak rekap kas harian dan serahkan setoran tunai ke bagian keuangan',
        },
      ],
      targetNav: 'pos',
      sopCategory: 'POS_CASHIER',
    },
  ];

  const handleCardClick = (targetNav: ActiveNavModule, title: string) => {
    if (targetNav === 'pos') {
      setActiveNav('pos');
      return;
    }

    if (userRole === 'admin') {
      setActiveNav(targetNav);
    } else {
      setPendingNav(targetNav);
      setPendingNavTitle(title);
      setAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    if (pendingNav) {
      setActiveNav(pendingNav);
    }
    setAuthModalOpen(false);
    setPendingNav(null);
  };

  const handleViewSop = (mod: RoleModuleData, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSopModal(mod);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner / Store Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 border border-slate-700/60 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                {isEn ? '6 Core Operational Divisions' : '6 Divisi Operasional Terpadu'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                {businessProfile.category || 'Ritel Modern & Multi-Industry'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {businessProfile.name || 'KHANSA SWALAYAN'}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {businessProfile.address || 'Jl. BERUA RAYA Komp Bumi Daya Indah, Daya, Makassar'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveNav('pos')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Store className="w-4 h-4" />
              <span>{isEn ? 'Open POS Cashier' : 'Buka Terminal Kasir'}</span>
            </button>
            <button
              onClick={() => setActiveNav('admin')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>{isEn ? 'Master SOP & Settings' : 'Super Admin & SOP'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid 6 Divisi Operasional */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modulesList.map((mod) => {
          const IconComponent = mod.icon;
          const isPos = mod.id === 'pos';
          const isLocked = !isPos && userRole !== 'admin';

          return (
            <div
              key={mod.id}
              onClick={() => handleCardClick(mod.targetNav, mod.title)}
              className="group relative flex flex-col justify-between rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 p-5 shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer overflow-hidden"
              style={getReactiveNeonGlowStyle(mod.colorHex)}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ backgroundColor: `${mod.colorHex}20`, color: mod.colorHex }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-300">DIVISI {mod.order}</span>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {mod.title}
                      </h3>
                    </div>
                  </div>

                  {isLocked ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <Lock className="w-3 h-3" />
                      {isEn ? 'LOCKED' : 'KUNCI'}
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-slate-400">#{mod.order}</span>
                  )}
                </div>

                <p className="text-xs font-medium text-slate-300">{mod.subTitle}</p>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{mod.summary}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => handleViewSop(mod, e)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors py-1.5 px-2.5 rounded-lg hover:bg-slate-800"
                >
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isEn ? 'View SOP' : 'Lihat SOP'}</span>
                </button>

                <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  <span>{isEn ? 'Open Module' : 'Buka Modul'}</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal SOP Preview */}
      {activeSopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${activeSopModal.colorHex}20`, color: activeSopModal.colorHex }}
                >
                  <activeSopModal.icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    SOP DIVISI {activeSopModal.order}
                  </span>
                  <h3 className="text-lg font-bold text-white">{activeSopModal.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setActiveSopModal(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {isEn ? 'Operational Objective' : 'Tujuan Utama Operasional'}
                </h4>
                <ul className="space-y-2">
                  {activeSopModal.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  {isEn ? 'Standard Operating Procedure (SOP) Flow' : 'Alur Standar Operasional Prosedur (SOP)'}
                </h4>
                <div className="space-y-3">
                  {activeSopModal.sopSteps.map((step) => (
                    <div
                      key={step.step}
                      className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {step.step}
                      </span>
                      <div>
                        <h5 className="text-sm font-semibold text-white">{step.title}</h5>
                        <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
              <button
                onClick={() => setActiveSopModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {isEn ? 'Close' : 'Tutup'}
              </button>

              <button
                onClick={() => {
                  const target = activeSopModal.targetNav;
                  const title = activeSopModal.title;
                  setActiveSopModal(null);
                  handleCardClick(target, title);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-lg shadow-indigo-950/40"
              >
                <span>{isEn ? 'Go to Module' : 'Buka Modul'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Auth Modal */}
      <QuickAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        title={isEn ? `Authorization Required` : `Otorisasi Dibutuhkan`}
        message={
          isEn
            ? `Enter PIN (1234) to access ${pendingNavTitle}`
            : `Masukkan PIN (1234) untuk mengakses ${pendingNavTitle}`
        }
      />
    </div>
  );
};