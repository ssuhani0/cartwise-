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
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const { theme, toggleTheme } = useUiStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated]);

  if (!user) return null;

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
                <Button variant="ghost" size="sm">
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
                        <button className="p-1 hover:bg-muted rounded text-destructive"><Trash2 className="h-3 w-3" /></button>
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
    </div>
  );
}
