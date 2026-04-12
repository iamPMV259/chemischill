import { FileText, Brain, Users, MessageSquare, Download, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { documents, quizzes, leaderboardUsers, communityQuestions } from '../../data/mockData';

export default function AdminDashboard() {
  const pendingQuestions = communityQuestions.filter((q) => q.status === 'pending').length;
  const totalDownloads = documents.reduce((sum, doc) => sum + doc.downloads, 0);

  const downloadData = [
    { month: 'Oct', downloads: 1200 },
    { month: 'Nov', downloads: 1890 },
    { month: 'Dec', downloads: 2390 },
    { month: 'Jan', downloads: 3490 },
    { month: 'Feb', downloads: 4200 },
    { month: 'Mar', downloads: 5100 },
  ];

  const quizData = [
    { week: 'Week 1', participants: 234 },
    { week: 'Week 2', participants: 345 },
    { week: 'Week 3', participants: 289 },
    { week: 'Week 4', participants: 421 },
  ];

  const recentActivity = [
    { action: 'New document uploaded', user: 'Admin', time: '10 minutes ago' },
    { action: 'Quiz "Organic Chemistry" completed by 45 users', user: 'System', time: '1 hour ago' },
    { action: 'Community question approved', user: 'Admin', time: '2 hours ago' },
    { action: 'New user registered', user: 'System', time: '3 hours ago' },
    { action: 'Document downloaded 50 times', user: 'System', time: '5 hours ago' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <Badge variant="secondary">+12%</Badge>
          </div>
          <div className="text-3xl font-bold mb-1">{documents.length}</div>
          <div className="text-sm text-gray-600">Total Documents</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <Badge variant="secondary">+8%</Badge>
          </div>
          <div className="text-3xl font-bold mb-1">{quizzes.length}</div>
          <div className="text-sm text-gray-600">Total Quizzes</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <Badge variant="secondary">+24%</Badge>
          </div>
          <div className="text-3xl font-bold mb-1">{leaderboardUsers.length}</div>
          <div className="text-sm text-gray-600">Active Users</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
            {pendingQuestions > 0 && (
              <Badge className="bg-red-500">{pendingQuestions} pending</Badge>
            )}
          </div>
          <div className="text-3xl font-bold mb-1">{communityQuestions.length}</div>
          <div className="text-sm text-gray-600">Community Questions</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Downloads Chart */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Download className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold">Document Downloads</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={downloadData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line key="downloads-line" type="monotone" dataKey="downloads" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Quiz Participation Chart */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold">Quiz Participation</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={quizData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar key="participants-bar" dataKey="participants" fill="#9333ea" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="flex-1">
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-gray-500">by {activity.user}</p>
              </div>
              <div className="text-sm text-gray-500">{activity.time}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
