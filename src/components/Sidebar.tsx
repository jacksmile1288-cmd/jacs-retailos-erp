import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ActiveNavModule } from '../types';
import { getReactiveNeonGlowStyle } from '../utils/neonGlow';
import { JacSLogo } from './common/JacSLogo';
import { AboutSystemModal } from './common/AboutSystemModal';
import {
  Home,
  LayoutDashboard,
  Database,
  Briefcase,
  CreditCard,
  ShoppingBag,
  Boxes,
  Users,
  Store,
  ShieldAlert,
  X,
  Info,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  id: ActiveNavModule;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  neonColor: string;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC<{ isOpenMobile: boolean; onCloseMobile: () => void }> = ({
  isOpenMobile,
  onCloseMobile,
}) => {
  const {
    activeNav,
    setActiveNav,
    products,
    purchasing,
    purchaseRequests,
    promotions,
    approvalQueue,
    employees,
    leaveRequests,
    theme,
    language,
  } = useApp();
  const [hoveredNavId, setHoveredNavId] = useState<string | null>(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const isLight = theme === 'light';
  const isEn = language === 'en';

  // 1. Executive Pending Approvals & Authorizations (status === 'PENDING' / 'PENDING_APPROVAL')
  const totalExecutivePending = useMemo(() => {
    // a. Dokumen dalam antrean persetujuan eksekutif
    const pendingInQueue = (approvalQueue || []).filter(
      (a) => a.status === 'PENDING' || (a.status as string) === 'PENDING_APPROVAL'
    );

    // b. Berkas PO bernilai tinggi/direksi yang masih pending persetujuan
    const pendingExecutivePOs = (purchasing || []).filter((po) => {
      const s = (po.status || '').toUpperCase().trim();
      const isPending =
        s === 'PENDING_APPROVAL' ||
        s === 'MENUNGGU APPROVAL DIREKSI' ||
        s === 'MENUNGGU APPROVAL PIMPINAN' ||
        s === 'PENDING APPROVAL' ||
        s === 'PENDING';
      if (!isPending) return false;
      const inQueue = pendingInQueue.some(
        (a) =>
          a.reference_id === po.po_number ||
          a.id.includes(po.po_number)
      );
      return !inQueue;
    });

    // c. Berkas promosi yang berstatus pending otorisasi
    const pendingPromos = (promotions || []).filter((p) => {
      const s = (p.status || '').toUpperCase().trim();
      return s === 'PENDING' || s === 'PENDING_APPROVAL';
    });

    return pendingInQueue.length + pendingExecutivePOs.length + pendingPromos.length;
  }, [approvalQueue, purchasing, promotions]);

  // 2. Warehouse Stock Alerts: Filter out items with active draft PRs or in-process restock POs
  const lowStockProducts = (products || []).filter((p) => {
    const minStock = p.min_stock || 10;
    return (
      p.stock <= minStock ||
      p.status === 'Low Stock' ||
      p.status === 'Out of Stock'
    );
  });

  const unhandledStockAlerts = lowStockProducts.filter((p) => {
    const pName = p.name.toLowerCase().trim();
    const pId = p.id.toLowerCase().trim();

    // Check if item has draft PR / active PR in purchaseRequests
    const hasActivePR = (purchaseRequests || []).some((pr) => {
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

    if (hasActivePR) return false;

    // Check if item is already in an active restock PO (in process of ordering / restock)
    const hasActivePO = (purchasing || []).some((po) => {
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

    if (hasActivePO) return false;

    return true;
  });

  const activeAlertCount = unhandledStockAlerts.length;

  const pendingPoCount = (purchasing || []).filter(
    (po) =>
      po.status === 'Draft' ||
      po.status === 'Menunggu Approval Pimpinan' ||
      po.status === 'PENDING APPROVAL' ||
      po.status === 'Pending Approval' ||
      po.status === 'Disetujui (Approved)' ||
      po.status === 'Disetujui' ||
      po.status === 'Approved' ||
      po.status === 'Dipesan' ||
      po.status === 'SENT_TO_VENDOR' ||
      po.status === 'Sent' ||
      po.status === 'PARTIALLY_RECEIVED'
  ).length;

  const pendingLeavesCount = (leaveRequests || []).filter((l) => l.status === 'Menunggu').length;

  // PRIMARY MENU ITEMS (Clean Single-Language Based on Active Language)
  const primaryNavItems: NavItem[] = [
    {
      id: 'home',
      label: isEn ? 'HOME' : 'BERANDA',
      icon: Home,
      neonColor: '#00f2fe',
    },
    {
      id: 'dashboard',
      label: 'DASHBOARD',
      icon: LayoutDashboard,
      neonColor: '#0052FF',
    },
    {
      id: 'master-data',
      label: 'MASTER DATA',
      icon: Database,
      neonColor: '#00f2fe',
      badge: 'CANONICAL',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    },
    {
      id: 'executive',
      label: isEn ? 'EXECUTIVE & MANAGERIAL' : 'EKSEKUTIF & MANAJERIAL',
      icon: Briefcase,
      neonColor: '#10B981',
      badge:
        totalExecutivePending > 0
          ? `${totalExecutivePending} ${isEn ? 'Queue' : 'Antrean'}`
          : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    },
    {
      id: 'hr',
      label: isEn ? 'HUMAN RESOURCES' : 'SDM & PERSONALIA',
      icon: Users,
      neonColor: '#06b6d4',
      badge: pendingLeavesCount > 0 
        ? `${pendingLeavesCount} ${isEn ? 'Leave' : 'Cuti'}` 
        : `${employees.length} ${isEn ? 'Staff' : 'Staf'}`,
      badgeColor: pendingLeavesCount > 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    },
    {
      id: 'finance',
      label: isEn ? 'FINANCE & ACCOUNTING' : 'KEUANGAN & AKUNTANSI',
      icon: CreditCard,
      neonColor: '#f59e0b',
    },
    {
      id: 'purchasing',
      label: isEn ? 'PURCHASING' : 'PENGADAAN & PEMBELIAN',
      icon: ShoppingBag,
      neonColor: '#f43f5e',
      badge: pendingPoCount > 0 ? `${pendingPoCount} PO` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    },
    {
      id: 'warehouse',
      label: isEn ? 'WAREHOUSE & INVENTORY' : 'GUDANG & INVENTORI',
      icon: Boxes,
      neonColor: '#8b5cf6',
      badge: activeAlertCount > 0 ? `${activeAlertCount} Alert` : undefined,
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    },
    {
      id: 'pos',
      label: isEn ? 'POS & CASHIER' : 'KASIR & PENJUALAN',
      icon: Store,
      neonColor: '#ff7a00',
    },
    {
      id: 'admin',
      label: 'SUPER ADMIN',
      icon: ShieldAlert,
      neonColor: '#ec4899',
      badge: 'DEV CONSOLE',
      badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/40',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 lg:top-14 bottom-0 left-0 z-30 w-64 md:w-72 border-r flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
            : 'bg-[#161b22] border-[#30363d] text-[#e6edf3]'
        } ${isOpenMobile ? 'translate-x-0 z-50 top-0' : '-translate-x-full'}`}
      >
        {/* 2. Brand Header: JacS RetailOS ERP (Sidebar Kiri Atas) */}
        <div
          className={`h-16 px-3.5 xl:px-4 flex items-center justify-between border-b transition-colors shrink-0 ${
            isLight ? 'border-slate-200 bg-white' : 'border-[#30363d] bg-[#161b22]'
          }`}
        >
          <div className="flex-1 min-w-0 pr-2">
            <JacSLogo />
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className={`p-1.5 rounded-lg transition cursor-pointer lg:hidden shrink-0 ${
              isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Tutup Menu"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Navigation Menu List: Clean Primary Modules (Fit to Viewport) */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2 xl:py-2.5 space-y-1">
          <div className="px-2.5 pb-1 text-[9px] xl:text-[10px] font-bold text-[#8b949e] uppercase tracking-wider select-none">
            {isEn ? 'NAVIGATION MENU' : 'MENU NAVIGASI'}
          </div>

          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            const isHovered = hoveredNavId === item.id;

            // Thick multi-layer neon glow with specific module color and instant reactive hover
            const navStyle = getReactiveNeonGlowStyle(item.neonColor, isActive, isHovered, isLight);

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  setActiveNav(item.id);
                  onCloseMobile();
                }}
                onMouseEnter={() => setHoveredNavId(item.id)}
                onMouseLeave={() => setHoveredNavId(null)}
                style={isLight || isActive ? undefined : navStyle}
                className={`w-full group flex items-center justify-between px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-xl text-left transition-all duration-150 ease-out cursor-pointer ${
                  isActive
                    ? isLight
                      ? 'border-l-4 border-cyan-600 bg-cyan-100 text-cyan-900 shadow-sm font-bold'
                      : 'border-l-4 border-cyan-400 bg-cyan-950/70 shadow-[inset_0_0_15px_rgba(6,182,212,0.35)] text-cyan-300 font-extrabold'
                    : isLight
                    ? 'text-slate-800 hover:bg-slate-100 hover:text-slate-900 font-semibold'
                    : 'text-slate-200 dark:text-slate-200 hover:bg-slate-800 hover:text-white font-semibold'
                }`}
              >
                <div className="flex items-center gap-2.5 xl:gap-3 min-w-0">
                  {/* Icon with Individual Glow */}
                  <div
                    className={`w-6 h-6 xl:w-6.5 xl:h-6.5 rounded-lg flex items-center justify-center transition shrink-0 ${
                      isActive
                        ? isLight
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]'
                        : isLight
                        ? 'bg-slate-100 text-slate-600 group-hover:text-slate-900 group-hover:bg-slate-200'
                        : 'bg-[#0d1117] text-slate-300 border border-[#30363d]'
                    }`}
                    style={
                      !isActive && !isLight && isHovered
                        ? {
                            backgroundColor: `${item.neonColor}25`,
                            color: item.neonColor,
                            boxShadow: `0 0 10px ${item.neonColor}50`,
                          }
                        : {}
                    }
                  >
                    <Icon
                      className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
                        isActive
                          ? isLight
                            ? 'text-white'
                            : 'text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]'
                          : isLight
                          ? 'text-slate-600 group-hover:text-slate-900'
                          : 'text-slate-300'
                      }`}
                    />
                  </div>

                  {/* Clean Menu Label Only */}
                  <span
                    className={`text-xs xl:text-sm tracking-wide truncate ${
                      isActive
                        ? isLight
                          ? 'text-cyan-900 font-bold'
                          : 'text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)] font-bold'
                        : isLight
                        ? 'text-slate-800 group-hover:text-slate-900 font-semibold'
                        : 'text-slate-200 group-hover:text-white font-semibold'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Optional Badge: Jangan render badge angka sama sekali jika 0 atau tidak ada dokumen pending */}
                {item.id === 'executive' ? (
                  totalExecutivePending > 0 && Boolean(item.badge) ? (
                    <span
                      className={`text-[10px] xl:text-xs font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${
                        isActive
                          ? isLight
                            ? 'bg-cyan-200/80 border-cyan-400 text-cyan-900'
                            : 'bg-cyan-500/25 border-cyan-400/50 text-cyan-200 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]'
                          : isLight
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : item.badgeColor || 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null
                ) : (
                  Boolean(item.badge) && item.badge !== 0 && item.badge !== '0' && (
                    <span
                      className={`text-[10px] xl:text-xs font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${
                        isActive
                          ? isLight
                            ? 'bg-cyan-200/80 border-cyan-400 text-cyan-900'
                            : 'bg-cyan-500/25 border-cyan-400/50 text-cyan-200 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]'
                          : isLight
                          ? 'bg-slate-200 text-slate-800 border-slate-300'
                          : item.badgeColor || 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )
                )}
              </button>
            );
          })}
        </div>

        {/* 3. Footer Brand & Tentang Sistem Trigger */}
        <div
          className={`p-2.5 border-t shrink-0 ${
            isLight ? 'border-slate-200 bg-slate-50/70' : 'border-[#30363d] bg-[#12161c]'
          }`}
        >
          <button
            type="button"
            id="btn-sidebar-about-system"
            onClick={() => setIsAboutModalOpen(true)}
            className={`w-full p-2 rounded-xl flex items-center justify-between transition cursor-pointer text-xs group ${
              isLight
                ? 'hover:bg-slate-200/80 text-slate-700 hover:text-slate-900'
                : 'hover:bg-slate-800 text-gray-300 hover:text-white'
            }`}
            title={isEn ? 'About JacS RetailOS ERP & Developer' : 'Tentang Sistem JacS ERP & Pengembang'}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="flex flex-col text-left leading-tight min-w-0">
                <span className="font-bold text-[11px] truncate">
                  {isEn ? 'About System & Dev' : 'Tentang Sistem & Dev'}
                </span>
                <span className="text-[9px] text-[#8b949e] font-mono">
                  v4.2 Enterprise
                </span>
              </div>
            </div>
            <Info className="w-3.5 h-3.5 text-[#8b949e] group-hover:text-cyan-400 shrink-0" />
          </button>
        </div>
      </aside>

      {/* Modal Tentang Sistem & Pengembang */}
      <AboutSystemModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        isLight={isLight}
        language={language}
      />
    </>
  );
};
