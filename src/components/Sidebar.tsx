import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActiveNavModule } from '../types';
import { AboutSystemModal } from './common/AboutSystemModal';
import { QuickAuthModal } from './auth/QuickAuthModal';
import { getReactiveNeonGlowStyle } from '../utils/neonGlow';
import {
  Home,
  LayoutDashboard,
  Database,
  BarChart3,
  Users,
  Wallet,
  ShoppingBag,
  Boxes,
  Store,
  ChevronRight,
  X,
  Info,
  ShieldCheck,
  Building2,
  Package,
} from 'lucide-react';

interface NavItemConfig {
  id: ActiveNavModule;
  labelKey: string;
  defaultLabel: string;
  enLabel: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  badgeCountKey?: 'pendingApprovals' | 'pendingLeave' | 'pendingPO';
  customBadge?: string;
  colorHex: string;
  isProtected?: boolean;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'home',
    labelKey: 'BERANDA',
    defaultLabel: 'BERANDA',
    enLabel: 'HOME',
    icon: Home,
    colorHex: '#38bdf8',
  },
  {
    id: 'dashboard',
    labelKey: 'DASHBOARD UTAMA',
    defaultLabel: 'DASHBOARD UTAMA',
    enLabel: 'MAIN DASHBOARD',
    icon: LayoutDashboard,
    colorHex: '#00f5ff',
  },
  {
    id: 'master',
    labelKey: 'DATA MASTER',
    defaultLabel: 'DATA MASTER',
    enLabel: 'MASTER DATA',
    icon: Database,
    customBadge: 'KATALOG',
    colorHex: '#39ff14',
  },
  {
    id: 'executive',
    labelKey: 'EKSEKUTIF & MANAJERIAL',
    defaultLabel: 'EKSEKUTIF & MANAJERIAL',
    enLabel: 'EXECUTIVE & MANAGERIAL',
    icon: BarChart3,
    badgeCountKey: 'pendingApprovals',
    colorHex: '#bf5af2',
    isProtected: true,
  },
  {
    id: 'hr',
    labelKey: 'SDM & PERSONALIA',
    defaultLabel: 'SDM & PERSONALIA',
    enLabel: 'HR & PERSONNEL',
    icon: Users,
    badgeCountKey: 'pendingLeave',
    colorHex: '#ff375f',
    isProtected: true,
  },
  {
    id: 'finance',
    labelKey: 'KEUANGAN & AKUNTANSI',
    defaultLabel: 'KEUANGAN & AKUNTANSI',
    enLabel: 'FINANCE & ACCOUNTING',
    icon: Wallet,
    colorHex: '#ffd60a',
    isProtected: true,
  },
  {
    id: 'purchasing',
    labelKey: 'PENGADAAN & PEMBELIAN',
    defaultLabel: 'PENGADAAN & PEMBELIAN',
    enLabel: 'PURCHASING & PO',
    icon: ShoppingBag,
    badgeCountKey: 'pendingPO',
    colorHex: '#ff9f0a',
  },
  {
    id: 'warehouse',
    labelKey: 'GUDANG & INVENTORI',
    defaultLabel: 'GUDANG & INVENTORI',
    enLabel: 'WAREHOUSE & INVENTORY',
    icon: Boxes,
    colorHex: '#30d158',
  },
  {
    id: 'pos',
    labelKey: 'KASIR & PENJUALAN',
    defaultLabel: 'KASIR & PENJUALAN',
    enLabel: 'POS & CASHIER',
    icon: Store,
    colorHex: '#0a84ff',
  },
];

