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
  Ban,
  Minus,
  Save,
  Upload,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { products, productCategories } from '@/data/mockData';
import { useNetworkStore } from '@/stores/useNetworkStore';
import { cn } from '@/lib/utils';

type TabType = 'list' | 'inbound' | 'outbound' | 'stocktake';

interface StocktakeItem {
  productId: string;
  expectedQty: number;
  actualQty: number | null;
}

export function Inventory() {
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const isOnline = useNetworkStore((state) => state.isOnline);

  const [stocktakeItems, setStocktakeItems] = useState<StocktakeItem[]>(() =>
    products.map((p) => ({
      productId: p.id,
      expectedQty: p.stock,
      actualQty: null,
    }))
  );
  const [stocktakeSearch, setStocktakeSearch] = useState('');
  const [stocktakeCategory, setStocktakeCategory] = useState<string | null>(null);

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

  const stocktakeProgress = useMemo(() => {
    const done = stocktakeItems.filter((i) => i.actualQty !== null).length;
    const total = stocktakeItems.length;
    const matched = stocktakeItems.filter(
      (i) => i.actualQty !== null && i.actualQty === i.expectedQty
    ).length;
    const diff = stocktakeItems.filter(
      (i) => i.actualQty !== null && i.actualQty !== i.expectedQty
    ).length;
    return { done, total, matched, diff };
  }, [stocktakeItems]);

  const filteredStocktakeItems = useMemo(() => {
    return stocktakeItems
      .map((item) => ({
        ...item,
        product: products.find((p) => p.id === item.productId)!,
      }))
      .filter((row) => {
        if (!row.product) return false;
        const matchesSearch =
          !stocktakeSearch ||
          row.product.name.toLowerCase().includes(stocktakeSearch.toLowerCase()) ||
          row.product.barcode.includes(stocktakeSearch);
        const matchesCategory = !stocktakeCategory || row.product.category === stocktakeCategory;
        return matchesSearch && matchesCategory;
      });
  }, [stocktakeItems, stocktakeSearch, stocktakeCategory]);

  const handleActualQtyChange = (productId: string, value: string) => {
    const qty = value === '' ? null : parseInt(value, 10);
    if (value !== '' && isNaN(qty as number)) return;
    setStocktakeItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, actualQty: qty } : i))
    );
  };

  const tabs: { id: TabType; label: string; icon: any; disableOffline?: boolean }[] = [
    { id: 'list', label: '库存总览', icon: Package, disableOffline: false },
    { id: 'inbound', label: '入库管理', icon: ArrowDownToLine, disableOffline: true },
    { id: 'outbound', label: '出库管理', icon: ArrowUpFromLine, disableOffline: true },
    { id: 'stocktake', label: '库存盘点', icon: ClipboardList, disableOffline: false },
  ];

  const handleTabClick = (tabId: TabType, disabled: boolean) => {
    if (disabled) return;
    setActiveTab(tabId);
  };

  return (
    <div className="h-full flex flex-col p-5 gap-5 overflow-auto">
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

      <div className="flex-1 flex flex-col bg-white rounded-2xl overflow-hidden min-h-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-5">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const disabled = tab.disableOffline && !isOnline;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id, disabled)}
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
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
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
                <thead className="bg-slate-50 sticky top-0 z-10">
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

        {activeTab === 'inbound' && (
          <PlaceholderView
            title="入库管理"
            description={
              isOnline
                ? '入库单创建、扫码入库、供应商对账等功能开发中...'
                : '此功能需要联网使用，请检查网络连接'
            }
            icon={ArrowDownToLine}
            online={isOnline}
          />
        )}

        {activeTab === 'outbound' && (
          <PlaceholderView
            title="出库管理"
            description={
              isOnline
                ? '销售出库、调拨出库、损耗登记等功能开发中...'
                : '此功能需要联网使用，请检查网络连接'
            }
            icon={ArrowUpFromLine}
            online={isOnline}
          />
        )}

        {activeTab === 'stocktake' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">今日盘点任务</div>
                    <div className="text-xs text-slate-500">
                      已完成 <span className="text-primary font-medium">{stocktakeProgress.done}</span>
                      /{stocktakeProgress.total} 项 ·{' '}
                      <span className="text-emerald-600">{stocktakeProgress.matched} 项一致</span>
                      {stocktakeProgress.diff > 0 && (
                        <>
                          {' '}·{' '}
                          <span className="text-amber-600">{stocktakeProgress.diff} 项差异</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="w-60">
                  <div className="text-xs text-slate-500 mb-1">盘点进度</div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${(stocktakeProgress.done / stocktakeProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isOnline && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>离线录入，恢复网络后自动同步</span>
                  </div>
                )}
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                  <Upload className="w-4 h-4" />
                  导入
                </button>
                <button
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    'bg-primary text-white hover:bg-primary-hover'
                  )}
                >
                  <Save className="w-4 h-4" />
                  保存盘点
                </button>
              </div>
            </div>

            <div className="p-3 border-b border-slate-100 flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={stocktakeSearch}
                  onChange={(e) => setStocktakeSearch(e.target.value)}
                  placeholder="搜索商品名称、条码进行盘点..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <select
                value={stocktakeCategory || ''}
                onChange={(e) => setStocktakeCategory(e.target.value || null)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="">全部分类</option>
                {productCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-3 font-medium w-12">#</th>
                    <th className="px-4 py-3 font-medium">商品信息</th>
                    <th className="px-4 py-3 font-medium">分类</th>
                    <th className="px-4 py-3 font-medium text-right">系统库存</th>
                    <th className="px-4 py-3 font-medium text-center">实盘数量</th>
                    <th className="px-4 py-3 font-medium text-right">差异</th>
                    <th className="px-4 py-3 font-medium text-center">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStocktakeItems.map((row, idx) => {
                    if (!row.product) return null;
                    const diff =
                      row.actualQty !== null ? row.actualQty - row.expectedQty : null;
                    const isDone = row.actualQty !== null;
                    const isMatched = isDone && diff === 0;
                    const isDiff = isDone && diff !== 0;
                    return (
                      <tr
                        key={row.productId}
                        className={cn(
                          'transition-colors',
                          isDiff && 'bg-amber-50/40',
                          !isDone && 'hover:bg-slate-50'
                        )}
                      >
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                              <Package className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-800 text-sm">
                                {row.product.name}
                              </div>
                              <div className="text-slate-400 text-xs font-mono">
                                {row.product.sku}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                            {row.product.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700">
                          {row.expectedQty}
                          <span className="text-xs text-slate-400 ml-1">{row.product.unit}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={row.actualQty ?? ''}
                            onChange={(e) => handleActualQtyChange(row.productId, e.target.value)}
                            placeholder="请输入"
                            className={cn(
                              'w-24 px-2 py-1.5 rounded-lg border text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors',
                              isMatched
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                : isDiff
                                ? 'border-amber-300 bg-amber-50 text-amber-700'
                                : 'border-slate-200 text-slate-700 focus:border-primary'
                            )}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {diff !== null ? (
                            <span
                              className={cn(
                                'font-mono font-semibold',
                                diff > 0
                                  ? 'text-emerald-600'
                                  : diff < 0
                                  ? 'text-red-600'
                                  : 'text-slate-400'
                              )}
                            >
                              {diff > 0 ? `+${diff}` : diff}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isMatched ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-600 text-xs rounded-full font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              一致
                            </span>
                          ) : isDiff ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-600 text-xs rounded-full font-medium">
                              <AlertTriangle className="w-3 h-3" />
                              差异
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-400 text-xs rounded-full font-medium">
                              待盘点
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlaceholderView({
  title,
  description,
  icon: Icon,
  online,
}: {
  title: string;
  description: string;
  icon: any;
  online: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10">
      <div
        className={cn(
          'w-20 h-20 rounded-2xl flex items-center justify-center mb-4',
          online ? 'bg-slate-100' : 'bg-red-50'
        )}
      >
        <Icon className={cn('w-10 h-10', online ? 'text-slate-300' : 'text-red-400')} />
      </div>
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <p
        className={cn(
          'text-xs mt-1.5 px-4 py-1.5 rounded-full',
          online ? 'bg-slate-100 text-slate-500' : 'bg-red-50 text-red-500'
        )}
      >
        {description}
      </p>
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
  suffix: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
  };
  const bgMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden">
      <div
        className={cn(
          'absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 bg-gradient-to-br',
          colorMap[color]
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500 mb-1">{title}</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-800 font-mono">{value}</span>
            <span className="text-xs text-slate-400">{suffix}</span>
          </div>
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bgMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}