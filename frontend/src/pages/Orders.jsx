import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { useAuthStore } from '@/store/authStore';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { OrderCardSkeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDistance, getTimeAgo } from '@/lib/utils';
import { ORDER_STATUS } from '@/lib/constants';

const statusBadgeVariant = {
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.CONFIRMED]: 'default',
  [ORDER_STATUS.PREPARING]: 'default',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 'secondary',
  [ORDER_STATUS.DELIVERED]: 'success',
  [ORDER_STATUS.CANCELLED]: 'danger',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getOrders();
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-6">
        <EmptyState
          title="Login to view orders"
          description="Please login to see your order history"
          action={{ label: 'Login', onClick: () => window.location.href = '/login' }}
        />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Place your first order and it will appear here"
          action={{ label: 'Browse Shops', onClick: () => window.location.href = '/shops' }}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link
                to={`/order/${order.id}`}
                className="block glass rounded-2xl p-5 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Order #{order.id?.slice(0, 8).toUpperCase()}</span>
                    <p className="font-semibold mt-0.5">{order.shopName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusBadgeVariant[order.status] || 'default'}>
                      {order.status?.replace(/_/g, ' ')}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{order.itemCount || 0} items</span>
                  <span>•</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                  <span>•</span>
                  <span>{getTimeAgo(order.createdAt)}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
