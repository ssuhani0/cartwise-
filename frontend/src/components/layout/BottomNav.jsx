import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Store, ShoppingCart, ScanLine, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/shops', icon: Store, label: 'Shops' },
  { to: '/cart', icon: ShoppingCart, label: 'Cart', hasBadge: true },
  { to: '/ocr', icon: ScanLine, label: 'Scan' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const { items } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/80 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ to, icon: Icon, label, hasBadge }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className="relative flex flex-col items-center gap-0.5 min-w-[60px] py-1"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNav"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <div className="relative">
                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors relative z-10',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
                {hasBadge && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground z-20">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium relative z-10',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
