import { useState } from 'react';
import { Percent, X, Check } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { success, error } from '@/components/ui/Toast';

export default function CouponInput() {
  const [code, setCode] = useState('');
  const { coupon, applyCoupon, removeCoupon, setDiscount } = useCartStore();

  const handleApply = () => {
    if (!code.trim()) return;

    const validCoupons = {
      'WELCOME10': { discount: 50, type: 'flat' },
      'SAVE20': { discount: 20, type: 'percent' },
      'FIRST50': { discount: 100, type: 'flat' },
    };

    const couponData = validCoupons[code.toUpperCase()];
    if (couponData) {
      const discount = couponData.type === 'percent'
        ? Math.min(200, (useCartStore.getState().subtotal() * couponData.discount) / 100)
        : couponData.discount;
      applyCoupon({ code: code.toUpperCase(), ...couponData });
      setDiscount(discount);
      success(`Coupon applied! You saved ₹${discount}`);
    } else {
      error('Invalid coupon code');
    }
  };

  const handleRemove = () => {
    removeCoupon();
    setCode('');
    success('Coupon removed');
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {coupon ? (
          <motion.div
            key="applied"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
          >
            <Check className="h-4 w-4 text-green-500 shrink-0" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400 flex-1">
              {coupon.code} applied
            </span>
            <button onClick={handleRemove} className="p-1 hover:bg-green-100 dark:hover:bg-green-900/50 rounded">
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="w-full h-10 pl-10 pr-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              />
            </div>
            <button
              onClick={handleApply}
              disabled={!code.trim()}
              className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Apply
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
