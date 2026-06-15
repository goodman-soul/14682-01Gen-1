import { useMemo } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  RefreshCw,
  Clock,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { dashboardData } from '@/data/mockData';
import { useNetworkStore } from '@/stores/useNetworkStore';
import { cn } from '@/lib/utils';

const PIE_COLORS = ['#1E3A8A', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#6366F1'];

export function Dashboard() {
  const isOnline = useNetworkStore((state) => state.isOnline);

  const formattedTime = useMemo(() => {
    if (!dashboardData.lastUpdated) return '';
    return new Date(dashboardData.lastUpdated).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, []);

  const kpiCards = [
    {
      title: '今日销售额',
      value: `¥${dashboardData.todaySales.toLocaleString()}`,
      icon: DollarSign,
      trend: 12.5,
      trendLabel: '较昨日',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: '今日订单数',
      value: dashboardData.todayOrders.toString(),
      icon: ShoppingBag,
      trend: 8.3,
      trendLabel: '较昨日',
      gradient: 'from-emerald-500 to-emerald-600',
    },
    {
      title: '客单价',
      value: `¥${dashboardData.avgOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      trend: 3.2,
      trendLabel: '较昨日',
      gradient: 'from-amber-500 to-amber-600',
    },
    {
      title: '到店客流',
      value: dashboardData.customerCount.toString(),
      icon: Users,
      trend: -2.1,
      trendLabel: '较昨日',
      gradient: 'from-rose-500 to-rose-600',
    },
  ];

  return (
    <div className="h-full flex flex-col p-5 gap-5 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">店长看板</h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>数据更新于 {formattedTime}</span>
            {!dashboardData.synced && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded">
                本地缓存数据
              </span>
            )}
            {!isOnline && (
              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded">
                离线模式
              </span>
            )}
          </div>
        </div>
        <button
          disabled={!isOnline}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            isOnline
              ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          )}
        >
          <RefreshCw className={cn('w-4 h-4', isOnline && 'animate-spin')} />
          {isOnline ? '刷新数据' : '离线无法刷新'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          const isUp = card.trend >= 0;
          return (
            <div
              key={card.title}
              className="relative bg-white rounded-2xl p-5 overflow-hidden group hover:shadow-lg transition-shadow"
            >
              <div
                className={cn(
                  'absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity',
                  card.gradient
                )}
              />
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm text-slate-500">{card.title}</div>
                  <div className="text-3xl font-bold text-slate-800 mt-2 font-mono">
                    {card.value}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs">
                    {isUp ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span className={isUp ? 'text-emerald-600' : 'text-red-600'}>
                      {Math.abs(card.trend)}%
                    </span>
                    <span className="text-slate-400">{card.trendLabel}</span>
                  </div>
                </div>
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-md',
                    card.gradient
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-5 flex-1 min-h-0">
        <div className="col-span-2 bg-white rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-slate-800">销售趋势</h2>
            </div>
            <div className="flex items-center gap-1">
              {['近7天', '近30天'].map((t, i) => (
                <button
                  key={t}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                    i === 0 ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.salesTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    fontSize: 12,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sales"
                  name="销售额"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-primary)', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  name="订单数"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: 'var(--color-accent)', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <PieChart className="w-4 h-4 text-accent" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">分类销售占比</h2>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={dashboardData.categorySales}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="sales"
                  nameKey="name"
                >
                  {dashboardData.categorySales.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `¥${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontSize: 12 }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {dashboardData.categorySales.map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[idx] }}
                />
                <span className="text-slate-600 truncate">{cat.name}</span>
                <span className="text-slate-400 ml-auto font-mono">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-800">热销商品 TOP 10</h2>
            </div>
            <span className="text-xs text-slate-400">按销量</span>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.topProducts.slice(0, 8)}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 100, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  width={100}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === 'sales' ? `¥${value.toLocaleString()}` : `${value} 件`,
                    name === 'sales' ? '销售额' : '销量',
                  ]}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontSize: 12 }}
                />
                <Bar dataKey="quantity" name="销量" radius={[0, 6, 6, 0]} barSize={14}>
                  {dashboardData.topProducts.slice(0, 8).map((_, idx) => (
                    <Cell
                      key={`bar-${idx}`}
                      fill={idx < 3 ? 'var(--color-primary)' : 'var(--color-primary)'}
                      fillOpacity={idx < 3 ? 1 : 0.5 - idx * 0.04}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-rose-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-800">商品销售明细</h2>
            </div>
          </div>
          <div className="overflow-auto max-h-[280px] -mx-2">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr className="text-left text-slate-500">
                  <th className="px-4 py-2.5 font-medium text-xs">排名</th>
                  <th className="px-4 py-2.5 font-medium text-xs">商品名称</th>
                  <th className="px-4 py-2.5 font-medium text-xs text-right">销量</th>
                  <th className="px-4 py-2.5 font-medium text-xs text-right">销售额</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboardData.topProducts.map((product, idx) => (
                  <tr key={product.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-semibold',
                          idx === 0 && 'bg-amber-100 text-amber-600',
                          idx === 1 && 'bg-slate-200 text-slate-600',
                          idx === 2 && 'bg-orange-100 text-orange-600',
                          idx > 2 && 'bg-slate-100 text-slate-500'
                        )}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 truncate max-w-[180px]">{product.name}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">
                      {product.quantity}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-slate-800">
                      ¥{product.sales.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
