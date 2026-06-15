import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { menuItems } from '@/data/mockData';
import { useStoreConfig } from '@/stores/useStoreConfig';
import { useNetworkStore } from '@/stores/useNetworkStore';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Calculator: Icons.Calculator,
  Package: Icons.Package,
  Tag: Icons.Tag,
  BarChart3: Icons.BarChart3,
  Settings: Icons.Settings,
  Store: Icons.Store,
};

export function Sidebar() {
  const storeName = useStoreConfig((state) => state.storeName);
  const isOnline = useNetworkStore((state) => state.isOnline);

  return (
    <aside className="w-60 h-full bg-sidebar text-sidebar-text flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
          <Icons.Store className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">{storeName}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={cn(
                'w-2 h-2 rounded-full animate-pulse-dot',
                isOnline ? 'bg-green-400' : 'bg-red-400'
              )}
            />
            <span className="text-xs opacity-70">{isOnline ? '在线' : '离线模式'}</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto sidebar-scroll">
        <div className="px-3 mb-2">
          <span className="px-2 text-xs font-medium opacity-50 uppercase tracking-wider">
            功能模块
          </span>
        </div>
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = iconMap[item.icon] || Icons.Circle;
            return (
              <li key={item.id}>
                <NavLink
                  to={item.route}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-white/15 text-white shadow-sm'
                        : 'opacity-80 hover:opacity-100 hover:bg-white/10'
                    )
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-semibold text-sm">
            店
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">张店长</div>
            <div className="text-xs opacity-60 truncate">店长权限</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
