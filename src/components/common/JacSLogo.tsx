import React from 'react';

export interface JacSLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;
  showSubtitle?: boolean;
  showErpBadge?: boolean;
  className?: string;
  isLight?: boolean;
  imgOnly?: boolean;
}

export const JacSLogo: React.FC<JacSLogoProps> = () => {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/jacs-logo.png"
        alt="JacS Logo"
        className="w-10 h-10 object-contain shrink-0"
        onError={(e) => {
          // Fallback jika path public berbeda
          const target = e.currentTarget;
          if (!target.dataset.tried) {
            target.dataset.tried = 'true';
            target.src = '/Logo JacS ENterprise.png';
          }
        }}
      />
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
            JacS RetailOS
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white leading-none shrink-0">
            ERP
          </span>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight whitespace-nowrap truncate mt-0.5">
          Enterprise Retail Management
        </span>
      </div>
    </div>
  );
};
