import { useState } from 'react';
import {
  Tag,
  Percent,
  Gift,
  Layers,
  Plus,
  Search,
  Clock,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Edit3,
  Trash2,
  ChevronRight,
  Sparkles,
  Ban,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { promotionRules } from '@/data/mockData';
import { useNetworkStore } from '@/stores/useNetworkStore';
import { cn } from '@/lib/utils';
import type { PromotionRule } from '@/types';

type StatusFilter = 'all' | 'active' | 'pending' | 'ended';
type TypeFilter = 'all' | 'discount' | 'full_reduction' | 'gift' | 'combo';

const typeIconMap: Record<string, LucideIcon> = {
  discount: Percent,
  full_reduction: Tag,
  gift: Gift,
  combo: Layers,
};

const typeNameMap: Record<string, string> = {
  discount: '折扣',
  full_reduction: '满减',
  gift: '赠品',
  combo: '组合',
};

const typeColorMap: Record<string, string> = {
  discount: 'bg-purple-100 text-purple-600',
  full_reduction: 'bg-rose-100 text-rose-600',
  gift: 'bg-emerald-100 text-emerald-600',
  combo: 'bg-blue-100 text-blue-600',
};

export function Promotion() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const isOnline = useNetworkStore((state) => state.isOnline);

  const stats = {
    active: promotionRules.filter((r) => r.status === 'active').length,
    pending: promotionRules.filter((r) => r.status === 'pending').length,
    ended: promotionRules.filter((r) => r.status === 'ended').length,
  };

  const filteredRules = promotionRules.filter((rule) => {
    const matchesStatus = statusFilter === 'all' || rule.status === statusFilter;
    const matchesType = typeFilter === 'all' || rule.type === typeFilter;
    const matchesSearch =
      !searchQuery || rule.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const getDaysLeft = (rule: PromotionRule) => {
    if (rule.status === 'ended') return 0;
    if (rule.status === 'pending') {
      const diff = Math.ceil((rule.startDate - Date.now()) / 86400000);
      return `${diff}天后开始`;
    }
    const diff = Math.ceil((rule.endDate - Date.now()) / 86400000);
    return diff > 0 ? `还剩${diff}天` : '今日结束';
  };

  return (
    <div className="h-full flex flex-col p-5 gap-5 overflow-auto">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="text-sm opacity-90">进行中活动</div>
            <Sparkles className="w-5 h-5 opacity-80" />
          </div>
          <div className="text-3xl font-bold mt-2 font-mono">{stats.active}</div>
          <div className="text-xs opacity-80 mt-1">项促销活动正在生效</div>
        </div>
        <div className="bg-white rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="text-sm text-slate-500">待开始活动</div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5 font-mono">
              {stats.pending}
              <span className="text-sm font-normal text-slate-400 ml-1">项</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <Ban className="w-6 h-6 text-slate-500" />
          </div>
          <div>
            <div className="text-sm text-slate-500">已结束活动</div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5 font-mono">
              {stats.ended}
              <span className="text-sm font-normal text-slate-400 ml-1">项</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <button
            disabled={!isOnline}
            className={cn(
              'w-full h-full rounded-xl flex flex-col items-center justify-center gap-2 transition-colors border-2 border-dashed',
              isOnline
                ? 'border-slate-200 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5'
                : 'border-slate-100 text-slate-300 cursor-not-allowed'
            )}
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-medium">
              {isOnline ? '新建促销活动' : '需联网创建'}
            </span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索活动名称..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {([
              { id: 'all', label: '全部' },
              { id: 'active', label: '进行中' },
              { id: 'pending', label: '待开始' },
              { id: 'ended', label: '已结束' },
            ] as { id: StatusFilter; label: string }[]).map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  statusFilter === s.id
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setTypeFilter('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                typeFilter === 'all'
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              全部类型
            </button>
            {(['discount', 'full_reduction', 'gift', 'combo'] as TypeFilter[]).map((t) => {
              const Icon = typeIconMap[t];
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    typeFilter === t
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-500 hover:bg-slate-50'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {typeNameMap[t]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRules.map((rule) => {
              const TypeIcon = typeIconMap[rule.type];
              return (
                <div
                  key={rule.id}
                  className={cn(
                    'rounded-xl border overflow-hidden transition-all hover:shadow-md',
                    rule.status === 'ended' ? 'bg-slate-50 opacity-75' : 'bg-white border-slate-200'
                  )}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center',
                            typeColorMap[rule.type]
                          )}
                        >
                          <TypeIcon className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{rule.name}</div>
                          <span
                            className={cn(
                              'inline-block mt-0.5 px-2 py-0.5 text-[10px] font-medium rounded',
                              typeColorMap[rule.type]
                            )}
                          >
                            {typeNameMap[rule.type]}
                          </span>
                        </div>
                      </div>
                      <button
                        disabled={!isOnline || rule.status === 'ended'}
                        className={cn(
                          !isOnline || rule.status === 'ended'
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                        )}
                      >
                        {rule.status === 'active' ? (
                          <ToggleRight className="w-10 h-6 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-10 h-6 text-slate-300" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{rule.description}</p>

                    <div className="space-y-1.5 text-xs">
                      {rule.conditions.minAmount && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span>满 {rule.conditions.minAmount} 元</span>
                        </div>
                      )}
                      {rule.conditions.minQuantity && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Layers className="w-3 h-3 text-slate-400" />
                          <span>满 {rule.conditions.minQuantity} 件</span>
                        </div>
                      )}
                      {rule.benefits.discountAmount && (
                        <div className="flex items-center gap-2 text-rose-600 font-medium">
                          <Percent className="w-3 h-3" />
                          <span>立减 ¥{rule.benefits.discountAmount}</span>
                        </div>
                      )}
                      {rule.benefits.discountPercent && (
                        <div className="flex items-center gap-2 text-rose-600 font-medium">
                          <Percent className="w-3 h-3" />
                          <span>{rule.benefits.discountPercent}% 折扣</span>
                        </div>
                      )}
                      {rule.benefits.giftQuantity && (
                        <div className="flex items-center gap-2 text-emerald-600 font-medium">
                          <Gift className="w-3 h-3" />
                          <span>赠送礼品 x{rule.benefits.giftQuantity}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {formatDate(rule.startDate)} - {formatDate(rule.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {rule.status !== 'ended' && (
                        <span
                          className={cn(
                            'text-xs font-medium',
                            rule.status === 'active' ? 'text-emerald-600' : 'text-amber-600'
                          )}
                        >
                          {getDaysLeft(rule)}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <button
                          disabled={!isOnline}
                          className={cn(
                            'p-1.5 rounded transition-colors',
                            isOnline
                              ? 'text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                              : 'text-slate-300 cursor-not-allowed'
                          )}
                          title="编辑"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={!isOnline}
                          className={cn(
                            'p-1.5 rounded transition-colors',
                            isOnline
                              ? 'text-slate-400 hover:bg-red-50 hover:text-red-500'
                              : 'text-slate-300 cursor-not-allowed'
                          )}
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                          title="详情"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {rule.status === 'active' && (
                    <div className="h-1 bg-emerald-500 w-2/3" />
                  )}
                  {rule.status === 'pending' && (
                    <div className="h-1 bg-amber-500 w-1/4" />
                  )}
                  {rule.status === 'ended' && <div className="h-1 bg-slate-300 w-full" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
