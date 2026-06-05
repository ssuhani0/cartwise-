import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, Trash2, Shield, User as UserIcon } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

import { useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { error } from '@/components/ui/Toast';

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers({ pageSize: 50 });
      setUsers(res.data.users);
    } catch (err) {
      error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || (u.email && u.email.toLowerCase().includes(search.toLowerCase())) || (u.phone && u.phone.includes(search));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">User Management</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full h-10 pl-10 pr-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-2">
        {['all', 'user', 'delivery', 'admin'].map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm capitalize transition-all',
              roleFilter === role ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            {role}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Role</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Orders</th>
                <th className="text-left p-4 font-medium">Joined</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        {user.role === 'admin' ? <Shield className="h-4 w-4 text-primary" /> : <UserIcon className="h-4 w-4 text-primary" />}
                      </div>
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{user.email || user.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 capitalize">{user.role.replace('_', ' ')}</td>
                  <td className="p-4">
                    <Badge variant={user.isActive ? 'success' : 'danger'}>
                      {user.isActive ? 'active' : 'blocked'}
                    </Badge>
                  </td>
                  <td className="p-4">-</td>
                  <td className="p-4 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 rounded-lg hover:bg-muted transition-colors"><Edit2 className="h-4 w-4" /></button>
                      <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
