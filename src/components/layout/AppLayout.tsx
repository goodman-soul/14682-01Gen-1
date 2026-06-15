import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { OfflineBanner } from './OfflineBanner';
import { useTheme } from '@/hooks/useTheme';
import { useNetworkStore } from '@/stores/useNetworkStore';

export function AppLayout() {
  useTheme();
  const setOnline = useNetworkStore((state) => state.setOnline);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <OfflineBanner />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-auto bg-slate-100">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
