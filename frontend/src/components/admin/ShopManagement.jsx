import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, Trash2, Plus, Store } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';

const shops = [
  { id: '1', name: 'Sharma Kirana Store', owner: 'Rahul Sharma', area: 'Adyar', city: 'Chennai', rating: 4.5, status: 'active', orders: 234, revenue: 45000 },
  { id: '2', name: 'Patel General Store', owner: 'Amit Patel', area: 'Velachery', city: 'Chennai', rating: 4.2, status: 'active', orders: 189, revenue: 32000 },
  { id: '3', name: 'Gupta Supermarket', owner: 'Neha Gupta', area: 'T Nagar', city: 'Chennai', rating: 3.8, status: 'inactive', orders: 56, revenue: 12000 },
  { id: '4', name: 'Singh Grocers', owner: 'Vikram Singh', area: 'Thoraipakkam', city: 'Chennai', rating: 4.7, status: 'active', orders: 312, revenue: 56000 },
];

export default function ShopManagement() {
  const [search, setSearch] = useState('');

  const filtered = shops.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.owner.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Shop Management</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shops..."
              className="w-64 h-10 pl-10 pr-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button variant="primary" size="md"><Plus className="h-4 w-4 mr-1" /> Add Shop</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium">Shop</th>
                <th className="text-left p-4 font-medium">Owner</th>
                <th className="text-left p-4 font-medium">Location</th>
                <th className="text-left p-4 font-medium">Rating</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Revenue</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((shop, i) => (
                <motion.tr
                  key={shop.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Store className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{shop.name}</span>
                    </div>
                  </td>
                  <td className="p-4">{shop.owner}</td>
                  <td className="p-4 text-muted-foreground">{shop.area}, {shop.city}</td>
                  <td className="p-4">{shop.rating} ★</td>
                  <td className="p-4">
                    <Badge variant={shop.status === 'active' ? 'success' : 'danger'}>{shop.status}</Badge>
                  </td>
                  <td className="p-4">{formatPrice(shop.revenue)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 rounded-lg hover:bg-muted transition-colors"><Edit2 className="h-4 w-4" /></button>
                      <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
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
