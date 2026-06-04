import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import { APP_NAME } from '@/lib/constants';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <span className="text-2xl font-extrabold">
              <span className="text-primary">{APP_NAME.slice(0, 4)}</span>
              <span className="text-secondary">{APP_NAME.slice(4)}</span>
            </span>
          </div>
        </motion.div>

        <LoginForm onSuccess={() => navigate('/')} />
      </div>
    </div>
  );
}
