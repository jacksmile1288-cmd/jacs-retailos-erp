import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Store, 
  Lock, 
  Unlock, 
  Plus, 
  ArrowRight, 
  RefreshCw,
  Building2,
  Package
} from 'lucide-react';
import { Terminal } from '../../types';

export const PosModule: React.FC = () => {
  const { 
    terminals, 
    activeTerminal, 
    setActiveTerminal, 
    setAllTerminalsLock, 
    openPinAuth, 
    offlineQueue, 
    syncOfflineTransactions,
    setActiveNav,
    setIsCashierWorkspaceActive
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  // Default selector unit: 3 Unit (sama persis dengan tampilan lokal)
  const [selectedUnitMode, setSelectedUnitMode] = useState<number>(3);

  const isAnyLocked = terminals.some((t) => t.isLocked);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncOfflineTransactions();
    setIsSyncing(false);
  };

  // Batasi terminal yang ditampilkan sesuai selector unit yang dipilih
  const displayedTerminals = terminals.slice(0, selectedUnitMode);

  return (
    <div className="space-y-6">
      {/* Header Modul POS 1 Baris Sejajar Presisi */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Sisi Kiri: Badge, Judul, & Badge Industri */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wider">
              POS
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Terminal Kasir
            </h2>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
                <Store className="w-3.5 h-3.5 text-cyan-400" />
                🏢 Ritel Modern & Multi-Industry
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                Hybrid
              </span>
            </div>
          </div>

          {/* Sisi Kanan: Quick Selector Unit, Kunci Kasir & Tambah Terminal */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            {offlineQueue && offlineQueue.length > 0 && (
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold inline-flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                Sinkronkan ({offlineQueue.length})
              </button>
            )}

            {/* Tombol Pemilih Unit Mode */}
            <div className="inline-flex rounded-xl bg-slate-800/80 p-1 border border-slate-700/80">
              <button
                type="button"
                onClick={() => setSelectedUnitMode(1)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedUnitMode === 1
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1 Unit (All-in-One)
              </button>
              <button
                type="button"
                onClick={() => setSelectedUnitMode(2)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedUnitMode === 2
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2 Unit (Kasir + Back-End)
              </button>
              <button
                type="button"
                onClick={() => setSelectedUnitMode(3)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedUnitMode === 3
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3 Unit
              </button>
            </div>

            {/* Tombol Kunci Semua Kasir */}
            <button
              type="button"
              onClick={() => setAllTerminalsLock(!isAnyLocked)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              {isAnyLocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  Buka Semua Kasir
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  Kunci Semua Kasir
                </>
              )}
            </button>

            {/* Tombol Tambah Terminal */}
            <button
              type="button"
              onClick={() => openPinAuth()}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Terminal
            </button>
          </div>
        </div>
      </div>

      {/* Grid Kartu Terminal Kasir Sejajar Presisi */}
      <div className={`grid gap-4 ${
        selectedUnitMode === 1 
          ? 'grid-cols-1 max-w-md' 
          : selectedUnitMode === 2 
          ? 'grid-cols-1 sm:grid-cols-2' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        {displayedTerminals.map((t, idx) => {
          const isSelected = activeTerminal?.id === t.id;
          const isLocked = t.isLocked;

          // Terminal index ke-1 & ke-2 adalah Kasir 02 & Kasir 03 bertipe HYBRID
          const isHybrid = idx === 1 || idx === 2 || (t.businessModel && t.businessModel.toLowerCase().includes('hybrid'));
          const terminalLabel = idx === 0 
            ? 'KASIR 01' 
            : idx === 1 
            ? 'KASIR 02' 
            : idx === 2 
            ? 'KASIR 03 (BACK-END)' 
            : t.name;

          return (
            <div
              key={t.id}
              onClick={() => !isLocked && setActiveTerminal(t)}
              className={`group relative flex flex-col justify-between h-[320px] p-5 rounded-2xl border transition-all duration-200 select-none ${
                isLocked
                  ? 'bg-slate-900/50 border-rose-950/40 cursor-not-allowed opacity-75'
                  : isSelected
                  ? 'bg-slate-900/95 border-cyan-500/80 shadow-[0_0_24px_rgba(6,182,212,0.16)] cursor-pointer'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 cursor-pointer'
              }`}
            >
              {/* Garis Aksen Neon Atas */}
              <div
                className={`absolute top-0 inset-x-5 h-[2px] rounded-full transition-all duration-200 ${
                  isLocked
                    ? 'bg-rose-500/50'
                    : isSelected
                    ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                    : 'bg-transparent group-hover:bg-slate-700'
                }`}
              />

              {/* Area Atas: Nama, Status, Type, & Deskripsi */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-base font-black tracking-tight text-white uppercase">
                    {terminalLabel}
                  </span>
                  <div>
                    {isLocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                        <Lock className="w-2.5 h-2.5" />
                        TERKUNCI
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ONLINE
                      </span>
                    )}
                  </div>
                </div>

                {/* Badge Tipe */}
                <div className="mb-2.5">
                  <span className={`inline-block text-[10px] font-mono tracking-wider font-semibold px-2 py-0.5 rounded border ${
                    isHybrid
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                  }`}>
                    {isHybrid
                      ? '[ TIPE: HYBRID (BACK-END & KASIR BANTUAN) ]'
                      : '[ TIPE: KASIR (FRONT-END) ]'}
                  </span>
                </div>

                {/* Sektor Usaha */}
                <h4 className="text-xs font-bold text-slate-200 line-clamp-1 mb-1.5">
                  {isHybrid
                    ? 'Dual-Mode: Input Master Produk & Kasir Bantuan'
                    : (t.location || 'Ritel & Grosir Modern')}
                </h4>

                {/* Deskripsi Seragam */}
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                  {isLocked
                    ? 'Terminal sedang dalam masa pemeliharaan sistem. Buka otorisasi melalui PIN Super Admin.'
                    : isHybrid
                    ? 'Fungsi ganda: kelola katalog produk & stok di panel admin, atau buka langsung sebagai Kasir 02 (Register ID: KASIR-02) saat antrean ramai.'
                    : 'Loket kasir siap melayani transaksi penjualan, scan barcode, voucher diskon, dan cetak struk.'}
                </p>
              </div>

              {/* Area Bawah: Status & Tombol Aksi */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className={`inline-flex items-center gap-1 ${
                    isLocked ? 'text-rose-400' : isHybrid ? 'text-amber-400' : 'text-cyan-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isLocked ? 'bg-rose-500' : isHybrid ? 'bg-amber-400' : 'bg-cyan-400'
                    }`} />
                    {isLocked ? 'PEMELIHARAAN' : isHybrid ? 'DUAL-MODE' : 'SIAP PAKAI'}
                  </span>
                  <span className="text-slate-500 font-mono">
                    {t.id}
                  </span>
                </div>

                {isLocked ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPinAuth();
                    }}
                    className="w-full py-2 px-3 text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    Buka via PIN Admin
                  </button>
                ) : isHybrid ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveNav('master-data' as any);
                      }}
                      className="py-2 px-2 text-[11px] font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors truncate text-center"
                    >
                      Input Produk (Admin)
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTerminal(t);
                        setIsCashierWorkspaceActive(true);
                      }}
                      className="py-2 px-2 text-[11px] font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm transition-colors truncate text-center"
                    >
                      Buka Kasir 02 →
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTerminal(t);
                      setIsCashierWorkspaceActive(true);
                    }}
                    className={`w-full py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    Buka Kasir →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};