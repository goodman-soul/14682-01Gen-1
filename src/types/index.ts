export interface ThemeColors {
  primary: string;
  primaryHover: string;
  accent: string;
  sidebarBg: string;
  sidebarText: string;
  headerBg: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  route: string;
  order: number;
}

export interface StoreConfig {
  storeId: string;
  storeName: string;
  themeId: string;
  quickActions: QuickAction[];
  defaultHomepage: string;
}

export interface NetworkState {
  isOnline: boolean;
  lastOnlineTime: number | null;
  pendingSyncCount: number;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  unit: string;
  imageUrl?: string;
  isOnSale?: boolean;
  tags?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount?: number;
  subtotal: number;
}

export interface HeldOrder {
  id: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: number;
}

export interface CartState {
  items: CartItem[];
  totalAmount: number;
  discountAmount: number;
  payableAmount: number;
  heldOrders: HeldOrder[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  requiresNetwork: boolean;
}

export interface StockRecord {
  id: string;
  product: Product;
  quantity: number;
  type: 'in' | 'out' | 'adjust';
  operator: string;
  reason: string;
  createdAt: number;
  synced: boolean;
}

export interface PromotionRule {
  id: string;
  name: string;
  type: 'discount' | 'full_reduction' | 'gift' | 'combo';
  description: string;
  startDate: number;
  endDate: number;
  status: 'active' | 'pending' | 'ended';
  conditions: {
    minAmount?: number;
    minQuantity?: number;
    productIds?: string[];
    categoryIds?: string[];
  };
  benefits: {
    discountPercent?: number;
    discountAmount?: number;
    giftProductId?: string;
    giftQuantity?: number;
  };
  requiresNetwork: boolean;
}

export interface DashboardData {
  todaySales: number;
  todayOrders: number;
  avgOrderValue: number;
  customerCount: number;
  salesTrend: { date: string; sales: number; orders: number }[];
  topProducts: { name: string; sales: number; quantity: number }[];
  categorySales: { name: string; sales: number; percentage: number }[];
  lastUpdated: number;
  synced: boolean;
}

export interface OfflineFeature {
  id: string;
  name: string;
  module: string;
  availableOffline: boolean;
  description: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  requiresNetwork: boolean;
}
