import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Beaker, ArrowLeft, Mail, Lock, User, Shield, Zap, Users, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error(
        language === 'vi' ? 'Vui lòng điền đầy đủ thông tin' : 'Please fill in all fields'
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(
        language === 'vi' ? 'Mật khẩu không khớp' : 'Passwords do not match'
      );
      return;
    }

    if (formData.password.length < 6) {
      toast.error(
        language === 'vi'
          ? 'Mật khẩu phải có ít nhất 6 ký tự'
          : 'Password must be at least 6 characters'
      );
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.username, formData.email, formData.password);
      toast.success(
        language === 'vi' ? 'Đăng ký thành công!' : 'Registration successful!'
      );
      setTimeout(() => navigate('/profile-setup'), 500);
    } catch (error) {
      toast.error(
        language === 'vi'
          ? 'Đăng ký thất bại. Vui lòng thử lại.'
          : 'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: BookOpen,
      titleVi: 'Hàng Nghìn Tài Liệu',
      titleEn: 'Thousands of Materials',
      descVi: 'Truy cập kho tài liệu học hóa học phong phú',
      descEn: 'Access rich chemistry learning materials',
    },
    {
      icon: Zap,
      titleVi: 'Quiz Thử Thách',
      titleEn: 'Challenge Quizzes',
      descVi: 'Tham gia quiz cạnh tranh với phần thưởng',
      descEn: 'Join competitive quizzes with rewards',
    },
    {
      icon: Users,
      titleVi: 'Cộng Đồng Chuyên Gia',
      titleEn: 'Expert Community',
      descVi: 'Nhận trợ giúp từ cộng đồng và giảng viên',
      descEn: 'Get help from community and instructors',
    },
    {
      icon: Shield,
      titleVi: 'An Toàn & Bảo Mật',
      titleEn: 'Safe & Secure',
      descVi: 'Thông tin của bạn được bảo vệ tuyệt đối',
      descEn: 'Your information is absolutely protected',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 mb-8 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'vi' ? 'Quay Lại Trang Chủ' : 'Back to Home'}
          </Link>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Beaker className="w-10 h-10 text-white" />
              </motion.div>
            </div>

            <h1 className="text-3xl font-bold text-center mb-2">
              {language === 'vi' ? 'Tạo Tài Khoản Mới' : 'Create New Account'}
            </h1>
            <p className="text-center text-gray-600 mb-8">
              {language === 'vi'
                ? 'Bắt đầu hành trình học hóa của bạn ngay hôm nay'
                : 'Start your chemistry learning journey today'}
            </p>

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <Label htmlFor="username">
                  {language === 'vi' ? 'Tên Đăng Nhập' : 'Username'}
                </Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder={language === 'vi' ? 'chemlearner123' : 'chemlearner123'}
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">
                  {language === 'vi' ? 'Email hoặc Số Điện Thoại' : 'Email or Phone Number'}
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="text"
                    placeholder={
                      language === 'vi'
                        ? 'example@email.com hoặc 0901234567'
                        : 'example@email.com or 0901234567'
                    }
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">
                  {language === 'vi' ? 'Mật Khẩu' : 'Password'}
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 h-12"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'vi'
                    ? 'Tối thiểu 6 ký tự'
                    : 'Minimum 6 characters'}
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">
                  {language === 'vi' ? 'Xác Nhận Mật Khẩu' : 'Confirm Password'}
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                {isLoading
                  ? language === 'vi'
                    ? 'Đang đăng ký...'
                    : 'Signing up...'
                  : language === 'vi'
                  ? 'Đăng Ký'
                  : 'Sign Up'}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">
                  {language === 'vi' ? 'Đã có tài khoản?' : 'Already have an account?'}{' '}
                </span>
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                  {language === 'vi' ? 'Đăng nhập' : 'Login'}
                </Link>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
              {language === 'vi'
                ? 'Bằng cách đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật'
                : 'By signing up, you agree to our Terms of Service and Privacy Policy'}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Features & Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="register-molecules"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="50" cy="50" r="3" fill="white" />
                <circle cx="20" cy="30" r="2" fill="white" />
                <circle cx="80" cy="70" r="2" fill="white" />
                <line x1="50" y1="50" x2="20" y2="30" stroke="white" strokeWidth="1" />
                <line x1="50" y1="50" x2="80" y2="70" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#register-molecules)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-white p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-bold mb-4">
              {language === 'vi' ? 'Tham Gia Cộng Đồng' : 'Join The Community'}
            </h2>
            <p className="text-xl text-blue-100">
              {language === 'vi'
                ? 'Hơn 7,500+ học viên đang học tập cùng nhau'
                : 'Over 7,500+ students learning together'}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6 max-w-2xl">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {language === 'vi' ? feature.titleVi : feature.titleEn}
                  </h3>
                  <p className="text-sm text-blue-100">
                    {language === 'vi' ? feature.descVi : feature.descEn}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
