import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { Trophy, Brain, MessageCircle, Star, ArrowLeft, Medal } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { motion } from 'motion/react';
import { usersService } from '../../../services/users';
import { adaptCommunityQuestion } from '../../../lib/adapters';
import { getDefaultAvatarUrl } from '../../../lib/env';

export default function PublicProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([usersService.getUser(id), usersService.getPublicActivity(id, { limit: 10 })])
      .then(([userRes, activityRes]) => {
        setUser(userRes.data);
        setActivity({
          ...activityRes.data,
          questions: (activityRes.data.questions || []).map(adaptCommunityQuestion),
        });
      })
      .catch(() => {
        setUser(null);
        setActivity(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500 bg-yellow-50';
    if (rank === 2) return 'text-gray-400 bg-gray-50';
    if (rank === 3) return 'text-orange-600 bg-orange-50';
    return 'text-blue-600 bg-blue-50';
  };

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-12">Đang tải hồ sơ...</div>;
  if (!user) return <div className="max-w-7xl mx-auto px-6 py-12 text-center"><h1 className="text-2xl font-bold">Không tìm thấy người dùng</h1><Link to="/leaderboard"><Button className="mt-4">Quay lại</Button></Link></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Link to="/leaderboard" className="inline-flex items-center gap-2 text-gray-600 mb-8 hover:text-gray-900 transition-colors"><ArrowLeft className="w-4 h-4" />Quay lại bảng xếp hạng</Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600" />
          <div className="px-8 pb-8">
            <div className="flex items-end gap-6 -mt-16 mb-6">
              <div className="relative">
                <img src={user.avatar_url || getDefaultAvatarUrl(user.username)} alt={user.full_name || user.username} className="w-32 h-32 rounded-full border-4 border-white shadow-lg" />
                {(user.stats?.rank ?? 0) <= 3 && (user.stats?.rank ?? 0) > 0 && <div className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full ${getMedalColor(user.stats.rank)} shadow-lg flex items-center justify-center border-2 border-white`}><Medal className="w-6 h-6" fill="currentColor" /></div>}
              </div>
              <div className="flex-1 pt-20">
                <div className="flex items-center gap-3 mb-2"><h1 className="text-3xl font-bold">{user.full_name || user.username}</h1><Badge className="bg-blue-600">#{user.stats?.rank ?? 0}</Badge></div>
                <p className="text-gray-600">{user.username}</p>
                {user.school && <p className="text-sm text-gray-500 mt-1">{user.school}</p>}
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

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold mb-4">Quiz gần đây</h2>
            {(activity?.quiz_history || []).length === 0 ? <div className="text-gray-500">Chưa có hoạt động quiz công khai.</div> : activity.quiz_history.map((row: any) => <div key={row.submission_id} className="border rounded-xl p-4 mb-3"><div className="font-semibold">{row.quiz?.title || 'Quiz'}</div><div className="text-sm text-gray-500">Điểm {row.score}/{row.total_questions}</div></div>)}
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold mb-4">Câu hỏi công khai</h2>
            {(activity?.questions || []).length === 0 ? <div className="text-gray-500">Chưa có câu hỏi công khai.</div> : activity.questions.map((question: any) => <Link key={question.id} to={`/community/${question.id}`} className="block border rounded-xl p-4 mb-3 hover:bg-gray-50"><div className="font-semibold">{question.title}</div><div className="text-sm text-gray-500">{question.description}</div></Link>)}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
