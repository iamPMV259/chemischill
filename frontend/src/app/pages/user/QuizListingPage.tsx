import { useState } from 'react';
import { Link } from 'react-router';
import { Brain, Trophy, Clock, Users, Search, Filter, Medal, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { motion } from 'motion/react';
import { quizzes, leaderboardUsers } from '../../data/mockData';
import { useLanguage } from '../../contexts/LanguageContext';

export default function QuizListingPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all-time'>('all-time');

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      searchQuery === '' ||
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === '' || quiz.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const topThree = leaderboardUsers.slice(0, 3);
  const restOfUsers = leaderboardUsers.slice(3, 10);

  const getPodiumOrder = (rank: number) => {
    if (rank === 1) return 'order-2';
    if (rank === 2) return 'order-1';
    return 'order-3';
  };

  const getPodiumHeight = (rank: number) => {
    if (rank === 1) return 'h-48';
    if (rank === 2) return 'h-40';
    return 'h-32';
  };

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    return 'text-orange-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Quiz Cộng Đồng</h1>
          <p className="text-gray-600">Kiểm tra kiến thức và cạnh tranh với người khác</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Tìm kiếm quiz theo chủ đề hoặc tiêu đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold">Lọc Theo Độ Khó</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedDifficulty === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDifficulty('')}
            >
              Tất Cả
            </Button>
            <Button
              variant={selectedDifficulty === 'easy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDifficulty('easy')}
            >
              Dễ
            </Button>
            <Button
              variant={selectedDifficulty === 'medium' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDifficulty('medium')}
            >
              Trung Bình
            </Button>
            <Button
              variant={selectedDifficulty === 'hard' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDifficulty('hard')}
            >
              Khó
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Có {filteredQuizzes.length} quiz
          </p>
        </div>

        {/* Quiz Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Brain className="w-6 h-6 text-blue-600" />
                  </div>
                  {quiz.reward && (
                    <Badge className="bg-green-500 text-white">
                      <Trophy className="w-3 h-3 mr-1" />
                      Reward
                    </Badge>
                  )}
                </div>

                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{quiz.title}</h3>
                <p className="text-sm text-gray-600 mb-4 flex-1">{quiz.description}</p>

                {quiz.reward && quiz.rewardDescription && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm text-green-700">
                    🎁 {quiz.rewardDescription}
                  </div>
                )}

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Số Câu Hỏi</span>
                    <span className="font-semibold">{quiz.questionCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Thời Gian</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {quiz.timeLimit} phút
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Độ Khó</span>
                    <Badge
                      variant={
                        quiz.difficulty === 'easy'
                          ? 'secondary'
                          : quiz.difficulty === 'medium'
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {quiz.difficulty === 'easy' ? 'Dễ' : quiz.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    {quiz.participants.toLocaleString()} người
                  </div>
                  <Link to={`/quizzes/${quiz.id}/take`}>
                    <Button size="sm">Tham Gia</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredQuizzes.length === 0 && (
          <div className="text-center py-16">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy quiz</h3>
            <p className="text-gray-500">Thử điều chỉnh tìm kiếm hoặc bộ lọc</p>
          </div>
        )}

        {/* Leaderboard Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3">
              {language === 'vi' ? 'Bảng Xếp Hạng' : 'Leaderboard'}
            </h2>
            <p className="text-gray-600">
              {language === 'vi'
                ? 'Học viên hóa học xuất sắc nhất cộng đồng'
                : 'Top chemistry learners in the community'}
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex justify-center gap-2 mb-12">
            <Button
              variant={period === 'weekly' ? 'default' : 'outline'}
              onClick={() => setPeriod('weekly')}
            >
              {language === 'vi' ? 'Tuần' : 'Weekly'}
            </Button>
            <Button
              variant={period === 'monthly' ? 'default' : 'outline'}
              onClick={() => setPeriod('monthly')}
            >
              {language === 'vi' ? 'Tháng' : 'Monthly'}
            </Button>
            <Button
              variant={period === 'all-time' ? 'default' : 'outline'}
              onClick={() => setPeriod('all-time')}
            >
              {language === 'vi' ? 'Mọi Thời Đại' : 'All Time'}
            </Button>
          </div>

          {/* Top 3 Podium */}
          <div className="mb-12">
            <div className="flex items-end justify-center gap-4 mb-8">
              {topThree.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: user.rank * 0.1 }}
                  className={`${getPodiumOrder(user.rank)} flex flex-col items-center`}
                >
                  <Link to={`/users/${user.id}`} className="block">
                    <div className="relative mb-4">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-24 h-24 rounded-full border-4 border-white shadow-lg hover:border-blue-300 transition-colors cursor-pointer"
                      />
                      <div
                        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center ${getMedalColor(
                          user.rank
                        )}`}
                      >
                        <Medal className="w-6 h-6" fill="currentColor" />
                      </div>
                    </div>
                    <div
                      className={`bg-white rounded-t-2xl shadow-xl p-6 w-48 text-center ${getPodiumHeight(
                        user.rank
                      )} flex flex-col justify-between hover:shadow-2xl transition-shadow cursor-pointer`}
                    >
                      <div>
                        <div className="text-3xl font-bold mb-2">#{user.rank}</div>
                        <h3 className="font-semibold text-lg mb-1 truncate">{user.name}</h3>
                        <div className="text-2xl font-bold text-purple-600 mb-3">
                          {user.points.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500">
                          {language === 'vi' ? 'điểm' : 'points'}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm mt-2">
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{user.quizzesJoined}</div>
                          <div className="text-xs text-gray-500 truncate">Quiz</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-600">{user.questionsPosted}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {language === 'vi' ? 'Câu hỏi' : 'Questions'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Rest of Rankings */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                {language === 'vi' ? 'Học Viên Hàng Đầu' : 'Top Learners'}
              </h3>
            </div>
            <div className="divide-y">
              {restOfUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Link to={`/users/${user.id}`} className="flex items-center gap-6">
                    <div className="w-12 text-center">
                      <div className="text-2xl font-bold text-gray-400">#{user.rank}</div>
                    </div>
                    <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{user.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{user.quizzesJoined} quiz</span>
                        <span>•</span>
                        <span>
                          {user.questionsPosted}{' '}
                          {language === 'vi' ? 'câu hỏi' : 'questions'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {user.points.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {language === 'vi' ? 'điểm' : 'points'}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
