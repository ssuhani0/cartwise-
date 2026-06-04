import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/authService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import OtpVerification from './OtpVerification';
import { success, error } from '@/components/ui/Toast';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const passwordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function ForgotPasswordForm({ onSuccess }) {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const handleSendOtp = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data);
      setEmail(data.email);
      setStep('otp');
      success('OTP sent to your email');
    } catch (err) {
      error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = (code) => {
    setOtpCode(code || '');
    setStep('reset');
  };

  const handleResetPassword = async (data) => {
    setLoading(true);
    try {
      await authService.resetPassword({ email, otpCode, newPassword: data.password });
      success('Password reset successfully!');
      onSuccess?.();
    } catch (err) {
      error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="w-full max-w-md mx-auto">
      <div className="glass rounded-2xl p-8 shadow-xl">
        <AnimatePresence mode="wait">
          {step === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-2xl font-bold mb-2">Forgot Password?</h2>
              <p className="text-muted-foreground mb-6">
                Enter your email and we'll send you an OTP to reset your password.
              </p>
              <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  icon={Mail}
                  {...emailForm.register('email')}
                  error={emailForm.formState.errors.email?.message}
                />
                <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                  Send OTP
                </Button>
              </form>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <OtpVerification
                email={email}
                mode="password-reset"
                onVerified={handleOtpVerified}
                onBack={() => setStep('email')}
              />
            </motion.div>
          )}

          {step === 'reset' && (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <button
                onClick={() => setStep('otp')}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
              <p className="text-muted-foreground mb-6">
                Enter your new password.
              </p>
              <form onSubmit={passwordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                  icon={Lock}
                  {...passwordForm.register('password')}
                  error={passwordForm.formState.errors.password?.message}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm new password"
                  icon={Lock}
                  {...passwordForm.register('confirmPassword')}
                  error={passwordForm.formState.errors.confirmPassword?.message}
                />
                <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                  Reset Password
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
