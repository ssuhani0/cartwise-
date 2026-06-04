import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Package } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatPrice, getTimeAgo } from '@/lib/utils';

const orders = [
  { id: '1', orderId: 'CW001', customer: 'Rahul Sharma', shop: 'Sharma Kirana', total: 450, status: 'pending', payment: 'cod', createdAt: new Date().toISOString() },
  { id: '2', orderId: 'CW002', customer: 'Priya Patel', shop: 'Patel General', total: 320, status: 'out_for_delivery', payment: 'paid', createdAt: new Date().toISOString() },
  { id: '3', orderId: 'CW003', customer: 'Amit Singh', shop: 'Gupta Supermarket', total: 680, status: 'delivered', payment: 'paid', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', orderId: 'CW004', customer: 'Neha Gupta', shop: 'Singh Grocers', total: 250, status: 'cancelled', payment: 'cod', createdAt: new Date(Date.now() - 172800000).toISOString() },
];

const statusVariant = {
  pending: 'warning',
  confirmed: 'default',
  preparing: 'default',
  out_for_delivery: 'secondary',
  delivered: 'success',
  cancelled: 'danger',
};

export default function OrderManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = orders.filter((o) => {
    const m = o.orderId.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const s = statusFilter === 'all' || o.status === statusFilter;
    return m && s;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Order Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="w-64 h-10 pl-10 pr-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {['all', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm capitalize transition-all ${
              statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium">Order ID</th>
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Shop</th>
                <th className="text-left p-4 font-medium">Total</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Payment</th>
                <th className="text-left p-4 font-medium">Time</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4 font-medium">{order.orderId}</td>
                  <td className="p-4">{order.customer}</td>
                  <td className="p-4 text-muted-foreground">{order.shop}</td>
                  <td className="p-4">{formatPrice(order.total)}</td>
                  <td className="p-4">
                    <Badge variant={statusVariant[order.status]}>{order.status.replace(/_/g, ' ')}</Badge>
                  </td>
                  <td className="p-4 capitalize">{order.payment}</td>
                  <td className="p-4 text-muted-foreground">{getTimeAgo(order.createdAt)}</td>
                  <td className="p-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
