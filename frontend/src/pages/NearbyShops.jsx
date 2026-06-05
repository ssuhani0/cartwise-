import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Loader2, Phone, Clock, Star, RefreshCw,
  Store, Navigation, Search, ChevronRight, Locate
} from 'lucide-react';
import axios from 'axios';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const shopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const CATEGORIES = [
  { id: 'kirana', label: 'Kirana', emoji: '🏪' },
  { id: 'vegetables', label: 'Vegetables', emoji: '🥦' },
  { id: 'fruits', label: 'Fruits', emoji: '🍎' },
  { id: 'dairy', label: 'Dairy', emoji: '🥛' },
  { id: 'bakery', label: 'Bakery', emoji: '🍞' },
  { id: 'snacks', label: 'Snacks', emoji: '🍿' },
  { id: 'pharmacy', label: 'Pharmacy', emoji: '💊' },
  { id: 'meat', label: 'Meat & Fish', emoji: '🐟' },
];

function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 14);
  }, [lat, lng]);
  return null;
}

function PermissionScreen({ onRequest, loading }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {/* Animated location icon */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-orange-500/20"
          />
          <motion.div
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            className="absolute inset-4 rounded-full bg-orange-500/15"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-2xl shadow-orange-500/40">
              <Navigation className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-3">Find Shops Near You</h1>
        <p className="text-muted-foreground text-lg mb-2">
          Allow location access to discover kirana stores and shops around you.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Groq AI will analyse your location and find the best nearby shops.
        </p>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRequest}
          disabled={loading}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Locate className="w-5 h-5" />
          )}
          {loading ? 'Getting Location...' : 'Enable Location Access'}
        </motion.button>

        <p className="text-xs text-muted-foreground mt-4">
          Your precise location is used only to find nearby shops and is never stored.
        </p>
      </motion.div>
    </div>
  );
}

