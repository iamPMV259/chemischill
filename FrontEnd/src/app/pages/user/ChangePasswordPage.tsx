import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, KeyRound, LockKeyhole } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { authService } from '../../../services/auth';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('Vui lòng nhập đầy đủ thông tin');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp');
    }

    setLoading(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      toast.success(res.data.message || 'Đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      navigate('/profile');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Không thể đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/profile" className="inline-flex items-center gap-2 text-gray-600 mb-8 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Quay lại hồ sơ
      </Link>

      <Card className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <LockKeyhole className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Đổi mật khẩu</h1>
        </div>
        <p className="text-gray-600 mb-8">
          Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật tài khoản của bạn.
        </p>

        <div className="space-y-6">
          <div>
            <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
            <div className="relative mt-2">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="current-password" type="password" className="pl-10" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="new-password">Mật khẩu mới</Label>
            <div className="relative mt-2">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="new-password" type="password" className="pl-10" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
            <div className="relative mt-2">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="confirm-password" type="password" className="pl-10" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
