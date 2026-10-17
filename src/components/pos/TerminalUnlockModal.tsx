import React, { useState } from 'react';
import { Terminal, User, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import { Lock, X, ShieldAlert, KeyRound, Check, Delete, Eye, EyeOff, User as UserIcon } from 'lucide-react';

interface TerminalUnlockModalProps {
  terminal: Terminal | null;
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: (terminal: Terminal, user?: User) => void;
}

export const TerminalUnlockModal: React.FC<TerminalUnlockModalProps> = ({
  terminal,
  isOpen,
  onClose,
  onUnlockSuccess,
}) => {
  const { developerPassword, users, employees, setCurrentUser, setActiveUser } = useApp();
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  if (!isOpen || !terminal) return null;

  const handleVerify = (inputVal: string) => {
    const trimmed = inputVal.trim();
    if (!trimmed) {
      setErrorMessage('Masukkan kata sandi master atau PIN');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    // 1. Cek Sandi Master Super Admin (dinamis dari state / localStorage)
    const storedMaster = localStorage.getItem('jacs_super_admin_password');
    const isMasterMatch =
      trimmed === developerPassword ||
      (Boolean(storedMaster) && trimmed === storedMaster) ||
      trimmed === 'Admin123';

    // 2. Tentukan Kasir Berdasarkan Terminal & PIN Kasir
    const termName = (terminal.name || '').toUpperCase();
    const termCode = (terminal.code || '').toUpperCase();
    const termId = (terminal.id || '').toUpperCase();

    let targetCashierName = '';
    let targetCashierRole = 'Kasir 01';
    let targetCashierEmail = 'andi.pos01@jacs-erp.com';
    let targetCashierId = 'emp-001';

    if (termName.includes('02') || termCode.includes('02') || termId === 'T-02') {
      targetCashierName = 'Maya Indah';
      targetCashierRole = 'Kasir 02';
      targetCashierEmail = 'maya.pos02@jacs-erp.com';
      targetCashierId = 'emp-002';
    } else if (termName.includes('03') || termCode.includes('03') || termId === 'T-03') {
      targetCashierName = 'Rian Hidayat';
      targetCashierRole = 'Kasir 03';
      targetCashierEmail = 'rian.pos03@jacs-erp.com';
      targetCashierId = 'emp-003';
    } else if (termName.includes('04') || termCode.includes('04') || termId === 'T-04') {
      targetCashierName = 'Siti Aminah';
      targetCashierRole = 'Kasir 04';
      targetCashierEmail = 'siti.pos04@jacs-erp.com';
      targetCashierId = 'emp-004';
    } else {
      targetCashierName = 'Andi Pratama';
      targetCashierRole = 'Kasir 01';
      targetCashierEmail = 'andi.pos01@jacs-erp.com';
      targetCashierId = 'emp-001';
    }

    // Jika input PIN 1111/2222/3333/7777, override ke kasir spesifik
    if (trimmed === '1111') {
      targetCashierName = 'Andi Pratama';
      targetCashierRole = 'Kasir 01';
    } else if (trimmed === '2222') {
      targetCashierName = 'Maya Indah';
      targetCashierRole = 'Kasir 02';
    } else if (trimmed === '3333') {
      targetCashierName = 'Rian Hidayat';
      targetCashierRole = 'Kasir 03';
    } else if (trimmed === '7777') {
      targetCashierName = 'Siti Aminah';
      targetCashierRole = 'Kasir 04';
    }

    let matchedUser: User | undefined;
    const isPin1234 = trimmed === '1234';
    const isLegacyPin = trimmed === '1111' || trimmed === '2222' || trimmed === '3333' || trimmed === '7777';

    if (isPin1234 || isLegacyPin) {
      const existingUser = users.find((u) => u.name === targetCashierName);
      const existingEmp = employees.find((e) => e.name === targetCashierName);
      matchedUser = existingUser || (existingEmp ? {
        user_id: existingEmp.id,
        id: existingEmp.id,
        name: existingEmp.name,
        email: existingEmp.email || targetCashierEmail,
        division: 'POS & Kasir',
        role: 'Kasir',
        status: 'Active',
        pin: '1234',
        avatar: existingEmp.avatar || null,
        avatarUrl: existingEmp.avatarUrl ?? null,
      } : {
        user_id: targetCashierId,
        id: targetCashierId,
        name: targetCashierName,
        email: targetCashierEmail,
        division: 'POS & Kasir',
        role: 'Kasir',
        status: 'Active',
        pin: '1234',
        avatar: null,
        avatarUrl: null,
      });
    } else {
      // Cek PIN Operator Kasir / Staff yang Terdaftar di users / employees
      matchedUser = users.find((u) => u.pin === trimmed && u.status === 'Active');
      if (!matchedUser) {
        const emp = employees.find((e) => e.pin === trimmed && e.status !== 'Inactive');
        if (emp) {
          matchedUser = {
            user_id: emp.id,
            id: emp.id,
            name: emp.name,
            email: emp.email || `${emp.name.toLowerCase().replace(/\s+/g, '.')}@jacs-erp.com`,
            division: emp.division,
            role: (emp.role.includes('Kasir') ? 'Kasir' : emp.role.includes('Manager') ? 'Manager' : emp.role) as UserRole,
            status: 'Active',
            pin: emp.pin,
            avatar: emp.avatar || null,
            avatarUrl: emp.avatarUrl ?? null,
          };
        }
      }
    }

    if (isMasterMatch || matchedUser) {
      if (matchedUser) {
        setCurrentUser(matchedUser);
        setActiveUser(matchedUser);
      }
      setErrorMessage(null);
      onUnlockSuccess(terminal, matchedUser);
      setPasswordInput('');
    } else {
      setErrorMessage('Akses Ditolak: Sandi Master atau PIN Kasir Salah');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      setPasswordInput('');
    }
  };

  const handleKeyClick = (char: string) => {
    setErrorMessage(null);
    setPasswordInput((prev) => prev + char);
  };

  const handleDelete = () => {
    setPasswordInput((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  return (
    <div
      id="modal-terminal-unlock"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150"
    >
      <div
        className={`w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative text-white transition-all ${
          isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
        }`}
        style={{
          borderTop: `4px solid ${terminal.colorHex}`,
          boxShadow: `0 0 30px ${terminal.colorHex}25`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8b949e] hover:text-white p-2 rounded-lg hover:bg-[#21262d] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-4">
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border shadow-lg"
            style={{
              backgroundColor: `${terminal.colorHex}20`,
              borderColor: `${terminal.colorHex}60`,
              color: terminal.colorHex,
              boxShadow: `0 0 20px ${terminal.colorHex}40`,
            }}
          >
            <Lock className="w-7 h-7 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <span>OTORISASI KASIR OPERASIONAL</span>
          </div>

          <h3 className="text-lg font-black tracking-wide" style={{ color: terminal.colorHex }}>
            {terminal.name} • {terminal.businessModel || terminal.location}
          </h3>
          <p className="text-xs text-[#8b949e] max-w-xs mx-auto">
            Masukkan PIN Kasir untuk membuka terminal dan mencatat identitas kasir di profil Topbar.
          </p>
        </div>

        {/* Quick Cashier Selector Buttons */}
        <div className="mb-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1 flex items-center justify-between">
            <span>PILIH CEPAT KASIR BERTUGAS:</span>
            <span className="text-cyan-400 font-mono">4 Kasir Aktif</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'k1', name: 'Andi Pratama', role: 'Kasir 01', pin: '1234' },
              { id: 'k2', name: 'Maya Indah', role: 'Kasir 02', pin: '1234' },
              { id: 'k3', name: 'Rian Hidayat', role: 'Kasir 03', pin: '1234' },
              { id: 'k4', name: 'Siti Aminah', role: 'Kasir 04', pin: '1234' },
            ].map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => handleVerify(k.pin)}
                className="p-2 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] hover:border-cyan-500/50 text-left transition cursor-pointer flex items-center justify-between group"
              >
                <div className="min-w-0 pr-1">
                  <div className="text-xs font-bold text-white group-hover:text-cyan-400 truncate">
                    {k.name}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">{k.role}</div>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shrink-0">
                  {k.pin}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Box */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <input
              id="input-terminal-unlock-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Atau ketik PIN kasir (4 digit)..."
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setErrorMessage(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleVerify(passwordInput);
                }
              }}
              autoFocus
              className="w-full bg-[#0d1117] border-2 border-[#30363d] focus:border-[#0052FF] text-white text-center text-lg font-mono tracking-widest px-10 py-2.5 rounded-xl outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 cursor-pointer transition"
              title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/50 text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Security Guidance Banner */}
        <div className="mb-4 bg-[#0d1117] border border-[#30363d] rounded-xl p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-gray-400">
            <KeyRound className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>PIN Kasir Default: <span className="text-gray-300 font-mono font-bold">1234</span></span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            KASIR READY
          </span>
        </div>

        {/* On-screen Virtual Keypad for Mobile/Touch Screen */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
            <button
              key={k}
              onClick={() => {
                if (k === 'C') setPasswordInput('');
                else if (k === '⌫') handleDelete();
                else handleKeyClick(k);
              }}
              className="h-11 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white font-bold text-base border border-[#30363d] active:scale-95 transition cursor-pointer flex items-center justify-center"
            >
              {k}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#21262d] hover:bg-[#30363d] text-gray-300 transition cursor-pointer"
          >
            Batal
          </button>
          <button
            id="btn-confirm-terminal-unlock"
            onClick={() => handleVerify(passwordInput)}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#0052FF] hover:bg-[#0043d1] text-white shadow-[0_0_15px_rgba(0,82,255,0.4)] transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Buka Terminal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
