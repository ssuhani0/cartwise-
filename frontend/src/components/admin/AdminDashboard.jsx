import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, ShoppingBag, DollarSign, Package, Store,
  ArrowUp, ArrowDown,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import Card from '@/components/ui/Card';
import { formatPrice } from '@/lib/utils';


import { adminService } from '@/services/adminService';
import { error } from '@/components/ui/Toast';

const COLORS = ['#ea580c', '#16a34a', '#eab308', '#3b82f6', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { label: 'Total Revenue', value: 0, icon: DollarSign, change: 0, trend: 'up', color: 'text-green-500' },
    { label: 'Total Orders', value: 0, icon: Package, change: 0, trend: 'up', color: 'text-blue-500' },
    { label: 'Active Users', value: 0, icon: Users, change: 0, trend: 'up', color: 'text-orange-500' },
    { label: 'Active Shops', value: 0, icon: Store, change: 0, trend: 'up', color: 'text-purple-500' },
  ]);
  const [dailyOrdersData, setDailyOrdersData] = useState([]);
  const [popularItemsData, setPopularItemsData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revenueRes, dailyRes, popularRes, usersRes, shopsRes] = await Promise.all([
          adminService.getRevenue({ period: 'month' }),
          adminService.getDailyOrders({ days: 7 }),
          adminService.getPopularItems({ limit: 5 }),
          adminService.getUsers({ pageSize: 1 }),
          adminService.getShops({ pageSize: 1 })
        ]);

        setStats([
          { label: 'Total Revenue', value: revenueRes.data.revenue, icon: DollarSign, change: 0, trend: 'up', color: 'text-green-500' },
          { label: 'Total Orders', value: revenueRes.data.orderCount, icon: Package, change: 0, trend: 'up', color: 'text-blue-500' },
          { label: 'Active Users', value: usersRes.data.total, icon: Users, change: 0, trend: 'up', color: 'text-orange-500' },
          { label: 'Active Shops', value: shopsRes.data.total, icon: Store, change: 0, trend: 'up', color: 'text-purple-500' },
        ]);

        const formattedDaily = dailyRes.data.dailyOrders.map(d => {
          const date = new Date(d.date);
          return { day: date.toLocaleDateString('en-US', { weekday: 'short' }), orders: d.count, revenue: d.revenue };
        });
        setDailyOrdersData(formattedDaily);

        const formattedPopular = popularRes.data.popularItems.map(p => ({
          name: p.name, value: p.totalSold
        }));
        setPopularItemsData(formattedPopular);

      } catch (err) {
        error("Failed to load dashboard data");
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">
                    {stat.label === 'Total Revenue' ? formatPrice(stat.value) : stat.value.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs">
                {stat.trend === 'up' ? (
                  <ArrowUp className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-500" />
                )}
                <span className={stat.color}>{stat.change}%</span>
                <span className="text-muted-foreground">vs last week</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Daily Orders & Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyOrdersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                }}
              />
              <Legend />
              <Bar dataKey="orders" fill="#ea580c" radius={[4, 4, 0, 0]} name="Orders" />
              <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-4">Popular Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={popularItemsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {popularItemsData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyOrdersData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={2} dot={{ fill: '#ea580c' }} name="Revenue (₹)" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
