import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Plus, Search, Edit, Trash2, Copy, Brain } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { toast } from 'sonner';
import { quizzesService } from '../../../services/quizzes';
import { adaptQuiz } from '../../../lib/adapters';

export default function AdminQuizzesPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const fetchQuizzes = () => {
    quizzesService.getAdminQuizzes({ search: search || undefined, limit: 100 })
      .then((res) => setQuizzes((res.data.data || []).map(adaptQuiz)))
      .catch(() => setQuizzes([]));
  };

  useEffect(() => {
    fetchQuizzes();
  }, [search]);

  const handleDelete = async (quizId: string) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa quiz này? Hành động này sẽ xóa toàn bộ câu hỏi và lịch sử làm bài liên quan.');
    if (!confirmed) return;

    try {
      await quizzesService.deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId));
      toast.success('Quiz deleted');
    } catch {
      toast.error('Failed to delete quiz');
    }
  };

  const handleDuplicate = async (quizId: string) => {
    try {
      await quizzesService.duplicateQuiz(quizId);
      toast.success('Quiz duplicated');
      fetchQuizzes();
    } catch {
      toast.error('Failed to duplicate quiz');
    }
  };

  const togglePublish = async (quizId: string, nextPublished: boolean) => {
    try {
      await quizzesService.publishQuiz(quizId, nextPublished);
      setQuizzes((prev) => prev.map((quiz) => quiz.id === quizId ? { ...quiz, status: nextPublished ? 'published' : 'draft', is_published: nextPublished } : quiz));
      toast.success(nextPublished ? 'Quiz published' : 'Quiz unpublished');
    } catch {
      toast.error('Failed to update publish status');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quiz Management</h1>
          <p className="text-gray-600">Manage community quizzes and challenges</p>
        </div>
        <Link to="/admin/quizzes/create">
          <Button><Plus className="w-4 h-4 mr-2" />Create Quiz</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search quizzes..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

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
            {quizzes.length === 0 && <TableRow><TableCell colSpan={9}>Không có quiz</TableCell></TableRow>}
            {quizzes.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell className="font-medium max-w-xs">
                  <div className="flex items-center gap-3"><Brain className="w-4 h-4 text-gray-400" /><span className="line-clamp-1">{quiz.title}</span></div>
                </TableCell>
                <TableCell><Badge variant="secondary">{quiz.topic || 'N/A'}</Badge></TableCell>
                <TableCell>{quiz.questionCount}</TableCell>
                <TableCell>{Math.round((quiz.timeLimit || 0) / 60)} min</TableCell>
                <TableCell><Badge variant={quiz.difficulty === 'easy' ? 'secondary' : quiz.difficulty === 'medium' ? 'default' : 'destructive'}>{quiz.difficulty}</Badge></TableCell>
                <TableCell>{quiz.reward ? <Badge className="bg-green-500">Yes</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                <TableCell>{quiz.participants.toLocaleString()}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => togglePublish(quiz.id, !quiz.is_published)}>
                    {quiz.is_published ? 'Published' : 'Draft'}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/quizzes/${quiz.id}/edit`)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDuplicate(quiz.id)}><Copy className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(quiz.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
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
