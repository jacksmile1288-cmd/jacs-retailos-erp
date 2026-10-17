import React from 'react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-white shadow-2xl">
        <h3 className="text-lg font-bold mb-2">Pengaturan Profil Pengguna</h3>
        <p className="text-xs text-slate-400 mb-6">Profil operasional terhubung dengan sistem Khansa Swalayan ERP.</p>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm transition"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
