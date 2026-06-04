import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDistance, formatPrice } from '@/lib/utils';

export default function ShopCard({ shop }) {
  return (
    <Link to={`/shop/${shop.id}`}>
      <Card className="overflow-hidden group h-full">
        <div className="relative h-48 overflow-hidden">
          <img
            src={shop.imageUrl || 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400'}
            alt={shop.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-3 right-3">
            <Badge variant={shop.isOpen ? 'success' : 'danger'}>
              {shop.isOpen ? 'Open' : 'Closed'}
            </Badge>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-bold text-lg">{shop.name}</h3>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{shop.rating || '4.5'}</span>
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {formatDistance(shop.distance)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {shop.estimatedDeliveryTime || '30-40'} min
            </span>
            <span className="font-medium text-primary">
              {shop.deliveryFee === 0 ? 'Free delivery' : formatPrice(shop.deliveryFee || 20)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
