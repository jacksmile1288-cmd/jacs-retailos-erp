import React from 'react';
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

const AppContent: React.FC = () => {
  const { activeNav, theme } = useApp();
  const isLight = theme === 'light';

  const renderModule = () => {
    switch (activeNav) {
      case 'home':
        return <HomeModule />;
      case 'dashboard':
        return <DashboardModule />;
      case 'pos':
        return <PosModule />;
      case 'master':
        return <MasterDataModule />;
      case 'executive':
        return <ExecutiveModule />;
      case 'purchasing':
        return <PurchasingModule />;
      case 'finance':
        return <FinanceModule />;
      case 'warehouse':
        return <WarehouseModule />;
      case 'hr':
        return <HrModule />;
      case 'admin':
        return <SuperAdminModule />;
      default:
        return <HomeModule />;
    }
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0d1117] text-[#c9d1d9]'}`}>
      <div className="shrink-0 h-full hidden md:block border-r border-[#30363d] bg-[#161b22]">
        <Sidebar />
      </div>
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <Topbar />
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderModule()}
        </main>
      </div>
      <PinAuthModal />
      <ReceiptModal />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
