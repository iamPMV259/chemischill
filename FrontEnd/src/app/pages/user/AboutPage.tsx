import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Award, GraduationCap, Users, BookOpen, Trophy, Target } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { teachersService } from '../../../services/teachers';

export default function AboutPage() {
  const { language, t } = useLanguage();
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    teachersService.getTeachers().then((res) => setTeachers(res.data.data || [])).catch(() => setTeachers([]));
  }, []);

  const stats = [
    { icon: Users, value: '7,500+', label: language === 'vi' ? 'Học Viên' : 'Students' },
    { icon: BookOpen, value: '500+', label: language === 'vi' ? 'Tài Liệu' : 'Documents' },
    { icon: Trophy, value: '200+', label: language === 'vi' ? 'Quiz' : 'Quizzes' },
    { icon: Award, value: '15+', label: language === 'vi' ? 'Năm Kinh Nghiệm' : 'Years Experience' },
  ];

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-24 pb-28 md:pb-32">
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{language === 'vi' ? 'Về ChemisChill' : 'About ChemisChill'}</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">{language === 'vi' ? 'Nền tảng học tập hóa học hàng đầu, kết nối học viên với chuyên gia và tài liệu chất lượng cao' : 'Leading chemistry learning platform, connecting students with experts and high-quality materials'}</p>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 -mt-14 md:-mt-16 mb-16 md:mb-20">
        <div className="grid md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="bg-white rounded-2xl shadow-lg p-8 text-center"><div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"><Icon className="w-8 h-8 text-blue-600" /></div><div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div><div className="text-gray-600">{stat.label}</div></motion.div>;
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6"><Target className="w-10 h-10 text-blue-600" /><h2 className="text-4xl font-bold">{language === 'vi' ? 'Sứ Mệnh' : 'Our Mission'}</h2></div>
            <p className="text-lg text-gray-600 mb-6">{language === 'vi' ? 'ChemisChill được thành lập với sứ mệnh làm cho việc học hóa học trở nên dễ dàng, thú vị và hiệu quả hơn.' : 'ChemisChill was founded with the mission to make learning chemistry easier, more enjoyable, and more effective.'}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="relative"><img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop" alt="Chemistry Lab" className="rounded-2xl shadow-2xl" /></motion.div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16"><h2 className="text-4xl font-bold mb-4">{t('team.title')}</h2><p className="text-gray-600 text-lg">{t('team.subtitle')}</p></div>
          <div className="grid md:grid-cols-3 gap-8">
            {teachers.map((teacher, index) => (
              <motion.div key={teacher.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.15 }} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group">
                <div className="relative h-80 overflow-hidden">
                  <img src={teacher.avatar_url} alt={language === 'vi' ? teacher.name : teacher.name_en} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-1">{language === 'vi' ? teacher.name : teacher.name_en}</h3>
                    <p className="text-blue-200 mb-3">{language === 'vi' ? teacher.title : teacher.title_en}</p>
                    <Badge className="bg-white/20 text-white backdrop-blur border-white/30"><Award className="w-3 h-3 mr-1" />{language === 'vi' ? teacher.specialty : teacher.specialty_en}</Badge>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{language === 'vi' ? teacher.bio : teacher.bio_en}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg"><div className="text-2xl font-bold text-blue-600">{teacher.experience_years}</div><div className="text-sm text-gray-600">{t('team.yearsExp')}</div></div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg"><div className="text-2xl font-bold text-purple-600">{teacher.students_count}+</div><div className="text-sm text-gray-600">{t('team.students')}</div></div>
                  </div>
                  <Link to={`/teachers/${teacher.id}`}><Button variant="outline" className="w-full"><GraduationCap className="w-4 h-4 mr-2" />{t('team.viewProfile')}</Button></Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
