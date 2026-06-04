import { useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Store, Package, ClipboardList, Bike, LogOut, ShoppingCart,
} from 'lucide-react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserManagement from '@/components/admin/UserManagement';
import ShopManagement from '@/components/admin/ShopManagement';
import ProductManagement from '@/components/admin/ProductManagement';
import OrderManagement from '@/components/admin/OrderManagement';
import DeliveryAgentManagement from '@/components/admin/DeliveryAgentManagement';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/shops', label: 'Shops', icon: Store },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/delivery-agents', label: 'Delivery Agents', icon: Bike },
];

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      <aside className={cn(
        'fixed left-0 top-0 bottom-0 z-40 border-r bg-card transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-0 -translate-x-full lg:w-16 lg:translate-x-0',
      )}>
        <div className="flex items-center gap-2 p-4 border-b h-16">
          <ShoppingCart className="h-6 w-6 text-primary shrink-0" />
          {sidebarOpen && (
            <span className="font-bold text-lg whitespace-nowrap">
              <span className="text-primary">Cart</span><span className="text-secondary">Wise</span>
            </span>
          )}
        </div>

        <nav className="p-2 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-2 right-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Back to Site</span>}
          </Link>
        </div>
      </aside>

      <div className={cn(
        'flex-1 transition-all duration-300',
        sidebarOpen ? 'ml-64' : 'ml-0 lg:ml-16',
      )}>
        <header className="sticky top-0 z-30 h-16 border-b bg-background/80 backdrop-blur-xl flex items-center px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold ml-2">
            {sidebarItems.find((i) => {
              if (i.exact) return location.pathname === i.to;
              return location.pathname.startsWith(i.to);
            })?.label || 'Admin'}
          </h2>
        </header>

        <main className="p-6">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="shops" element={<ShopManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="delivery-agents" element={<DeliveryAgentManagement />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
