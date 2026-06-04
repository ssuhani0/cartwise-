import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, SlidersHorizontal, Search, X } from 'lucide-react';
import { shopService } from '@/services/shopService';
import ShopCard from '@/components/shop/ShopCard';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { ShopCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDebounce } from '@/hooks/useDebounce';

export default function ShopListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('distance');
  const [showFilters, setShowFilters] = useState(false);
  const { latitude, longitude, loading: geoLoading } = useGeolocation();
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchShops();
  }, [debouncedSearch, category, sort, latitude, longitude]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const params = { sort };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category) params.category = category;
      if (latitude && longitude) {
        params.lat = latitude;
        params.lng = longitude;
      }
      const response = await shopService.getAllShops(params);
      setShops(response.data.shops || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (cat) => {
    setCategory(cat === category ? '' : cat);
    setSearchParams(cat ? { category: cat } : {});
  };

  const categories = ['vegetables', 'fruits', 'dairy', 'snacks', 'kirana', 'beverages', 'household', 'personal'];

  return (
    <div className="container py-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Nearby Shops</h1>
            <p className="text-muted-foreground text-sm">
              {geoLoading ? 'Detecting location...' : shops.length > 0 ? `${shops.length} shops found` : 'Discover local kirana stores'}
            </p>
          </div>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryFilter(cat)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all capitalize ${
                category === cat
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <ShopCardSkeleton key={i} />)
          : shops.map((shop) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ShopCard shop={shop} />
              </motion.div>
            ))}
      </div>

      {!loading && shops.length === 0 && (
        <EmptyState
          title="No shops found"
          description={debouncedSearch ? `No shops matching "${debouncedSearch}"` : 'No shops available in your area'}
          action={{ label: 'Clear filters', onClick: () => { setSearch(''); setCategory(''); setSearchParams({}); } }}
        />
      )}
    </div>
  );
}
