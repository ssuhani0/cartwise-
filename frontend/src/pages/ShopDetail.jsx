import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, MapPin, ChevronRight } from 'lucide-react';
import { shopService } from '@/services/shopService';
import ProductCard from '@/components/shop/ProductCard';
import Spinner from '@/components/ui/Spinner';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDistance } from '@/lib/utils';

export default function ShopDetail() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchShopData();
  }, [id]);

  const fetchShopData = async () => {
    setLoading(true);
    try {
      const [shopRes, productsRes] = await Promise.all([
        shopService.getShopById(id),
        shopService.getShopProducts(id),
      ]);
      setShop(shopRes.data);
      setProducts(productsRes.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(products.map((p) => p.category).filter(Boolean))];
  const filteredProducts = activeCategory === 'all' ? products : products.filter((p) => p.category === activeCategory);

  if (loading) {
    return (
      <div className="container py-6">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Shop not found</p>
        <Link to="/shops" className="text-primary mt-4 inline-block">Browse shops</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={shop.imageUrl || 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800'}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <Link
            to="/shops"
            className="flex items-center gap-1 rounded-xl bg-black/30 backdrop-blur-sm px-4 py-2 text-white text-sm hover:bg-black/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-white mb-2">{shop.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {shop.rating || '4.5'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {formatDistance(shop.distance)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {shop.isOpen ? 'Open' : 'Closed'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                Min. order: {formatPrice(shop.minOrderAmount || 0)}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="sticky top-16 z-20 bg-background/80 backdrop-blur-xl border-b">
        <div className="container flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all capitalize ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {cat} {cat === 'all' ? `(${products.length})` : `(${products.filter((p) => p.category === cat).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <ProductCard product={product} shopId={id} />
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
