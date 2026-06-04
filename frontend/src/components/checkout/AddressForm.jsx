import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Home, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const savedAddresses = [
  {
    id: '1',
    label: 'Home',
    fullAddress: '123, Gandhi Nagar',
    area: 'Adyar',
    city: 'Chennai',
    pincode: '600020',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Work',
    fullAddress: '456, OMR Road',
    area: 'Thoraipakkam',
    city: 'Chennai',
    pincode: '600097',
    isDefault: false,
  },
];

export default function AddressForm({ onSelect, selected }) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [addresses, setAddresses] = useState(savedAddresses);
  const [newAddress, setNewAddress] = useState({
    label: '',
    fullAddress: '',
    area: '',
    city: '',
    pincode: '',
    isDefault: false,
  });

  const handleAddAddress = () => {
    if (!newAddress.fullAddress || !newAddress.city || !newAddress.pincode) return;
    const addr = { ...newAddress, id: Date.now().toString() };
    setAddresses([...addresses, addr]);
    onSelect(addr);
    setShowNewForm(false);
    setNewAddress({ label: '', fullAddress: '', area: '', city: '', pincode: '', isDefault: false });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Delivery Address</h3>

      {addresses.map((addr) => (
        <motion.div
          key={addr.id}
          whileHover={{ scale: 1.01 }}
          onClick={() => onSelect(addr)}
          className={cn(
            'p-4 rounded-2xl border-2 cursor-pointer transition-all',
            selected?.id === addr.id
              ? 'border-primary bg-primary/5'
              : 'border-muted bg-card hover:border-muted-foreground/30',
          )}
        >
          <div className="flex items-start gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
              selected?.id === addr.id ? 'bg-primary text-primary-foreground' : 'bg-muted',
            )}>
              <Home className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{addr.label}</p>
                {addr.isDefault && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{addr.fullAddress}</p>
              <p className="text-sm text-muted-foreground">{addr.area}, {addr.city} - {addr.pincode}</p>
            </div>
          </div>
        </motion.div>
      ))}

      {showNewForm ? (
        <Card className="p-4 space-y-3">
          <Input
            label="Label"
            placeholder="Home, Work, etc."
            value={newAddress.label}
            onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
            icon={MapPin}
          />
          <Input
            label="Full Address"
            placeholder="House/Flat No., Street, Landmark"
            value={newAddress.fullAddress}
            onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Area"
              placeholder="Area/Locality"
              value={newAddress.area}
              onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
            />
            <Input
              label="City"
              placeholder="City"
              value={newAddress.city}
              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
            />
          </div>
          <Input
            label="Pincode"
            placeholder="6-digit pincode"
            value={newAddress.pincode}
            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
          />
          <div className="flex gap-2 pt-2">
            <Button variant="primary" size="md" className="flex-1" onClick={handleAddAddress}>
              Save Address
            </Button>
            <Button variant="ghost" size="md" onClick={() => setShowNewForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          variant="outline"
          size="md"
          className="w-full"
          onClick={() => setShowNewForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Address
        </Button>
      )}
    </div>
  );
}
