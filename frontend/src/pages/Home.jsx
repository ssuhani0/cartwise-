import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  TrendingUp,
  Truck,
  Shield,
  Zap,
  Star,
  ChevronRight,
  ArrowRight,
  Smartphone,
  Bot,
  ScanLine,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { SECTIONS, APP_NAME } from '@/lib/constants';
import { shopService } from '@/services/shopService';
import { ShopCardSkeleton } from '@/components/ui/Skeleton';

const FEATURES_LIST = [
  {
    icon: Bot,
    title: 'AI-Powered Shopping',
    description: 'Smart recommendations based on your preferences and past orders',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: ScanLine,
    title: 'OCR Scanner',
    description: 'Upload your kirana list photo and we\'ll add items automatically',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: TrendingUp,
    title: 'Budget Optimizer',
    description: 'Get the best deals and save money on your monthly groceries',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Free delivery on orders above ₹299. Fast delivery from local shops',
    color: 'from-blue-500 to-cyan-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  const navigate = useNavigate();
  const [nearbyShops, setNearbyShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNearbyShops();
  }, []);

  const fetchNearbyShops = async () => {
    try {
      const response = await shopService.getAllShops({ pageSize: 6 });
      setNearbyShops(response.data.shops || []);
    } catch (err) {
      console.error('Failed to fetch shops:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={() => navigate(`/shops?search=${searchQuery}`)} />

      <section className="container py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
              <p className="text-muted-foreground mt-1">Everything you need, organized for you</p>
            </div>
            <Link to="/shops" className="text-primary text-sm font-medium hover:underline hidden sm:block">
              View All <ChevronRight className="h-4 w-4 inline" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {SECTIONS.map((section, index) => (
              <motion.div
                key={section.id}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <Link
                  to={`/shops?category=${section.id}`}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl border bg-card hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${section.color}15` }}
                  >
                    <section.icon className="h-7 w-7" style={{ color: section.color }} />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">{section.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="bg-muted/30 py-12">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Nearby Kirana Stores</h2>
                <p className="text-muted-foreground mt-1">Fresh groceries from your local shops</p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="text-sm font-medium border-orange-200 bg-orange-50/50 hover:bg-orange-100 text-orange-600 hidden sm:flex" onClick={() => navigate('/nearby')}>
                  <Zap className="h-4 w-4 mr-2" />
                  Use AI Location Search
                </Button>
                <Link to="/shops" className="text-primary text-sm font-medium hover:underline hidden sm:block">
                  View All <ChevronRight className="h-4 w-4 inline" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <ShopCardSkeleton key={i} />)
                : nearbyShops.map((shop, index) => (
                    <motion.div key={shop.id} variants={itemVariants}>
                      <Link to={`/shop/${shop.id}`} className="block">
                        <Card className="overflow-hidden group">
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={shop.imageUrl || 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400'}
                              alt={shop.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3">
                              <h3 className="text-white font-bold text-lg">{shop.name}</h3>
                              <div className="flex items-center gap-2 text-white/80 text-sm">
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  {shop.rating}
                                </span>
                                <span>•</span>
                                <span>{shop.distance ? `${(shop.distance / 1000).toFixed(1)} km` : 'Nearby'}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
            </div>

            {!loading && nearbyShops.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No shops found in the database. Let our AI find shops near you!</p>
                <div className="flex justify-center gap-3 mt-4">
                  <Button variant="primary" onClick={() => navigate('/nearby')}>
                    <Zap className="h-4 w-4 mr-2" />
                    Find AI Nearby Shops
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/shops')}>
                    Browse All
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <FeaturesSection />

      <CTASection />
    </div>
  );
}

function HeroSection({ searchQuery, setSearchQuery, onSearch }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-green-50 dark:from-orange-950/20 dark:via-background dark:to-green-950/20">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container relative py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6"
            >
              <Zap className="h-4 w-4" />
              AI-Powered Kirana Shopping
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
              Your Smart{' '}
              <span className="text-gradient">Kirana</span>{' '}
              Shopping Assistant
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Order fresh groceries from local kirana stores with AI-powered recommendations,
              OCR scanning, and budget optimization.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                  placeholder="Search for groceries, snacks..."
                  className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 bg-background text-lg focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <Button variant="primary" size="xl" onClick={onSearch}>
                Search
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-green-500" /> Trusted
              </span>
              <span className="flex items-center gap-1">
                <Truck className="h-4 w-4 text-primary" /> Fast Delivery
              </span>
              <span className="flex items-center gap-1">
                <Smartphone className="h-4 w-4 text-blue-500" /> Easy Order
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <motion.img
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"
                alt="Fresh groceries"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -left-4 glass rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Save up to 20%</p>
                    <p className="text-xs text-muted-foreground">on your monthly bill</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="container py-12">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold">Why Choose {APP_NAME}?</h2>
          <p className="text-muted-foreground mt-2">Making your grocery shopping smarter and easier</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES_LIST.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="p-6 text-center group hover:border-primary/30 cursor-default">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-0.5 mx-auto mb-4`}>
                  <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary/80 to-secondary p-8 md:p-12"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
              Ready to start shopping?
            </h2>
            <p className="text-white/80 text-lg">
              Join thousands of happy customers using {APP_NAME}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/signup">
              <Button
                variant="primary"
                size="xl"
                className="bg-white text-primary hover:bg-white/90 shadow-xl"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/shops">
              <Button
                variant="outline"
                size="xl"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Browse Shops
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
