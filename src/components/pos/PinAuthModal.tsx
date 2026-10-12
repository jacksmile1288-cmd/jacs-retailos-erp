import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, X, Delete, Check, ShieldAlert } from 'lucide-react';
import { JacSLogo } from '../common/JacSLogo';

export const PinAuthModal: React.FC = () => {
  const { isPinModalOpen, closePinAuth, verifyPin, users } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isPinModalOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + num;
      setPinInput(next);
      setErrorMessage(null);
      if (next.length === 4) {
        submitPin(next);
      }
    }
  };

  const handleDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    setPinInput('');
    setErrorMessage(null);
  };

  const submitPin = (val: string) => {
    const result = verifyPin(val);
    if (!result.success) {
      setErrorMessage(result.error || 'PIN Salah');
      setTimeout(() => {
        setPinInput('');
      }, 600);
    }
  };

  return (
    <div
      id="modal-pin-auth"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={closePinAuth}
          className="absolute top-4 right-4 text-[#8b949e] hover:text-white p-1.5 rounded-lg hover:bg-[#21262d] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Developer High-Res 3D 'J' Logo & Header (h-16 / h-20) */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center mb-1">
            <JacSLogo size="xl" imgOnly={true} className="drop-shadow-[0_4px_20px_rgba(0,82,255,0.6)]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/15 border border-blue-500/30 text-cyan-400 uppercase tracking-wider">
            JacS RetailOS ERP
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Autentikasi PIN Operator</h3>
          <p className="text-xs text-[#8b949e]">
            Masukkan 4 digit PIN kasir / supervisor untuk beralih operator
          </p>
        </div>

        {/* PIN Dots Indicator */}
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const filled = idx < pinInput.length;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  filled
                    ? 'bg-[#00f2fe] shadow-[0_0_12px_rgba(0,242,254,0.8)] scale-110'
                    : 'bg-[#21262d] border border-[#30363d]'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 text-center text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white font-bold text-xl border border-[#30363d] hover:border-[#58a6ff] active:scale-95 transition"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-14 rounded-xl bg-[#21262d]/50 hover:bg-[#21262d] text-xs font-medium text-[#8b949e] hover:text-white border border-[#30363d] transition flex items-center justify-center"
          >
            CLEAR
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white font-bold text-xl border border-[#30363d] hover:border-[#58a6ff] active:scale-95 transition"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-xl bg-[#21262d]/50 hover:bg-[#21262d] text-[#8b949e] hover:text-rose-400 border border-[#30363d] transition flex items-center justify-center active:scale-95"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Staff Reference List (Demo convenience with hidden PIN protection) */}
        <div className="pt-3 border-t border-[#30363d] text-[11px] text-[#8b949e]">
          <span className="font-semibold text-gray-300">Pilih Cepat Operator (PIN Terproteksi):</span>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {users.slice(0, 4).map((u) => (
              <button
                key={u.user_id}
                onClick={() => submitPin(u.pin)}
                className="text-left bg-[#0d1117] hover:bg-[#21262d] p-1.5 rounded border border-[#30363d] hover:border-[#00f2fe]/40 transition cursor-pointer"
                title={`Login cepat sebagai ${u.name}`}
              >
                <div className="font-medium text-white truncate">{u.name}</div>
                <div className="text-[10px] text-cyan-400 font-mono">PIN: •••• ({u.role})</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
