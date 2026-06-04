import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Store,
  User,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Package,
  ScanLine,
  Bot,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';
import SearchBar from '@/components/ui/SearchBar';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items } = useCartStore();
  const { theme, toggleTheme } = useUiStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <ShoppingCart className="h-7 w-7 text-primary" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-secondary" />
          </div>
          <span className="text-xl font-extrabold hidden sm:block">
            <span className="text-primary">{APP_NAME.slice(0, 4)}</span>
            <span className="text-secondary">{APP_NAME.slice(4)}</span>
          </span>
        </Link>

        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <SearchBar onSearch={(q) => q && navigate(`/shops?search=${q}`)} />
        </div>

        <nav className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="rounded-xl p-2 hover:bg-muted transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </motion.button>

          <Link to="/ocr" className="rounded-xl p-2 hover:bg-muted transition-colors hidden sm:block">
            <ScanLine className="h-5 w-5" />
          </Link>

          <Link to="/ai-assistant" className="rounded-xl p-2 hover:bg-muted transition-colors hidden sm:block">
            <Bot className="h-5 w-5" />
          </Link>

          <Link to="/cart" className="relative rounded-xl p-2 hover:bg-muted transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-muted transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium hidden lg:block">{user?.name?.split(' ')[0]}</span>
              </motion.button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-56 rounded-xl border bg-card shadow-xl overflow-hidden"
                  >
                    <div className="p-3 border-b bg-muted/30">
                      <p className="font-medium text-sm">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <MenuItem icon={User} label="My Profile" to="/profile" onClick={() => setUserMenuOpen(false)} />
                      <MenuItem icon={Package} label="My Orders" to="/orders" onClick={() => setUserMenuOpen(false)} />
                      <MenuItem icon={Bot} label="AI Assistant" to="/ai-assistant" onClick={() => setUserMenuOpen(false)} />
                      {user?.role === 'admin' && (
                        <MenuItem icon={Settings} label="Admin Panel" to="/admin" onClick={() => setUserMenuOpen(false)} />
                      )}
                    </div>
                    <div className="p-1 border-t">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 hover:bg-muted transition-colors md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t md:hidden overflow-hidden"
          >
            <div className="container py-4 space-y-3">
              <SearchBar onSearch={(q) => { navigate(`/shops?search=${q}`); setMobileMenuOpen(false); }} />
              <MobileNavItem icon={Store} label="Shops" to="/shops" onClick={() => setMobileMenuOpen(false)} />
              <MobileNavItem icon={ScanLine} label="OCR Scan" to="/ocr" onClick={() => setMobileMenuOpen(false)} />
              <MobileNavItem icon={Bot} label="AI Assistant" to="/ai-assistant" onClick={() => setMobileMenuOpen(false)} />
              <MobileNavItem icon={Package} label="Orders" to="/orders" onClick={() => setMobileMenuOpen(false)} />
              <MobileNavItem icon={User} label="Profile" to="/profile" onClick={() => setMobileMenuOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MenuItem({ icon: Icon, label, to, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </Link>
  );
}

function MobileNavItem({ icon: Icon, label, to, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted transition-colors"
    >
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}
