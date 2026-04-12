import { Link, useNavigate } from 'react-router';
import { Plus, Search, Edit, Trash2, Copy, Eye, Brain } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { quizzes } from '../../data/mockData';

export default function AdminQuizzesPage() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quiz Management</h1>
          <p className="text-gray-600">Manage community quizzes and challenges</p>
        </div>
        <Link to="/admin/quizzes/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Quiz
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search quizzes..." className="pl-10" />
          </div>
          <Button variant="outline">Filter</Button>
        </div>
      </div>

      {/* Quizzes Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Time Limit</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell className="font-medium max-w-xs">
                  <div className="flex items-center gap-3">
                    <Brain className="w-4 h-4 text-gray-400" />
                    <span className="line-clamp-1">{quiz.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{quiz.topic}</Badge>
                </TableCell>
                <TableCell>{quiz.questionCount}</TableCell>
                <TableCell>{quiz.timeLimit} min</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      quiz.difficulty === 'easy'
                        ? 'secondary'
                        : quiz.difficulty === 'medium'
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {quiz.difficulty}
                  </Badge>
                </TableCell>
                <TableCell>
                  {quiz.reward ? (
                    <Badge className="bg-green-500">Yes</Badge>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </TableCell>
                <TableCell>{quiz.participants.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={quiz.status === 'published' ? 'default' : 'secondary'}>
                    {quiz.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/quizzes/${quiz.id}/edit`)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
