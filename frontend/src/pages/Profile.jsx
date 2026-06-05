import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { authService } from '@/services/authService';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { success, error } from '@/components/ui/Toast';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateUser, fetchProfile } = useAuthStore();
  const { theme, toggleTheme } = useUiStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', fullAddress: '', area: '', city: '', pincode: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchProfile().finally(() => setLoadingProfile(false));
    }
  }, [isAuthenticated]);

  if (!user || loadingProfile) return (
    <div className="container flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-muted rounded-full"></div>
        <div className="w-32 h-4 bg-muted rounded"></div>
      </div>
    </div>
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await authService.updateProfile({ fullName: name });
      updateUser({ fullName: name });
      setEditing(false);
      success('Profile updated!');
    } catch (err) {
      error(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      await authService.addAddress(newAddress);
      await fetchProfile();
      setShowAddressModal(false);
      setNewAddress({ label: 'Home', fullAddress: '', area: '', city: '', pincode: '' });
      success('Address added!');
    } catch (err) {
      error(err.message || 'Failed to add address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await authService.deleteAddress(id);
      await fetchProfile();
      success('Address deleted');
    } catch (err) {
      error('Failed to delete address');
    }
  };

  return (
    <div className="container py-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary p-0.5">
                  <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{user.fullName?.charAt(0)}</span>
                  </div>
                </div>
                <div className="flex-1">
                  {editing ? (
                    <div className="space-y-3">
                      <Input
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <Input
                        label="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
                          Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-bold">{user.fullName}</h2>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Mail className="h-3 w-3" /> {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" /> {user.phone}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => setEditing(true)}
                      >
                        <Edit className="h-3 w-3 mr-1" /> Edit Profile
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Saved Addresses</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAddressModal(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              {user.addresses?.length > 0 ? (
                <div className="space-y-3">
                  {user.addresses.map((addr, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{addr.label}</p>
                        <p className="text-xs text-muted-foreground">{addr.fullAddress}</p>
                        <p className="text-xs text-muted-foreground">{addr.city} - {addr.pincode}</p>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1 hover:bg-muted rounded"><Edit className="h-3 w-3" /></button>
                        <button className="p-1 hover:bg-muted rounded text-destructive" onClick={() => handleDeleteAddress(addr.id)}><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No addresses saved yet</p>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3">Settings</h3>

              <div className="space-y-1">
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span className="text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                <Link
                  to="/orders"
                  className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4" />
                    <span className="text-sm">My Orders</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
            </Card>

            <Button
              variant="danger"
              size="md"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-card rounded-2xl shadow-xl border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Address</h2>
              <button onClick={() => setShowAddressModal(false)} className="p-2 hover:bg-muted rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Label (e.g. Home, Work)"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  required
                />
                <Input
                  label="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  required
                />
              </div>
              <Input
                label="Full Address (Flat, Building, Street)"
                value={newAddress.fullAddress}
                onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Area/Locality"
                  value={newAddress.area}
                  onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                  required
                />
                <Input
                  label="Pincode"
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                  required
                />
              </div>
              <div className="pt-2">
                <Button type="submit" variant="primary" className="w-full" loading={savingAddress}>
                  Save Address
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
