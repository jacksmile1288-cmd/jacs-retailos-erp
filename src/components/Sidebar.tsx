import React from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Database, 
  ShieldCheck, 
  Users, 
  Wallet, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Settings, 
  Info 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeNav, setActiveNav, theme } = useApp();

  const navItems = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'master', label: 'MASTER DATA CANONICAL', icon: Database },
    { id: 'executive', label: 'EXECUTIVE & MANAGERIAL', icon: ShieldCheck, badge: '1 Queue', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { id: 'hr', label: 'HUMAN RESOURCES', icon: Users, badge: '2 Leave', badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { id: 'finance', label: 'FINANCE & ACCOUNTING', icon: Wallet },
    { id: 'purchasing', label: 'PURCHASING', icon: ShoppingCart, badge: '1 PO', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { id: 'warehouse', label: 'WAREHOUSE & INVENTORY', icon: Package },
    { id: 'pos', label: 'POS & CASHIER', icon: CreditCard },
    { id: 'admin', label: 'SUPER ADMIN', icon: Settings },
    { id: 'about', label: 'About System & Dev', icon: Info, subtitle: 'v4.2 Enterprise' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-[#0d1117]/80 border border-[#30363d]/60 p-1 shadow-md">
            <img src="/Logo-JacS-Enterprise.png" alt="JacS Enterprise Logo" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(0,82,255,0.4)]" />
          </div>
        <div>
          <div className="font-bold text-white text-base leading-tight tracking-wide flex items-center gap-1.5">
            JacS RetailOS
            <span className="text-[10px] font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded">
              ERP
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Enterprise Retail Management</div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        <div className="text-[10px] font-bold text-slate-500 px-3 pt-2 pb-1 tracking-wider uppercase">
          Navigation Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-slate-800 text-slate-400 group-hover:text-cyan-300 group-hover:bg-slate-700/60'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="truncate text-left">
                  <div>{item.label}</div>
                  {item.subtitle && (
                    <div className="text-[10px] font-normal text-slate-500 -mt-0.5">{item.subtitle}</div>
                  )}
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-medium border px-1.5 py-0.5 rounded-md shrink-0 ml-2 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
