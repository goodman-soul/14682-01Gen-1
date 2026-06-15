import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useStoreConfig } from '@/stores/useStoreConfig';
import { useNetworkStore } from '@/stores/useNetworkStore';
import { storeList, themes } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { OfflineFeatureModal } from './OfflineFeatureModal';

const actionIconMap: Record<string, LucideIcon> = {
  Zap: Icons.Zap,
  Package: Icons.Package,
  BarChart3: Icons.BarChart3,
  Tag: Icons.Tag,
  Settings: Icons.Settings,
  Users: Icons.Users,
  ClipboardList: Icons.ClipboardList,
  Receipt: Icons.Receipt,
};

export function TopBar() {
  const navigate = useNavigate();
  const currentStoreId = useStoreConfig((state) => state.currentStoreId);
  const storeConfigs = useStoreConfig((state) => state.storeConfigs);
  const setTheme = useStoreConfig((state) => state.setTheme);
  const switchStore = useStoreConfig((state) => state.switchStore);
  const isOnline = useNetworkStore((state) => state.isOnline);
  const pendingSyncCount = useNetworkStore((state) => state.pendingSyncCount);
  const toggleOnline = useNetworkStore((state) => state.toggleOnline);

  const currentConfig = useMemo(
    () => storeConfigs[currentStoreId],
    [storeConfigs, currentStoreId]
  );
  const storeName = currentConfig?.storeName || '';
  const quickActions = currentConfig?.quickActions || [];
  const themeId = currentConfig?.themeId || 'classic-blue';
  const currentTheme = themes.find((t) => t.id === themeId);

  const themeOptions = themes.map((t) => ({
    id: t.id,
    name: t.name,
    color: t.colors.primary,
  }));

  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  const handleStoreChange = (storeId: string) => {
    switchStore(storeId);
    const target = storeList.find((s) => s.storeId === storeId);
    if (target) {
      navigate(storeConfigs[storeId]?.defaultHomepage || '/cashier');
    }
    setShowStoreDropdown(false);
  };

  return (
    <>
      <header className="h-16 bg-header border-b border-slate-200 flex items-center px-5 gap-4 flex-shrink-0 relative">
        <div className="relative">
          <button
            onClick={() => setShowStoreDropdown(!showStoreDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Icons.MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-slate-700">{storeName}</span>
            <Icons.ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          {showStoreDropdown && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-fade-in">
              {storeList.map((store) => (
                <button
                  key={store.storeId}
                  onClick={() => handleStoreChange(store.storeId)}
                  className={cn(
                    'w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2.5',
                    store.storeId === currentStoreId
                      ? 'bg-primary/5 text-primary font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <Icons.Store className="w-4 h-4" />
                  {store.storeName}
                  {store.storeId === currentStoreId && (
                    <Icons.Check className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200" />

        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          <span className="text-xs text-slate-400 flex-shrink-0">快捷操作：</span>
          {quickActions
            .sort((a, b) => a.order - b.order)
            .map((action) => {
              const Icon = actionIconMap[action.icon] || Icons.Circle;
              return (
                <button
                  key={action.id}
                  onClick={() => navigate(action.route)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-primary/10 hover:text-primary transition-all whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  <span>{action.label}</span>
                </button>
              );
            })}
        </div>

        <div className="flex items-center gap-2">
          {!isOnline && pendingSyncCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs">
              <Icons.RefreshCw className="w-3.5 h-3.5" />
              <span>{pendingSyncCount} 条待同步</span>
            </div>
          )}

          <button
            onClick={() => setShowOfflineModal(true)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors',
              isOnline
                ? 'text-slate-500 hover:bg-slate-100'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            )}
          >
            <Icons.Wifi className={cn('w-4 h-4', !isOnline && 'text-red-500')} />
            <span className="font-medium">{isOnline ? '网络正常' : '已离线'}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="切换主题"
            >
              <Icons.Palette className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500">{currentTheme?.name || '主题'}</span>
            </button>
            {showThemeDropdown && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-fade-in">
                {themeOptions.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setTheme(theme.id);
                      setShowThemeDropdown(false);
                    }}
                    className={cn(
                      'w-full px-4 py-2.5 flex items-center gap-2.5 text-sm transition-colors',
                      currentTheme?.id === theme.id
                        ? 'bg-primary/5 text-primary font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <span
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.color }}
                    />
                    {theme.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleOnline}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="模拟网络状态切换"
          >
            <Icons.Repeat className="w-4 h-4 text-slate-400" />
          </button>

          <div className="w-px h-6 bg-slate-200" />

          <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors relative">
            <Icons.Bell className="w-4 h-4 text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </header>

      <OfflineFeatureModal
        open={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
      />
    </>
  );
}