function ShopCard({ shop, selected, onClick }) {
  // Handle both snake_case (raw) and camelCase (interceptor-converted) keys
  const name = shop.shopName || shop.shop_name || 'Unknown Shop';
  const address = shop.locationAddress || shop.location_address || '';
  const phone = shop.phoneNumber || shop.phone_number || '';
  const openFrom = shop.openFrom || shop.open_from || '';
  const openTo = shop.openTo || shop.open_to || '';
  const rating = shop.rating;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
        selected
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 shadow-md'
          : 'border-border hover:border-orange-300 hover:shadow-sm bg-card'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm leading-tight">{name}</h3>
        {rating && (
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{Number(rating).toFixed(1)}</span>
          </div>
        )}
      </div>
      {address && (
        <div className="flex items-start gap-1 text-xs text-muted-foreground mb-2">
          <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-orange-500" />
          <span className="line-clamp-2">{address}</span>
        </div>
      )}
      <div className="flex items-center justify-between text-xs">
        {phone && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Phone className="w-3 h-3" />
            <span>{phone}</span>
          </div>
        )}
        {openFrom && openTo && (
          <div className="flex items-center gap-1 text-green-600 font-medium">
            <Clock className="w-3 h-3" />
            <span>{openFrom} – {openTo}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function NearbyShops() {
  const [phase, setPhase] = useState('permission'); // permission | locating | browsing
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [category, setCategory] = useState('kirana');
  const [shops, setShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setPhase('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        setPhase('browsing');
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? 'Location access denied. Please allow location access in your browser and try again.'
            : 'Unable to determine your location. Please try again.'
        );
        setPhase('permission');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  const fetchShops = useCallback(async () => {
    if (!location) return;
    setLoadingShops(true);
    setShops([]);
    setSelectedShop(null);
    setFetchError(null);
    try {
      // Use raw axios (no auth interceptor, no camelCase transform) so we get raw snake_case keys
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/v1/shops/ai-nearby`, {
        params: { lat: location.lat, lng: location.lng, category },
        timeout: 30000,
      });
      const shopList = res.data?.shops || [];
      if (shopList.length === 0) {
        setFetchError('No shops found for this category. Try another one.');
      }
      setShops(shopList);
    } catch (err) {
      console.error('Failed to fetch AI shops:', err);
      setFetchError('Failed to load shops. Please try again.');
    } finally {
      setLoadingShops(false);
    }
  }, [location, category]);

  // Fetch shops whenever category or location changes
  useEffect(() => {
    if (phase === 'browsing' && location) {
      fetchShops();
    }
  }, [phase, location, category]);

  // Helper to get lat/lng from a shop object (handles both key formats)
  const getShopCoords = (shop, idx) => {
    const lat = shop.lat || (location.lat + (((idx % 5) - 2) * 0.003));
    const lng = shop.lng || (location.lng + (((idx % 3) - 1) * 0.003));
    return [lat, lng];
  };

  if (phase === 'permission' || phase === 'locating') {
    return (
      <div>
        {locationError && (
          <div className="container pt-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-700 text-sm flex items-start gap-2 mb-4"
            >
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
              {locationError}
            </motion.div>
          </div>
        )}
        <PermissionScreen onRequest={requestLocation} loading={phase === 'locating'} />
      </div>
    );
  }

  return (
    <div className="container py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Store className="w-6 h-6 text-orange-500" />
              Nearby Shops
            </h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {location?.lat.toFixed(5)}, {location?.lng.toFixed(5)}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 text-xs font-medium">
                Precise GPS
              </span>
            </p>
          </div>
          <button
            onClick={fetchShops}
            disabled={loadingShops}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingShops ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat.id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-muted text-muted-foreground hover:bg-orange-100 hover:text-orange-700'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main layout: Map + Side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Map */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border shadow-sm relative">
          {loadingShops && (
            <div className="absolute inset-0 z-[1000] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
              <p className="font-medium text-sm">Groq AI is finding {category} shops near you...</p>
              <p className="text-xs text-muted-foreground">Analysing your location</p>
            </div>
          )}
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={14}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapRecenter lat={location.lat} lng={location.lng} />

            {/* User marker */}
            <Marker position={[location.lat, location.lng]} icon={userIcon}>
              <Popup>
                <div className="text-center">
                  <strong>📍 You are here</strong>
                  <p className="text-xs text-gray-500 mt-1">Precise GPS location</p>
                </div>
              </Popup>
            </Marker>

            {/* Shop markers */}
            {shops.map((shop, idx) => {
              const [sLat, sLng] = getShopCoords(shop, idx);
              const name = shop.shopName || shop.shop_name || 'Shop';
              const address = shop.locationAddress || shop.location_address || '';
              const phone = shop.phoneNumber || shop.phone_number || '';
              const openFrom = shop.openFrom || shop.open_from || '';
              const openTo = shop.openTo || shop.open_to || '';
              const rating = shop.rating;

              return (
                <Marker
                  key={idx}
                  position={[sLat, sLng]}
                  icon={shopIcon}
                  eventHandlers={{ click: () => setSelectedShop(idx) }}
                >
                  <Popup>
                    <div className="p-1 min-w-[180px]">
                      <h3 className="font-bold text-base mb-1">{name}</h3>
                      {address && <p className="text-xs text-gray-500 mb-2">{address}</p>}
                      <div className="space-y-1 text-xs">
                        {phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{phone}</span>
                          </div>
                        )}
                        {openFrom && openTo && (
                          <div className="flex items-center gap-1 text-green-600 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>{openFrom} – {openTo}</span>
                          </div>
                        )}
                        {rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{Number(rating).toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: '600px' }}>
          <div className="flex items-center justify-between sticky top-0 bg-background pb-2 z-10">
            <span className="text-sm font-medium text-muted-foreground">
              {loadingShops ? 'Finding shops with Groq AI...' : `${shops.length} shops found`}
            </span>
          </div>

          {fetchError && !loadingShops && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-700 text-xs"
            >
              {fetchError}
            </motion.div>
          )}

          {!loadingShops && shops.length === 0 && !fetchError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 px-4"
            >
              <Store className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-medium text-sm">No shops found</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different category</p>
            </motion.div>
          )}

          {!loadingShops && shops.map((shop, idx) => (
            <ShopCard
              key={idx}
              shop={shop}
              selected={selectedShop === idx}
              onClick={() => setSelectedShop(idx === selectedShop ? null : idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
