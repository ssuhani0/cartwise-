import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import QuantitySelector from '@/components/ui/QuantitySelector';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { success, error } from '@/components/ui/Toast';

export default function ProductCard({ product, shopId }) {
  const [quantity, setQuantity] = useState(0);
  const { items, addItem, updateQuantity, getItemQuantity } = useCartStore();

  const existingItem = items.find((item) => item.id === product.id);
  const cartQuantity = existingItem?.quantity || 0;

  const handleAddToCart = () => {
    const result = addItem({ ...product, shopId }, 1);
    if (result?.error) {
      error(result.error);
    } else {
      success(`${product.name} added to cart`);
    }
  };

  const handleIncrease = () => {
    if (cartQuantity === 0) {
      handleAddToCart();
    } else {
      updateQuantity(product.id, cartQuantity + 1);
    }
  };

  const handleDecrease = () => {
    if (cartQuantity <= 1) {
      updateQuantity(product.id, 0);
    } else {
      updateQuantity(product.id, cartQuantity - 1);
    }
  };

  return (
    <Card className="overflow-hidden group">
      <div className="relative h-40 overflow-hidden bg-muted">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
          loading="lazy"
        />
        {product.discountedPrice && product.discountedPrice < product.price && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {Math.round((1 - product.discountedPrice / product.price) * 100)}% OFF
          </span>
        )}
        <button className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-black/30 backdrop-blur-sm hover:bg-white dark:hover:bg-black/50 transition-colors">
          <Heart className="h-4 w-4 text-muted-foreground hover:text-red-500 transition-colors" />
        </button>
      </div>

      <div className="p-3 space-y-2">
        <h3 className="font-medium text-sm line-clamp-2 leading-tight">{product.name}</h3>
        {product.unit && (
          <p className="text-xs text-muted-foreground">{product.unit}</p>
        )}
        {product.rating && (
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{product.rating}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="font-bold text-primary">{formatPrice(product.discountedPrice || product.price)}</span>
            {product.discountedPrice && (
              <span className="text-xs text-muted-foreground line-through ml-1">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {cartQuantity > 0 ? (
            <QuantitySelector
              quantity={cartQuantity}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              size="sm"
            />
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddToCart}
              className="h-8 px-3"
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
