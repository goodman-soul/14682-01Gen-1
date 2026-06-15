import { useState } from 'react';
import { WifiOff, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useNetworkStore } from '@/stores/useNetworkStore';
import { offlineFeatures } from '@/data/mockData';
import { cn } from '@/lib/utils';

export function OfflineBanner() {
  const isOnline = useNetworkStore((state) => state.isOnline);
  const pendingSyncCount = useNetworkStore((state) => state.pendingSyncCount);
  const [expanded, setExpanded] = useState(false);

  if (isOnline) return null;

  const availableCount = offlineFeatures.filter((f) => f.availableOffline).length;

  return (
    <div className="bg-red-600 text-white animate-fade-in">
      <div className="px-5 py-3 flex items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <WifiOff className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>当前网络已断开，部分功能暂不可用</span>
              <span className="px-2 py-0.5 bg-white/15 rounded text-xs">
                {availableCount} 项功能仍可离线使用
              </span>
              {pendingSyncCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/90 rounded text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  {pendingSyncCount} 条数据待同步
                </span>
              )}
            </div>
            {expanded && (
              <div className="mt-3 pl-11 grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-white/80 animate-fade-in">
                {offlineFeatures.slice(0, 6).map((f) => (
                  <div key={f.id} className="flex items-center gap-2">
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        f.availableOffline ? 'bg-emerald-300' : 'bg-white/30'
                      )}
                    />
                    <span className={f.availableOffline ? '' : 'opacity-50 line-through'}>
                      {f.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors text-sm"
        >
          {expanded ? (
            <>
              <span>收起</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>查看详情</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
