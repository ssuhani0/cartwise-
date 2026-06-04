import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import SignupForm from '@/components/auth/SignupForm';
import OtpVerification from '@/components/auth/OtpVerification';
import { useAuthStore } from '@/store/authStore';
import { APP_NAME } from '@/lib/constants';
import { success } from '@/components/ui/Toast';

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState('signup');
  const [email, setEmail] = useState('');
  const { login } = useAuthStore();

  const handleOtpRequired = (userEmail) => {
    setEmail(userEmail);
    setStep('otp');
  };

  const handleVerified = () => {
    success('Account created successfully!');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {step === 'otp' && (
          <button
            onClick={() => setStep('signup')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to signup
          </button>
        )}

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

        <AnimatePresence mode="wait">
          {step === 'signup' && (
            <SignupForm
              key="signup"
              onSuccess={() => navigate('/')}
              onOtpRequired={handleOtpRequired}
            />
          )}
          {step === 'otp' && (
            <OtpVerification
              key="otp"
              email={email}
              onVerified={handleVerified}
              onBack={() => setStep('signup')}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
