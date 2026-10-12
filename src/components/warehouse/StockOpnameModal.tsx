import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  ClipboardCheck,
  X,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Boxes,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scale,
} from 'lucide-react';

interface StockOpnameModalProps {
  isOpen: boolean;
  preselectedProduct?: Product | null;
  onClose: () => void;
  isLight?: boolean;
  isEn?: boolean;
}

export const StockOpnameModal: React.FC<StockOpnameModalProps> = ({
  isOpen,
  preselectedProduct,
  onClose,
  isLight = false,
  isEn = false,
}) => {
  const { products, activeUser, processStockOpnameAdjustment } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    preselectedProduct?.id || products[0]?.id || ''
  );

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0] || null;
  }, [products, selectedProductId]);

  const systemStock = selectedProduct ? selectedProduct.stock : 0;
  const [physicalStock, setPhysicalStock] = useState<number>(systemStock);
  const [opnameNotes, setOpnameNotes] = useState<string>('Stock Opname Koreksi Fisik vs Sistem');
  const [operator, setOperator] = useState<string>(
    activeUser ? `${activeUser.name} (${activeUser.role})` : 'Petugas Gudang'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync state if preselectedProduct changes
  useEffect(() => {
    if (preselectedProduct) {
      setSelectedProductId(preselectedProduct.id);
      setPhysicalStock(preselectedProduct.stock);
    }
  }, [preselectedProduct]);

  // When changing selected product, reset physical stock to system stock
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setPhysicalStock(prod.stock);
    }
  };

  const difference = physicalStock - systemStock;
  const unitCost = selectedProduct?.cost_price || 15000;
  const totalAdjValue = Math.abs(difference) * unitCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      const res = processStockOpnameAdjustment({
        productId: selectedProduct.id,
        physicalStock: Math.max(0, Number(physicalStock)),
        systemStock,
        notes: opnameNotes,
        operator,
      });

      if (res.success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#161b22] border-[#30363d] text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1117] border-[#30363d]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black font-mono uppercase tracking-wider text-cyan-400">
                Warehouse • Inventory Audit Gateway
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {isEn ? 'Stock Opname & Discrepancy Adjustment' : 'Stock Opname & Rekonsiliasi Fisik Inventori'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* 1. Pilih Produk */}
          <div>
            <label className="text-[11px] font-bold text-gray-300 block mb-1.5">
              Pilih Produk untuk Di-Opname:
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition cursor-pointer ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500'
                  : 'bg-[#0d1117] border-[#30363d] text-white focus:border-cyan-500'
              }`}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} - {p.name} (Stok Sistem: {p.stock} {p.unit || 'Unit'})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Informasi Produk Terpilih */}
          {selectedProduct && (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 block font-medium">SKU / PLU</span>
                <span className="font-mono font-bold text-cyan-400 mt-0.5 block truncate">
                  {selectedProduct.id}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-medium">Kategori</span>
                <span className="font-semibold text-gray-300 mt-0.5 block truncate">
                  {selectedProduct.category || 'Umum'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-medium">Harga Modal (HPP)</span>
                <span className="font-mono font-bold text-gray-200 mt-0.5 block">
                  Rp {unitCost.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-medium">Satuan Barang</span>
                <span className="font-semibold text-gray-300 mt-0.5 block">
                  {selectedProduct.unit || 'Pcs / Unit'}
                </span>
              </div>
            </div>
          )}

          {/* 3. Perbandingan Stok Fisik vs Sistem */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Stok Sistem (Tercatat) */}
            <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/50 space-y-1">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                Stok Sistem (Tercatat)
              </span>
              <div className="text-2xl font-black font-mono text-cyan-400">
                {systemStock} <span className="text-xs font-normal text-gray-400">{selectedProduct?.unit || 'Unit'}</span>
              </div>
              <span className="text-[10px] text-gray-500 block">Saldo inventori saat ini</span>
            </div>

            {/* Input Stok Fisik Nyata */}
            <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-1">
              <label htmlFor="input-physical-stock" className="text-[10px] text-amber-300 uppercase font-black tracking-wider block">
                Hitungan Fisik Riil *
              </label>
              <input
                id="input-physical-stock"
                type="number"
                min="0"
                value={physicalStock}
                onChange={(e) => setPhysicalStock(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-2xl font-black font-mono bg-slate-950 border border-amber-500/50 rounded-lg px-2.5 py-1 text-white outline-none focus:ring-1 focus:ring-amber-400"
                required
              />
              <span className="text-[10px] text-amber-300/80 block">Masukkan hasil cacah fisik</span>
            </div>

            {/* Selisih (Delta) */}
            <div
              className={`p-4 rounded-xl border space-y-1 ${
                difference === 0
                  ? 'border-blue-500/40 bg-blue-500/10'
                  : difference < 0
                  ? 'border-rose-500/40 bg-rose-500/10'
                  : 'border-emerald-500/40 bg-emerald-500/10'
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider block text-gray-300">
                Selisih (Adjustment)
              </span>
              <div
                className={`text-2xl font-black font-mono ${
                  difference === 0
                    ? 'text-blue-400'
                    : difference < 0
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
              >
                {difference > 0 ? `+${difference}` : difference} <span className="text-xs font-normal text-gray-400">{selectedProduct?.unit || 'Unit'}</span>
              </div>
              <span className="text-[10px] text-gray-400 block">
                {difference === 0
                  ? 'Balance (Sesuai)'
                  : difference < 0
                  ? 'Kurang Fisik (Shortage)'
                  : 'Lebih Fisik (Surplus)'}
              </span>
            </div>
          </div>

          {/* 4. Rekonsiliasi Akuntansi Berimbang (FIN-STK-ADJ) Callout */}
          <div
            className={`p-4 rounded-xl border space-y-2 text-xs leading-relaxed ${
              difference === 0
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                : difference < 0
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              <Scale className="w-4 h-4 shrink-0" />
              <span>
                {difference === 0
                  ? 'Hasil Verifikasi: Stok Sesuai (Balance)'
                  : difference < 0
                  ? 'Jurnal Otomatis Selisih Kurang (FIN-STK-ADJ)'
                  : 'Jurnal Otomatis Selisih Lebih (FIN-STK-ADJ)'}
              </span>
            </div>

            {difference === 0 ? (
              <p className="text-[11px] text-gray-300">
                Stok fisik riil sama persis dengan pencatatan sistem ({systemStock} unit). Tidak diperlukan jurnal penyesuaian nilai buku.
              </p>
            ) : difference < 0 ? (
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between font-mono">
                  <span>Nominal Penyesuaian Beban:</span>
                  <strong className="text-rose-300 font-bold">
                    -Rp {totalAdjValue.toLocaleString('id-ID')} ({Math.abs(difference)} x Rp {unitCost.toLocaleString('id-ID')})
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-black/30 font-mono text-[10.5px] space-y-1">
                  <div className="flex items-center justify-between text-rose-300">
                    <span>(Debit) 5-10502 Beban Selisih Persediaan:</span>
                    <span>Rp {totalAdjValue.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300 pl-4">
                    <span>(Kredit) 1-10501 Persediaan:</span>
                    <span>Rp {totalAdjValue.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between font-mono">
                  <span>Nominal Penambahan Nilai Inventori:</span>
                  <strong className="text-emerald-300 font-bold">
                    +Rp {totalAdjValue.toLocaleString('id-ID')} (+{difference} x Rp {unitCost.toLocaleString('id-ID')})
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-black/30 font-mono text-[10.5px] space-y-1">
                  <div className="flex items-center justify-between text-emerald-300">
                    <span>(Debit) 1-10501 Persediaan:</span>
                    <span>Rp {totalAdjValue.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300 pl-4">
                    <span>(Kredit) 4-10502 Pendapatan Penyesuaian Persediaan:</span>
                    <span>Rp {totalAdjValue.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. Petugas & Catatan Opname */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                Petugas Verifikasi Opname:
              </label>
              <input
                type="text"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border bg-slate-900/60 border-slate-700 text-white outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                Catatan / Berita Acara Opname:
              </label>
              <input
                type="text"
                value={opnameNotes}
                onChange={(e) => setOpnameNotes(e.target.value)}
                placeholder="Contoh: Stock Opname Kuartal III / Temuan Selisih Fisik"
                className="w-full px-3 py-2 rounded-xl border bg-slate-900/60 border-slate-700 text-white outline-none focus:border-cyan-500 text-xs"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition cursor-pointer"
            >
              Batal
            </button>

            <button
              id="btn-confirm-stock-opname"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.35)] transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Menyimpan...'
                  : difference === 0
                  ? 'Konfirmasi Opname (Balance)'
                  : `Simpan & Sesuaikan Inventori (FIN-STK-ADJ)`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default StockOpnameModal;
