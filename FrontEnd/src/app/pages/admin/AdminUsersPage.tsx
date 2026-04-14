import { useEffect, useState } from 'react';
import { Search, Eye, Ban, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { toast } from 'sonner';
import { adminService } from '../../../services/admin';
import { getDefaultAvatarUrl } from '../../../lib/env';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    adminService.getUsers({ search: search || undefined, limit: 100 })
      .then((res) => setUsers(res.data.data || []))
      .catch(() => setUsers([]));
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const updateStatus = async (userId: string, status: 'ACTIVE' | 'BLOCKED') => {
    try {
      await adminService.updateUserStatus(userId, status);
      toast.success('User updated');
      fetchUsers();
    } catch {
      toast.error('Failed to update user');
    }
  };

  return (
    <div>
      <div className="mb-8"><h1 className="text-3xl font-bold mb-2">User Management</h1><p className="text-gray-600">Manage platform users and permissions</p></div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6"><div className="text-sm text-gray-600 mb-2">Total Users</div><div className="text-3xl font-bold text-blue-600">{users.length}</div></div>
        <div className="bg-white rounded-xl shadow-sm p-6"><div className="text-sm text-gray-600 mb-2">Active Users</div><div className="text-3xl font-bold text-green-600">{users.filter((u) => u.status === 'ACTIVE').length}</div></div>
        <div className="bg-white rounded-xl shadow-sm p-6"><div className="text-sm text-gray-600 mb-2">Total Quizzes Taken</div><div className="text-3xl font-bold text-purple-600">{users.reduce((sum, user) => sum + (user.stats?.quizzes_completed ?? 0), 0)}</div></div>
        <div className="bg-white rounded-xl shadow-sm p-6"><div className="text-sm text-gray-600 mb-2">Total Questions</div><div className="text-3xl font-bold text-orange-600">{users.reduce((sum, user) => sum + (user.stats?.questions_posted ?? 0), 0)}</div></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search users..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Quizzes</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell><div className="flex items-center gap-3"><img src={user.avatar_url || getDefaultAvatarUrl(user.username)} alt={user.username} className="w-10 h-10 rounded-full" /><div><div className="font-medium">{user.full_name || user.username}</div><div className="text-xs text-gray-500">{user.email}</div></div></div></TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>{user.stats?.quizzes_completed ?? 0}</TableCell>
                <TableCell>{user.stats?.questions_posted ?? 0}</TableCell>
                <TableCell>{(user.stats?.points ?? 0).toLocaleString()}</TableCell>
                <TableCell><Badge variant={user.status === 'ACTIVE' ? 'default' : 'destructive'}>{user.status}</Badge></TableCell>
                <TableCell><div className="flex items-center justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => window.open(`/users/${user.id}`, '_blank')}><Eye className="w-4 h-4" /></Button>{user.status === 'ACTIVE' ? <Button variant="ghost" size="sm" onClick={() => updateStatus(user.id, 'BLOCKED')}><Ban className="w-4 h-4 text-red-500" /></Button> : <Button variant="ghost" size="sm" onClick={() => updateStatus(user.id, 'ACTIVE')}><CheckCircle className="w-4 h-4 text-green-600" /></Button>}</div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
