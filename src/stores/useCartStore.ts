import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartState, Product, CartItem, HeldOrder } from '@/types';

interface CartStoreState extends CartState {
  addProduct: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  holdOrder: () => void;
  retrieveHeldOrder: (orderId: string) => void;
  deleteHeldOrder: (orderId: string) => void;
  recalculateTotals: () => void;
}

function calculateTotals(items: CartItem[]): {
  totalAmount: number;
  discountAmount: number;
  payableAmount: number;
  items: CartItem[];
} {
  const updatedItems = items.map((item) => {
    const price = item.product.isOnSale && item.product.originalPrice
      ? item.product.price
      : item.product.price;
    const subtotal = price * item.quantity;
    return { ...item, subtotal };
  });

  const totalAmount = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
  let discountAmount = 0;

  if (totalAmount >= 99) {
    discountAmount += 20;
  }

  const payableAmount = Math.max(0, totalAmount - discountAmount);

  return {
    items: updatedItems,
    totalAmount,
    discountAmount,
    payableAmount,
  };
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      totalAmount: 0,
      discountAmount: 0,
      payableAmount: 0,
      heldOrders: [],
      addProduct: (product: Product, quantity = 1) => {
        const { items } = get();
        const existingIndex = items.findIndex((i) => i.product.id === product.id);

        let newItems: CartItem[];
        if (existingIndex >= 0) {
          newItems = [...items];
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + quantity,
          };
        } else {
          newItems = [
            ...items,
            {
              product,
              quantity,
              subtotal: product.price * quantity,
            },
          ];
        }

        const totals = calculateTotals(newItems);
        set(totals);
      },
      removeItem: (productId: string) => {
        const { items } = get();
        const newItems = items.filter((i) => i.product.id !== productId);
        const totals = calculateTotals(newItems);
        set(totals);
      },
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const { items } = get();
        const newItems = items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        );
        const totals = calculateTotals(newItems);
        set(totals);
      },
      clearCart: () => {
        set({
          items: [],
          totalAmount: 0,
          discountAmount: 0,
          payableAmount: 0,
        });
      },
      holdOrder: () => {
        const { items, totalAmount, heldOrders } = get();
        if (items.length === 0) return;

        const heldOrder: HeldOrder = {
          id: `held-${Date.now()}`,
          items: [...items],
          totalAmount,
          createdAt: Date.now(),
        };

        set({
          heldOrders: [...heldOrders, heldOrder],
          items: [],
          totalAmount: 0,
          discountAmount: 0,
          payableAmount: 0,
        });
      },
      retrieveHeldOrder: (orderId: string) => {
        const { heldOrders } = get();
        const order = heldOrders.find((o) => o.id === orderId);
        if (!order) return;

        const totals = calculateTotals(order.items);
        set({
          ...totals,
          heldOrders: heldOrders.filter((o) => o.id !== orderId),
        });
      },
      deleteHeldOrder: (orderId: string) => {
        const { heldOrders } = get();
        set({ heldOrders: heldOrders.filter((o) => o.id !== orderId) });
      },
      recalculateTotals: () => {
        const { items } = get();
        const totals = calculateTotals(items);
        set(totals);
      },
    }),
    {
      name: 'cart-store',
    }
  )
);
