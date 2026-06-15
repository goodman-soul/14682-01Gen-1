import { X, CheckCircle2, XCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { offlineFeatures } from '@/data/mockData';
import { useNetworkStore } from '@/stores/useNetworkStore';
import { cn } from '@/lib/utils';

interface OfflineFeatureModalProps {
  open: boolean;
  onClose: () => void;
}

export function OfflineFeatureModal({ open, onClose }: OfflineFeatureModalProps) {
  const isOnline = useNetworkStore((state) => state.isOnline);
  const lastOnlineTime = useNetworkStore((state) => state.lastOnlineTime);
  const pendingSyncCount = useNetworkStore((state) => state.pendingSyncCount);

  if (!open) return null;

  const groupedFeatures = offlineFeatures.reduce((acc, feature) => {
    if (!acc[feature.module]) {
      acc[feature.module] = [];
    }
    acc[feature.module].push(feature);
    return acc;
  }, {} as Record<string, typeof offlineFeatures>);

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return '未知';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-[720px] max-h-[80vh] bg-white rounded-2xl shadow-2xl animate-fade-in flex flex-col overflow-hidden">
        <div
          className={cn(
            'px-6 py-5 flex items-center gap-4',
            isOnline ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-red-50 border-b border-red-100'
          )}
        >
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              isOnline ? 'bg-emerald-100' : 'bg-red-100'
            )}
          >
            {isOnline ? (
              <Wifi className="w-6 h-6 text-emerald-600" />
            ) : (
              <WifiOff className="w-6 h-6 text-red-600" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-800">
              {isOnline ? '网络连接正常' : '当前处于离线模式'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {isOnline
                ? '所有功能正常可用'
                : `上次在线时间：${formatTime(lastOnlineTime)}`}
              {pendingSyncCount > 0 && (
                <span className="ml-3 inline-flex items-center gap-1 text-amber-600">
                  <Clock className="w-3.5 h-3.5" />
                  {pendingSyncCount} 条数据待同步
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/50 transition-colors text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-600">离线可用</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-slate-300" />
              <span className="text-slate-600">仅在线可用</span>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedFeatures).map(([module, features]) => (
              <div key={module}>
                <h3 className="text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-primary" />
                  {module}
                </h3>
                <div className="bg-slate-50 rounded-xl divide-y divide-slate-200 overflow-hidden">
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className="px-4 py-3 flex items-center gap-4 hover:bg-slate-100/50 transition-colors"
                    >
                      {feature.availableOffline ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div
                          className={cn(
                            'text-sm font-medium',
                            feature.availableOffline ? 'text-slate-800' : 'text-slate-400'
                          )}
                        >
                          {feature.name}
                        </div>
                        <div
                          className={cn(
                            'text-xs mt-0.5',
                            feature.availableOffline ? 'text-slate-500' : 'text-slate-400'
                          )}
                        >
                          {feature.description}
                        </div>
                      </div>
                      {!feature.availableOffline && !isOnline && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-md font-medium">
                          暂不可用
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
