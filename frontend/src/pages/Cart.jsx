import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowLeft, Percent } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import CartItem from '@/components/cart/CartItem';
import CouponInput from '@/components/cart/CouponInput';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { formatPrice } from '@/lib/utils';
import { DELIVERY_FEE_PER_KM, FREE_DELIVERY_THRESHOLD } from '@/lib/constants';

export default function Cart() {
  const navigate = useNavigate();
  const { items, shopId, discount, subtotal, clearCart } = useCartStore();
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalAmount = subtotal();
  const totalAmount = subtotalAmount - discount;
  const deliveryFee = subtotalAmount >= FREE_DELIVERY_THRESHOLD ? 0 : 20;
  const finalTotal = totalAmount + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="container py-6">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Browse shops and add items!"
          action={{ label: 'Browse Shops', onClick: () => navigate('/shops') }}
        />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Your Cart</h1>
            <p className="text-muted-foreground text-sm">{totalItems} items</p>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-1 text-sm text-destructive hover:text-destructive/80 transition-colors"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              layout
            >
              <CartItem item={item} />
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl p-6 space-y-4"
          >
            <h3 className="font-semibold text-lg">Order Summary</h3>

            <CouponInput />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotalAmount)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{deliveryFee === 0 ? <span className="text-green-500">FREE</span> : formatPrice(deliveryFee)}</span>
              </div>
              {subtotalAmount < FREE_DELIVERY_THRESHOLD && (
                <p className="text-xs text-muted-foreground">
                  Add {formatPrice(FREE_DELIVERY_THRESHOLD - subtotalAmount)} more for free delivery
                </p>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </Button>

            <Link
              to="/shops"
              className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
