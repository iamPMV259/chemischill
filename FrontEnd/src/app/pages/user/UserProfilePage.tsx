import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Trophy, Brain, MessageCircle, Star, Download, Bookmark } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { motion } from 'motion/react';
import { usersService } from '../../../services/users';
import { adaptUser, adaptCommunityQuestion } from '../../../lib/adapters';
import { getDefaultAvatarUrl } from '../../../lib/env';

export default function UserProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [savedDocs, setSavedDocs] = useState<any[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [myQuestions, setMyQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      usersService.getMe(),
      usersService.getSavedDocuments(),
      usersService.getDownloadHistory({ limit: 10 }),
      usersService.getQuizHistory({ limit: 10 }),
      usersService.getMyQuestions({ include_unapproved: true, limit: 10 }),
    ])
      .then(([meRes, savedRes, downloadRes, quizRes, questionsRes]) => {
        setUser(adaptUser(meRes.data));
        setSavedDocs(savedRes.data.data || []);
        setDownloads(downloadRes.data.data || []);
        setQuizHistory(quizRes.data.data || []);
        setMyQuestions((questionsRes.data.data || []).map(adaptCommunityQuestion));
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-12">Đang tải hồ sơ...</div>;
  if (!user) return <div className="max-w-7xl mx-auto px-6 py-12 text-center">Không tải được hồ sơ</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600" />
          <div className="px-8 pb-8">
            <div className="flex items-end gap-6 -mt-16 mb-6">
              <img src={user.avatarUrl || getDefaultAvatarUrl(user.username)} alt={user.fullName || user.username} className="w-32 h-32 rounded-full border-4 border-white shadow-lg" />
              <div className="flex-1 pt-20">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-bold mb-1">{user.fullName || user.username}</h1>
                    <p className="text-gray-600">{user.email || user.phone || user.username}</p>
                    {user.school && <p className="text-sm text-gray-500 mt-1">{user.school}</p>}
                  </div>
                  <Link to="/profile/edit"><Button variant="outline">Chỉnh sửa hồ sơ</Button></Link>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center"><div className="flex items-center justify-center gap-2 mb-2"><Trophy className="w-5 h-5 text-blue-600" /><span className="text-sm text-gray-600">Xếp hạng</span></div><div className="text-3xl font-bold text-blue-600">#{user.stats?.rank ?? 0}</div></div>
              <div className="bg-purple-50 rounded-xl p-4 text-center"><div className="flex items-center justify-center gap-2 mb-2"><Star className="w-5 h-5 text-purple-600" /><span className="text-sm text-gray-600">Điểm</span></div><div className="text-3xl font-bold text-purple-600">{(user.stats?.points ?? 0).toLocaleString()}</div></div>
              <div className="bg-green-50 rounded-xl p-4 text-center"><div className="flex items-center justify-center gap-2 mb-2"><Brain className="w-5 h-5 text-green-600" /><span className="text-sm text-gray-600">Quiz</span></div><div className="text-3xl font-bold text-green-600">{user.stats?.quizzes_completed ?? 0}</div></div>
              <div className="bg-orange-50 rounded-xl p-4 text-center"><div className="flex items-center justify-center gap-2 mb-2"><MessageCircle className="w-5 h-5 text-orange-600" /><span className="text-sm text-gray-600">Câu hỏi</span></div><div className="text-3xl font-bold text-orange-600">{user.stats?.questions_posted ?? 0}</div></div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="saved" className="bg-white rounded-2xl shadow-lg p-8">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="saved">Đã lưu</TabsTrigger>
            <TabsTrigger value="downloads">Đã tải</TabsTrigger>
            <TabsTrigger value="quizzes">Quiz</TabsTrigger>
            <TabsTrigger value="questions">Câu hỏi</TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="space-y-4">
            {savedDocs.length === 0 ? <div className="text-gray-500">Chưa có tài liệu đã lưu.</div> : savedDocs.map((doc: any) => <Link key={doc.id} to={`/documents/${doc.id}`} className="block border rounded-xl p-4 hover:bg-gray-50"><div className="font-semibold">{doc.title}</div><div className="text-sm text-gray-500">{doc.description}</div></Link>)}
          </TabsContent>

          <TabsContent value="downloads" className="space-y-4">
            {downloads.length === 0 ? <div className="text-gray-500">Chưa có lịch sử tải tài liệu.</div> : downloads.map((row: any) => <Link key={`${row.document.id}-${row.downloaded_at}`} to={`/documents/${row.document.id}`} className="block border rounded-xl p-4 hover:bg-gray-50"><div className="flex items-center gap-2 font-semibold"><Download className="w-4 h-4" />{row.document.title}</div><div className="text-sm text-gray-500">Tải lúc {new Date(row.downloaded_at).toLocaleString('vi-VN')}</div></Link>)}
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4">
            {quizHistory.length === 0 ? <div className="text-gray-500">Chưa có lịch sử làm quiz.</div> : quizHistory.map((row: any) => <Link key={row.submission_id} to={`/quizzes/${row.quiz.id}/result`} className="block border rounded-xl p-4 hover:bg-gray-50"><div className="font-semibold">{row.quiz.title}</div><div className="text-sm text-gray-500">Điểm {row.score}/{row.total_questions} • {row.percentage}%</div></Link>)}
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            {myQuestions.length === 0 ? <div className="text-gray-500">Chưa có câu hỏi nào.</div> : myQuestions.map((question: any) => <Link key={question.id} to={question.status === 'approved' ? `/community/${question.id}` : '/community'} className="block border rounded-xl p-4 hover:bg-gray-50"><div className="flex items-center justify-between"><div className="font-semibold">{question.title}</div><div className="text-xs uppercase text-gray-500">{question.status}</div></div><div className="text-sm text-gray-500">{question.description}</div></Link>)}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
