import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Lock,
  UserCheck,
  CheckCircle2,
  Clock,
  Sun,
  Moon,
  BookOpen,
  Globe,
  ChevronDown,
  Check,
  Menu,
  Shield,
  LogOut,
  Sparkles,
  Info,
} from 'lucide-react';
import { SopModal } from './common/SopModal';
import { AboutSystemModal } from './common/AboutSystemModal';

interface TopbarProps {
  onOpenMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    activeUser,
    openPinAuth,
    toastMessage,
    isOnline,
    offlineQueue,
    syncOfflineQueue,
    syncOfflineTransactions,
    showToast,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [isSopModalOpen, setIsSopModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(target)
      ) {
        setIsLangDropdownOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isLight = theme === 'light';

  return (
    <header
      id="app-topbar"
      className={`h-14 w-full flex items-center justify-between px-3 sm:px-4 lg:px-6 sticky top-0 z-40 select-none backdrop-blur-md transition-colors duration-200 shadow-sm shrink-0 ${
        isLight
          ? 'bg-white/85 border-b border-slate-200/80 text-slate-800'
          : 'bg-slate-900/85 border-b border-slate-800/80 text-[#e6edf3]'
      }`}
    >
      {/* 1. Sisi Kiri: Mobile trigger, Jam Operasional Realtime, Status System Online, & Tombol Info Center & SOP */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {onOpenMobileMenu && (
          <button
            id="btn-topbar-mobile-menu"
            type="button"
            onClick={onOpenMobileMenu}
            className={`lg:hidden p-2 -ml-1 rounded-xl transition cursor-pointer flex items-center justify-center border ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-slate-800/70 hover:bg-slate-700 text-gray-300 hover:text-cyan-400 border-slate-700'
            }`}
            title="Buka Navigasi"
            aria-label="Buka Navigasi"
          >
            <Menu className="w-5 h-5 shrink-0" />
          </button>
        )}

        {/* Jam Digital Realtime */}
        <div
          id="topbar-digital-clock"
          className={`font-mono text-xs px-2.5 sm:px-3 py-1 rounded-md border flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
            isLight
              ? 'text-cyan-700 bg-cyan-50/80 border-cyan-200'
              : 'text-cyan-400 bg-slate-800/60 border-cyan-500/30'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 shrink-0" />
          <span className="whitespace-nowrap font-medium">{currentTime || '00:00:00'}</span>
        </div>

        {/* Indikator Status Koneksi & Cache (Online / Offline Mode) */}
        {isOnline ? (
          <div
            id="system-online-badge"
            className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-2 sm:px-2.5 py-1 text-xs font-semibold border whitespace-nowrap transition-all duration-300 ${
              isLight
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm'
                : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.35)]'
            }`}
            title="Sistem Terhubung ke Cloud Database"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 bg-emerald-500 ${isLight ? '' : 'drop-shadow-[0_0_8px_rgba(34,197,94,0.9)] animate-pulse'}`}></span>
            </span>
            <span className={`font-bold tracking-wide flex items-center gap-1 text-[11px] whitespace-nowrap ${isLight ? 'text-emerald-700' : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.9)]'}`}>
              <Wifi className="w-3 h-3 shrink-0" />
              <span>ONLINE (Cloud Connected)</span>
            </span>
            {offlineQueue.length > 0 && (
              <button
                type="button"
                id="btn-topbar-manual-sync"
                onClick={async () => {
                  const res = await syncOfflineTransactions();
                  showToast(res.message);
                }}
                className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-900 hover:bg-amber-400 transition cursor-pointer flex items-center gap-1 shadow-xs"
                title="Klik untuk menyinkronkan transaksi offline sekarang ke Cloud"
              >
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span>Sinkronkan Sekarang (Sync Cloud) ({offlineQueue.length})</span>
              </button>
            )}
          </div>
        ) : (
          <div
            id="system-offline-badge"
            className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-3 py-1 text-xs font-semibold border whitespace-nowrap transition-all duration-300 animate-pulse ${
              isLight
                ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm'
                : 'bg-amber-950/70 border-amber-500/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
            }`}
            title="Koneksi Terputus: Transaksi disimpan ke Local Storage & Struk tetap dapat dicetak"
          >
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 animate-ping"></span>
            </span>
            <span className="font-black tracking-wide flex items-center gap-1 text-[11px] whitespace-nowrap text-amber-500 dark:text-amber-300">
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              <span>OFFLINE MODE (Local Storage Active)</span>
            </span>
            {offlineQueue.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                [ {offlineQueue.length} Transaksi Tertunda ]
              </span>
            )}
          </div>
        )}

        {/* Tombol [Info Center & SOP] */}
        <button
          id="btn-topbar-sop-modal"
          type="button"
          onClick={() => setIsSopModalOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
            isLight
              ? 'bg-blue-50/80 border-blue-200 hover:bg-blue-100 text-blue-700 hover:border-blue-300'
              : 'bg-slate-800/80 border-slate-700 hover:border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10'
          }`}
          title={language === 'en' ? 'Open Info Center & SOP for 6 Divisions' : 'Buka Pusat Informasi & SOP Operasional 6 Divisi JacS ERP'}
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400 shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">
            {language === 'en' ? 'Info Center & SOP' : 'Pusat Informasi & SOP'}
          </span>
          <span className="sm:hidden whitespace-nowrap">SOP</span>
        </button>
      </div>

      {/* 2. Sisi Kanan: Action Controls & User Profile (Toggle Bahasa, Toggle Dark Mode, Profil) */}
      <div className="flex items-center gap-2 shrink-0 flex-shrink-0">

        {/* Dropdown Pemilih Bahasa (Language Switcher) */}
        <div className="relative shrink-0" ref={langDropdownRef}>
          <button
            id="btn-language-switcher"
            type="button"
            onClick={() => setIsLangDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
              isLight
                ? 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                : 'bg-slate-800/80 border-slate-700 hover:border-cyan-500/50 text-gray-200 hover:bg-cyan-500/10'
            }`}
            title="Pilih Bahasa / Select Language"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-bold tracking-wider whitespace-nowrap">{language.toUpperCase()}</span>
            <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
          </button>

          {/* Dropdown Menu */}
          {isLangDropdownOpen && (
            <div
              id="language-dropdown-menu"
              className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl py-1.5 z-[60] backdrop-blur-md animate-fadeIn ${
                isLight
                  ? 'bg-white/95 border-slate-200 text-slate-800'
                  : 'bg-slate-900/95 border-slate-700 text-gray-200'
              }`}
            >
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8b949e] whitespace-nowrap">
                {language === 'en' ? 'Select Language' : 'Pilih Bahasa'}
              </div>

              {/* ID Option */}
              <button
                type="button"
                id="btn-lang-id"
                onClick={() => {
                  setLanguage('id');
                  setIsLangDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 flex items-center justify-between text-xs transition cursor-pointer whitespace-nowrap ${
                  language === 'id'
                    ? isLight
                      ? 'bg-cyan-50 text-cyan-700 font-bold'
                      : 'bg-cyan-500/15 text-cyan-400 font-bold'
                    : isLight
                    ? 'hover:bg-slate-100 text-slate-700'
                    : 'hover:bg-slate-800 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-sm">🇮🇩</span>
                  <span className="whitespace-nowrap">ID - Bahasa Indonesia</span>
                </div>
                {language === 'id' && <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0" />}
              </button>

              {/* EN Option */}
              <button
                type="button"
                id="btn-lang-en"
                onClick={() => {
                  setLanguage('en');
                  setIsLangDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 flex items-center justify-between text-xs transition cursor-pointer whitespace-nowrap ${
                  language === 'en'
                    ? isLight
                      ? 'bg-cyan-50 text-cyan-700 font-bold'
                      : 'bg-cyan-500/15 text-cyan-400 font-bold'
                    : isLight
                    ? 'hover:bg-slate-100 text-slate-700'
                    : 'hover:bg-slate-800 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-sm">🇬🇧</span>
                  <span className="whitespace-nowrap">EN - English</span>
                </div>
                {language === 'en' && <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0" />}
              </button>
            </div>
          )}
        </div>

        {/* Tombol Toggle Dark / Light Mode */}
        <div className="flex items-center shrink-0">
          <button
            id="btn-theme-toggle"
            type="button"
            onClick={toggleTheme}
            className={`group relative flex items-center p-1 rounded-full border transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0 ${
              isLight
                ? 'bg-amber-50 border-amber-300 hover:border-amber-400 text-amber-900 shadow-xs'
                : 'bg-slate-800/80 border-slate-700 hover:border-indigo-500/50 text-[#e6edf3]'
            }`}
            title={`Mode saat ini: ${isLight ? 'Terang (Light Mode)' : 'Gelap (Dark Mode)'} - Klik untuk beralih`}
          >
            <div className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap">
              {/* Sun Icon */}
              <div
                className={`p-1 rounded-full transition-all duration-300 flex items-center justify-center ${
                  isLight
                    ? 'bg-amber-400 text-white shadow-[0_0_10px_rgba(245,158,11,0.6)] scale-110'
                    : 'text-gray-400 hover:text-amber-400'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </div>

              {/* Moon Icon */}
              <div
                className={`p-1 rounded-full transition-all duration-300 flex items-center justify-center ${
                  !isLight
                    ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.6)] scale-110'
                    : 'text-gray-400 hover:text-indigo-600'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>
        </div>

        {/* Profil Pengguna Aktif & Menu Profil Dropdown */}
        <div className="relative shrink-0" ref={profileDropdownRef}>
          <div
            id="topbar-user-profile"
            onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-2 rounded-full p-1 pl-2.5 pr-2 border whitespace-nowrap shrink-0 cursor-pointer transition select-none ${
              isLight
                ? 'bg-slate-100 border-slate-200 hover:bg-slate-200/80'
                : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700/80'
            }`}
          >
            <div className="flex flex-col text-right leading-none whitespace-nowrap">
              <span
                className={`text-xs font-bold leading-tight flex items-center gap-1 justify-end whitespace-nowrap ${
                  isLight ? 'text-slate-900' : 'text-[#e6edf3]'
                }`}
              >
                <UserCheck className="w-3 h-3 text-[#10B981] shrink-0" />
                <span className="whitespace-nowrap">{activeUser.name}</span>
              </span>
              <span className="text-[10px] text-[#8b949e] font-medium whitespace-nowrap mt-0.5">{activeUser.role}</span>
            </div>

            <img
              src={
                activeUser.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={activeUser.name}
              className={`w-7 h-7 rounded-full object-cover border shrink-0 ${
                isLight ? 'border-slate-300' : 'border-slate-700'
              }`}
            />

            <button
              id="btn-switch-operator-pin"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openPinAuth();
              }}
              className={`p-1.5 rounded-full transition border cursor-pointer shrink-0 ${
                isLight
                  ? 'bg-white hover:bg-slate-200 text-slate-700 border-slate-300 hover:text-[#0052FF]'
                  : 'bg-slate-900/60 hover:bg-slate-700 text-[#8b949e] hover:text-[#00f2fe] border-slate-700'
              }`}
              title="Ganti Operator / Kasir menggunakan PIN"
            >
              <Lock className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>

          {/* User Profile Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div
              id="user-profile-dropdown-menu"
              className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl py-2 z-[60] backdrop-blur-md animate-fadeIn ${
                isLight
                  ? 'bg-white/95 border-slate-200 text-slate-800'
                  : 'bg-slate-900/95 border-slate-700 text-gray-200'
              }`}
            >
              <div className="px-4 py-2.5 border-b border-gray-700/30">
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      activeUser.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={activeUser.name}
                    className="w-9 h-9 rounded-full object-cover border border-cyan-500/50"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{activeUser.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono truncate">{activeUser.email || `${activeUser.user_id}@jacs.retailos.id`}</p>
                  </div>
                </div>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>{activeUser.role} • Aktif</span>
                </div>
              </div>

              <div className="p-2 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    openPinAuth();
                  }}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs transition cursor-pointer font-medium ${
                    isLight
                      ? 'hover:bg-slate-100 text-slate-700'
                      : 'hover:bg-slate-800 text-gray-200'
                  }`}
                >
                  <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{language === 'en' ? 'Switch Operator / PIN Login' : 'Ganti Operator / Login PIN'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    setIsSopModalOpen(true);
                  }}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs transition cursor-pointer font-medium ${
                    isLight
                      ? 'hover:bg-slate-100 text-slate-700'
                      : 'hover:bg-slate-800 text-gray-200'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'en' ? 'System SOP & Helpdesk' : 'Pusat SOP & Panduan Operasional'}</span>
                </button>
                <button
                  type="button"
                  id="btn-topbar-about-system"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    setIsAboutModalOpen(true);
                  }}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs transition cursor-pointer font-medium ${
                    isLight
                      ? 'hover:bg-slate-100 text-slate-700'
                      : 'hover:bg-slate-800 text-gray-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{language === 'en' ? 'About System & Developer' : 'Tentang Sistem & Pengembang'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Notification Toast */}
      {toastMessage && (
        <div
          id="global-toast"
          className="fixed bottom-6 right-6 z-[70] flex items-center gap-3 bg-[#161b22] border border-[#10B981] text-[#e6edf3] px-4 py-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-bounce"
        >
          <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
          <div className="text-sm font-medium">{toastMessage}</div>
        </div>
      )}

      {/* Pop-up Modal Pusat Informasi & SOP */}
      <SopModal
        isOpen={isSopModalOpen}
        onClose={() => setIsSopModalOpen(false)}
      />

      {/* Pop-up Modal Tentang Sistem & Pengembang */}
      <AboutSystemModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        isLight={isLight}
        language={language}
        onOpenSop={() => setIsSopModalOpen(true)}
      />
    </header>
  );
};
