import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Search, Phone, Clock, Star, Store, Loader2, RefreshCw } from 'lucide-react';
import { ShopCardSkeleton } from '@/components/ui/Skeleton';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDebounce } from '@/hooks/useDebounce';
import axios from 'axios';

const CATEGORIES = [
  { id: '', label: '✨ All', emoji: '' },
  { id: 'kirana', label: 'Kirana', emoji: '🏪' },
  { id: 'vegetables', label: 'Vegetables', emoji: '🥦' },
  { id: 'fruits', label: 'Fruits', emoji: '🍎' },
  { id: 'dairy', label: 'Dairy', emoji: '🥛' },
  { id: 'bakery', label: 'Bakery', emoji: '🍞' },
  { id: 'snacks', label: 'Snacks', emoji: '🍿' },
  { id: 'pharmacy', label: 'Pharmacy', emoji: '💊' },
  { id: 'meat', label: 'Meat & Fish', emoji: '🐟' },
  { id: 'household', label: 'Household', emoji: '🧹' },
];

// Shop images per category
const CATEGORY_IMAGES = {
  kirana: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600',
  vegetables: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
  fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600',
  dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600',
  bakery: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600',
  snacks: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=600',
  pharmacy: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600',
  meat: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600',
  household: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600',
  default: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600',
};

function AiShopCard({ shop }) {
  // Handle raw snake_case keys from AI
  const name = shop.shopName || shop.shop_name || 'Local Shop';
  const address = shop.locationAddress || shop.location_address || '';
  const phone = shop.phoneNumber || shop.phone_number || '';
  const openFrom = shop.openFrom || shop.open_from || '08:00 AM';
  const openTo = shop.openTo || shop.open_to || '10:00 PM';
  const rating = shop.rating || 4.2;
  const category = shop.category || 'kirana';
  const imageUrl = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
    >
      {/* Shop Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        {/* Open badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500 text-white shadow">
          Open Now
        </div>
        {/* Rating badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          {Number(rating).toFixed(1)}
        </div>
        {/* Shop name overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-base leading-tight drop-shadow">{name}</h3>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-2.5">
        {address && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{address}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-xs">
          {phone && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              <span>{phone}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-green-600 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{openFrom} – {openTo}</span>
          </div>
        </div>
        <div className="pt-1 border-t">
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">
            {category}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ShopListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'kirana');
  const { latitude, longitude, loading: geoLoading } = useGeolocation();
  const debouncedSearch = useDebounce(search, 400);

  const fetchShops = useCallback(async () => {
    if (!latitude || !longitude) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/v1/shops/ai-nearby`,
        { params: { lat: latitude, lng: longitude, category: category || 'kirana' }, timeout: 30000 }
      );
      let result = res.data?.shops || [];
      // Filter by search query on the frontend
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        result = result.filter(s =>
          (s.shop_name || s.shopName || '').toLowerCase().includes(q) ||
          (s.location_address || s.locationAddress || '').toLowerCase().includes(q)
        );
      }
      setShops(result);
    } catch (err) {
      console.error('Failed to fetch AI shops:', err);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, category, debouncedSearch]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleCategoryFilter = (cat) => {
    setCategory(cat);
    setSearchParams(cat ? { category: cat } : {});
  };

  return (
    <div className="container py-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Store className="w-6 h-6 text-orange-500" />
              Nearby Shops
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {geoLoading
                ? '📍 Detecting your location...'
                : loading
                ? '🤖 Groq AI is finding shops near you...'
                : shops.length > 0
                ? `${shops.length} shops found near you`
                : 'Discover local stores around you'}
            </p>
          </div>

          {/* Search + Refresh */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shops..."
                className="flex h-10 w-full rounded-xl border bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200"
              />
            </div>
            <button
              onClick={fetchShops}
              disabled={loading || geoLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryFilter(cat.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                category === cat.id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-muted text-muted-foreground hover:bg-orange-100 hover:text-orange-700'
              }`}
            >
              {cat.emoji && <span>{cat.emoji}</span>}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Location needed prompt */}
        {geoLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
            <p className="font-medium text-muted-foreground">Getting your location...</p>
          </div>
        )}

        {/* AI Loading state */}
        {!geoLoading && loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <ShopCardSkeleton key={i} />)}
          </div>
        )}

        {/* Shop cards */}
        {!geoLoading && !loading && shops.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop, idx) => (
              <AiShopCard key={idx} shop={shop} />
            ))}
          </div>
        )}

        {/* No results */}
        {!geoLoading && !loading && shops.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Store className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="font-semibold text-lg">No shops found</p>
            <p className="text-sm text-muted-foreground">
              {debouncedSearch ? `No shops matching "${debouncedSearch}"` : 'Try a different category or refresh'}
            </p>
            <button
              onClick={fetchShops}
              className="mt-2 px-5 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
