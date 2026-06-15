import { useState, useMemo } from 'react';
import {
  Search,
  Scan,
  Plus,
  Minus,
  X,
  Trash2,
  Clock,
  Banknote,
  MessageCircle,
  Smartphone,
  CreditCard,
  CheckCircle,
  ShoppingCart,
  Tag,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { products, productCategories, paymentMethods } from '@/data/mockData';
import { useCartStore } from '@/stores/useCartStore';
import { useNetworkStore } from '@/stores/useNetworkStore';
import { cn } from '@/lib/utils';

const paymentIconMap: Record<string, LucideIcon> = {
  Banknote,
  MessageCircle,
  Smartphone,
  CreditCard,
};

export function Cashier() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    items,
    totalAmount,
    discountAmount,
    payableAmount,
    heldOrders,
    addProduct,
    removeItem,
    updateQuantity,
    clearCart,
    holdOrder,
    retrieveHeldOrder,
    deleteHeldOrder,
  } = useCartStore();

  const isOnline = useNetworkStore((state) => state.isOnline);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !activeCategory || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleCheckout = () => {
    if (items.length === 0 || !selectedPayment) return;
    const payment = paymentMethods.find((p) => p.id === selectedPayment);
    if (payment?.requiresNetwork && !isOnline) {
      return;
    }
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      clearCart();
      setSelectedPayment(null);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-3 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <div className="text-xl font-semibold text-slate-800">结算成功</div>
            <div className="text-sm text-slate-500">订单已提交</div>
          </div>
        </div>
      )}

      <div className="p-5 flex-1 flex gap-5 overflow-hidden">
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="扫描条码或搜索商品名称、SKU..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <button className="px-5 py-3 bg-primary text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-primary-hover transition-colors">
              <Scan className="w-4 h-4" />
              扫码
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                !activeCategory
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              )}
            >
              全部
            </button>
            {productCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  activeCategory === cat
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 bg-white rounded-2xl p-4 overflow-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => product.stock > 0 && addProduct(product)}
                  disabled={product.stock === 0}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-all group',
                    product.stock === 0
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-white border-slate-200 hover:border-primary hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                  )}
                >
                  <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                    <ShoppingCart className="w-10 h-10 text-slate-300" />
                    {product.isOnSale && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
                        特价
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="absolute inset-0 bg-slate-900/50 flex items-center justify-center text-white text-sm font-medium rounded-lg">
                        缺货
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {product.name}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-semibold text-primary font-mono">
                        ¥{product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          ¥{product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">库存 {product.stock}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-[380px] flex flex-col bg-white rounded-2xl overflow-hidden flex-shrink-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <span className="font-semibold text-slate-800">当前购物车</span>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                {items.length} 件
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHeldOrders(!showHeldOrders)}
                className={cn(
                  'p-2 rounded-lg transition-colors relative',
                  showHeldOrders ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-100'
                )}
                title="挂单列表"
              >
                <Clock className="w-4 h-4" />
                {heldOrders.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                    {heldOrders.length}
                  </span>
                )}
              </button>
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors"
                  title="清空购物车"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {showHeldOrders && heldOrders.length > 0 && (
            <div className="max-h-40 overflow-auto border-b border-slate-100 bg-slate-50 p-3 space-y-2">
              {heldOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700">
                      {order.items.length} 件商品
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleTimeString('zh-CN')}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-primary font-mono">
                    ¥{order.totalAmount.toFixed(2)}
                  </div>
                  <button
                    onClick={() => retrieveHeldOrder(order.id)}
                    className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    取单
                  </button>
                  <button
                    onClick={() => deleteHeldOrder(order.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-auto p-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <ShoppingCart className="w-16 h-16 mb-3 opacity-30" />
                <p className="text-sm">购物车为空</p>
                <p className="text-xs mt-1">点击商品或扫描条码添加</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200">
                      <ShoppingCart className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">
                        {item.product.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-primary font-mono">
                          ¥{item.product.price.toFixed(2)}
                        </span>
                        {item.product.isOnSale && (
                          <Tag className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium text-slate-700">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-sm font-semibold text-slate-700 font-mono">
                        ¥{item.subtotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>商品金额</span>
                <span className="font-mono">¥{totalAmount.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>优惠金额</span>
                  <span className="font-mono">-¥{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-800">应付金额</span>
                <span className="text-2xl font-bold text-primary font-mono">
                  ¥{payableAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {paymentMethods.map((pm) => {
                const Icon = paymentIconMap[pm.icon] || Banknote;
                const disabled = pm.requiresNetwork && !isOnline;
                return (
                  <button
                    key={pm.id}
                    onClick={() => !disabled && items.length > 0 && setSelectedPayment(pm.id)}
                    disabled={disabled}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all',
                      disabled
                        ? 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                        : selectedPayment === pm.id
                        ? 'bg-primary/5 border-primary text-primary'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{pm.name}</span>
                    {disabled && <span className="text-[10px] text-slate-400">需联网</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={holdOrder}
                disabled={items.length === 0}
                className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                挂单
              </button>
              <button
                onClick={handleCheckout}
                disabled={items.length === 0 || !selectedPayment}
                className="flex-[2] py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {selectedPayment
                  ? `确认支付 ¥${payableAmount.toFixed(2)}`
                  : '请选择支付方式'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
