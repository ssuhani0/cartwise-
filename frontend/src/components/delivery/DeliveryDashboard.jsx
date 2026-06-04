import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, CheckCircle, XCircle, Navigation, Phone, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import OrderStatusTimeline from './OrderStatusTimeline';
import { formatPrice, getTimeAgo } from '@/lib/utils';
import { success, error } from '@/components/ui/Toast';

const dummyOrders = [
  {
    id: '1',
    orderId: 'CW001',
    customer: { name: 'Rahul Sharma', phone: '+91 9876543210', address: '123, Gandhi Nagar, Chennai' },
    items: [
      { name: 'Basmati Rice', quantity: 2 },
      { name: 'Toor Dal', quantity: 1 },
      { name: 'Sugar', quantity: 1 },
    ],
    total: 450,
    status: 'out_for_delivery',
    paymentMethod: 'cod',
    deliveryOtp: '1234',
    createdAt: new Date().toISOString(),
    distance: '2.3 km',
  },
  {
    id: '2',
    orderId: 'CW002',
    customer: { name: 'Priya Patel', phone: '+91 8765432109', address: '456, OMR Road, Chennai' },
    items: [
      { name: 'Vegetables Pack', quantity: 1 },
      { name: 'Milk', quantity: 2 },
      { name: 'Bread', quantity: 1 },
    ],
    total: 320,
    status: 'preparing',
    paymentMethod: 'paid',
    deliveryOtp: '5678',
    createdAt: new Date().toISOString(),
    distance: '1.5 km',
  },
];

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState(dummyOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otp, setOtp] = useState('');

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    success(`Order ${orderId} status updated to ${newStatus.replace(/_/g, ' ')}`);
  };

  const handleDeliver = (orderId) => {
    if (otp.length !== 4) {
      error('Please enter valid OTP');
      return;
    }
    const order = orders.find((o) => o.id === orderId);
    if (order && otp === order.deliveryOtp) {
      handleStatusUpdate(orderId, 'delivered');
      setOtp('');
      setSelectedOrder(null);
      success('Delivery confirmed!');
    } else {
      error('Invalid OTP');
    }
  };

  const statusCounts = {
    pending: orders.filter((o) => o.status === 'pending').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    out_for_delivery: orders.filter((o) => o.status === 'out_for_delivery').length,
  };

  return (
    <div className="container py-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              {orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length} active orders
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Card key={status} className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{count}</p>
              <p className="text-xs text-muted-foreground capitalize">{status.replace(/_/g, ' ')}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className={`p-5 cursor-pointer transition-all ${
                  selectedOrder?.id === order.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <span className="font-semibold">Order #{order.orderId}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{getTimeAgo(order.createdAt)}</p>
                  </div>
                  <Badge variant={
                    order.status === 'out_for_delivery' ? 'secondary' :
                    order.status === 'preparing' ? 'warning' : 'default'
                  }>
                    {order.status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="space-y-1 mb-3">
                  <p className="text-sm font-medium">{order.customer.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {order.customer.address}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {order.customer.phone}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Navigation className="h-3 w-3" /> {order.distance}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                  <div className="flex gap-2">
                    {order.status === 'preparing' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'out_for_delivery'); }}
                      >
                        Pick Up
                      </Button>
                    )}
                    {order.status === 'out_for_delivery' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                      >
                        Deliver
                      </Button>
                    )}
                  </div>
                </div>

                {selectedOrder?.id === order.id && order.status === 'out_for_delivery' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-4 pt-4 border-t space-y-3"
                  >
                    <p className="text-sm font-medium">Enter Delivery OTP</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="4-digit OTP"
                        className="flex-1 h-10 rounded-xl border bg-background px-3 text-sm text-center tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={(e) => { e.stopPropagation(); handleDeliver(order.id); }}
                        disabled={otp.length !== 4}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Confirm
                      </Button>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
