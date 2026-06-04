import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import Footer from './Footer';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export default function Layout({ children }) {
  const location = useLocation();
  const { theme } = useUiStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthPage && <Navbar />}
      <main className={cn('flex-1', !isAuthPage && 'pb-16 md:pb-0')}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      {!isAuthPage && (
        <>
          <Footer />
          <BottomNav />
          <AiFab />
        </>
      )}
    </div>
  );
}

function AiFab() {
  const location = useLocation();
  if (location.pathname === '/ai-assistant') return null;

  return (
    <a
      href="/ai-assistant"
      className="fixed bottom-20 right-4 z-30 md:bottom-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 transition-all hover:scale-110 animate-float"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}


