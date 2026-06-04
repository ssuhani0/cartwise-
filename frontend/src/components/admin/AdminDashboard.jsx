import { useState } from 'react';
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

const stats = [
  { label: 'Total Revenue', value: 125000, icon: DollarSign, change: 12.5, trend: 'up', color: 'text-green-500' },
  { label: 'Total Orders', value: 1450, icon: Package, change: 8.2, trend: 'up', color: 'text-blue-500' },
  { label: 'Active Users', value: 890, icon: Users, change: -3.1, trend: 'down', color: 'text-orange-500' },
  { label: 'Active Shops', value: 48, icon: Store, change: 4.7, trend: 'up', color: 'text-purple-500' },
];

const dailyOrders = [
  { day: 'Mon', orders: 45, revenue: 12500 },
  { day: 'Tue', orders: 52, revenue: 14800 },
  { day: 'Wed', orders: 38, revenue: 10200 },
  { day: 'Thu', orders: 65, revenue: 18900 },
  { day: 'Fri', orders: 55, revenue: 15600 },
  { day: 'Sat', orders: 78, revenue: 22300 },
  { day: 'Sun', orders: 72, revenue: 20500 },
];

const popularItems = [
  { name: 'Basmati Rice', value: 35 },
  { name: 'Toor Dal', value: 25 },
  { name: 'Sugar', value: 20 },
  { name: 'Cooking Oil', value: 15 },
  { name: 'Tea', value: 10 },
];

const COLORS = ['#ea580c', '#16a34a', '#eab308', '#3b82f6', '#8b5cf6'];

export default function AdminDashboard() {
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
            <BarChart data={dailyOrders}>
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
                data={popularItems}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {popularItems.map((_, index) => (
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
          <LineChart data={dailyOrders}>
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
