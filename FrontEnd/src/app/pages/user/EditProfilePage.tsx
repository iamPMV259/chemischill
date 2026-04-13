import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Beaker, User, Calendar, School, Phone, Mail, ArrowLeft, Camera } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { usersService } from '../../../services/users';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    birthYear: '',
    school: '',
    phone: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        birthYear: user.birthYear || '',
        school: user.school || '',
        phone: user.phone || '',
      });
      setAvatarPreview(user.avatarUrl || '');
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName) {
      toast.error(language === 'vi' ? 'Vui lòng nhập họ tên' : 'Please enter your full name');
      return;
    }

    setSaving(true);
    try {
      if (avatarFile) {
        const avatarRes = await usersService.uploadAvatar(avatarFile);
        updateProfile({ avatarUrl: avatarRes.data.avatar_url });
      }

      const res = await usersService.updateMe({
        full_name: formData.fullName || null,
        phone: formData.phone || null,
        birth_year: formData.birthYear ? Number(formData.birthYear) : null,
        school: formData.school || null,
      });

      updateProfile({
        fullName: res.data.full_name || '',
        phone: res.data.phone || '',
        birthYear: res.data.birth_year ? String(res.data.birth_year) : '',
        school: res.data.school || '',
        avatarUrl: res.data.avatar_url || avatarPreview,
      });

      toast.success(language === 'vi' ? 'Cập nhật hồ sơ thành công!' : 'Profile updated successfully!');
      navigate('/profile');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || (language === 'vi' ? 'Không thể cập nhật hồ sơ' : 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Link to="/profile" className="inline-flex items-center gap-2 text-gray-600 mb-8 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {language === 'vi' ? 'Quay Lại Hồ Sơ' : 'Back to Profile'}
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Beaker className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{language === 'vi' ? 'Chỉnh Sửa Hồ Sơ' : 'Edit Profile'}</h1>
              <p className="text-gray-600">{language === 'vi' ? 'Cập nhật thông tin cá nhân của bạn' : 'Update your personal information'}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-8 pb-8 border-b">
            <div className="relative">
              <img
                src={avatarPreview || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-gray-100"
              />
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors cursor-pointer">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <p className="font-semibold mb-1">{language === 'vi' ? 'Ảnh Đại Diện' : 'Profile Picture'}</p>
              <p className="text-sm text-gray-600 mb-3">{language === 'vi' ? 'Ảnh JPG, PNG hoặc WEBP. Kích thước tối đa 2MB' : 'JPG, PNG or WEBP. Max size 2MB'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fullName" className="text-base">{language === 'vi' ? 'Họ và Tên' : 'Full Name'} <span className="text-red-500">*</span></Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} className="pl-10 h-12" required />
                </div>
              </div>

              <div>
                <Label htmlFor="username" className="text-base">{language === 'vi' ? 'Tên Đăng Nhập' : 'Username'}</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input id="username" name="username" type="text" value={formData.username} onChange={handleChange} className="pl-10 h-12" disabled />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-base">{language === 'vi' ? 'Email' : 'Email'}</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="pl-10 h-12" disabled />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-base">{language === 'vi' ? 'Số Điện Thoại' : 'Phone Number'}</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className="pl-10 h-12" />
                </div>
              </div>

              <div>
                <Label htmlFor="birthYear" className="text-base">{language === 'vi' ? 'Năm Sinh' : 'Birth Year'}</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input id="birthYear" name="birthYear" type="number" min="1950" max="2015" value={formData.birthYear} onChange={handleChange} className="pl-10 h-12" />
                </div>
              </div>

              <div>
                <Label htmlFor="school" className="text-base">{language === 'vi' ? 'Trường Học' : 'School'}</Label>
                <div className="relative mt-1">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input id="school" name="school" type="text" value={formData.school} onChange={handleChange} className="pl-10 h-12" />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate('/profile')} className="flex-1 h-12 text-base">
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </Button>
              <Button type="submit" className="flex-1 h-12 text-base" disabled={saving}>
                {saving ? (language === 'vi' ? 'Đang lưu...' : 'Saving...') : (language === 'vi' ? 'Lưu Thay Đổi' : 'Save Changes')}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
