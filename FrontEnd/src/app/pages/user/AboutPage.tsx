import { Link } from 'react-router';
import { Award, GraduationCap, Users, BookOpen, Trophy, Target } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AboutPage() {
  const { language, t } = useLanguage();

  const teachers = [
    {
      id: 1,
      name: 'Dr. Nguyễn Văn A',
      nameEn: 'Dr. Nguyen Van A',
      title: 'Tiến sĩ Hóa Hữu Cơ',
      titleEn: 'Ph.D. in Organic Chemistry',
      experience: 15,
      students: 2500,
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop',
      specialty: 'Hóa Hữu Cơ & Phản Ứng',
      specialtyEn: 'Organic Chemistry & Reactions',
      bio: 'Chuyên gia hàng đầu về hóa hữu cơ với hơn 15 năm kinh nghiệm giảng dạy và nghiên cứu.',
      bioEn: 'Leading expert in organic chemistry with over 15 years of teaching and research experience.',
    },
    {
      id: 2,
      name: 'PGS. Trần Thị B',
      nameEn: 'Assoc. Prof. Tran Thi B',
      title: 'Phó Giáo Sư Hóa Lý',
      titleEn: 'Associate Professor in Physical Chemistry',
      experience: 20,
      students: 3200,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
      specialty: 'Nhiệt Động Học & Động Học',
      specialtyEn: 'Thermodynamics & Kinetics',
      bio: 'Phó giáo sư với 20 năm kinh nghiệm, chuyên sâu về nhiệt động học và động học hóa học.',
      bioEn: 'Associate Professor with 20 years of experience, specialized in thermodynamics and chemical kinetics.',
    },
    {
      id: 3,
      name: 'TS. Lê Minh C',
      nameEn: 'Dr. Le Minh C',
      title: 'Tiến sĩ Hóa Phân Tích',
      titleEn: 'Ph.D. in Analytical Chemistry',
      experience: 12,
      students: 1800,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      specialty: 'Phân Tích Định Lượng',
      specialtyEn: 'Quantitative Analysis',
      bio: 'Tiến sĩ trẻ năng động với kinh nghiệm phong phú trong phân tích hóa học định lượng.',
      bioEn: 'Dynamic young doctor with extensive experience in quantitative chemical analysis.',
    },
  ];

  const stats = [
    {
      icon: Users,
      value: '7,500+',
      label: language === 'vi' ? 'Học Viên' : 'Students',
    },
    {
      icon: BookOpen,
      value: '500+',
      label: language === 'vi' ? 'Tài Liệu' : 'Documents',
    },
    {
      icon: Trophy,
      value: '200+',
      label: language === 'vi' ? 'Quiz' : 'Quizzes',
    },
    {
      icon: Award,
      value: '15+',
      label: language === 'vi' ? 'Năm Kinh Nghiệm' : 'Years Experience',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-24 pb-40">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="molecules" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="3" fill="white" />
                <circle cx="20" cy="30" r="2" fill="white" />
                <circle cx="80" cy="70" r="2" fill="white" />
                <line x1="50" y1="50" x2="20" y2="30" stroke="white" strokeWidth="1" />
                <line x1="50" y1="50" x2="80" y2="70" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#molecules)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {language === 'vi' ? 'Về ChemisChill' : 'About ChemisChill'}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {language === 'vi'
                ? 'Nền tảng học tập hóa học hàng đầu, kết nối học viên với chuyên gia và tài liệu chất lượng cao'
                : 'Leading chemistry learning platform, connecting students with experts and high-quality materials'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 -mt-20">
        <div className="grid md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-8 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-10 h-10 text-blue-600" />
              <h2 className="text-4xl font-bold">
                {language === 'vi' ? 'Sứ Mệnh' : 'Our Mission'}
              </h2>
            </div>
            <p className="text-lg text-gray-600 mb-6">
              {language === 'vi'
                ? 'ChemisChill được thành lập với sứ mệnh làm cho việc học hóa học trở nên dễ dàng, thú vị và hiệu quả hơn. Chúng tôi tin rằng mọi người đều có thể làm chủ hóa học với phương pháp đúng đắn và sự hỗ trợ phù hợp.'
                : 'ChemisChill was founded with the mission to make learning chemistry easier, more enjoyable, and more effective. We believe everyone can master chemistry with the right approach and proper support.'}
            </p>
            <p className="text-lg text-gray-600">
              {language === 'vi'
                ? 'Nền tảng của chúng tôi kết hợp tài liệu chất lượng cao, các bài quiz tương tác và cộng đồng hỗ trợ để tạo ra trải nghiệm học tập toàn diện.'
                : 'Our platform combines high-quality materials, interactive quizzes, and a supportive community to create a comprehensive learning experience.'}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop"
              alt="Chemistry Lab"
              className="rounded-2xl shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Teaching Team Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('team.title')}</h2>
            <p className="text-gray-600 text-lg">{t('team.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teachers.map((teacher, index) => (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={teacher.avatar}
                    alt={language === 'vi' ? teacher.name : teacher.nameEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-1">
                      {language === 'vi' ? teacher.name : teacher.nameEn}
                    </h3>
                    <p className="text-blue-200 mb-3">
                      {language === 'vi' ? teacher.title : teacher.titleEn}
                    </p>
                    <Badge className="bg-white/20 text-white backdrop-blur border-white/30">
                      <Award className="w-3 h-3 mr-1" />
                      {language === 'vi' ? teacher.specialty : teacher.specialtyEn}
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    {language === 'vi' ? teacher.bio : teacher.bioEn}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{teacher.experience}</div>
                      <div className="text-sm text-gray-600">{t('team.yearsExp')}</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{teacher.students}+</div>
                      <div className="text-sm text-gray-600">{t('team.students')}</div>
                    </div>
                  </div>
                  <Link to={`/teachers/${teacher.id}`}>
                    <Button variant="outline" className="w-full">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      {t('team.viewProfile')}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            {language === 'vi' ? 'Giá Trị Cốt Lõi' : 'Core Values'}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4">
              {language === 'vi' ? 'Chất Lượng' : 'Quality'}
            </h3>
            <p className="text-gray-600">
              {language === 'vi'
                ? 'Cung cấp tài liệu và nội dung học tập chất lượng cao, được kiểm duyệt bởi chuyên gia.'
                : 'Providing high-quality learning materials and content, reviewed by experts.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4">
              {language === 'vi' ? 'Cộng Đồng' : 'Community'}
            </h3>
            <p className="text-gray-600">
              {language === 'vi'
                ? 'Xây dựng cộng đồng học tập tích cực, nơi mọi người cùng nhau phát triển.'
                : 'Building an active learning community where everyone grows together.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4">
              {language === 'vi' ? 'Đổi Mới' : 'Innovation'}
            </h3>
            <p className="text-gray-600">
              {language === 'vi'
                ? 'Liên tục cập nhật phương pháp học tập hiện đại và công nghệ mới nhất.'
                : 'Continuously updating modern learning methods and latest technologies.'}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
