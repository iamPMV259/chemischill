import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { toast } from 'sonner';
import { tagsService } from '../../../services/tags';
import { quizzesService } from '../../../services/quizzes';
import { communityService } from '../../../services/community';

const formatDateTimeLocal = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
};

const toIsoOrNull = (value: string) => (value ? new Date(value).toISOString() : null);

const createQuestion = () => ({
  id: crypto.randomUUID(),
  question_text: '',
  question_image_url: '',
  explanation: '',
  options: Array.from({ length: 4 }, (_, index) => ({
    id: `${crypto.randomUUID()}-${index}`,
    option_text: '',
    is_correct: index === 0,
  })),
});

export default function AdminEditQuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingQuestionId, setUploadingQuestionId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([quizzesService.getAdminQuiz(id), tagsService.getTags()])
      .then(([quizRes, tagsRes]) => {
        setQuiz({
          ...quizRes.data,
          tag_ids: quizRes.data.tag_ids || [],
          questions: (quizRes.data.questions || []).map((question: any) => ({
            ...question,
            explanation: question.explanation || '',
            question_image_url: question.question_image_url || '',
            options: (question.options || []).map((option: any) => ({ ...option })),
          })),
          available_from: formatDateTimeLocal(quizRes.data.available_from),
          available_until: formatDateTimeLocal(quizRes.data.available_until),
        });
        setTags(tagsRes.data.data || []);
      })
      .catch(() => setQuiz(null))
      .finally(() => setLoading(false));
  }, [id]);

  const updateQuestion = (questionId: string, patch: any) => {
    setQuiz((prev: any) => ({
      ...prev,
      questions: prev.questions.map((question: any) => question.id === questionId ? { ...question, ...patch } : question),
    }));
  };

  const updateOptionText = (questionId: string, optionId: string, value: string) => {
    setQuiz((prev: any) => ({
      ...prev,
      questions: prev.questions.map((question: any) => question.id === questionId ? {
        ...question,
        options: question.options.map((option: any) => option.id === optionId ? { ...option, option_text: value } : option),
      } : question),
    }));
  };

  const setCorrectOption = (questionId: string, selectedIndex: number) => {
    setQuiz((prev: any) => ({
      ...prev,
      questions: prev.questions.map((question: any) => question.id === questionId ? {
        ...question,
        options: question.options.map((option: any, index: number) => ({ ...option, is_correct: index === selectedIndex })),
      } : question),
    }));
  };

  const uploadQuestionImage = async (questionId: string, file: File | null) => {
    if (!file) return;
    setUploadingQuestionId(questionId);
    try {
      const res = await communityService.uploadImage(file, 'question');
      updateQuestion(questionId, { question_image_url: res.data.image_url });
      toast.success('Đã tải ảnh câu hỏi lên');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Không thể tải ảnh câu hỏi');
    } finally {
      setUploadingQuestionId(null);
    }
  };

  const save = async (publish: boolean) => {
    if (!id || !quiz) return;
    try {
      await quizzesService.updateQuiz(id, {
        title: quiz.title,
        description: quiz.description,
        topic: quiz.topic || null,
        time_limit: Number(quiz.time_limit),
        difficulty: quiz.difficulty,
        total_points: Number(quiz.total_points),
        attempt_mode: quiz.attempt_mode,
        retry_score_mode: quiz.retry_score_mode,
        retry_penalty_percent: Number(quiz.retry_penalty_percent),
        count_points_once: Boolean(quiz.count_points_once),
        available_from: toIsoOrNull(quiz.available_from),
        available_until: toIsoOrNull(quiz.available_until),
        has_reward: quiz.has_reward,
        reward_description: quiz.has_reward ? quiz.reward_description : null,
        tag_ids: quiz.tag_ids || [],
        is_published: publish,
        questions: (quiz.questions || []).map((question: any, questionIndex: number) => ({
          question_text: question.question_text,
          question_image_url: question.question_image_url || null,
          explanation: question.explanation || null,
          order_index: questionIndex,
          options: (question.options || []).map((option: any, optionIndex: number) => ({
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_index: optionIndex,
          })),
        })),
      });
      toast.success('Quiz updated');
      navigate('/admin/quizzes');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to update quiz');
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (!quiz) return <div className="text-center py-20">Quiz not found</div>;

  return (
    <div>
      <Link to="/admin/quizzes" className="inline-flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900"><ArrowLeft className="w-4 h-4" />Back to Quizzes</Link>
      <div className="mb-8"><h1 className="text-3xl font-bold mb-2">Edit Quiz</h1><p className="text-gray-600">Update quiz details and questions</p></div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div><Label>Quiz Title</Label><Input value={quiz.title} onChange={(e) => setQuiz((prev: any) => ({ ...prev, title: e.target.value }))} className="mt-2" /></div>
            <div><Label>Description</Label><Textarea value={quiz.description} onChange={(e) => setQuiz((prev: any) => ({ ...prev, description: e.target.value }))} className="mt-2" rows={4} /></div>
            <div className="grid md:grid-cols-3 gap-4">
              <div><Label>Time Limit Per Attempt (seconds)</Label><Input type="number" value={quiz.time_limit} onChange={(e) => setQuiz((prev: any) => ({ ...prev, time_limit: e.target.value }))} className="mt-2" /></div>
              <div><Label>Total Quiz Points</Label><Input type="number" value={quiz.total_points} onChange={(e) => setQuiz((prev: any) => ({ ...prev, total_points: e.target.value }))} className="mt-2" /></div>
              <div><Label>Difficulty</Label><Select value={quiz.difficulty} onValueChange={(value) => setQuiz((prev: any) => ({ ...prev, difficulty: value }))}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="EASY">Easy</SelectItem><SelectItem value="MEDIUM">Medium</SelectItem><SelectItem value="HARD">Hard</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div><Label>Topic</Label><Input value={quiz.topic || ''} onChange={(e) => setQuiz((prev: any) => ({ ...prev, topic: e.target.value }))} className="mt-2" /></div>
              <div><Label>Available From</Label><Input type="datetime-local" value={quiz.available_from || ''} onChange={(e) => setQuiz((prev: any) => ({ ...prev, available_from: e.target.value }))} className="mt-2" /></div>
              <div><Label>Available Until</Label><Input type="datetime-local" value={quiz.available_until || ''} onChange={(e) => setQuiz((prev: any) => ({ ...prev, available_until: e.target.value }))} className="mt-2" /></div>
            </div>
            <div><Label>Tags</Label><div className="mt-2 flex flex-wrap gap-2">{tags.map((tag) => <Badge key={tag.id} variant={(quiz.tag_ids || []).includes(tag.id) ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => setQuiz((prev: any) => ({ ...prev, tag_ids: (prev.tag_ids || []).includes(tag.id) ? prev.tag_ids.filter((item: string) => item !== tag.id) : [...(prev.tag_ids || []), tag.id] }))}>{tag.name}</Badge>)}</div></div>
            <div className="border-t pt-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Attempt Mode</Label><Select value={quiz.attempt_mode} onValueChange={(value) => setQuiz((prev: any) => ({ ...prev, attempt_mode: value }))}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SINGLE">Single attempt</SelectItem><SelectItem value="MULTIPLE">Multiple attempts</SelectItem></SelectContent></Select></div>
                {quiz.attempt_mode === 'MULTIPLE' && <div><Label>Retry Score Mode</Label><Select value={quiz.retry_score_mode} onValueChange={(value) => setQuiz((prev: any) => ({ ...prev, retry_score_mode: value }))}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="FULL">Full points on retry</SelectItem><SelectItem value="REDUCED">Reduced points on retry</SelectItem><SelectItem value="ZERO">Zero points on retry</SelectItem></SelectContent></Select></div>}
              </div>
              {quiz.attempt_mode === 'MULTIPLE' && quiz.retry_score_mode === 'REDUCED' && (
                <div><Label>Retry Penalty Percent</Label><Input type="number" min="0" max="100" value={quiz.retry_penalty_percent} onChange={(e) => setQuiz((prev: any) => ({ ...prev, retry_penalty_percent: e.target.value }))} className="mt-2" /></div>
              )}
              {quiz.attempt_mode === 'MULTIPLE' && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="count-once">Count quiz points only once</Label>
                    <p className="text-sm text-gray-500 mt-1">Leaderboard/profile points will only count once for this quiz.</p>
                  </div>
                  <Switch id="count-once" checked={Boolean(quiz.count_points_once)} onCheckedChange={(value) => setQuiz((prev: any) => ({ ...prev, count_points_once: value }))} />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between"><Label htmlFor="reward">Reward Quiz</Label><Switch id="reward" checked={Boolean(quiz.has_reward)} onCheckedChange={(value) => setQuiz((prev: any) => ({ ...prev, has_reward: value }))} /></div>
            {quiz.has_reward && <div><Label>Reward Description</Label><Input value={quiz.reward_description || ''} onChange={(e) => setQuiz((prev: any) => ({ ...prev, reward_description: e.target.value }))} className="mt-2" /></div>}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6"><h3 className="font-semibold text-lg">Questions ({quiz.questions?.length || 0})</h3><Button onClick={() => setQuiz((prev: any) => ({ ...prev, questions: [...(prev.questions || []), createQuestion()] }))} variant="outline"><Plus className="w-4 h-4 mr-2" />Add Question</Button></div>
            <div className="space-y-6">
              {(quiz.questions || []).map((question: any, qIndex: number) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4"><h4 className="font-semibold">Question {qIndex + 1}</h4><Button variant="ghost" size="sm" onClick={() => setQuiz((prev: any) => ({ ...prev, questions: prev.questions.filter((item: any) => item.id !== question.id) }))}><X className="w-4 h-4 text-red-500" /></Button></div>
                  <div className="space-y-4">
                    <div><Label>Question Text</Label><Textarea value={question.question_text} onChange={(e) => updateQuestion(question.id, { question_text: e.target.value })} className="mt-2" rows={3} /></div>
                    <div><Label>Explanation</Label><Textarea value={question.explanation || ''} onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })} className="mt-2" rows={2} /></div>
                    <div>
                      <Label>Question Image</Label>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 ${uploadingQuestionId === question.id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <Upload className="w-4 h-4" />
                          {uploadingQuestionId === question.id ? 'Uploading...' : 'Upload Image'}
                          <input type="file" accept="image/*" className="hidden" disabled={uploadingQuestionId === question.id} onChange={(e) => uploadQuestionImage(question.id, e.target.files?.[0] || null)} />
                        </label>
                        {question.question_image_url && <Button variant="outline" size="sm" onClick={() => updateQuestion(question.id, { question_image_url: '' })}><X className="w-4 h-4 mr-2" />Remove Image</Button>}
                      </div>
                      {question.question_image_url && <div className="mt-3 overflow-hidden rounded-lg border border-gray-200"><img src={question.question_image_url} alt={`Question ${qIndex + 1}`} className="max-h-64 w-full object-contain bg-gray-50" /></div>}
                      {!question.question_image_url && <div className="mt-3 flex items-center gap-2 text-sm text-gray-500"><ImageIcon className="w-4 h-4" />No image uploaded</div>}
                    </div>
                    <RadioGroup value={String((question.options || []).findIndex((option: any) => option.is_correct))} onValueChange={(value) => setCorrectOption(question.id, Number(value))} className="space-y-2">
                      {(question.options || []).map((option: any, optIndex: number) => (
                        <div key={option.id} className="flex items-center gap-3">
                          <RadioGroupItem value={String(optIndex)} id={`${question.id}-${optIndex}`} />
                          <Input value={option.option_text} onChange={(e) => updateOptionText(question.id, option.id, e.target.value)} className="flex-1" />
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              <Button onClick={() => save(true)} className="w-full">Save & Publish</Button>
              <Button onClick={() => save(false)} variant="outline" className="w-full">Save as Draft</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
