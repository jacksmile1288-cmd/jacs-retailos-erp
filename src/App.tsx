import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { HomeModule } from './components/home/HomeModule';
import { PosModule } from './components/pos/PosModule';
import { DashboardModule } from './components/dashboard/DashboardModule';
import { MasterDataModule } from './components/master/MasterDataModule';
import { ExecutiveModule } from './components/executive/ExecutiveModule';
import { PurchasingModule } from './components/purchasing/PurchasingModule';
import { FinanceModule } from './components/finance/FinanceModule';
import { WarehouseModule } from './components/warehouse/WarehouseModule';
import { HrModule } from './components/hr/HrModule';
import { SuperAdminModule } from './components/admin/SuperAdminModule';
import { PinAuthModal } from './components/pos/PinAuthModal';
import { ReceiptModal } from './components/pos/ReceiptModal';
import {
  AlertTriangle,
  Power,
  Building2,
  Lock,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  LogIn,
  ArrowRight,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeNav,
    setActiveNav,
    theme,
    isCashierWorkspaceActive,
    activeUser,
    setActiveUser,
    users,
    isGlobalMaintenance,
    toggleGlobalMaintenance,
    businessProfile,
    isFirstRunSetup,
    setIsSuperAdminAuthenticated,
    showToast,
  } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isFullscreenCashier = activeNav === 'pos' && isCashierWorkspaceActive;
  const isSuperAdmin = activeUser?.role === 'Super Admin';

  // If first run setup is active or business profile is unconfigured, redirect initial flow directly to Super Admin profile onboarding
  useEffect(() => {
    const isProfileUnconfigured = !businessProfile?.name?.trim() || !businessProfile?.isConfigured;
    if ((isFirstRunSetup || isProfileUnconfigured) && activeNav === 'pos') {
      setActiveNav('admin');
      showToast('Selesaikan registrasi profil entitas usaha terlebih dahulu di Super Admin sebelum menggunakan Kasir.');
    }
  }, [isFirstRunSetup, businessProfile, activeNav, setActiveNav, showToast]);

  // ==============================================================
  // 1. GLOBAL MAINTENANCE MODE STANDBY SCREEN (FOR REGULAR USERS)
  // ==============================================================
  if (isGlobalMaintenance && !isSuperAdmin && activeNav !== 'admin') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 font-sans ${
        theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-[#0a0d12] text-white'
      }`}>
        <div className={`w-full max-w-xl rounded-3xl p-8 border shadow-2xl text-center space-y-6 ${
          theme === 'light'
            ? 'bg-white border-slate-300 shadow-slate-200'
            : 'bg-[#161b22] border-rose-500/40 shadow-[0_0_50px_rgba(244,63,94,0.2)]'
        }`}>
          {/* Logo & Beacon */}
          <div className="flex items-center justify-center gap-3">
            {businessProfile.logoUrl ? (
              <img
                src={businessProfile.logoUrl}
                alt="Logo"
                className="w-12 h-12 object-contain rounded-xl"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : null}
            <div className="text-left">
              <h3 className="font-extrabold text-base tracking-tight text-cyan-400">
                {businessProfile.name}
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                {businessProfile.category}
              </p>
            </div>
          </div>

          <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center bg-rose-500/15 border-2 border-rose-500/50 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.35)] animate-pulse">
            <Power className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-black bg-rose-500/20 text-rose-300 border border-rose-500/50 tracking-wider uppercase">
              GLOBAL MAINTENANCE MODE ACTIVE
            </span>
            <h1 className="text-2xl font-black tracking-tight mt-2">
              Sistem Dalam Pemeliharaan Terpusat
            </h1>
            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
              Akses reguler untuk operasional kasir POS, gudang inventori, dan SDM ditangguhkan sementara demi keamanan integritas data saat pemeliharaan, migrasi, atau diagnosa terpadu.
            </p>
          </div>

          {/* System Info Bento */}
          <div className="grid grid-cols-2 gap-3 text-left text-xs p-4 rounded-2xl bg-black/25 border border-gray-800">
            <div>
              <span className="text-[10px] text-gray-500 block">Status Gateway:</span>
              <span className="font-mono font-bold text-rose-400">STANDBY / LOCKDOWN</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">Akun Terdeteksi:</span>
              <span className="font-bold text-gray-300">{activeUser?.name || 'Staff'} ({activeUser?.role || 'Reguler'})</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">Otoritas Akses:</span>
              <span className="text-amber-400 font-semibold">Khusus Super Admin</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">Perkiraan Durasi:</span>
              <span className="text-emerald-400 font-mono font-bold">&plusmn; 10 Menit</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                const superAdminUser = users.find((u) => u.role === 'Super Admin') || users[0];
                if (superAdminUser) {
                  setActiveUser(superAdminUser);
                }
                setActiveNav('admin');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.35)] cursor-pointer transition active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Login sebagai Super Admin (Dev Console)</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-semibold border border-gray-700 hover:bg-gray-800 text-gray-300 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
              <span>Periksa Ulang Status</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen overflow-hidden flex flex-col font-sans transition-colors duration-200 ${
      theme === 'light' ? 'bg-[#F1F5F9] text-[#0F172A]' : 'bg-[#0d1117] text-[#e6edf3]'
    }`}>
      {/* 1. Global Maintenance Alert Banner for Super Admin */}
      {isGlobalMaintenance && isSuperAdmin && (
        <div className="bg-gradient-to-r from-rose-700 via-pink-700 to-rose-700 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-lg z-50 shrink-0 animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-300" />
            <span>
              <strong>GLOBAL MAINTENANCE MODE AKTIF:</strong> Seluruh pengguna reguler (Kasir &amp; Staff) sedang terkunci di halaman standby. Hanya Anda yang memiliki akses sistem.
            </span>
          </div>
          <button
            onClick={toggleGlobalMaintenance}
            className="px-3 py-1 rounded-lg bg-white text-rose-900 font-extrabold text-[11px] hover:bg-rose-50 transition cursor-pointer shrink-0 ml-3"
          >
            Matikan Mode Maintenance
          </button>
        </div>
      )}

      {/* 2. First-Time Run Setup Onboarding Banner */}
      {isFirstRunSetup && activeNav !== 'admin' && (
        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-lg z-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 shrink-0 text-cyan-200" />
            <span>
              <strong>SETUP PERTAMA (FIRST-RUN):</strong> Harap lengkapi Profil &amp; Registrasi Entitas Usaha di modul Super Admin sebelum memulai operasional kasir.
            </span>
          </div>
          <button
            onClick={() => setActiveNav('admin')}
            className="px-3 py-1 rounded-lg bg-white text-blue-900 font-extrabold text-[11px] hover:bg-cyan-50 transition cursor-pointer shrink-0 ml-3 flex items-center gap-1"
          >
            <span>Buka Setup Profil Entitas Usaha</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Topbar: hidden during active cashier transaction register for 100% widescreen workspace */}
      {!isFullscreenCashier && (
        <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
      )}

      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Sidebar: auto-collapsed when cashier transaction workspace is active */}
        {!isFullscreenCashier && (
          <Sidebar
            isOpenMobile={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Viewport: Fullscreen 100% width during cashier transaction */}
        <main
          className={`flex-1 ${
            !isFullscreenCashier
              ? 'lg:ml-64 md:lg:ml-72 pt-6 pb-12 px-6 sm:px-8 overflow-y-auto flex flex-col'
              : 'lg:ml-0 p-0 sm:p-2 overflow-y-auto'
          } max-w-full`}
        >
          {activeNav === 'home' && <HomeModule />}
          {activeNav === 'pos' && <PosModule />}
          {activeNav === 'dashboard' && <DashboardModule />}
          {activeNav === 'executive' && <ExecutiveModule />}
          {activeNav === 'finance' && <FinanceModule />}
          {activeNav === 'purchasing' && <PurchasingModule />}
          {activeNav === 'warehouse' && <WarehouseModule />}
          {activeNav === 'hr' && <HrModule />}
          {activeNav === 'master-data' && <MasterDataModule />}
          {activeNav === 'admin' && <SuperAdminModule />}
        </main>
      </div>

      {/* Global Modals */}
      <PinAuthModal />
      <ReceiptModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
