import { useEffect, useState } from 'react';
import { FileText, Brain, Users, MessageSquare, Trophy } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { adminService } from '../../../services/admin';
import { usersService } from '../../../services/users';
import { adaptLeaderboardEntry } from '../../../lib/adapters';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [topUsers, setTopUsers] = useState<any[]>([]);

  useEffect(() => {
    adminService.getStats().then((res) => setStats(res.data)).catch(() => setStats(null));
    usersService.getLeaderboard({ limit: 5 }).then((res) => setTopUsers((res.data.data || []).map(adaptLeaderboardEntry))).catch(() => setTopUsers([]));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Snapshot từ dữ liệu thật của hệ thống</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl"><FileText className="w-6 h-6 text-blue-600" /></div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats?.total_documents ?? 0}</div>
          <div className="text-sm text-gray-600">Total Documents</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl"><Brain className="w-6 h-6 text-purple-600" /></div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats?.total_quizzes ?? 0}</div>
          <div className="text-sm text-gray-600">Total Quizzes</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl"><Users className="w-6 h-6 text-green-600" /></div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats?.total_users ?? 0}</div>
          <div className="text-sm text-gray-600">Users</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl"><MessageSquare className="w-6 h-6 text-orange-600" /></div>
            {(stats?.pending_questions ?? 0) > 0 && <Badge className="bg-red-500">{stats.pending_questions} pending</Badge>}
          </div>
          <div className="text-3xl font-bold mb-1">{stats?.pending_questions ?? 0}</div>
          <div className="text-sm text-gray-600">Pending Questions</div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <h2 className="text-xl font-bold">Top Users</h2>
        </div>
        <div className="space-y-4">
          {topUsers.length === 0 && <div className="text-gray-500">Chưa có dữ liệu leaderboard.</div>}
          {topUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="flex items-center gap-3">
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.quizzesJoined} quiz, {user.questionsPosted} câu hỏi</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">#{user.rank}</div>
                <div className="text-sm text-gray-500">{user.points.toLocaleString()} điểm</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
