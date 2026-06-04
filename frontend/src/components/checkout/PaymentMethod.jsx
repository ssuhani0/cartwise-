import { motion } from 'framer-motion';
import { Wallet, CreditCard, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

const methods = [
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    icon: Wallet,
  },
  {
    id: 'upi',
    name: 'UPI',
    description: 'GPay, PhonePe, Paytm, etc.',
    icon: Smartphone,
  },
  {
    id: 'card',
    name: 'Credit / Debit Card',
    description: 'Visa, Mastercard, Rupay',
    icon: CreditCard,
  },
];

export default function PaymentMethod({ selected, onSelect }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Payment Method</h3>
      <div className="space-y-3">
        {methods.map((method) => {
          const isSelected = selected === method.id;
          return (
            <motion.div
              key={method.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => onSelect(method.id)}
              className={cn(
                'p-4 rounded-2xl border-2 cursor-pointer transition-all',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-muted bg-card hover:border-muted-foreground/30',
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted',
                )}>
                  <method.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{method.name}</p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  isSelected ? 'border-primary' : 'border-muted-foreground/30',
                )}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
