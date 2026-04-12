import { Trophy, Award, TrendingUp, Gift } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { leaderboardUsers } from '../../data/mockData';

export default function AdminLeaderboardPage() {
  const topPerformers = leaderboardUsers.slice(0, 10);

  const rewardCampaigns = [
    {
      id: '1',
      name: 'Weekly Chemistry Challenge',
      period: 'Weekly',
      reward: 'Premium materials access',
      status: 'active',
      participants: 234,
    },
    {
      id: '2',
      name: 'Monthly Top Learner',
      period: 'Monthly',
      reward: 'Certificate + Study guide',
      status: 'active',
      participants: 456,
    },
    {
      id: '3',
      name: 'Organic Chemistry Master',
      period: 'One-time',
      reward: 'Advanced course access',
      status: 'completed',
      participants: 123,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leaderboard & Rewards</h1>
        <p className="text-gray-600">Monitor top performers and manage reward campaigns</p>
      </div>

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leaderboard">
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="rewards">
            <Gift className="w-4 h-4 mr-2" />
            Reward Campaigns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-yellow-50 rounded-xl shadow-sm p-6 border border-yellow-200">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <span className="font-semibold">Top Performer</span>
              </div>
              <div className="text-2xl font-bold mb-1">{leaderboardUsers[0].name}</div>
              <div className="text-lg text-yellow-600">
                {leaderboardUsers[0].points.toLocaleString()} points
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl shadow-sm p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <span className="font-semibold">Average Points</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(
                  leaderboardUsers.reduce((sum, u) => sum + u.points, 0) /
                    leaderboardUsers.length
                ).toLocaleString()}
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl shadow-sm p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-purple-600" />
                <span className="font-semibold">Total Engagement</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {leaderboardUsers
                  .reduce((sum, u) => sum + u.quizzesJoined, 0)
                  .toLocaleString()}{' '}
                quizzes
              </div>
            </div>
          </div>

          {/* Top Performers Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Top 10 Performers</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Quizzes Joined</TableHead>
                  <TableHead>Questions Posted</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPerformers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            user.rank === 1
                              ? 'bg-yellow-100 text-yellow-700'
                              : user.rank === 2
                              ? 'bg-gray-200 text-gray-700'
                              : user.rank === 3
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {user.rank}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="font-medium">{user.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-purple-600">
                        {user.points.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>{user.quizzesJoined}</TableCell>
                    <TableCell>{user.questionsPosted}</TableCell>
                    <TableCell>
                      {new Date(user.joinDate).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="rewards">
          {/* Reward Campaigns */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Reward Campaigns</h2>
              <Button>
                <Gift className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewardCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{campaign.period}</Badge>
                    </TableCell>
                    <TableCell>{campaign.reward}</TableCell>
                    <TableCell>{campaign.participants.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={campaign.status === 'active' ? 'default' : 'secondary'}
                      >
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {campaign.status === 'active' && (
                          <Button variant="outline" size="sm">
                            End Campaign
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
