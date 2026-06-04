import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      shopId: null,
      coupon: null,
      discount: 0,

      addItem: (product, quantity = 1) => {
        const { items, shopId } = get();
        if (!shopId) {
          set({ shopId: product.shopId, items: [{ ...product, quantity }] });
          return;
        }

        if (shopId !== product.shopId) {
          return { error: 'Cannot add items from different shops' };
        }

        const existingIndex = items.findIndex((item) => item.id === product.id);
        if (existingIndex >= 0) {
          const updatedItems = [...items];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + quantity,
          };
          set({ items: updatedItems });
        } else {
          set({ items: [...items, { ...product, quantity }] });
        }
      },

      removeItem: (productId) => {
        const { items } = get();
        const updatedItems = items.filter((item) => item.id !== productId);
        if (updatedItems.length === 0) {
          set({ items: [], shopId: null, coupon: null, discount: 0 });
        } else {
          set({ items: updatedItems });
        }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        const { items } = get();
        const updatedItems = items.map((item) =>
          item.id === productId ? { ...item, quantity } : item,
        );
        set({ items: updatedItems });
      },

      clearCart: () => {
        set({ items: [], shopId: null, coupon: null, discount: 0 });
      },

      applyCoupon: (coupon) => {
        set({ coupon });
      },

      removeCoupon: () => {
        set({ coupon: null, discount: 0 });
      },

      setDiscount: (discount) => {
        set({ discount });
      },

      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      totalPrice: () => {
        const { items, discount } = get();
        const subtotal = items.reduce(
          (sum, item) => sum + (item.discountedPrice || item.price) * item.quantity,
          0,
        );
        return Math.max(0, subtotal - discount);
      },

      subtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + (item.discountedPrice || item.price) * item.quantity,
          0,
        );
      },
    }),
    {
      name: 'cartwise-cart',
      partialize: (state) => ({
        items: state.items,
        shopId: state.shopId,
        coupon: state.coupon,
        discount: state.discount,
      }),
    },
  ),
);
