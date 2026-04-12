import { useParams, Link } from 'react-router';
import { Trophy, BookOpen, Brain, MessageCircle, Download, Calendar, Star, ArrowLeft, Medal } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { motion } from 'motion/react';
import { leaderboardUsers, documents, quizzes, communityQuestions } from '../../data/mockData';
import { useLanguage } from '../../contexts/LanguageContext';

export default function PublicProfilePage() {
  const { id } = useParams();
  const { language } = useLanguage();
  const user = leaderboardUsers.find((u) => u.id === id);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold">
          {language === 'vi' ? 'Không tìm thấy người dùng' : 'User not found'}
        </h1>
        <Link to="/quizzes">
          <Button className="mt-4">
            {language === 'vi' ? 'Quay lại' : 'Go back'}
          </Button>
        </Link>
      </div>
    );
  }

  const userQuestions = communityQuestions.filter((q) => q.userId === user.id);
  const recentQuizzes = quizzes.slice(0, 3);

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500 bg-yellow-50';
    if (rank === 2) return 'text-gray-400 bg-gray-50';
    if (rank === 3) return 'text-orange-600 bg-orange-50';
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Link
        to="/quizzes"
        className="inline-flex items-center gap-2 text-gray-600 mb-8 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {language === 'vi' ? 'Quay Lại Bảng Xếp Hạng' : 'Back to Leaderboard'}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600" />
          <div className="px-8 pb-8">
            <div className="flex items-end gap-6 -mt-16 mb-6">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                />
                {user.rank <= 3 && (
                  <div
                    className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full ${getMedalColor(
                      user.rank
                    )} shadow-lg flex items-center justify-center border-2 border-white`}
                  >
                    <Medal className="w-6 h-6" fill="currentColor" />
                  </div>
                )}
              </div>
              <div className="flex-1 pt-20">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold">{user.name}</h1>
                      <Badge className="bg-blue-600">
                        #{user.rank} {language === 'vi' ? 'Xếp hạng' : 'Ranked'}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{user.phone}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {language === 'vi' ? 'Tham gia' : 'Joined'}{' '}
                      {new Date(user.joinDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    {language === 'vi' ? 'Xếp hạng' : 'Rank'}
                  </span>
                </div>
                <div className="text-3xl font-bold text-blue-600">#{user.rank}</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">
                    {language === 'vi' ? 'Điểm' : 'Points'}
                  </span>
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {user.points.toLocaleString()}
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">
                    {language === 'vi' ? 'Quiz' : 'Quizzes'}
                  </span>
                </div>
                <div className="text-3xl font-bold text-green-600">{user.quizzesJoined}</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MessageCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-600">
                    {language === 'vi' ? 'Câu hỏi' : 'Questions'}
                  </span>
                </div>
                <div className="text-3xl font-bold text-orange-600">
                  {user.questionsPosted}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Tabs */}
        <Tabs defaultValue="quizzes" className="bg-white rounded-2xl shadow-lg p-8">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="quizzes">
              <Brain className="w-4 h-4 mr-2" />
              {language === 'vi' ? 'Quiz Gần Đây' : 'Recent Quizzes'}
            </TabsTrigger>
            <TabsTrigger value="questions">
              <MessageCircle className="w-4 h-4 mr-2" />
              {language === 'vi' ? 'Câu Hỏi' : 'Questions'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes" className="space-y-4">
            <h3 className="text-xl font-bold mb-4">
              {language === 'vi' ? 'Quiz Đã Tham Gia' : 'Quiz History'}
            </h3>
            {recentQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{quiz.title}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>{quiz.questionCount} {language === 'vi' ? 'câu hỏi' : 'questions'}</span>
                    <span>•</span>
                    <span>{quiz.timeLimit} {language === 'vi' ? 'phút' : 'min'}</span>
                    <span>•</span>
                    <Badge
                      variant={
                        quiz.difficulty === 'easy'
                          ? 'secondary'
                          : quiz.difficulty === 'medium'
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {quiz.difficulty === 'easy'
                        ? language === 'vi'
                          ? 'Dễ'
                          : 'Easy'
                        : quiz.difficulty === 'medium'
                        ? language === 'vi'
                          ? 'Trung bình'
                          : 'Medium'
                        : language === 'vi'
                        ? 'Khó'
                        : 'Hard'}
                    </Badge>
                  </div>
                </div>
                <div className="text-right mr-4">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.floor(Math.random() * 20) + 80}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {language === 'vi' ? 'Điểm' : 'Score'}
                  </div>
                </div>
                <Link to={`/quizzes/${quiz.id}/take`}>
                  <Button variant="outline" size="sm">
                    {language === 'vi' ? 'Xem' : 'View'}
                  </Button>
                </Link>
              </div>
            ))}
            {recentQuizzes.length === 0 && (
              <div className="text-center py-16">
                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {language === 'vi' ? 'Chưa có quiz nào' : 'No quizzes yet'}
                </h3>
                <p className="text-gray-500">
                  {language === 'vi'
                    ? 'Người dùng này chưa tham gia quiz nào'
                    : 'This user has not joined any quizzes yet'}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <h3 className="text-xl font-bold mb-4">
              {language === 'vi' ? 'Câu Hỏi Đã Đăng' : 'Posted Questions'}
            </h3>
            {userQuestions.map((question) => (
              <Link key={question.id} to={`/community/${question.id}`}>
                <div className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold flex-1">{question.title}</h4>
                    <Badge variant={question.status === 'approved' ? 'secondary' : 'default'}>
                      {question.status === 'approved'
                        ? language === 'vi'
                          ? 'Đã duyệt'
                          : 'Approved'
                        : language === 'vi'
                        ? 'Chờ duyệt'
                        : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{question.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex gap-2">
                      {question.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {question.answerCount} {language === 'vi' ? 'câu trả lời' : 'answers'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {userQuestions.length === 0 && (
              <div className="text-center py-16">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {language === 'vi' ? 'Chưa có câu hỏi nào' : 'No questions yet'}
                </h3>
                <p className="text-gray-500">
                  {language === 'vi'
                    ? 'Người dùng này chưa đăng câu hỏi nào'
                    : 'This user has not posted any questions yet'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
