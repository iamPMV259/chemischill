import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Trophy, TrendingUp, Medal } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { motion } from 'motion/react';
import { usersService } from '../../../services/users';
import { adaptLeaderboardEntry } from '../../../lib/adapters';

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all-time'>('all-time');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    usersService.getLeaderboard({ limit: 50 })
      .then((res) => setLeaderboard((res.data.data || []).map(adaptLeaderboardEntry)))
      .catch(() => setLeaderboard([]))
      .finally(() => setLoading(false));
  }, [period]);

  const topThree = leaderboard.slice(0, 3);
  const restOfUsers = leaderboard.slice(3);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-3">Bảng Xếp Hạng</h1>
            <p className="text-gray-600">Học viên hóa học xuất sắc nhất cộng đồng</p>
          </div>

          {/* Period Selector */}
          <div className="flex justify-center gap-2 mb-12">
            <Button variant={period === 'weekly' ? 'default' : 'outline'} onClick={() => setPeriod('weekly')}>Tuần</Button>
            <Button variant={period === 'monthly' ? 'default' : 'outline'} onClick={() => setPeriod('monthly')}>Tháng</Button>
            <Button variant={period === 'all-time' ? 'default' : 'outline'} onClick={() => setPeriod('all-time')}>Mọi Thời Đại</Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />)}
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {topThree.length > 0 && (
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
                        <div className="relative mb-4">
                          <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-4 border-white shadow-lg" />
                          <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center ${getMedalColor(user.rank)}`}>
                            <Medal className="w-6 h-6" fill="currentColor" />
                          </div>
                        </div>
                        <div className={`bg-white rounded-t-2xl shadow-xl p-6 w-48 text-center ${getPodiumHeight(user.rank)} flex flex-col justify-between`}>
                          <div>
                            <div className="text-3xl font-bold mb-2">#{user.rank}</div>
                            <h3 className="font-semibold text-lg mb-1">{user.name}</h3>
                            <div className="text-2xl font-bold text-purple-600 mb-3">{user.points.toLocaleString()}</div>
                            <p className="text-xs text-gray-500">điểm</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="font-semibold text-blue-600">{user.quizzesJoined}</div>
                              <div className="text-xs text-gray-500">Quiz</div>
                            </div>
                            <div>
                              <div className="font-semibold text-purple-600">{user.questionsPosted}</div>
                              <div className="text-xs text-gray-500">Câu hỏi</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rest of Rankings */}
              {restOfUsers.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Học Viên Hàng Đầu
                    </h2>
                  </div>
                  <div className="divide-y">
                    {restOfUsers.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <Link to={`/users/${user.id}`} className="flex items-center gap-6">
                          <div className="w-12 text-center">
                            <div className="text-2xl font-bold text-gray-400">#{user.rank}</div>
                          </div>
                          <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{user.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{user.quizzesJoined} quiz</span>
                              <span>•</span>
                              <span>{user.questionsPosted} câu hỏi</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600 mb-1">{user.points.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">điểm</div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="mt-8 grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{leaderboard.length}</div>
                  <div className="text-gray-600">Học Viên Hoạt Động</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {leaderboard.reduce((sum, u) => sum + u.quizzesJoined, 0).toLocaleString()}
                  </div>
                  <div className="text-gray-600">Lượt Tham Gia Quiz</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {leaderboard.reduce((sum, u) => sum + u.questionsPosted, 0)}
                  </div>
                  <div className="text-gray-600">Câu Hỏi Cộng Đồng</div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
