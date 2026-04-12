import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Beaker, ArrowLeft, Shield, Zap, Users, BookOpen, Mail, Lock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(
        language === 'vi'
          ? 'Vui lòng nhập đầy đủ thông tin'
          : 'Please fill in all fields'
      );
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success(language === 'vi' ? 'Đăng nhập thành công!' : 'Login successful!');
      setTimeout(() => navigate('/'), 500);
    } catch (error) {
      toast.error(
        language === 'vi'
          ? 'Đăng nhập thất bại. Vui lòng thử lại.'
          : 'Login failed. Please try again.'
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
      {/* Left Side - Login Form */}
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
              {language === 'vi' ? 'Chào Mừng Đến ' : 'Welcome to '}
              {t('nav.appName')}
            </h1>
            <p className="text-center text-gray-600 mb-8">
              {language === 'vi'
                ? 'Đăng nhập để truy cập hành trình học hóa của bạn'
                : 'Login to access your chemistry learning journey'}
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="email">
                  {language === 'vi' ? 'Email hoặc Số Điện Thoại' : 'Email or Phone Number'}
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="text"
                    placeholder={
                      language === 'vi'
                        ? 'example@email.com hoặc 0901234567'
                        : 'example@email.com or 0901234567'
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="password">
                    {language === 'vi' ? 'Mật Khẩu' : 'Password'}
                  </Label>
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => toast.info(language === 'vi' ? 'Tính năng sắp ra mắt' : 'Coming soon')}
                  >
                    {language === 'vi' ? 'Quên mật khẩu?' : 'Forgot password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                {isLoading
                  ? language === 'vi'
                    ? 'Đang đăng nhập...'
                    : 'Logging in...'
                  : language === 'vi'
                  ? 'Đăng Nhập'
                  : 'Login'}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">
                  {language === 'vi' ? 'Chưa có tài khoản?' : "Don't have an account?"}{' '}
                </span>
                <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                  {language === 'vi' ? 'Đăng ký ngay' : 'Sign up now'}
                </Link>
              </div>
            </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            {language === 'vi'
              ? 'Bằng cách tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật'
              : 'By continuing, you agree to our Terms of Service and Privacy Policy'}
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
                id="login-molecules"
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
            <rect width="100%" height="100%" fill="url(#login-molecules)" />
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
              {language === 'vi' ? 'Khám Phá Thế Giới Hóa Học' : 'Explore Chemistry World'}
            </h2>
            <p className="text-xl text-blue-100">
              {language === 'vi'
                ? 'Học tập thông minh, tiến bộ vượt trội'
                : 'Smart learning, outstanding progress'}
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-12 text-center"
          >
            <p className="text-blue-100 text-sm">
              {language === 'vi'
                ? 'Được tin tưởng bởi hơn 7,500+ học viên'
                : 'Trusted by over 7,500+ students'}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
