import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import QuantitySelector from '@/components/ui/QuantitySelector';
import { formatPrice } from '@/lib/utils';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <motion.div
      layout
      className="flex items-center gap-4 p-4 rounded-2xl border bg-card"
    >
      <img
        src={item.imageUrl || 'https://via.placeholder.com/80'}
        alt={item.name}
        className="w-20 h-20 rounded-xl object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm line-clamp-1">{item.name}</h3>
        <p className="text-xs text-muted-foreground">
          {item.unit || '1 unit'}
        </p>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="font-bold text-primary">{formatPrice((item.discountedPrice || item.price) * item.quantity)}</span>
            {item.discountedPrice && (
              <span className="text-xs text-muted-foreground line-through ml-1">
                {formatPrice(item.price * item.quantity)}
              </span>
            )}
          </div>
          <QuantitySelector
            quantity={item.quantity}
            onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
            onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
            size="sm"
          />
        </div>
      </div>
      <button
        onClick={() => removeItem(item.id)}
        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-500 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
