import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import AddressForm from '@/components/checkout/AddressForm';
import PaymentMethod from '@/components/checkout/PaymentMethod';
import OrderSummary from '@/components/checkout/OrderSummary';
import Button from '@/components/ui/Button';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { success, error } from '@/components/ui/Toast';

const steps = ['Delivery Address', 'Payment Method', 'Order Summary'];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, discount, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [address, setAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const response = await orderService.createOrder({
        deliveryAddressId: address.id,
        paymentMethod,
        notes: '',
      });
      const order = response.data;

      if (paymentMethod === 'cod') {
        clearCart();
        success('Order placed successfully!');
        navigate(`/order/${order.orderId}`);
        return;
      }

      const paymentRes = await paymentService.createRazorpayOrder({
        orderId: order.orderId,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentRes.data.amount,
        currency: paymentRes.data.currency,
        name: 'CartWise',
        order_id: paymentRes.data.razorpayOrderId,
        handler: async (paymentResponse) => {
          await paymentService.verifyPayment(paymentResponse);
          clearCart();
          success('Payment successful! Order placed.');
          navigate(`/order/${order.orderId}`);
        },
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: '9999999999',
        },
        theme: { color: '#ea580c' },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return !!address;
    if (currentStep === 1) return !!paymentMethod;
    return true;
  };

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  index <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={`text-sm font-medium hidden sm:block ${
                  index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-2 transition-all ${
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <AddressForm onSelect={setAddress} selected={address} />
              </motion.div>
            )}
            {currentStep === 1 && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <PaymentMethod selected={paymentMethod} onSelect={setPaymentMethod} />
              </motion.div>
            )}
            {currentStep === 2 && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <OrderSummary address={address} paymentMethod={paymentMethod} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Items ({items.length})</span>
              <span className="font-medium">{subtotal()} INR</span>
            </div>

            <div className="space-y-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
              )}
              {currentStep < 2 ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={!canProceed()}
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={loading}
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
