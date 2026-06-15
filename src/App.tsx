import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Cashier } from '@/pages/Cashier';
import { Inventory } from '@/pages/Inventory';
import { Promotion } from '@/pages/Promotion';
import { Dashboard } from '@/pages/Dashboard';
import { Settings } from '@/pages/Settings';
import { useStoreConfig } from '@/stores/useStoreConfig';
import { useTheme } from '@/hooks/useTheme';

function HomeRedirect() {
  const currentStoreId = useStoreConfig((state) => state.currentStoreId);
  const storeConfigs = useStoreConfig((state) => state.storeConfigs);
  const defaultHomepage = storeConfigs[currentStoreId]?.defaultHomepage || '/cashier';
  return <Navigate to={defaultHomepage} replace />;
}

export default function App() {
  useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400 text-sm">正在加载门店系统...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomeRedirect />} />
          <Route path="cashier" element={<Cashier />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="promotion" element={<Promotion />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<HomeRedirect />} />
        </Route>
      </Routes>
    </Router>
  );
}
