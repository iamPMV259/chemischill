import { useEffect, useState } from 'react';
import { Trophy, Award, TrendingUp } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { usersService } from '../../../services/users';
import { adaptLeaderboardEntry } from '../../../lib/adapters';

export default function AdminLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    usersService.getLeaderboard({ limit: 50 })
      .then((res) => {
        setLeaderboard((res.data.data || []).map(adaptLeaderboardEntry));
        setSummary(res.data.summary || null);
      })
      .catch(() => {
        setLeaderboard([]);
        setSummary(null);
      });
  }, []);

  const topPerformers = leaderboard.slice(0, 10);

  return (
    <div>
      <div className="mb-8"><h1 className="text-3xl font-bold mb-2">Leaderboard</h1><p className="text-gray-600">Monitor top performers with real backend data</p></div>

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList><TabsTrigger value="leaderboard"><Trophy className="w-4 h-4 mr-2" />Leaderboard</TabsTrigger><TabsTrigger value="summary"><TrendingUp className="w-4 h-4 mr-2" />Summary</TabsTrigger></TabsList>

        <TabsContent value="leaderboard">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b"><h2 className="text-xl font-bold">Top 10 Performers</h2></div>
            <Table>
              <TableHeader><TableRow><TableHead>Rank</TableHead><TableHead>User</TableHead><TableHead>Points</TableHead><TableHead>Quizzes Joined</TableHead><TableHead>Questions Posted</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {topPerformers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${user.rank === 1 ? 'bg-yellow-100 text-yellow-700' : user.rank === 2 ? 'bg-gray-200 text-gray-700' : user.rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>{user.rank}</div></TableCell>
                    <TableCell><div className="flex items-center gap-3"><img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" /><div className="font-medium">{user.name}</div></div></TableCell>
                    <TableCell><div className="font-bold text-purple-600">{user.points.toLocaleString()}</div></TableCell>
                    <TableCell>{user.quizzesJoined}</TableCell>
                    <TableCell>{user.questionsPosted}</TableCell>
                    <TableCell><Badge variant={user.status === 'active' ? 'default' : 'secondary'}>{user.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-yellow-50 rounded-xl shadow-sm p-6 border border-yellow-200"><div className="flex items-center gap-3 mb-2"><Trophy className="w-6 h-6 text-yellow-600" /><span className="font-semibold">Top Performer</span></div><div className="text-2xl font-bold mb-1">{leaderboard[0]?.name || 'N/A'}</div><div className="text-lg text-yellow-600">{(leaderboard[0]?.points || 0).toLocaleString()} points</div></div>
            <div className="bg-blue-50 rounded-xl shadow-sm p-6 border border-blue-200"><div className="flex items-center gap-3 mb-2"><TrendingUp className="w-6 h-6 text-blue-600" /><span className="font-semibold">Active Users</span></div><div className="text-2xl font-bold text-blue-600">{summary?.total_active_users ?? 0}</div></div>
            <div className="bg-purple-50 rounded-xl shadow-sm p-6 border border-purple-200"><div className="flex items-center gap-3 mb-2"><Award className="w-6 h-6 text-purple-600" /><span className="font-semibold">Total Engagement</span></div><div className="text-2xl font-bold text-purple-600">{summary?.total_quiz_participations ?? 0} quizzes</div></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6"><div className="text-gray-600">Approved community questions: <span className="font-semibold text-gray-900">{summary?.total_questions_posted ?? 0}</span></div></div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
