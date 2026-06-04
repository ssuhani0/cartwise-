import { Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function QuantitySelector({ quantity, onIncrease, onDecrease, min = 1, max = 99, size = 'md' }) {
  const sizes = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-11 w-11 text-base',
  };

  const btnSize = sizes[size];
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border bg-background p-0.5">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onDecrease}
        disabled={quantity <= min}
        className={cn(
          'flex items-center justify-center rounded-lg transition-colors',
          'hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed',
          btnSize,
        )}
      >
        <Minus className="h-3.5 w-3.5" />
      </motion.button>
      <AnimatePresence mode="wait">
        <motion.span
          key={quantity}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          className={cn('font-semibold min-w-[24px] text-center', textSize)}
        >
          {quantity}
        </motion.span>
      </AnimatePresence>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onIncrease}
        disabled={quantity >= max}
        className={cn(
          'flex items-center justify-center rounded-lg transition-colors',
          'hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed',
          btnSize,
        )}
      >
        <Plus className="h-3.5 w-3.5" />
      </motion.button>
    </div>
  );
}
