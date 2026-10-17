import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  AlertTriangle,
  FilePlus2,
  ExternalLink,
  Zap,
  Boxes,
  ShoppingBag,
  TrendingDown,
  Building2,
  CheckCircle2,
  Search,
  ArrowRight,
  ClipboardCheck,
  PackageX,
  ShieldAlert,
} from 'lucide-react';
import { StockOpnameModal } from './StockOpnameModal';

interface StockAlertTabProps {
  isLight?: boolean;
  isEn?: boolean;
}

export const StockAlertTab: React.FC<StockAlertTabProps> = ({
  isLight = false,
  isEn = false,
}) => {
  const {
    products,
    getProductAlertThreshold,
    createPurchaseRequest,
    getDefaultSupplierForProduct,
    setActiveNav,
    activeUser,
    showToast,
    purchaseRequests,
    purchasing,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForOpname, setSelectedProductForOpname] = useState<Product | null>(null);
  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
  const [generatingPrId, setGeneratingPrId] = useState<string | null>(null);

  // Helper to check if a product already has a draft/active PR or in-process restock PO
  const getProductRestockStatus = (p: Product) => {
    const pName = p.name.toLowerCase().trim();
    const pId = p.id.toLowerCase().trim();

    const matchedPR = (purchaseRequests || []).find((pr) => {
      const prItem = (pr.item_name || '').toLowerCase().trim();
      const isNameMatch =
        prItem.includes(pName) ||
        pName.includes(prItem.split('(')[0].trim()) ||
        prItem.includes(pId);
      const isStatusActive =
        pr.status !== 'Rejected' &&
        pr.status !== 'Ditolak' &&
        pr.status !== 'Cancelled';
      return isNameMatch && isStatusActive;
    });

    if (matchedPR) {
      return {
        type: 'PR' as const,
        label: `Draf PR: ${matchedPR.pr_number}`,
        statusText: matchedPR.status,
      };
    }

    const matchedPO = (purchasing || []).find((po) => {
      const isStatusActive =
        po.status !== 'Cancelled' &&
        po.status !== 'Dibatalkan' &&
        po.status !== 'Selesai' &&
        po.status !== 'Completed';
      if (!isStatusActive) return false;

      const poItemsStr = typeof po.items === 'string' ? po.items.toLowerCase() : '';
      if (poItemsStr.includes(pName) || poItemsStr.includes(pId)) return true;

      if (po.item_details && Array.isArray(po.item_details)) {
        return po.item_details.some(
          (d) =>
            d.product_id?.toLowerCase() === pId ||
            (d.product_name && d.product_name.toLowerCase().includes(pName))
        );
      }
      return false;
    });

    if (matchedPO) {
      return {
        type: 'PO' as const,
        label: `PO Restock: ${matchedPO.po_number}`,
        statusText: matchedPO.status,
      };
    }

    return null;
  };

  // Identify low-stock products
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => {
      const thresholdInfo = getProductAlertThreshold(p);
      const minStock = p.min_stock || thresholdInfo.minStock || 10;
      return (
        p.stock <= minStock ||
        p.status === 'Low Stock' ||
        p.status === 'Out of Stock' ||
        thresholdInfo.isLowStock
      );
    });
  }, [products, getProductAlertThreshold]);

  // Unhandled alerts: products without draft PR or restock PO
  const unhandledAlerts = useMemo(() => {
    return lowStockProducts.filter((p) => !getProductRestockStatus(p));
  }, [lowStockProducts, purchaseRequests, purchasing]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return lowStockProducts;
    const q = searchQuery.toLowerCase().trim();
    return lowStockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.barcode || '').includes(q)
    );
  }, [lowStockProducts, searchQuery]);

  // Statistics calculation
  const totalDeficitUnits = useMemo(() => {
    return lowStockProducts.reduce((acc, p) => {
      const threshold = p.min_stock || getProductAlertThreshold(p).minStock || 10;
      const targetMax = p.initialStock && p.initialStock > threshold ? p.initialStock : Math.max(threshold * 3, 20);
      const deficit = Math.max(1, targetMax - Math.max(0, p.stock));
      return acc + deficit;
    }, 0);
  }, [lowStockProducts, getProductAlertThreshold]);

  const totalEstimatedCost = useMemo(() => {
    return lowStockProducts.reduce((acc, p) => {
      const threshold = p.min_stock || getProductAlertThreshold(p).minStock || 10;
      const targetMax = p.initialStock && p.initialStock > threshold ? p.initialStock : Math.max(threshold * 3, 20);
      const deficit = Math.max(1, targetMax - Math.max(0, p.stock));
      const unitCost = p.cost_price || 15000;
      return acc + deficit * unitCost;
    }, 0);
  }, [lowStockProducts, getProductAlertThreshold]);

  // Handle single Auto Generate PR
  const handleAutoGeneratePR = (p: Product) => {
    setGeneratingPrId(p.id);
    try {
      const threshold = p.min_stock || getProductAlertThreshold(p).minStock || 10;
      const targetMax = p.initialStock && p.initialStock > threshold ? p.initialStock : Math.max(threshold * 3, 20);
      const orderQty = Math.max(1, targetMax - Math.max(0, p.stock));
      const unitCost = p.cost_price || 15000;
      const estimatedCost = orderQty * unitCost;
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const isUrgent = p.stock === 0;

      createPurchaseRequest({
        date: dateStr,
        department: 'Warehouse & Logistik',
        requester_name: activeUser ? `${activeUser.name} (${activeUser.role})` : 'Staf Gudang (Sistem)',
        item_name: p.name,
        qty: orderQty,
        estimated_cost: estimatedCost,
        urgency: isUrgent ? 'High' : 'Medium',
      });

      showToast(
        isEn
          ? `Draft PR automatically generated for ${p.name} (${orderQty} units). Forwarded to Purchasing!`
          : `Draf PR untuk ${p.name} (${orderQty} unit) berhasil dibuat & dikirim ke Purchasing Module!`
      );
    } finally {
      setGeneratingPrId(null);
    }
  };

  // Handle Auto Generate All PR (4 Alert)
  const handleGenerateAllPR = () => {
    if (lowStockProducts.length === 0) {
      showToast('Tidak ada produk kritis di bawah batas stok minimum.');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    let count = 0;

    lowStockProducts.forEach((p) => {
      const threshold = p.min_stock || getProductAlertThreshold(p).minStock || 10;
      const targetMax = p.initialStock && p.initialStock > threshold ? p.initialStock : Math.max(threshold * 3, 20);
      const orderQty = Math.max(1, targetMax - Math.max(0, p.stock));
      const unitCost = p.cost_price || 15000;
      const estimatedCost = orderQty * unitCost;

      createPurchaseRequest({
        date: dateStr,
        department: 'Warehouse & Logistik',
        requester_name: activeUser ? `${activeUser.name} (${activeUser.role})` : 'Staf Gudang (Sistem)',
        item_name: p.name,
        qty: orderQty,
        estimated_cost: estimatedCost,
        urgency: p.stock === 0 ? 'High' : 'Medium',
      });
      count++;
    });

    showToast(
      isEn
        ? `Successfully generated ${count} Purchase Requests for all low-stock items!`
        : `Berhasil membuat ${count} Purchase Request sekaligus untuk seluruh produk kritis di Purchasing Module!`
    );
  };

  const handleOpenOpname = (p: Product) => {
    setSelectedProductForOpname(p);
    setIsOpnameModalOpen(true);
  };

  return (
    <div id="warehouse-stock-alert-tab" className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div
        className={`p-5 rounded-2xl border transition duration-200 ${
          isLight
            ? 'bg-gradient-to-r from-amber-50 via-slate-50 to-orange-50 border-amber-200 text-slate-800'
            : 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-orange-950/20 border-amber-500/30 text-white shadow-[0_0_25px_rgba(245,158,11,0.12)]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                  Warehouse Stock Alert • Integrasi Purchasing
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {unhandledAlerts.length} Alert Aktif {lowStockProducts.length - unhandledAlerts.length > 0 ? `(${lowStockProducts.length - unhandledAlerts.length} Dalam Proses Restock/PR)` : ''}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight">
                {isEn
                  ? 'Warehouse Stock Alert & Purchasing Requisition Bridge'
                  : 'Peringatan Stok Minimum Gudang & Penghubung Pengadaan (PR)'}
              </h3>
              <p className="text-xs text-gray-400 max-w-2xl leading-relaxed mt-0.5">
                {isEn
                  ? 'Identify SKUs below safety thresholds and instantly auto-generate Purchase Requisitions to prevent retail out-of-stock.'
                  : 'Deteksi produk yang berada di bawah batas minimum (Safety Stock) dan langsung buat draf Purchase Requisition ke modul Purchasing.'}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
            <button
              id="btn-auto-generate-all-pr"
              type="button"
              onClick={handleGenerateAllPR}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-[0_0_18px_rgba(245,158,11,0.35)] transition cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Auto Generate All PR ({lowStockProducts.length} Alert)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNav('purchasing')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition cursor-pointer"
            >
              <span>{isEn ? 'Open Purchasing Module' : 'Buka Modul Purchasing'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4 Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#161b22] border-[#30363d]'
          }`}
        >
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">
              {isEn ? 'Stock Alert Items' : 'Total Produk Kritis'}
            </span>
            <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">
              {lowStockProducts.length} Produk
            </span>
            <span className="text-[10px] text-amber-400/80 mt-0.5 block font-mono">
              {lowStockProducts.length === 4 ? '4 Alert (Di Bawah Minimum)' : `${lowStockProducts.length} Perlu Restock`}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border flex items-center justify-between ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#161b22] border-[#30363d]'
          }`}
        >
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">
              {isEn ? 'Total Deficit Units' : 'Total Defisit Unit'}
            </span>
            <span className="text-2xl font-black font-mono text-cyan-400 mt-1 block">
              {totalDeficitUnits} Unit
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              Untuk mengembalikan ke kapasitas aman
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border flex items-center justify-between ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#161b22] border-[#30363d]'
          }`}
        >
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">
              {isEn ? 'Estimated Reorder Cost' : 'Estimasi Biaya Restock'}
            </span>
            <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
              Rp {totalEstimatedCost.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              Berdasarkan HPP pemasok resmi
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border flex items-center justify-between ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#161b22] border-[#30363d]'
          }`}
        >
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">
              {isEn ? 'Purchasing Integration' : 'Status Integrasi Purchasing'}
            </span>
            <span className="text-sm font-black text-white mt-1 block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Siap Terbitkan PR</span>
            </span>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">
              1-Klik kirim ke antrean approval
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <FilePlus2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Toolbar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={isEn ? 'Search low-stock products, SKU...' : 'Cari produk alert, SKU, kategori...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-none transition ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 focus:border-amber-500'
                : 'bg-[#161b22] border-[#30363d] text-white focus:border-amber-500'
            }`}
          />
        </div>

        <span className="text-xs text-gray-400 font-mono self-end sm:self-center">
          Menampilkan {filteredProducts.length} dari {lowStockProducts.length} SKU Kritis
        </span>
      </div>

      {/* 4. Daftar 4 Produk di Bawah Minimum Stock */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center text-gray-400 rounded-2xl border border-dashed border-slate-700/60 flex flex-col items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
          <p className="font-bold text-sm text-white">Seluruh Produk Memiliki Stok Aman!</p>
          <p className="text-xs text-gray-500 mt-1">
            Tidak ada SKU yang berada di bawah ambang batas minimum saat ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((p) => {
            const thresholdInfo = getProductAlertThreshold(p);
            const minStock = p.min_stock || thresholdInfo.minStock || 10;
            const targetMax = p.initialStock && p.initialStock > minStock ? p.initialStock : Math.max(minStock * 3, 20);
            const currentStock = Math.max(0, p.stock);
            const deficitQty = Math.max(1, targetMax - currentStock);
            const unitCost = p.cost_price || 15000;
            const estimatedCost = deficitQty * unitCost;
            const supplier = getDefaultSupplierForProduct(p) || p.supplier || 'Supplier Rekanan Lokal';
            const isOut = currentStock === 0;
            const restockStatus = getProductRestockStatus(p);

            return (
              <div
                key={p.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isLight
                    ? 'bg-white border-amber-200 hover:border-amber-400 shadow-sm'
                    : 'bg-[#161b22] border-amber-500/30 hover:border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                }`}
              >
                <div>
                  {/* Top Bar: SKU, Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {p.id}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        Barcode: {p.barcode || '-'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {restockStatus && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                          ✓ {restockStatus.label}
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono uppercase tracking-wider ${
                          isOut
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        {isOut ? 'Out of Stock (0)' : `Low Stock (${currentStock})`}
                      </span>
                    </div>
                  </div>

                  {/* Title & Brand */}
                  <h4 className="font-bold text-sm text-white line-clamp-1">{p.name}</h4>
                  <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                    <span>{p.category || 'Barang Umum'}</span>
                    <span>•</span>
                    <span>Brand: <strong className="text-gray-300">{p.brand || 'Original'}</strong></span>
                  </div>

                  {/* Stock Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2.5 my-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Stok Riil Saat Ini</span>
                      <span
                        className={`text-base font-black font-mono mt-0.5 block ${
                          isOut ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      >
                        {currentStock} {p.unit || 'Unit'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Batas Minimum (Safety)</span>
                      <span className="text-base font-bold font-mono text-gray-300 mt-0.5 block">
                        {minStock} {p.unit || 'Unit'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Defisit Pengadaan</span>
                      <span className="text-base font-black font-mono text-cyan-400 mt-0.5 block">
                        +{deficitQty} {p.unit || 'Unit'}
                      </span>
                    </div>
                  </div>

                  {/* Procurement & Supplier Info */}
                  <div className="space-y-1 text-xs mb-4">
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Estimasi Harga Modal (HPP):</span>
                      <span className="font-mono text-gray-200">Rp {unitCost.toLocaleString('id-ID')} / {p.unit || 'Unit'}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Total Estimasi Biaya PR:</span>
                      <span className="font-mono font-bold text-emerald-400">Rp {estimatedCost.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-400 pt-1 border-t border-slate-800">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-500" />
                        <span>Supplier Rekanan:</span>
                      </span>
                      <span className="font-semibold text-gray-300 truncate max-w-[180px]">{supplier}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    id={`btn-opname-${p.id}`}
                    onClick={() => handleOpenOpname(p)}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-gray-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                    title="Periksa fisik nyata vs stok sistem"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Opname Fisik</span>
                  </button>

                  <button
                    type="button"
                    id={`btn-auto-pr-${p.id}`}
                    disabled={generatingPrId === p.id}
                    onClick={() => handleAutoGeneratePR(p)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)] transition cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <FilePlus2 className="w-4 h-4 fill-slate-950" />
                    <span>Auto Generate PR</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stock Opname Modal */}
      {isOpnameModalOpen && (
        <StockOpnameModal
          isOpen={isOpnameModalOpen}
          preselectedProduct={selectedProductForOpname}
          onClose={() => {
            setIsOpnameModalOpen(false);
            setSelectedProductForOpname(null);
          }}
          isLight={isLight}
          isEn={isEn}
        />
      )}
    </div>
  );
};
export default StockAlertTab;
