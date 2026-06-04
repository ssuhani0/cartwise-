import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, Trash2, Plus, Bike, Phone, MapPin } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';

const agents = [
  { id: '1', name: 'Vikram Singh', phone: '+91 9876543210', area: 'Adyar', status: 'available', deliveries: 145, rating: 4.8, earnings: 28000 },
  { id: '2', name: 'Suresh Kumar', phone: '+91 8765432109', area: 'Velachery', status: 'busy', deliveries: 98, rating: 4.5, earnings: 19000 },
  { id: '3', name: 'Manoj Reddy', phone: '+91 7654321098', area: 'T Nagar', status: 'offline', deliveries: 67, rating: 4.2, earnings: 12000 },
  { id: '4', name: 'Ravi Shankar', phone: '+91 6543210987', area: 'Thoraipakkam', status: 'available', deliveries: 212, rating: 4.9, earnings: 35000 },
];

export default function DeliveryAgentManagement() {
  const [search, setSearch] = useState('');

  const filtered = agents.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) || a.area.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Delivery Agents</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents..."
              className="w-64 h-10 pl-10 pr-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button variant="primary" size="md"><Plus className="h-4 w-4 mr-1" /> Add Agent</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium">Agent</th>
                <th className="text-left p-4 font-medium">Area</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Deliveries</th>
                <th className="text-left p-4 font-medium">Rating</th>
                <th className="text-left p-4 font-medium">Earnings</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((agent, i) => (
                <motion.tr
                  key={agent.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bike className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {agent.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {agent.area}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge variant={
                      agent.status === 'available' ? 'success' :
                      agent.status === 'busy' ? 'warning' : 'danger'
                    }>
                      {agent.status}
                    </Badge>
                  </td>
                  <td className="p-4">{agent.deliveries}</td>
                  <td className="p-4">{agent.rating} ★</td>
                  <td className="p-4">{formatPrice(agent.earnings)}</td>
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
