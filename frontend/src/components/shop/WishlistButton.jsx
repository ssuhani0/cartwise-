import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WishlistButton({ productId, className }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={handleToggle}
      className={cn(
        'p-1.5 rounded-full transition-colors',
        isWishlisted
          ? 'bg-red-50 dark:bg-red-950/30'
          : 'bg-white/80 dark:bg-black/30 hover:bg-white dark:hover:bg-black/50',
        className,
      )}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors',
          isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground',
        )}
      />
    </motion.button>
  );
}