export const Sidebar: React.FC<{
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}> = ({ isOpenMobile, onCloseMobile }) => {
  const {
    activeNavModule,
    setActiveNavModule,
    businessProfile,
    language,
    posPendingApprovalsCount,
    leavePendingCount,
    purchaseOrders,
  } = useApp();

  const isEn = language === 'EN';
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingNavModule, setPendingNavModule] = useState<ActiveNavModule | null>(null);
  const [pendingNavTitle, setPendingNavTitle] = useState('');

  const getBadgeCount = (key?: 'pendingApprovals' | 'pendingLeave' | 'pendingPO') => {
    if (!key) return 0;
    if (key === 'pendingApprovals') return posPendingApprovalsCount || 0;
    if (key === 'pendingLeave') return leavePendingCount || 0;
    if (key === 'pendingPO') {
      return (purchaseOrders || []).filter((po) => po.status === 'PENDING').length;
    }
    return 0;
  };

  const handleNavClick = (item: NavItemConfig) => {
    if (item.isProtected) {
      setPendingNavModule(item.id);
      setPendingNavTitle(isEn ? item.enLabel : item.defaultLabel);
      setAuthModalOpen(true);
      return;
    }
    setActiveNavModule(item.id);
    onCloseMobile();
  };

  const handleAuthSuccess = () => {
    if (pendingNavModule) {
      setActiveNavModule(pendingNavModule);
      setPendingNavModule(null);
      setAuthModalOpen(false);
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Backdrop Mobile */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 p-1.5 flex items-center justify-center shrink-0">
              <img
                src="/logo-jacs-enterprise.png"
                alt="JacS Enterprise Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-wide text-white">
                  {businessProfile?.name || 'JacS RetailOS'}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                {businessProfile?.tagline || 'Enterprise Retail Management'}
              </p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Category Label */}
        <div className="px-4 pt-4 pb-1">
          <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            {isEn ? 'NAVIGATION MENU' : 'MENU NAVIGASI'}
          </p>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNavModule === item.id;
            const Icon = item.icon;
            const badgeCount = getBadgeCount(item.badgeCountKey);
            const dynamicGlow = getReactiveNeonGlowStyle(item.colorHex, isActive);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                style={dynamicGlow}
                className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 border ${
                  isActive
                    ? 'bg-slate-800/90 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="p-1.5 rounded-lg transition-transform duration-200 group-hover:scale-110"
                    style={{
                      backgroundColor: `${item.colorHex}15`,
                      color: item.colorHex,
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate">
                    {isEn ? item.enLabel : item.defaultLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.customBadge && (
                    <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      {item.customBadge}
                    </span>
                  )}
                  {badgeCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40">
                      {badgeCount}{' '}
                      {item.badgeCountKey === 'pendingApprovals'
                        ? 'Antrean'
                        : item.badgeCountKey === 'pendingLeave'
                        ? 'Cuti'
                        : 'PO'}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isActive
                        ? 'translate-x-0.5 text-cyan-400'
                        : 'text-slate-600 group-hover:text-slate-400'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>

        {/* Developer Footer */}
        <div className="p-3 border-t border-slate-800/90 bg-slate-950/40">
          <button
            onClick={() => setIsAboutOpen(true)}
            className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-800/60 transition-colors border border-slate-800/60 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700/70 p-0.5 flex items-center justify-center shrink-0">
                <img
                  src="/logo-jacs-enterprise.png"
                  alt="JacS Enterprise Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="truncate">
                <div className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-400 flex items-center gap-1.5 transition-colors">
                  <span>JacS Architecture</span>
                </div>
                <p className="text-[9px] text-slate-400">JacS Developer</p>
              </div>
            </div>
            <Info className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0" />
          </button>
        </div>
      </aside>

      {/* About & Super Admin Modal */}
      <AboutSystemModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Auth Modal untuk Navigasi Terproteksi */}
      <QuickAuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingNavModule(null);
        }}
        onSuccess={handleAuthSuccess}
        moduleTitle={pendingNavTitle}
        targetModule={pendingNavModule || undefined}
        requireMasterPassword={pendingNavModule === 'executive'}
        subtitle={
          isEn
            ? `Enter authorization PIN to access ${pendingNavTitle}`
            : `Masukkan PIN otorisasi untuk mengakses ${pendingNavTitle}`
        }
      />
    </>
  );
};

export default Sidebar;