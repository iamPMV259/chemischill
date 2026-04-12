import { useParams, Link } from 'react-router';
import { ArrowLeft, Award, Users, BookOpen, Calendar, Mail, Phone, GraduationCap } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function TeacherProfilePage() {
  const { id } = useParams();
  const { language } = useLanguage();

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
      fullBio:
        'Dr. Nguyễn Văn A là một trong những chuyên gia hàng đầu về hóa hữu cơ tại Việt Nam. Với bằng Tiến sĩ từ Đại học Kyoto, Nhật Bản, ông đã có hơn 15 năm kinh nghiệm trong giảng dạy và nghiên cứu. Ông đã hướng dẫn hơn 2500 học viên và xuất bản hơn 50 bài báo khoa học trên các tạp chí quốc tế uy tín.',
      fullBioEn:
        'Dr. Nguyen Van A is one of the leading experts in organic chemistry in Vietnam. With a Ph.D. from Kyoto University, Japan, he has over 15 years of experience in teaching and research. He has mentored over 2,500 students and published over 50 scientific papers in prestigious international journals.',
      email: 'nguyenvana@chemischill.edu.vn',
      phone: '+84 901 234 567',
      education: [
        {
          degree: 'Tiến sĩ Hóa Hữu Cơ',
          degreeEn: 'Ph.D. in Organic Chemistry',
          school: 'Đại học Kyoto, Nhật Bản',
          schoolEn: 'Kyoto University, Japan',
          year: '2008',
        },
        {
          degree: 'Thạc sĩ Hóa Học',
          degreeEn: 'M.Sc. in Chemistry',
          school: 'Đại học Khoa Học Tự Nhiên TP.HCM',
          schoolEn: 'HCMC University of Science',
          year: '2003',
        },
      ],
      achievements: [
        {
          titleVi: 'Giải thưởng Giảng viên Xuất sắc',
          titleEn: 'Outstanding Lecturer Award',
          year: '2022',
        },
        {
          titleVi: '50+ Bài báo Khoa học Quốc tế',
          titleEn: '50+ International Scientific Papers',
          year: '2008-2024',
        },
        {
          titleVi: 'Chuyên gia Tư vấn Bộ GD&ĐT',
          titleEn: 'Consultant for Ministry of Education',
          year: '2020-nay',
        },
      ],
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
      fullBio:
        'PGS. Trần Thị B là chuyên gia hàng đầu về hóa lý với 20 năm kinh nghiệm. Bà đã đào tạo hơn 3200 học viên và tham gia nhiều dự án nghiên cứu quốc tế về nhiệt động học và động học hóa học.',
      fullBioEn:
        'Assoc. Prof. Tran Thi B is a leading expert in physical chemistry with 20 years of experience. She has trained over 3,200 students and participated in numerous international research projects on thermodynamics and chemical kinetics.',
      email: 'tranthib@chemischill.edu.vn',
      phone: '+84 902 345 678',
      education: [
        {
          degree: 'Phó Giáo Sư Hóa Lý',
          degreeEn: 'Associate Professor in Physical Chemistry',
          school: 'Đại học Bách Khoa Hà Nội',
          schoolEn: 'Hanoi University of Science and Technology',
          year: '2015',
        },
      ],
      achievements: [
        {
          titleVi: 'Giải thưởng Nhà Giáo Ưu tú',
          titleEn: 'Excellent Teacher Award',
          year: '2019',
        },
        {
          titleVi: '10+ Dự án Nghiên cứu Quốc tế',
          titleEn: '10+ International Research Projects',
          year: '2010-2024',
        },
      ],
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
      fullBio:
        'TS. Lê Minh C là tiến sĩ trẻ tài năng với 12 năm kinh nghiệm trong lĩnh vực hóa phân tích. Ông đã hướng dẫn 1800+ học viên và phát triển nhiều phương pháp phân tích mới.',
      fullBioEn:
        'Dr. Le Minh C is a talented young doctor with 12 years of experience in analytical chemistry. He has mentored 1,800+ students and developed many new analytical methods.',
      email: 'leminhc@chemischill.edu.vn',
      phone: '+84 903 456 789',
      education: [
        {
          degree: 'Tiến sĩ Hóa Phân Tích',
          degreeEn: 'Ph.D. in Analytical Chemistry',
          school: 'Đại học Quốc gia Singapore',
          schoolEn: 'National University of Singapore',
          year: '2012',
        },
      ],
      achievements: [
        {
          titleVi: 'Giải thưởng Nghiên cứu Trẻ',
          titleEn: 'Young Researcher Award',
          year: '2018',
        },
        {
          titleVi: 'Phát triển 5+ Phương pháp Phân tích Mới',
          titleEn: 'Developed 5+ New Analytical Methods',
          year: '2015-2024',
        },
      ],
    },
  ];

  const teacher = teachers.find((t) => t.id === parseInt(id || '1'));

  if (!teacher) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold">
          {language === 'vi' ? 'Không tìm thấy giáo viên' : 'Teacher not found'}
        </h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Link
        to="/about"
        className="inline-flex items-center gap-2 text-gray-600 mb-8 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {language === 'vi' ? 'Quay Lại' : 'Back'}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600" />
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-24 mb-6">
              <img
                src={teacher.avatar}
                alt={language === 'vi' ? teacher.name : teacher.nameEn}
                className="w-40 h-40 rounded-2xl border-4 border-white shadow-lg object-cover"
              />
              <div className="flex-1 pt-24 md:pt-28">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">
                      {language === 'vi' ? teacher.name : teacher.nameEn}
                    </h1>
                    <p className="text-xl text-gray-600 mb-3">
                      {language === 'vi' ? teacher.title : teacher.titleEn}
                    </p>
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <Award className="w-3 h-3 mr-1" />
                      {language === 'vi' ? teacher.specialty : teacher.specialtyEn}
                    </Badge>
                  </div>
                  <Button size="lg">
                    <Mail className="w-4 h-4 mr-2" />
                    {language === 'vi' ? 'Liên Hệ' : 'Contact'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{teacher.experience}</div>
                <div className="text-sm text-gray-600">
                  {language === 'vi' ? 'Năm Kinh Nghiệm' : 'Years Experience'}
                </div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">{teacher.students}+</div>
                <div className="text-sm text-gray-600">
                  {language === 'vi' ? 'Học Viên' : 'Students'}
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-xs font-medium text-green-600 truncate">{teacher.email}</div>
                <div className="text-sm text-gray-600">Email</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Phone className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-xs font-medium text-orange-600">{teacher.phone}</div>
                <div className="text-sm text-gray-600">
                  {language === 'vi' ? 'Điện Thoại' : 'Phone'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Biography */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                {language === 'vi' ? 'Giới Thiệu' : 'Biography'}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {language === 'vi' ? teacher.fullBio : teacher.fullBioEn}
              </p>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-blue-600" />
                {language === 'vi' ? 'Thành Tựu' : 'Achievements'}
              </h2>
              <div className="space-y-4">
                {teacher.achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {language === 'vi' ? achievement.titleVi : achievement.titleEn}
                      </h3>
                      <p className="text-sm text-gray-600">{achievement.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Education */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-blue-600" />
                {language === 'vi' ? 'Học Vấn' : 'Education'}
              </h2>
              <div className="space-y-4">
                {teacher.education.map((edu, index) => (
                  <div key={index} className="pb-4 border-b last:border-0 last:pb-0">
                    <div className="font-semibold text-blue-600 mb-1">
                      {language === 'vi' ? edu.degree : edu.degreeEn}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {language === 'vi' ? edu.school : edu.schoolEn}
                    </div>
                    <div className="text-xs text-gray-500">{edu.year}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
              <h3 className="text-xl font-bold mb-4">
                {language === 'vi' ? 'Liên Hệ Giảng Viên' : 'Contact Teacher'}
              </h3>
              <p className="text-blue-100 mb-6">
                {language === 'vi'
                  ? 'Có câu hỏi? Hãy liên hệ trực tiếp với giảng viên.'
                  : 'Have questions? Contact the teacher directly.'}
              </p>
              <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                <Mail className="w-4 h-4 mr-2" />
                {language === 'vi' ? 'Gửi Email' : 'Send Email'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
