import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bike, ClipboardList } from 'lucide-react';
import DeliveryDashboard from '@/components/delivery/DeliveryDashboard';
import { cn } from '@/lib/utils';

const tabs = [
  { to: '/delivery', label: 'Dashboard', icon: ClipboardList, exact: true },
  { to: '/delivery/orders', label: 'Assigned Orders', icon: Bike },
];

export default function DeliveryDashboardPage() {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <Bike className="h-6 w-6 text-primary" />
            <span className="font-bold">CartWise Delivery</span>
          </Link>
          <nav className="flex items-center gap-1 ml-auto">
            {tabs.map((tab) => {
              const isActive = tab.exact ? location.pathname === tab.to : location.pathname.startsWith(tab.to);
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="container py-6">
        <Routes>
          <Route index element={<DeliveryDashboard />} />
          <Route path="orders" element={<DeliveryDashboard />} />
          <Route path="*" element={<Navigate to="/delivery" replace />} />
        </Routes>
      </main>
    </div>
  );
}
