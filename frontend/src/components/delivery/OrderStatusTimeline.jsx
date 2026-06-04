import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, Package, ChefHat, Bike, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Bike },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

const statusOrder = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: -1,
};

export default function OrderStatusTimeline({ status }) {
  const currentIndex = statusOrder[status] ?? 0;
  const isCancelled = status === 'cancelled';

  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isDisabled = index > currentIndex;

        return (
          <div key={step.key} className="flex items-start gap-3 relative">
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'absolute left-[15px] top-8 w-0.5 h-10',
                  isCompleted ? 'bg-primary' : isCancelled ? 'bg-red-200' : 'bg-muted',
                )}
              />
            )}

            <div className="relative z-10">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  isDisabled && !isCancelled && 'bg-muted text-muted-foreground',
                  isCancelled && 'bg-red-100 text-red-500 dark:bg-red-950/30',
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </motion.div>
            </div>

            <div className="flex-1 pb-8">
              <p
                className={cn(
                  'text-sm font-medium',
                  isCompleted && 'text-foreground',
                  isCurrent && 'text-primary font-semibold',
                  isDisabled && !isCancelled && 'text-muted-foreground',
                  isCancelled && 'text-red-500',
                )}
              >
                {step.label}
              </p>
              {isCurrent && !isCancelled && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-primary mt-0.5"
                >
                  {status === 'preparing' && 'Your order is being prepared'}
                  {status === 'out_for_delivery' && 'Delivery agent is on the way'}
                  {status === 'confirmed' && 'Order has been confirmed'}
                  {status === 'pending' && 'Waiting for confirmation'}
                </motion.p>
              )}
              {isCancelled && index === 0 && (
                <p className="text-xs text-red-500 mt-0.5">Order was cancelled</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
