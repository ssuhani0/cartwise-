import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Phone, RefreshCw, Download, CheckCircle } from 'lucide-react';
import { orderService } from '@/services/orderService';
import OrderStatusTimeline from '@/components/delivery/OrderStatusTimeline';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { formatPrice } from '@/lib/utils';
import { success, error } from '@/components/ui/Toast';

const statusBadgeVariant = {
  pending: 'warning',
  confirmed: 'default',
  preparing: 'default',
  out_for_delivery: 'secondary',
  delivered: 'success',
  cancelled: 'danger',
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await orderService.getOrderById(id);
      setOrder(response.data.order);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await orderService.cancelOrder(id);
      success('Order cancelled');
      fetchOrder();
    } catch (err) {
      error(err.message || 'Failed to cancel');
    }
  };

  const handleRepeat = async () => {
    try {
      const response = await orderService.repeatOrder(id);
      success('Items added to cart!');
      navigate('/cart');
    } catch (err) {
      error(err.message || 'Failed to repeat order');
    }
  };

  if (loading) return <div className="container py-12"><Spinner size="lg" /></div>;
  if (!order) return <div className="container py-12 text-center"><p>Order not found</p></div>;

  return (
    <div className="container py-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.id?.slice(0, 8).toUpperCase()}</h1>
            <p className="text-muted-foreground text-sm">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Badge variant={statusBadgeVariant[order.status]} size="lg">
            {order.status?.replace(/_/g, ' ')}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Order Status</h3>
              <OrderStatusTimeline status={order.status} />
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Items</h3>
              <div className="divide-y">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 py-3">
                    <img
                      src={item.imageUrl || 'https://via.placeholder.com/64'}
                      alt={item.productName}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Delivery Details</h3>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Delivery Address</p>
                  <p className="text-muted-foreground">{order.deliveryAddress?.fullAddress}</p>
                  <p className="text-muted-foreground">{order.deliveryAddress?.area}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}</p>
                </div>
              </div>
              {order.deliveryAgent && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.deliveryAgent.name} - {order.deliveryAgent.phone}</span>
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Price Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.totalAmount - order.deliveryFee + (order.discountAmount || 0))}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={handleRepeat}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Repeat Order
              </Button>
              {order.status === 'pending' && (
                <Button
                  variant="danger"
                  size="md"
                  className="w-full"
                  onClick={handleCancel}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
