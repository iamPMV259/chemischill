import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Beaker, User, Calendar, School, Phone, Mail } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    birthYear: '',
    school: '',
    phone: '',
    email: '',
  });

  // Pre-fill email if user has it
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.birthYear) {
      toast.error(
        language === 'vi'
          ? 'Vui lòng điền Họ Tên và Năm Sinh'
          : 'Please fill in Full Name and Birth Year'
      );
      return;
    }

    // Update profile
    updateProfile({
      fullName: formData.fullName,
      birthYear: formData.birthYear,
      school: formData.school || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
    });

    toast.success(
      language === 'vi'
        ? 'Hoàn tất thiết lập! Chào mừng đến với ChemisChill'
        : 'Setup complete! Welcome to ChemisChill'
    );
    setTimeout(() => navigate('/'), 1000);
  };

  const handleSkip = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6"
            >
              <Beaker className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {language === 'vi' ? 'Hoàn Thiện Hồ Sơ' : 'Complete Your Profile'}
            </h1>
            <p className="text-gray-600">
              {language === 'vi'
                ? 'Giúp chúng tôi hiểu bạn hơn để mang đến trải nghiệm học tập tốt nhất'
                : 'Help us understand you better for the best learning experience'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div className="w-12 h-1 bg-green-500" />
            <div className="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-100" />
            <div className="w-12 h-1 bg-gray-200" />
            <div className="w-3 h-3 rounded-full bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <Label htmlFor="fullName" className="text-base">
                  {language === 'vi' ? 'Họ và Tên' : 'Full Name'}{' '}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder={language === 'vi' ? 'Nguyễn Văn A' : 'John Doe'}
                    value={formData.fullName}
                    onChange={handleChange}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              {/* Birth Year */}
              <div>
                <Label htmlFor="birthYear" className="text-base">
                  {language === 'vi' ? 'Năm Sinh' : 'Birth Year'}{' '}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="birthYear"
                    name="birthYear"
                    type="number"
                    placeholder="2005"
                    min="1950"
                    max="2015"
                    value={formData.birthYear}
                    onChange={handleChange}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              {/* School */}
              <div>
                <Label htmlFor="school" className="text-base">
                  {language === 'vi' ? 'Trường Học' : 'School'}
                </Label>
                <div className="relative mt-1">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="school"
                    name="school"
                    type="text"
                    placeholder={
                      language === 'vi' ? 'THPT Lê Hồng Phong' : 'Le Hong Phong High School'
                    }
                    value={formData.school}
                    onChange={handleChange}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-base">
                  {language === 'vi' ? 'Số Điện Thoại' : 'Phone Number'}
                </Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <Label htmlFor="email" className="text-base">
                  {language === 'vi' ? 'Email' : 'Email'}
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="flex-1 h-12 text-base"
              >
                {language === 'vi' ? 'Bỏ Qua' : 'Skip'}
              </Button>
              <Button type="submit" className="flex-1 h-12 text-base">
                {language === 'vi' ? 'Hoàn Tất' : 'Complete'}
              </Button>
            </div>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            {language === 'vi'
              ? 'Bạn có thể cập nhật thông tin này sau trong trang Hồ Sơ'
              : 'You can update this information later in your Profile page'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
