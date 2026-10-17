import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PurchaseOrder } from '../../types';
import { getReactiveNeonGlowStyle } from '../../utils/neonGlow';
import { AutoPoSummaryModal } from '../purchasing/AutoPoSummaryModal';
import { GoodsReceiptModal } from '../purchasing/GoodsReceiptModal';
import { StockAlertTab } from './StockAlertTab';
import { StockOpnameModal } from './StockOpnameModal';
import {
  Boxes,
  AlertTriangle,
  ArrowUpDown,
  RefreshCw,
  Search,
  Plus,
  Minus,
  CheckCircle,
  X,
  Layers,
  ShoppingBag,
  ExternalLink,
  ShieldAlert,
  History,
  ClipboardList,
  ClipboardCheck,
  Zap,
  FilePlus2,
  Building2,
  PackageCheck,
  Truck,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Sparkles,
  Undo2,
} from 'lucide-react';

export const WarehouseModule: React.FC = () => {
  const {
    inventory,
    stockMutations,
    products,
    adjustStock,
    setActiveNav,
    purchasing,
    purchaseRequests,
    goodsReceipts,
    getProductAlertThreshold,
    createAutoReorderPO,
    reorderAllLowStock,
    getDefaultSupplierForProduct,
    theme,
    language,
    activeNeonCards,
    setActiveNeonCard,
    // Consumer Sales Returns & Bad Stock (APS POS4: 28_ReturPenjualan)
    badStockItems,
    updateBadStockStatus,
    salesReturns,
  } = useApp();

  const isLight = theme === 'light';
  const isEn = language === 'en';

  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [activeWarehouseTab, setActiveWarehouseTab] = useState<'inventory' | 'stock_alert' | 'mutations' | 'bad_stock'>('inventory');
  const [isStockOpnameOpen, setIsStockOpnameOpen] = useState(false);
  const [selectedProductForOpname, setSelectedProductForOpname] = useState<typeof products[0] | null>(null);
  const [mutationTypeFilter, setMutationTypeFilter] = useState<'ALL' | 'IN_GR' | 'OUT_KASIR' | 'IN_RETURN' | 'OPENING_STOCK_MIGRATION' | 'IN' | 'OUT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(
    products[0]?.id || ''
  );
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
  const [adjustQty, setAdjustQty] = useState(5);
  const [adjustReason, setAdjustReason] = useState(
    'Stock Opname Koreksi Fisik'
  );
  const [summaryModalPOs, setSummaryModalPOs] = useState<PurchaseOrder[] | null>(null);
  const [isGrModalOpen, setIsGrModalOpen] = useState(false);
  const [selectedPoForGr, setSelectedPoForGr] = useState<PurchaseOrder | null>(null);

  const approvedPOs = useMemo(() => {
    return (purchasing || []).filter((po) => {
      const s = (po.status || '').toLowerCase();
      return (
        s.includes('approv') ||
        s.includes('disetujui') ||
        s.includes('dipesan') ||
        s.includes('sent')
      ) && !s.includes('receiv') && !s.includes('selesai');
    });
  }, [purchasing]);

  const handleReorderAll = () => {
    const res = reorderAllLowStock();
    if (res.pos && res.pos.length > 0) {
      setSummaryModalPOs(res.pos);
    }
  };

  const handleAutoReorderSingle = (p: typeof products[0]) => {
    const newPo = createAutoReorderPO(p);
    if (newPo) {
      setSummaryModalPOs([newPo]);
    }
  };

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => {
      const thresholdInfo = getProductAlertThreshold(p);
      const minStock = p.minStock ?? p.min_stock ?? thresholdInfo.minStock ?? 10;
      return (
        p.stock <= minStock ||
        p.status === 'Low Stock' ||
        p.status === 'Out of Stock' ||
        thresholdInfo.isLowStock
      );
    });
  }, [products, getProductAlertThreshold]);

  const totalPhysicalUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + p.stock, 0);
  }, [products]);

  const totalPoValue = useMemo(() => {
    return purchasing.reduce((acc, p) => acc + p.total_amount, 0);
  }, [purchasing]);

  const activePRCount = purchaseRequests.filter(
    (pr) => pr.status === 'Pending Approval'
  ).length;

  const filteredInventory = inventory.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const p = products.find((prod) => prod.id === inv.product_id);
    const pName = p?.name || inv.product_name || '';
    return (
      inv.product_id.toLowerCase().includes(q) ||
      pName.toLowerCase().includes(q)
    );
  });

  const filteredMutations = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return (stockMutations || []).filter((m) => {
      const matchSearch =
        m.product_id.toLowerCase().includes(q) ||
        m.product_name.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        m.reference_no.toLowerCase().includes(q) ||
        (m.referenceId || '').toLowerCase().includes(q) ||
        (m.warehouse || '').toLowerCase().includes(q) ||
        (m.notes || '').toLowerCase().includes(q) ||
        (m.operator || '').toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (mutationTypeFilter === 'OPENING_STOCK_MIGRATION') {
        return m.type === 'OPENING_STOCK_MIGRATION' || m.type === 'ROLLBACK_MIGRATION';
      }
      if (mutationTypeFilter === 'IN_GR') {
        return (
          m.type === 'IN / GOODS_RECEIPT' ||
          m.type === 'IN / RECEIVING PO' ||
          m.type === 'IN_PURCHASE' ||
          m.type.includes('PURCHASE') ||
          m.type.includes('GOODS_RECEIPT')
        );
      }
      if (mutationTypeFilter === 'OUT_KASIR') {
        return m.type === 'OUT / KASIR' || m.type === 'OUT_SALES';
      }
      if (mutationTypeFilter === 'IN_RETURN') {
        return m.type.includes('IN_RETURN');
      }
      if (mutationTypeFilter === 'IN') {
        return m.type === 'IN';
      }
      if (mutationTypeFilter === 'OUT') {
        return m.type === 'OUT' || m.type === 'OUT / KASIR' || m.type === 'OUT_SALES';
      }
      return true;
    });
  }, [stockMutations, searchQuery, mutationTypeFilter]);

  const filteredBadStock = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return (badStockItems || []).filter((item) => {
      if (!q) return true;
      return (
        item.id.toLowerCase().includes(q) ||
        item.productId.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.conditionReason.toLowerCase().includes(q) ||
        item.sourceReference.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
      );
    });
  }, [badStockItems, searchQuery]);

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const delta =
      adjustType === 'IN' ? Math.abs(adjustQty) : -Math.abs(adjustQty);
    adjustStock(selectedProductId, delta, adjustReason);
    setIsAdjustModalOpen(false);
  };

  // 3 Warehouse Metric Cards with standardized labels
  const warehouseCards = [
    {
      id: 'sku-stock',
      title: isEn ? 'Total SKU & Stock' : 'Total SKU & Stok',
      shortTitle: isEn ? 'Total SKU' : 'Total SKU',
      value: `${products.length} SKU (${totalPhysicalUnits} Pcs)`,
      sub: isEn ? 'Warehouse Capacity 88% Optimal' : 'Kapasitas Gudang 88% Optimal',
      colorHex: '#38bdf8',
      icon: Boxes,
      focusDesc: isEn
        ? 'Catalog of all active SKUs, physical inventory, and DB sync.'
        : 'Katalog seluruh SKU, unit fisik riil, dan sinkronisasi DB_Inventory.',
    },
    {
      id: 'low-stock',
      title: isEn ? 'Low Stock Alert' : 'Peringatan Stok Rendah',
      shortTitle: isEn ? 'Low Stock' : 'Stok Rendah',
      value: `${lowStockProducts.length} SKU ${isEn ? 'Critical' : 'Kritis'}`,
      sub: isEn ? 'Safety stock threshold <= 10 units' : 'Batas Minimum <= 10 Unit Gudang',
      colorHex: '#f59e0b',
      icon: AlertTriangle,
      focusDesc: isEn
        ? 'Early warning system to prevent stockouts at cashier terminals.'
        : 'Peringatan dini ketersediaan barang untuk mencegah out-of-stock kasir.',
    },
    {
      id: 'po-value',
      title: isEn ? 'PO & Active PR Value' : 'Nilai PO & PR Berjalan',
      shortTitle: isEn ? 'PO & PR' : 'Nilai PO & PR',
      value: `Rp ${totalPoValue.toLocaleString('id-ID')}`,
      sub: `${purchasing.length} PO Terbit • ${activePRCount} PR Pending`,
      colorHex: '#8b5cf6',
      icon: ShoppingBag,
      focusDesc: isEn
        ? 'Ongoing purchase orders (PO) and restock requests (PR).'
        : 'Pengadaan barang berjalan (PO) dan permohonan restock barang (PR).',
    },
  ];

  const selectedCardId = activeNeonCards['warehouse'] || 'sku-stock';
  const selectedWarehouseCard =
    warehouseCards.find((c) => c.id === selectedCardId) || warehouseCards[0];

  return (
    <div id="warehouse-module" className="space-y-5 max-w-7xl mx-auto pb-6">
      {/* Header */}
      <div
        className={`p-5 rounded-2xl border transition duration-200 ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-[#161b22] border-[#30363d]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#8b5cf6]/15 border border-[#8b5cf6]/40 text-[#8b5cf6] text-[11px] font-bold mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>{isEn ? 'Warehouse & Inventory Control' : 'Manajemen Gudang & Kontrol Stok'}</span>
            </div>
            <h2
              className={`text-xl sm:text-2xl font-black tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {isEn ? 'Warehouse & Realtime Inventory' : 'Warehouse & Manajemen Stok Realtime'}
            </h2>
            <p className="text-xs text-[#8b949e] truncate mt-0.5">
              {isEn
                ? 'Monitoring inbound/outbound goods movements, stock ledger, and inventory sync.'
                : 'Monitoring pergerakan barang masuk/keluar, kartu stok, dan sinkronisasi DB_Inventory.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {/* Fokus Analisis Badge - rapi tanpa tumpang tindih */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-800'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-200'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: selectedWarehouseCard.colorHex }}
              />
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
                Fokus Analisis:
              </span>
              <span className="font-bold text-xs truncate max-w-[130px] sm:max-w-[200px]">
                {selectedWarehouseCard.shortTitle || selectedWarehouseCard.title}
              </span>
            </div>

            <button
              id="btn-open-stock-opname"
              type="button"
              onClick={() => {
                setSelectedProductForOpname(null);
                setIsStockOpnameOpen(true);
              }}
              className={`flex items-center gap-1.5 text-white text-xs font-black px-3.5 py-2 rounded-xl transition cursor-pointer active:scale-95 ${
                isLight
                  ? 'bg-teal-600 hover:bg-teal-700 border border-teal-600 shadow-sm'
                  : 'bg-teal-600 hover:bg-teal-500 border border-teal-500/40'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Stock Opname</span>
            </button>

            <button
              onClick={() => setIsAdjustModalOpen(true)}
              className={`flex items-center gap-1.5 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer ${
                isLight
                  ? 'bg-blue-600 hover:bg-blue-700 border border-blue-600 shadow-sm'
                  : 'bg-[#0052FF] hover:bg-[#0043d1] border border-blue-500/40'
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>Mutasi Stok</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 KPI METRIC CARDS - Grid 3 kolom seimbang, border solid, h-full, tanpa neon glow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {warehouseCards.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedCardId === card.id;

          return (
            <button
              key={card.id}
              id={`warehouse-card-${card.id}`}
              type="button"
              onClick={() => {
                setActiveNeonCard('warehouse', card.id);
                if (card.id === 'low-stock') {
                  setActiveWarehouseTab('stock_alert');
                } else if (card.id === 'sku-stock') {
                  setActiveWarehouseTab('inventory');
                }
              }}
              className={`p-4 rounded-xl text-left cursor-pointer flex flex-col justify-between h-full transition duration-150 ${
                isLight
                  ? isSelected
                    ? 'border-2 border-blue-500 bg-white shadow-sm'
                    : 'border border-slate-200 bg-white shadow-sm hover:border-slate-300'
                  : isSelected
                  ? 'border-2 border-slate-400 bg-slate-900/90'
                  : 'border border-slate-700/60 bg-slate-900/60 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span
                  className={`text-xs font-bold uppercase tracking-wider truncate ${
                    isSelected
                      ? isLight
                        ? 'text-blue-600 font-extrabold'
                        : 'text-white font-extrabold'
                      : isLight
                      ? 'text-slate-600'
                      : 'text-slate-400'
                  }`}
                >
                  {card.title}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isLight
                      ? 'bg-slate-100 text-slate-700 border border-slate-200'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-auto">
                <div
                  className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {card.value}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
                  {card.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ALERT BANNER 1 BARIS RAMPING (LOW STOCK ALERT) TEPAT DI ATAS TABEL STOK */}
      {lowStockProducts.length > 0 && (
        <div
          id="warehouse-low-stock-alert-banner"
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-xs transition duration-150 ${
            isLight
              ? 'bg-amber-50/90 border-amber-200 text-amber-950 shadow-sm'
              : 'border border-slate-700/60 bg-slate-900/60 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap sm:flex-nowrap">
              <span className="font-bold text-amber-500 shrink-0">
                {isEn ? 'Low Stock Warning:' : 'Peringatan Stok Rendah:'}
              </span>
              <span className="font-semibold text-xs shrink-0">
                {lowStockProducts.length} SKU {isEn ? 'below safety stock limit' : 'di bawah batas minimum'}
              </span>
              <span className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md hidden md:inline">
                ({lowStockProducts.map((p) => p.name).slice(0, 3).join(', ')}
                {lowStockProducts.length > 3 ? `, +${lowStockProducts.length - 3} lainnya` : ''})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReorderAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer active:scale-95 shadow-sm"
              title="Buat draf PO otomatis dikelompokkan per Supplier"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isEn ? `Reorder (${lowStockProducts.length})` : `Reorder Semua (${lowStockProducts.length})`}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveWarehouseTab('stock_alert')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                isLight
                  ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  : 'border-slate-700 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span>{isEn ? 'Detail Alert' : 'Detail Alert'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* BANNER KONFIRMASI PENERIMAAN BARANG PO (GOODS RECEIPT) */}
      {approvedPOs.length > 0 && (
        <div
          id="warehouse-gr-ready-banner"
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl border text-xs transition duration-150 ${
            isLight
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-sm'
              : 'border border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <PackageCheck className="w-4 h-4" />
            </span>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-emerald-400">
                  {isEn ? 'Goods Receipt Ready (PO Approved):' : 'Konfirmasi Penerimaan Barang (Goods Receipt PO):'}
                </span>
                <span className="px-2 py-0.2 rounded-full font-mono font-bold text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {approvedPOs.length} PO Siap Diterima Fisik
                </span>
              </div>
              <p className="text-[11px] text-gray-400 truncate max-w-xl">
                {approvedPOs.map((p) => `${p.po_number} (${p.supplier_name})`).join(' • ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id={`btn-wh-open-gr-${approvedPOs[0].po_number}`}
              onClick={() => {
                setSelectedPoForGr(approvedPOs[0]);
                setIsGrModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition cursor-pointer active:scale-95 shadow-sm"
              title="Konfirmasi fisik barang datang (Goods Receipt) ke stok gudang"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>{isEn ? `Receive Goods (${approvedPOs[0].po_number})` : `Terima Barang (${approvedPOs[0].po_number})`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={isEn ? "Search warehouse items (SKU, Product Name, Ref No)..." : "Cari item gudang (SKU, Nama Produk, No Ref)..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs outline-none border transition ${
            isLight
              ? 'bg-white border-slate-300 text-slate-900 focus:border-[#0052FF]'
              : 'bg-[#161b22] border-[#30363d] text-white focus:border-[#0052FF]'
          }`}
        />
      </div>

      {/* Inventory & Stock Mutation Card Container */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-lg transition duration-200 ${
          isLight
            ? 'bg-white border-slate-200'
            : 'bg-[#161b22] border-[#30363d]'
        }`}
      >
        {/* Navigation Tabs Header */}
        <div className="p-3 sm:p-4 border-b border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveWarehouseTab('inventory')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer border ${
                activeWarehouseTab === 'inventory'
                  ? isLight
                    ? 'bg-white text-blue-600 border-slate-200 shadow-sm'
                    : 'bg-[#0052FF] text-white border-blue-600 shadow-md'
                  : isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  : 'bg-[#0d1117] text-gray-400 border-[#30363d] hover:text-white'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{isEn ? 'Realtime Stock Ledger (DB_Inventory)' : 'Kartu Stok Realtime (DB_Inventory)'}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isLight ? 'bg-slate-200 text-slate-700' : 'bg-black/20 text-white'
              }`}>
                {filteredInventory.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveWarehouseTab('mutations')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer border ${
                activeWarehouseTab === 'mutations'
                  ? isLight
                    ? 'bg-white text-blue-600 border-slate-200 shadow-sm'
                    : 'bg-[#0052FF] text-white border-blue-600 shadow-md'
                  : isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  : 'bg-[#0d1117] text-gray-400 border-[#30363d] hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{isEn ? 'Stock Mutation History (Stock Card Audit)' : 'Riwayat Mutasi Barang (Stock Card Audit)'}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isLight ? 'bg-slate-200 text-slate-700' : 'bg-black/20 text-white'
              }`}>
                {filteredMutations.length}
              </span>
            </button>

            <button
              type="button"
              id="tab-btn-stock-alert"
              onClick={() => setActiveWarehouseTab('stock_alert')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer border ${
                activeWarehouseTab === 'stock_alert'
                  ? isLight
                    ? 'bg-white text-amber-700 border-slate-200 shadow-sm font-bold'
                    : 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                  : isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  : 'bg-[#0d1117] text-gray-400 border-[#30363d] hover:text-white'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${
                activeWarehouseTab === 'stock_alert'
                  ? isLight ? 'text-amber-600' : 'text-slate-950'
                  : 'text-amber-400'
              }`} />
              <span>{isEn ? 'Critical Stock Alerts (4 Alerts)' : 'Peringatan Stok Kritis (4 Alert)'}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeWarehouseTab === 'stock_alert'
                  ? isLight
                    ? 'bg-amber-50 text-amber-800 border border-slate-200'
                    : 'bg-black/20 text-slate-950'
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                {lowStockProducts.length} Alert
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveWarehouseTab('bad_stock')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer border ${
                activeWarehouseTab === 'bad_stock'
                  ? isLight
                    ? 'bg-white text-rose-700 border-slate-200 shadow-sm'
                    : 'bg-rose-600 text-white border-rose-500 shadow-md'
                  : isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  : 'bg-[#0d1117] text-gray-400 border-[#30363d] hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{isEn ? 'Quarantine & Bad Stock' : 'Karantina & Bad Stock'}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isLight ? 'bg-rose-50 text-rose-800 border border-slate-200' : 'bg-black/20 text-white'
              }`}>
                {(badStockItems || []).length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedProductForOpname(null);
                setIsStockOpnameOpen(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isLight
                  ? 'bg-sky-600 hover:bg-sky-700 text-white border border-sky-600 shadow-sm'
                  : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>{isEn ? 'Stock Opname' : 'Stock Opname'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto ${
                isLight
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 shadow-sm'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isEn ? 'Manual Adjustment' : 'Penyesuaian Manual'}</span>
            </button>
          </div>
        </div>

        {/* TAB 0: PERINGATAN STOK KRITIS (4 ALERT & AUTO GENERATE PR) */}
        {activeWarehouseTab === 'stock_alert' && (
          <div className="p-4 sm:p-5">
            <StockAlertTab isLight={isLight} />
          </div>
        )}

        {/* TAB 1: KARTU STOK REALTIME (DB_INVENTORY) */}
        {activeWarehouseTab === 'inventory' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`font-semibold border-b uppercase tracking-wider text-[11px] ${
                  isLight
                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-[#0d1117] text-[#8b949e] border-[#30363d]'
                }`}
              >
                <tr>
                  <th className="py-3 px-4">{isEn ? 'Product ID' : 'Product ID'}</th>
                  <th className="py-3 px-4">{isEn ? 'Product Name' : 'Nama Produk'}</th>
                  <th className="py-3 px-4 text-center">{isEn ? 'Initial Stock' : 'Stok Awal'}</th>
                  <th className="py-3 px-4 text-center text-emerald-400">
                    {isEn ? 'Inbound (In)' : 'Masuk (In)'}
                  </th>
                  <th className="py-3 px-4 text-center text-rose-400">
                    {isEn ? 'Outbound / POS (Out)' : 'Keluar / POS (Out)'}
                  </th>
                  <th className="py-3 px-4 text-center">{isEn ? 'Final Stock' : 'Stok Akhir'}</th>
                  <th className="py-3 px-4 text-center">{isEn ? 'Restock Action (PO)' : 'Aksi Restock (PO)'}</th>
                  <th className="py-3 px-4">{isEn ? 'Last Updated' : 'Pembaruan Terakhir'}</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isLight
                    ? 'divide-slate-200 text-slate-800'
                    : 'divide-[#30363d] text-gray-300'
                }`}
              >
                {filteredInventory.map((inv, idx) => {
                  const prod = products.find((p) => p.id === inv.product_id);
                  return (
                    <tr
                      key={`inv-row-${inv.product_id}-${idx}`}
                      className={`transition ${
                        isLight ? 'hover:bg-slate-50' : 'hover:bg-[#21262d]/50'
                      }`}
                    >
                      <td
                        className={`py-3 px-4 font-mono font-bold ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {inv.product_id}
                      </td>
                      <td
                        className={`py-3 px-4 font-semibold ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {prod?.name || inv.product_name}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-gray-400">
                        {inv.initial_stock}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#10B981]">
                        +{inv.in_qty}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-rose-400">
                        -{inv.out_qty}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-black text-sm">
                        {(() => {
                          const alertInfo = prod
                            ? getProductAlertThreshold(prod)
                            : { minStock: 10, isLowStock: inv.final_stock <= 10 };
                          const minStock = prod?.minStock ?? prod?.min_stock ?? alertInfo.minStock ?? 10;
                          const isLowStock = inv.final_stock <= minStock || alertInfo.isLowStock || prod?.status === 'Low Stock' || prod?.status === 'Out of Stock';
                          return (
                            <span
                              className={`px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
                                inv.final_stock <= 0
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : isLowStock
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              <span>{inv.final_stock}</span>
                              {isLowStock && (
                                <span className="text-[9px] font-sans font-bold px-1 rounded bg-amber-500/30 text-amber-300">
                                  ALERT
                                </span>
                              )}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {(() => {
                          const alertInfo = prod
                            ? getProductAlertThreshold(prod)
                            : { minStock: 10, isLowStock: inv.final_stock <= 10 };
                          const minStock = prod?.minStock ?? prod?.min_stock ?? alertInfo.minStock ?? 10;
                          const isLowStock = inv.final_stock <= minStock || alertInfo.isLowStock || prod?.status === 'Low Stock' || prod?.status === 'Out of Stock';
                          if (prod && isLowStock) {
                            return (
                              <button
                                type="button"
                                onClick={() => createAutoReorderPO(prod)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] inline-flex items-center gap-1 shadow-sm transition cursor-pointer"
                                title="Buat Draf PO Otomatis ke Purchasing"
                              >
                                <Zap className="w-3 h-3 fill-current" />
                                <span>{isEn ? 'Draft PO' : 'Draf PO'}</span>
                              </button>
                            );
                          }
                          return (
                            <span className="text-[11px] text-emerald-500/80 font-medium">
                              {isEn ? 'Stock Safe' : 'Stok Aman'}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-gray-400 font-mono">
                        {inv.last_update}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* TAB 2: RIWAYAT MUTASI BARANG (STOCK CARD AUDIT LOG) */
          <div>
            {/* Filter Pills for Mutations */}
            <div className="p-3 border-b border-[#30363d] flex flex-wrap items-center justify-between gap-2 text-xs bg-[#0d1117]/50">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-gray-400 font-semibold mr-1 text-[11px]">
                  {isEn ? 'Type Filter:' : 'Filter Tipe:'}
                </span>
                <button
                  type="button"
                  onClick={() => setMutationTypeFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    mutationTypeFilter === 'ALL'
                      ? 'bg-[#0052FF] text-white shadow-sm'
                      : 'bg-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {isEn ? 'All' : 'Semua'} ({stockMutations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMutationTypeFilter('OPENING_STOCK_MIGRATION')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    mutationTypeFilter === 'OPENING_STOCK_MIGRATION'
                      ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                      : 'bg-slate-800 text-indigo-300 hover:bg-slate-700'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-indigo-300" />
                  <span>
                    {isEn ? 'Opening Stock / Rollback' : 'Migrasi & Rollback'} (
                    {stockMutations.filter((m) => m.type === 'OPENING_STOCK_MIGRATION' || m.type === 'ROLLBACK_MIGRATION').length})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setMutationTypeFilter('IN_GR')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    mutationTypeFilter === 'IN_GR'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-800 text-teal-300 hover:bg-slate-700'
                  }`}
                >
                  <PackageCheck className="w-3 h-3" />
                  <span>
                    {isEn ? 'PO Receipt / GR' : 'Penerimaan PO / GR'} (
                    {
                      stockMutations.filter(
                        (m) =>
                          m.type === 'IN / GOODS_RECEIPT' ||
                          m.type === 'IN / RECEIVING PO' ||
                          m.type === 'IN_PURCHASE' ||
                          m.type.includes('PURCHASE') ||
                          m.type.includes('GOODS_RECEIPT')
                      ).length
                    }
                    )
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setMutationTypeFilter('OUT_KASIR')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    mutationTypeFilter === 'OUT_KASIR'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
                  }`}
                >
                  {isEn ? 'POS Sales (OUT_SALES)' : 'Kasir POS (OUT_SALES)'} (
                  {stockMutations.filter((m) => m.type === 'OUT / KASIR' || m.type === 'OUT_SALES').length})
                </button>
                <button
                  type="button"
                  onClick={() => setMutationTypeFilter('IN_RETURN')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    mutationTypeFilter === 'IN_RETURN'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                  }`}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>
                    {isEn ? 'Customer Returns' : 'Retur Konsumen'} (
                    {stockMutations.filter((m) => m.type.includes('IN_RETURN')).length})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setMutationTypeFilter('IN')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    mutationTypeFilter === 'IN'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {isEn ? 'Manual In / Correction' : 'Masuk Manual / Koreksi'} (
                  {stockMutations.filter((m) => m.type === 'IN').length})
                </button>
              </div>
              <span className="text-[11px] text-gray-400">
                {isEn
                  ? `Showing ${filteredMutations.length} mutation records`
                  : `Menampilkan ${filteredMutations.length} catatan mutasi`}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead
                  className={`font-semibold border-b uppercase tracking-wider text-[11px] ${
                    isLight
                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                      : 'bg-[#0d1117] text-[#8b949e] border-[#30363d]'
                  }`}
                >
                  <tr>
                    <th className="py-3 px-4">{isEn ? 'Timestamp' : 'Waktu'}</th>
                    <th className="py-3 px-4">{isEn ? 'Mutation Type' : 'Tipe Mutasi'}</th>
                    <th className="py-3 px-4">{isEn ? 'Ref No & Warehouse' : 'No. Referensi & Gudang'}</th>
                    <th className="py-3 px-4">{isEn ? 'Product' : 'Produk'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Initial Stock' : 'Stok Awal'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Mutation Qty' : 'Qty Mutasi'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Final Stock' : 'Stok Akhir'}</th>
                    <th className="py-3 px-4">{isEn ? 'Notes / Operator' : 'Keterangan / Operator'}</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isLight
                      ? 'divide-slate-200 text-slate-800'
                      : 'divide-[#30363d] text-gray-300'
                  }`}
                >
                  {filteredMutations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500 font-medium">
                        {isEn
                          ? 'No stock mutation records found for this filter'
                          : 'Belum ada riwayat mutasi stok tercatat untuk filter ini'}
                      </td>
                    </tr>
                  ) : (
                    filteredMutations.map((mut, idx) => {
                      const isOutKasir = mut.type === 'OUT / KASIR' || mut.type === 'OUT_SALES';
                      const isInReturn = mut.type.includes('IN_RETURN');
                      const isInGR =
                        mut.type === 'IN / GOODS_RECEIPT' ||
                        mut.type === 'IN / RECEIVING PO' ||
                        mut.type === 'IN_PURCHASE' ||
                        mut.type.includes('PURCHASE') ||
                        mut.type.includes('GOODS_RECEIPT');
                      const isOpeningMigration = mut.type === 'OPENING_STOCK_MIGRATION';
                      const isRollbackMigration = mut.type === 'ROLLBACK_MIGRATION';
                      const isOut = mut.type === 'OUT' || isOutKasir || isRollbackMigration;
                      const isIn = mut.type === 'IN' || isInGR || isInReturn || isOpeningMigration;

                      return (
                        <tr
                          key={`mut-row-${mut.id}-${idx}`}
                          className={`transition ${
                            isLight ? 'hover:bg-slate-50' : 'hover:bg-[#21262d]/50'
                          }`}
                        >
                          <td className="py-3 px-4 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                            <div>{mut.timestamp || mut.date}</div>
                            {mut.date && mut.timestamp && mut.date !== mut.timestamp && (
                              <div className="text-[10px] text-gray-500 font-mono">{mut.date}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase inline-flex items-center gap-1 border ${
                                isOpeningMigration
                                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_8px_rgba(99,102,241,0.25)]'
                                  : isRollbackMigration
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.25)]'
                                  : isInReturn
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                                  : isOutKasir
                                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                  : isInGR
                                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-[0_0_8px_rgba(20,184,166,0.25)]'
                                  : isOut
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  : isIn
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              }`}
                            >
                              {isOpeningMigration && <Sparkles className="w-3 h-3 text-indigo-300" />}
                              {isRollbackMigration && <Undo2 className="w-3 h-3 text-purple-300" />}
                              {isInReturn && <RotateCcw className="w-3 h-3 text-amber-300" />}
                              {isInGR && <PackageCheck className="w-3 h-3 text-teal-300" />}
                              <span>
                                {isOpeningMigration
                                  ? (isEn ? 'OPENING STOCK' : 'MIGRASI STOK AWAL')
                                  : isRollbackMigration
                                  ? (isEn ? 'ROLLBACK MIGRATION' : 'ROLLBACK MIGRASI')
                                  : isOutKasir
                                  ? (isEn ? 'POS SALE (OUT_SALES)' : 'KASIR POS (OUT_SALES)')
                                  : isInGR
                                  ? (isEn ? 'PO PURCHASE (IN_PURCHASE)' : 'PENERIMAAN PO (IN_PURCHASE)')
                                  : isInReturn
                                  ? (isEn ? 'CUSTOMER RETURN' : 'RETUR KONSUMEN')
                                  : mut.type}
                              </span>
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[#0052FF] dark:text-[#58a6ff] whitespace-nowrap">
                            <div>{mut.reference_no}</div>
                            {mut.referenceId && mut.referenceId !== mut.reference_no && (
                              <div className="text-[10px] text-gray-400 font-mono font-normal">
                                Ref: {mut.referenceId}
                              </div>
                            )}
                            {(mut.supplier_name || mut.supplier) && (
                              <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                                <Truck className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                                <span>{mut.supplier_name || mut.supplier}</span>
                              </div>
                            )}
                            {mut.warehouse && (
                              <div className="text-[10px] text-cyan-400 font-mono font-medium flex items-center gap-1 mt-0.5">
                                <Building2 className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                                <span>{mut.warehouse}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            <div className={isLight ? 'text-slate-900' : 'text-white'}>
                              {mut.product_name}
                            </div>
                            <div className="font-mono text-[10px] text-gray-400">
                              SKU: {mut.sku || mut.product_id}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-gray-400">
                            {mut.previous_stock}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-black text-sm whitespace-nowrap">
                            <span className={isOut ? 'text-rose-400' : 'text-emerald-400'}>
                              {isOut ? `-${mut.qty}` : `+${mut.qty}`}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-white whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                              {mut.balanceAfter ?? mut.final_stock}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[11px] text-gray-400">
                            <div>
                              {isOpeningMigration
                                ? (isEn ? 'Legacy System Opening Stock Migration' : 'Migrasi Stok Awal Sistem Lama')
                                : (mut.notes || '-')}
                            </div>
                            {(mut.cashier_name || mut.operator) && (
                              <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                                {isEn ? 'Kasir:' : 'Kasir:'} {mut.cashier_name || mut.operator}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Adjust Stock */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-md rounded-2xl p-6 shadow-2xl relative border ${
              isLight
                ? 'bg-white border-slate-300'
                : 'bg-[#161b22] border-[#30363d]'
            }`}
          >
            <button
              onClick={() => setIsAdjustModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3
              className={`font-bold text-base mb-4 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Mutasi / Penyesuaian Stok Gudang
            </h3>

            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-300 font-semibold block mb-1">
                  Pilih Produk
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] text-white px-3 py-2 rounded-xl outline-none focus:border-[#0052FF]"
                >
                  {products.map((p, pIdx) => (
                    <option key={`wh-opt-${p.id}-${pIdx}`} value={p.id}>
                      {p.name} (Stok: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('IN')}
                  className={`py-2 rounded-xl font-bold border transition ${
                    adjustType === 'IN'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-[#0d1117] text-gray-400 border-[#30363d]'
                  }`}
                >
                  Tambah Stok (+)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('OUT')}
                  className={`py-2 rounded-xl font-bold border transition ${
                    adjustType === 'OUT'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-[#0d1117] text-gray-400 border-[#30363d]'
                  }`}
                >
                  Kurangi Stok (-)
                </button>
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">
                  Jumlah Unit
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full bg-[#0d1117] border border-[#30363d] text-white px-3 py-2 rounded-xl outline-none focus:border-[#0052FF]"
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">
                  Alasan Penyesuaian
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] text-white px-3 py-2 rounded-xl outline-none focus:border-[#0052FF]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#21262d] text-gray-300 hover:bg-[#30363d]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0052FF] text-white font-bold hover:bg-[#0043d1] shadow-[0_0_12px_rgba(0,82,255,0.4)]"
                >
                  Terapkan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI RINGKASAN DRAF PO OTOMATIS */}
      {summaryModalPOs && (
        <AutoPoSummaryModal
          generatedPOs={summaryModalPOs}
          onClose={() => setSummaryModalPOs(null)}
          onViewInPurchasing={() => {
            setSummaryModalPOs(null);
            setActiveNav('purchasing');
          }}
          isLight={isLight}
          sourceModule="Warehouse"
        />
      )}

      {/* MODAL: STOCK OPNAME FISIK VS SISTEM */}
      {isStockOpnameOpen && (
        <StockOpnameModal
          isOpen={isStockOpnameOpen}
          preselectedProduct={selectedProductForOpname}
          onClose={() => {
            setIsStockOpnameOpen(false);
            setSelectedProductForOpname(null);
          }}
          isLight={isLight}
        />
      )}

      {/* MODAL: VERIFIKASI PENERIMAAN BARANG (GOODS RECEIPT / GR) */}
      <GoodsReceiptModal
        isOpen={isGrModalOpen}
        po={selectedPoForGr}
        onClose={() => {
          setIsGrModalOpen(false);
          setSelectedPoForGr(null);
        }}
        isLight={isLight}
      />
    </div>
  );
};
