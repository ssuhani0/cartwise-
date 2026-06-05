import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { cartService } from '@/services/cartService';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      shopId: null,
      coupon: null,
      discount: 0,
      cartId: null,

      syncCart: async () => {
        if (!useAuthStore.getState().isAuthenticated) return;
        try {
          const res = await cartService.getCart();
          if (res.data && res.data.items) {
            // Map backend items to frontend product shape
            const syncedItems = res.data.items.map(item => ({
              id: item.productId,
              cartItemId: item.id,
              name: item.name,
              price: item.unitPrice,
              image: item.imageUrl, // Map imageUrl back to image if used
              unit: item.unit,
              quantity: item.quantity,
              shopId: null // We might need to fetch shopId differently, but for now leave as is
            }));
            set({ items: syncedItems, cartId: res.data.cartId });
          }
        } catch (error) {
          console.error("Failed to sync cart:", error);
        }
      },

      addItem: (product, quantity = 1) => {
        const { items, shopId } = get();

        // OCR items always override — clear existing if from a different real shop
        const isOcrItem = product.shopId === 'ocr-store';
        const existingIsOcr = shopId === 'ocr-store';

        if (!shopId || isOcrItem) {
          // First item OR adding OCR items — set shopId to product's shopId
          if (!shopId || isOcrItem) {
            const existingIndex = items.findIndex((item) => item.id === product.id);
            if (existingIndex >= 0) {
              const updatedItems = [...items];
              updatedItems[existingIndex] = {
                ...updatedItems[existingIndex],
                quantity: updatedItems[existingIndex].quantity + quantity,
              };
              set({ items: updatedItems, shopId: product.shopId });
            } else {
              set({ items: [...items, { ...product, quantity }], shopId: product.shopId });
            }
            return;
          }
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

        if (useAuthStore.getState().isAuthenticated && !isOcrItem) {
          cartService.addToCart({ productId: product.id, quantity }).catch(console.error);
        }
      },

      removeItem: (productId) => {
        const { items } = get();
        const itemToRemove = items.find((item) => item.id === productId);
        const updatedItems = items.filter((item) => item.id !== productId);
        if (updatedItems.length === 0) {
          set({ items: [], shopId: null, coupon: null, discount: 0 });
        } else {
          set({ items: updatedItems });
        }

        if (useAuthStore.getState().isAuthenticated && itemToRemove?.cartItemId) {
          cartService.removeCartItem(itemToRemove.cartItemId).catch(console.error);
        }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        const { items } = get();
        const targetItem = items.find(item => item.id === productId);
        const updatedItems = items.map((item) =>
          item.id === productId ? { ...item, quantity } : item,
        );
        set({ items: updatedItems });

        if (useAuthStore.getState().isAuthenticated && targetItem?.cartItemId) {
          cartService.updateCartItem(targetItem.cartItemId, { quantity }).catch(console.error);
        }
      },

      clearCart: () => {
        set({ items: [], shopId: null, coupon: null, discount: 0, cartId: null });
        if (useAuthStore.getState().isAuthenticated) {
          cartService.clearCart().catch(console.error);
        }
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
