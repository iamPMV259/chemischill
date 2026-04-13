import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Award, Users, BookOpen, Calendar, Mail, Phone, GraduationCap } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { teachersService } from '../../../services/teachers';

export default function TeacherProfilePage() {
  const { id } = useParams();
  const { language } = useLanguage();
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    teachersService.getTeacher(id)
      .then((res) => setTeacher(res.data))
      .catch(() => setTeacher(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-12">Đang tải giảng viên...</div>;

  if (!teacher) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold">{language === 'vi' ? 'Không tìm thấy giáo viên' : 'Teacher not found'}</h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Link to="/about" className="inline-flex items-center gap-2 text-gray-600 mb-8 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {language === 'vi' ? 'Quay Lại' : 'Back'}
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600" />
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-24 mb-6">
              <img src={teacher.avatar_url} alt={language === 'vi' ? teacher.name : teacher.name_en} className="w-40 h-40 rounded-2xl border-4 border-white shadow-lg object-cover" />
              <div className="flex-1 pt-24 md:pt-28">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{language === 'vi' ? teacher.name : teacher.name_en}</h1>
                    <p className="text-xl text-gray-600 mb-3">{language === 'vi' ? teacher.title : teacher.title_en}</p>
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"><Award className="w-3 h-3 mr-1" />{language === 'vi' ? teacher.specialty : teacher.specialty_en}</Badge>
                  </div>
                  <Link to={`/teachers/${teacher.id}/contact`}>
                    <Button size="lg"><Mail className="w-4 h-4 mr-2" />{language === 'vi' ? 'Liên Hệ' : 'Contact'}</Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center"><div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2"><Calendar className="w-6 h-6 text-blue-600" /></div><div className="text-2xl font-bold text-blue-600">{teacher.experience_years}</div><div className="text-sm text-gray-600">{language === 'vi' ? 'Năm Kinh Nghiệm' : 'Years Experience'}</div></div>
              <div className="bg-purple-50 rounded-xl p-4 text-center"><div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2"><Users className="w-6 h-6 text-purple-600" /></div><div className="text-2xl font-bold text-purple-600">{teacher.students_count}+</div><div className="text-sm text-gray-600">{language === 'vi' ? 'Học Viên' : 'Students'}</div></div>
              <div className="bg-green-50 rounded-xl p-4 text-center"><div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2"><Mail className="w-6 h-6 text-green-600" /></div><div className="text-xs font-medium text-green-600 truncate">{teacher.email}</div><div className="text-sm text-gray-600">Email</div></div>
              <div className="bg-orange-50 rounded-xl p-4 text-center"><div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2"><Phone className="w-6 h-6 text-orange-600" /></div><div className="text-xs font-medium text-orange-600">{teacher.phone}</div><div className="text-sm text-gray-600">{language === 'vi' ? 'Điện Thoại' : 'Phone'}</div></div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><BookOpen className="w-6 h-6 text-blue-600" />{language === 'vi' ? 'Giới Thiệu' : 'Biography'}</h2>
              <p className="text-gray-600 leading-relaxed">{language === 'vi' ? teacher.bio : teacher.bio_en}</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><GraduationCap className="w-6 h-6 text-blue-600" />{language === 'vi' ? 'Thông Tin' : 'Information'}</h2>
              <div className="space-y-3 text-sm">
                <div><span className="text-gray-500">ID:</span> <span className="font-semibold">{teacher.id}</span></div>
                <div><span className="text-gray-500">Email:</span> <span className="font-semibold">{teacher.email}</span></div>
                <div><span className="text-gray-500">Phone:</span> <span className="font-semibold">{teacher.phone}</span></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
              <h3 className="text-xl font-bold mb-4">{language === 'vi' ? 'Liên Hệ Giảng Viên' : 'Contact Teacher'}</h3>
              <p className="text-blue-100 mb-6">{language === 'vi' ? 'Có câu hỏi? Hãy liên hệ trực tiếp với giảng viên.' : 'Have questions? Contact the teacher directly.'}</p>
              <Link to={`/teachers/${teacher.id}/contact`}>
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50"><Mail className="w-4 h-4 mr-2" />{language === 'vi' ? 'Gửi Email' : 'Send Email'}</Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
