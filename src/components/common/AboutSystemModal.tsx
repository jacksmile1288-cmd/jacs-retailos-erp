import React from 'react';
import { JacSLogo } from './JacSLogo';
import {
  X,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Terminal,
  Activity,
  Award,
} from 'lucide-react';

interface AboutSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
  language?: 'id' | 'en';
  onOpenSop?: () => void;
}

export const AboutSystemModal: React.FC<AboutSystemModalProps> = ({
  isOpen,
  onClose,
  isLight = false,
  language = 'id',
  onOpenSop,
}) => {
  if (!isOpen) return null;

  const isEn = language === 'en';

  return (
    <div
      id="modal-about-system"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden relative my-auto animate-in zoom-in-95 duration-200 ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
            : 'bg-[#161b22] border-[#30363d] text-[#e6edf3] shadow-[0_20px_60px_rgba(0,0,0,0.9)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Background Glow */}
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-blue-600/20 via-cyan-500/10 to-transparent pointer-events-none" />

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 z-10 p-2 rounded-xl transition cursor-pointer ${
            isLight
              ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              : 'hover:bg-[#21262d] text-gray-400 hover:text-white'
          }`}
          title={isEn ? 'Close' : 'Tutup'}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 relative">
          {/* Hero Developer Logo & Identity */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 pb-6 border-b border-gray-700/20">
            {/* 3D High-Res Logo Mark (h-20 w-20) */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition duration-300" />
              <div
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center p-2 border shadow-xl ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-slate-200'
                    : 'bg-[#0d1117] border-cyan-500/40 shadow-[0_0_30px_rgba(0,82,255,0.3)]'
                }`}
              >
                <img
                  src="/logo.png"
                  alt="JacS Developer Logo"
                  className="w-full h-full object-contain aspect-square select-none drop-shadow-[0_4px_12px_rgba(0,82,255,0.5)]"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.endsWith('LOGO-removebg-preview.png')) {
                      target.src = '/LOGO-removebg-preview.png';
                    }
                  }}
                />
              </div>
            </div>

            {/* Title & Developer Meta */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-gradient-to-r from-blue-600/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/40 mb-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>OFFICIAL DEVELOPER EDITION</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                <span className="text-[#0052FF] dark:text-[#38BDF8]">Jac</span>
                <span className="text-[#FF7A00]">S</span>{' '}
                <span>RetailOS ERP Enterprise</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {isEn
                  ? 'Unified Enterprise Operating System for Retail, F&B, Pharmacy, Building, Wholesale & Multi-Branch Management.'
                  : 'Sistem Operasi Terpadu Enterprise untuk Ritel, Resto/F&B, Apotek, Bahan Bangunan, Grosir & Multi-Cabang.'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                  v4.2.0-STABLE
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 font-bold">
                  Enterprise Release
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300">
                  Build 2026.10
                </span>
              </div>
            </div>
          </div>

          {/* Key System Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6 text-xs">
            {/* Card 1 */}
            <div
              className={`p-3.5 rounded-2xl border transition ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1117] border-[#30363d]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5 text-blue-500 font-bold">
                <Cpu className="w-4 h-4" />
                <span>{isEn ? 'Architecture & Core Engine' : 'Arsitektur & Mesin Utama'}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                {isEn
                  ? 'Local-first reactive state with instant synchronization, hybrid offline resilience, and zero-latency transaction pipelines.'
                  : 'State reaktif lokal dengan sinkronisasi instan, resiliensi offline hibrida, dan pipa transaksi nol latensi.'}
              </p>
            </div>

            {/* Card 2 */}
            <div
              className={`p-3.5 rounded-2xl border transition ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1117] border-[#30363d]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5 text-cyan-500 font-bold">
                <Layers className="w-4 h-4" />
                <span>{isEn ? '6 Unified Core Divisions' : '6 Divisi Inti Terpadu'}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                {isEn
                  ? 'POS & Cashier, Warehouse & Inventory, Finance & Accounting, Purchasing SCM, HR & Payroll, Executive Analytics.'
                  : 'Kasir POS, Gudang & Stok, Keuangan & Akuntansi, Purchasing SCM, SDM & Payroll, Analitik Eksekutif.'}
              </p>
            </div>

            {/* Card 3 */}
            <div
              className={`p-3.5 rounded-2xl border transition ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1117] border-[#30363d]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5 text-emerald-500 font-bold">
                <Terminal className="w-4 h-4" />
                <span>{isEn ? 'Multi-Industry POS Engine' : 'Mesin Kasir Multi-Industri'}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                {isEn
                  ? 'Automatic terminal catalog filtering for Resto (F&B), Pharmacy, Building Depot, and Retail with dynamic 1% cashier commission.'
                  : 'Filter katalog otomatis untuk F&B/Resto, Farmasi, Toko Bangunan, dan Ritel umum dengan komisi kasir dinamis 1%.'}
              </p>
            </div>

            {/* Card 4 */}
            <div
              className={`p-3.5 rounded-2xl border transition ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1117] border-[#30363d]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5 text-purple-500 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>{isEn ? 'Security & Access Gate' : 'Keamanan & Hak Akses'}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                {isEn
                  ? 'Super Admin Developer Console, PIN authentication for cashier operators, and encrypted session maintenance.'
                  : 'Konsol Developer Super Admin, autentikasi PIN kasir, dan pemeliharaan sesi terenkripsi.'}
              </p>
            </div>
          </div>

          {/* Developer Credentials & License Footnote */}
          <div
            className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-center justify-between gap-3 ${
              isLight
                ? 'bg-blue-50/50 border-blue-200 text-slate-700'
                : 'bg-slate-900/60 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  JacS Studio & Enterprise Technology Solutions
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  &copy; {new Date().getFullYear()} JacS RetailOS. All rights reserved.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenSop && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSop();
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition cursor-pointer flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Open SOP Guide' : 'Buka Panduan SOP'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition cursor-pointer"
              >
                {isEn ? 'Done' : 'Selesai'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
