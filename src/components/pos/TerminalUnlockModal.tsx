import React, { useState } from 'react';
import { Terminal } from '../../types';
import { Lock, X, ShieldAlert, KeyRound, Check, Delete, Eye, EyeOff } from 'lucide-react';

interface TerminalUnlockModalProps {
  terminal: Terminal | null;
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: (terminal: Terminal) => void;
}

export const TerminalUnlockModal: React.FC<TerminalUnlockModalProps> = ({
  terminal,
  isOpen,
  onClose,
  onUnlockSuccess,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showQuickTips, setShowQuickTips] = useState(false);

  if (!isOpen || !terminal) return null;

  const handleVerify = (inputVal: string) => {
    const trimmed = inputVal.trim();
    // Default standard password: "Admin123", also accept "admin123" or "8888" (Super Admin PIN)
    if (trimmed === 'Admin123' || trimmed === 'admin123' || trimmed === '8888') {
      setErrorMessage(null);
      onUnlockSuccess(terminal);
      setPasswordInput('');
    } else {
      setErrorMessage('Akses Ditolak: Password Otorisasi Salah');
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
        <div className="text-center space-y-2 mb-5">
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

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <span>TERMINAL STATUS: LOCKED / MAINTENANCE</span>
          </div>

          <h3 className="text-lg font-black tracking-wide" style={{ color: terminal.colorHex }}>
            {terminal.name} • {terminal.businessModel || terminal.location}
          </h3>
          <p className="text-xs text-[#8b949e] max-w-xs mx-auto">
            Masukkan Password Otorisasi Super Admin untuk Membuka Terminal
          </p>
        </div>

        {/* Input Box */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <input
              id="input-terminal-unlock-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Ketik password otorisasi..."
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
              className="w-full bg-[#0d1117] border-2 border-[#30363d] focus:border-[#0052FF] text-white text-center text-lg font-mono tracking-widest px-10 py-3 rounded-xl outline-none transition"
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

        {/* Quick Password Hint & Button to Autofill Admin123 */}
        <div className="mb-4 bg-[#0d1117] border border-[#30363d] rounded-xl p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-gray-400">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Password Default: <strong className="text-amber-400 font-mono">Admin123</strong></span>
          </div>
          <button
            onClick={() => {
              setPasswordInput('Admin123');
              handleVerify('Admin123');
            }}
            className="px-2.5 py-1 rounded bg-[#0052FF]/20 hover:bg-[#0052FF]/30 text-[#58a6ff] border border-[#0052FF]/40 text-[11px] font-bold transition cursor-pointer"
          >
            Gunakan Default
          </button>
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
