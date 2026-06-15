import { useState, useMemo } from 'react';
import {
  Search,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardList,
  AlertTriangle,
  Filter,
  ChevronDown,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Ban,
} from 'lucide-react';
import { products, productCategories } from '@/data/mockData';
import { useNetworkStore } from '@/stores/useNetworkStore';
import { cn } from '@/lib/utils';

type TabType = 'list' | 'inbound' | 'outbound' | 'stocktake';

export function Inventory() {
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const isOnline = useNetworkStore((state) => state.isOnline);

  const stats = useMemo(() => {
    const totalSkus = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStock = products.filter((p) => p.stock <= 50 && p.stock > 0).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    return { totalSkus, totalStock, lowStock, outOfStock };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !activeCategory || p.category === activeCategory;
      const matchesLowStock = !showLowStockOnly || (p.stock <= 50 && p.stock > 0);
      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [searchQuery, activeCategory, showLowStockOnly]);

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'list', label: '库存总览', icon: Package },
    { id: 'inbound', label: '入库管理', icon: ArrowDownToLine },
    { id: 'outbound', label: '出库管理', icon: ArrowUpFromLine },
    { id: 'stocktake', label: '库存盘点', icon: ClipboardList },
  ];

  return (
    <div className="h-full flex flex-col p-5 gap-5">
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="SKU 总数"
          value={stats.totalSkus.toString()}
          icon={Package}
          color="blue"
          suffix="种"
        />
        <StatCard
          title="库存总量"
          value={stats.totalStock.toLocaleString()}
          icon={TrendingUp}
          color="emerald"
          suffix="件"
        />
        <StatCard
          title="库存预警"
          value={stats.lowStock.toString()}
          icon={AlertTriangle}
          color="amber"
          suffix="种"
        />
        <StatCard
          title="缺货商品"
          value={stats.outOfStock.toString()}
          icon={Ban}
          color="red"
          suffix="种"
        />
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const disabled =
                (tab.id === 'inbound' || tab.id === 'outbound') && !isOnline;
              return (
                <button
                  key={tab.id}
                  onClick={() => !disabled && setActiveTab(tab.id)}
                  disabled={disabled}
                  className={cn(
                    'flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-all -mb-px',
                    disabled
                      ? 'text-slate-300 cursor-not-allowed border-transparent'
                      : activeTab === tab.id
                      ? 'text-primary border-primary'
                      : 'text-slate-500 border-transparent hover:text-slate-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {disabled && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded">
                      需联网
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={!isOnline}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isOnline
                  ? 'bg-primary text-white hover:bg-primary-hover'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
            >
              <Plus className="w-4 h-4" />
              新建单据
            </button>
          </div>
        </div>

        {activeTab === 'list' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索商品名称、条码、SKU..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div className="relative">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                  <Filter className="w-4 h-4" />
                  分类
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLowStockOnly}
                  onChange={(e) => setShowLowStockOnly(e.target.checked)}
                  className="w-3.5 h-3.5 text-primary rounded"
                />
                仅看预警
              </label>
            </div>

            <div className="px-4 py-2 flex gap-2 border-b border-slate-100 bg-slate-50">
              <button
                onClick={() => setActiveCategory(null)}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                  !activeCategory
                    ? 'bg-primary text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                )}
              >
                全部
              </button>
              {productCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                    activeCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-3 font-medium">商品信息</th>
                    <th className="px-4 py-3 font-medium">SKU / 条码</th>
                    <th className="px-4 py-3 font-medium">分类</th>
                    <th className="px-4 py-3 font-medium text-right">当前库存</th>
                    <th className="px-4 py-3 font-medium text-right">销售价</th>
                    <th className="px-4 py-3 font-medium text-center">状态</th>
                    <th className="px-4 py-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => {
                    const isLow = product.stock <= 50 && product.stock > 0;
                    const isOut = product.stock === 0;
                    return (
                      <tr
                        key={product.id}
                        className={cn(
                          'hover:bg-slate-50 transition-colors',
                          isLow && 'bg-amber-50/40',
                          isOut && 'bg-red-50/40'
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                              <Package className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-800">{product.name}</div>
                              {product.isOnSale && (
                                <span className="text-xs text-red-500">促销中</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-700 font-mono text-xs">{product.sku}</div>
                          <div className="text-slate-400 text-xs">{product.barcode}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div
                            className={cn(
                              'font-semibold font-mono',
                              isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-800'
                            )}
                          >
                            {product.stock}
                            <span className="text-xs font-normal text-slate-400 ml-1">
                              {product.unit}
                            </span>
                          </div>
                          {isLow && (
                            <div className="flex items-center justify-end gap-1 text-xs text-amber-500 mt-0.5">
                              <AlertTriangle className="w-3 h-3" />
                              库存偏低
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-slate-700">
                            ¥{product.price.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isOut ? (
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                              缺货
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-1 bg-amber-100 text-amber-600 text-xs rounded-full font-medium">
                              预警
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-xs rounded-full font-medium">
                              正常
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              disabled={!isOnline}
                              className={cn(
                                'p-1.5 rounded-lg transition-colors',
                                isOnline
                                  ? 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                                  : 'text-slate-300 cursor-not-allowed'
                              )}
                              title="入库"
                            >
                              <ArrowDownToLine className="w-4 h-4" />
                            </button>
                            <button
                              disabled={!isOnline}
                              className={cn(
                                'p-1.5 rounded-lg transition-colors',
                                isOnline
                                  ? 'text-slate-400 hover:bg-orange-50 hover:text-orange-600'
                                  : 'text-slate-300 cursor-not-allowed'
                              )}
                              title="出库"
                            >
                              <ArrowUpFromLine className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                              title="查看"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab !== 'list' && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              {activeTab === 'inbound' && <ArrowDownToLine className="w-10 h-10" />}
              {activeTab === 'outbound' && <ArrowUpFromLine className="w-10 h-10" />}
              {activeTab === 'stocktake' && <ClipboardList className="w-10 h-10" />}
            </div>
            <p className="text-sm font-medium">
              {activeTab === 'inbound' && '入库管理'}
              {activeTab === 'outbound' && '出库管理'}
              {activeTab === 'stocktake' && '库存盘点'}
            </p>
            <p className="text-xs mt-1">
              {isOnline ? '该模块功能开发中...' : '此功能需要联网使用'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  suffix,
}: {
  title: string;
  value: string;
  icon: any;
  color: 'blue' | 'emerald' | 'amber' | 'red';
  suffix?: string;
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-2xl p-5 flex items-center gap-4">
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colorMap[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-slate-500">{title}</div>
        <div className="text-2xl font-bold text-slate-800 mt-0.5 font-mono">
          {value}
          {suffix && <span className="text-sm font-normal text-slate-400 ml-1">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}
