import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveNavModule } from '../../types';
import { QuickAuthModal } from '../auth/QuickAuthModal';
import {
  Users,
  Briefcase,
  CreditCard,
  ShoppingBag,
  Boxes,
  Store,
  Layers,
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
  kpis: { label: string; target: string }[];
  targetNav: ActiveNavModule;
  sopCategory: string;
}

export const HomeModule: React.FC = () => {
  const {
    theme,
    language,
    setActiveNav,
    currentUser,
    setSopFilterCategory,
  } = useApp();

  const isLight = theme === 'light';
  const isEn = language === 'en';

  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingNav, setPendingNav] = useState<ActiveNavModule | null>(null);
  const [pendingNavTitle, setPendingNavTitle] = useState('');

  const modulesList: RoleModuleData[] = [
    {
      id: 'executive',
      order: '01',
      title: isEn ? 'Executive & Management' : 'Eksekutif & Manajerial',
      subTitle: isEn ? 'Governance, Strategic & Approvals' : 'Tata Kelola, Strategi & Approval',
      colorHex: '#38bdf8',
      icon: Briefcase,
      summary: isEn
        ? 'High-level business intelligence, strategic approval chains for PR/PO, and SLA monitoring.'
        : 'Pusat intelijen bisnis, rantai persetujuan (approval) PR/PO dan pengawasan kepatuhan SLA.',
      objectives: [
        isEn ? 'Executive approval authorization queue' : 'Otorisasi antrean persetujuan PR & PO bernilai besar',
        isEn ? 'Company health telemetry & SLA tracking' : 'Telemetri kesehatan perusahaan & kepatuhan SLA operasional',
        isEn ? 'Cross-division governance & risk audit' : 'Tata kelola lintas departemen dan mitigasi risiko usaha',
      ],
      kpis: [
        { label: 'SLA Rate', target: '99.5%' },
        { label: 'Approval Speed', target: '< 2 Jam' },
      ],
      targetNav: 'executive',
      sopCategory: 'MANAJERIAL',
    },
    {
      id: 'hr',
      order: '02',
      title: isEn ? 'HR & Workforce' : 'SDM & Personalia',
      subTitle: isEn ? 'Attendance, Shifts & Payroll' : 'Presensi, Shift & Penggajian',
      colorHex: '#ec4899',
      icon: Users,
      summary: isEn
        ? 'Workforce schedule, shift distribution, biometric attendance tracking, and leave approvals.'
        : 'Pengaturan jadwal kerja shift, absensi kehadiran, dan persetujuan cuti/sakit karyawan.',
      objectives: [
        isEn ? 'Shift scheduling & employee rosters' : 'Pengaturan jadwal kerja terdistribusi per shift',
        isEn ? 'Punctuality telemetry & leave tracking' : 'Pencatatan presensi kehadiran dan pengajuan cuti/sakit',
        isEn ? 'Payroll disbursement preparation' : 'Penyusunan komponen payroll & kompensasi karyawan',
      ],
      kpis: [
        { label: 'On-Time Presensi', target: '>= 95%' },
        { label: 'Shift Fulfillment', target: '100%' },
      ],
      targetNav: 'hr',
      sopCategory: 'SDM_HR',
    },
    {
      id: 'finance',
      order: '03',
      title: isEn ? 'Finance & Accounting' : 'Keuangan & Akuntansi',
      subTitle: isEn ? 'Cash Flow, AP/AR & Ledger' : 'Arus Kas, Buku Hutang & Jurnal',
      colorHex: '#10b981',
      icon: CreditCard,
      summary: isEn
        ? 'Realtime cash flow governance, accounts payable/receivable reconciliation, and ledger audit.'
        : 'Manajemen arus kas, rekonsiliasi buku hutang/piutang supplier, dan jurnal buku besar.',
      objectives: [
        isEn ? 'Accounts payable & vendor disbursements' : 'Buku hutang dagang (AP) & termin tempo vendor',
        isEn ? 'Operational expense budget tracking' : 'Kontrol realisasi anggaran biaya operasional (OPEX)',
        isEn ? 'Automated financial statements & audit' : 'Laporan laba rugi, arus kas, dan neraca keuangan',
      ],
      kpis: [
        { label: 'AP Accuracy', target: '100%' },
        { label: 'Cash Ratio', target: '>= 1.5x' },
      ],
      targetNav: 'finance',
      sopCategory: 'FINANCE',
    },
    {
      id: 'purchasing',
      order: '04',
      title: isEn ? 'Purchasing & Procurement' : 'Pengadaan & Pembelian',
      subTitle: isEn ? 'Vendors, PR, PO & Restock' : 'Vendor, PR, PO & Restok',
      colorHex: '#f59e0b',
      icon: ShoppingBag,
      summary: isEn
        ? 'End-to-end procurement pipeline: auto PR from low stock, vendor quotations, and PO issuance.'
        : 'Alur pengadaan terintegrasi: draf PR otomatis, negosiasi harga vendor, dan penerbitan PO.',
      objectives: [
        isEn ? 'Auto-generate PR from critical inventory' : 'Pembuatan draf PR otomatis dari batas minimum stok gudang',
        isEn ? 'Supplier price comparison & terms' : 'Katalog harga supplier & kepatuhan syarat termin bayar',
        isEn ? 'Official PO issuance upon approval' : 'Penerbitan PO resmi setelah disetujui Eksekutif',
      ],
      kpis: [
        { label: 'PO Fulfillment', target: '>= 98%' },
        { label: 'Cost Variance', target: '<= 1%' },
      ],
      targetNav: 'purchasing',
      sopCategory: 'PURCHASING',
    },
    {
      id: 'warehouse',
      order: '05',
      title: isEn ? 'Warehouse & Inventory' : 'Gudang & Inventori',
      subTitle: isEn ? 'Stock Ledger, GR & Mutations' : 'Kartu Stok, Penerimaan & Mutasi',
      colorHex: '#8b5cf6',
      icon: Boxes,
      summary: isEn
        ? 'Perpetual stock ledger, Goods Receipt against PO, stock opname audits, and internal transfers.'
        : 'Buku kartu stok perpetual, penerimaan barang PO (Goods Receipt), opname, dan mutasi fisik.',
      objectives: [
        isEn ? 'Goods receipt & physical quantity check' : 'Verifikasi fisik barang datang sesuai Surat Jalan & PO',
        isEn ? 'Perpetual moving average stock ledger' : 'Sinkronisasi kartu stok & pembaharuan HPP otomatis',
        isEn ? 'Stock opname variance reconciliation' : 'Stock opname berkala & pelaporan bad stock / karantina',
      ],
      kpis: [
        { label: 'Stock Accuracy', target: '>= 99%' },
        { label: 'Zero Discrepancy', target: 'Target Max 0.1%' },
      ],
      targetNav: 'warehouse',
      sopCategory: 'GUDANG',
    },
    {
      id: 'pos',
      order: '06',
      title: isEn ? 'Point of Sale (POS)' : 'Kasir & Penjualan (POS)',
      subTitle: isEn ? 'Checkout, Barcode & Shift Balance' : 'Kasir Cepat, Barcode & Tutup Kasir',
      colorHex: '#06b6d4',
      icon: Store,
      summary: isEn
        ? 'High-speed barcode scanning checkout, multi-payment tenders, shift cash settlement, and sales returns.'
        : 'Transaksi kasir kilat dengan barcode, ragam metode pembayaran, rekap kas kasir, dan retur jual.',
      objectives: [
        isEn ? 'Fast barcode scanning & multi-tier pricing' : 'Scan barcode kilat & skema harga grosir / bertingkat',
        isEn ? 'Shift opening, cash drop & day-end balance' : 'Buka modal, setoran kas tengah hari, dan tutup shift kasir',
        isEn ? 'Sales return validation against receipt' : 'Validasi retur konsumen dengan referensi struk asli',
      ],
      kpis: [
        { label: 'Checkout Speed', target: '< 45 Detik' },
        { label: 'Cash Variance', target: 'Rp 0 (Nihil)' },
      ],
      targetNav: 'pos',
      sopCategory: 'KASIR_POS',
    },
  ];

  const handleNavigateWithAuth = (nav: ActiveNavModule, title: string) => {
    if (nav === 'admin' && currentUser?.role !== 'Super Admin') {
      setPendingNav('admin');
      setPendingNavTitle(title);
      setAuthModalOpen(true);
      return;
    }
    setActiveNav(nav);
  };

  const handleOpenSop = (category: string) => {
    setSopFilterCategory(category);
    setActiveNav('admin');
  };

  return (
    <div id="home-module-container" className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Brand Header: KHANSA SWALAYAN */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition duration-200 ${
          isLight
            ? 'bg-gradient-to-br from-white via-slate-50 to-blue-50/40 border-slate-200 shadow-sm'
            : 'bg-gradient-to-br from-[#161b22] via-[#0d1117] to-[#1a1f2c] border-[#30363d]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>JacS RetailOS ERP Enterprise • Multi-Industry</span>
            </div>

            <div>
              <h1
                className={`text-2xl sm:text-4xl font-black tracking-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                KHANSA SWALAYAN
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                Jl. BERUA RAYA • Pusat Operasional Ritel Swalayan & Pergudangan Terpadu
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
                ✓ 492 Master SKU Aktif
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold">
                ✓ Moving Average HPP Sync
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 font-mono text-[11px] font-bold">
                ✓ Executive PO Approval
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveNav('pos')}
              className="px-5 py-3 rounded-2xl bg-[#0052FF] hover:bg-[#0043d1] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition cursor-pointer active:scale-95"
            >
              <Store className="w-4 h-4" />
              <span>Buka Terminal Kasir</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavigateWithAuth('admin', 'Super Admin')}
              className={`px-4 py-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                isLight
                  ? 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                  : 'border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Super Admin & SOP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid 6 Divisi Operasional */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            <h2 className={`font-black text-sm uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              6 Divisi Inti Operasional Swalayan
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Klik kartu untuk buka modul atau panduan SOP
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modulesList.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                onMouseEnter={() => setHoveredCardId(m.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                className={`p-5 rounded-2xl border transition duration-200 flex flex-col justify-between ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-blue-400 shadow-sm'
                    : 'bg-[#161b22] border-[#30363d] hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-black text-slate-400">{m.order}</span>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${m.colorHex}20`, color: m.colorHex }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {m.title}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">{m.subTitle}</p>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                    {m.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenSop(m.sopCategory)}
                    className="text-[11px] font-bold text-slate-500 hover:text-blue-500 flex items-center gap-1 transition cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>View SOP &gt;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigateWithAuth(m.targetNav, m.title)}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    style={{ backgroundColor: m.colorHex }}
                  >
                    <span>Masuk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Quick Auth */}
      {authModalOpen && pendingNav && (
        <QuickAuthModal
          isOpen={authModalOpen}
          targetModule={pendingNav}
          onSuccess={() => {
            setAuthModalOpen(false);
            if (pendingNav) setActiveNav(pendingNav);
            setPendingNav(null);
          }}
          onClose={() => {
            setAuthModalOpen(false);
            setPendingNav(null);
          }}
          requireMasterPassword={pendingNav === 'admin'}
          subtitle={
            pendingNav === 'admin'
              ? (isEn
                  ? 'PIN (1234) or Master Password to access Super Admin'
                  : 'Masukkan PIN (1234) atau Sandi Master Super Admin')
              : (isEn
                  ? `Enter PIN (1234) to access ${pendingNavTitle}`
                  : `Masukkan PIN (1234) untuk mengakses ${pendingNavTitle}`)
          }
        />
      )}
    </div>
  );
};
