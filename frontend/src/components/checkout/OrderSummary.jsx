import { useCartStore } from '@/store/cartStore';
import Card from '@/components/ui/Card';
import { formatPrice } from '@/lib/utils';

export default function OrderSummary({ address, paymentMethod }) {
  const { items, subtotal, discount } = useCartStore();
  const subtotalAmount = subtotal();
  const deliveryFee = subtotalAmount >= 299 ? 0 : 20;
  const total = subtotalAmount - discount + deliveryFee;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Order Summary</h3>

      {address && (
        <Card className="p-4">
          <p className="text-sm font-medium mb-1">Delivering to</p>
          <p className="text-sm text-muted-foreground">{address.label}: {address.fullAddress}, {address.city} - {address.pincode}</p>
        </Card>
      )}

      {paymentMethod && (
        <Card className="p-4">
          <p className="text-sm font-medium mb-1">Payment via</p>
          <p className="text-sm capitalize text-muted-foreground">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'upi' ? 'UPI' : 'Card'}</p>
        </Card>
      )}

      <Card className="p-4 space-y-3">
        <h4 className="font-medium text-sm">Items ({items.length})</h4>
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {item.name} x{item.quantity}
            </span>
            <span>{formatPrice((item.discountedPrice || item.price) * item.quantity)}</span>
          </div>
        ))}
      </Card>

      <Card className="p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotalAmount)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-500">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Delivery Fee</span>
          <span>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </Card>
    </div>
  );
}
