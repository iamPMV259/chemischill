import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
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

interface QuizQuestion {
  id: string;
  question_text: string;
  question_image_url?: string;
  explanation: string;
  options: { id: string; option_text: string; is_correct: boolean }[];
}

const createQuestion = (): QuizQuestion => ({
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

const toIsoOrNull = (value: string) => (value ? new Date(value).toISOString() : null);

export default function AdminCreateQuizPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [hasReward, setHasReward] = useState(false);
  const [rewardDescription, setRewardDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [timeLimit, setTimeLimit] = useState('1200');
  const [totalPoints, setTotalPoints] = useState('100');
  const [attemptMode, setAttemptMode] = useState('SINGLE');
  const [retryScoreMode, setRetryScoreMode] = useState('ZERO');
  const [retryPenaltyPercent, setRetryPenaltyPercent] = useState('50');
  const [countPointsOnce, setCountPointsOnce] = useState(true);
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [tags, setTags] = useState<any[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [uploadingQuestionId, setUploadingQuestionId] = useState<string | null>(null);

  useEffect(() => {
    tagsService.getTags().then((res) => setTags(res.data.data || [])).catch(() => {});
  }, []);

  const addQuestion = () => setQuestions((prev) => [...prev, createQuestion()]);

  const updateQuestion = (id: string, patch: Partial<QuizQuestion>) => {
    setQuestions((prev) => prev.map((question) => question.id === id ? { ...question, ...patch } : question));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions((prev) => prev.map((question) => {
      if (question.id !== questionId) return question;
      return {
        ...question,
        options: question.options.map((option, index) =>
          index === optionIndex ? { ...option, option_text: value } : option
        ),
      };
    }));
  };

  const setCorrectOption = (questionId: string, optionIndex: number) => {
    setQuestions((prev) => prev.map((question) => {
      if (question.id !== questionId) return question;
      return {
        ...question,
        options: question.options.map((option, index) => ({ ...option, is_correct: index === optionIndex })),
      };
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

  const submit = async (publish: boolean) => {
    if (!title || !description || questions.length === 0) {
      toast.error('Please fill in all required fields and add at least one question');
      return;
    }
    try {
      await quizzesService.createQuiz({
        title,
        description,
        topic: topic || null,
        time_limit: Number(timeLimit),
        difficulty,
        total_points: Number(totalPoints),
        attempt_mode: attemptMode,
        retry_score_mode: retryScoreMode,
        retry_penalty_percent: Number(retryPenaltyPercent),
        count_points_once: countPointsOnce,
        available_from: toIsoOrNull(availableFrom),
        available_until: toIsoOrNull(availableUntil),
        has_reward: hasReward,
        reward_description: hasReward ? rewardDescription : null,
        tag_ids: selectedTagIds,
        is_published: publish,
        questions: questions.map((question, questionIndex) => ({
          question_text: question.question_text,
          question_image_url: question.question_image_url || null,
          explanation: question.explanation || null,
          order_index: questionIndex,
          options: question.options.map((option, optionIndex) => ({
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_index: optionIndex,
          })),
        })),
      });
      toast.success(publish ? 'Quiz published successfully' : 'Quiz draft created successfully');
      navigate('/admin/quizzes');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to create quiz');
    }
  };

  return (
    <div>
      <Link to="/admin/quizzes" className="inline-flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />Back to Quizzes
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Quiz</h1>
        <p className="text-gray-600">Build a new chemistry quiz for the community</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div><Label htmlFor="title">Quiz Title *</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2" /></div>
            <div><Label htmlFor="description">Description *</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-2" /></div>
            <div className="grid md:grid-cols-3 gap-4">
              <div><Label>Time Limit Per Attempt (seconds)</Label><Input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} className="mt-2" /></div>
              <div><Label>Total Quiz Points</Label><Input type="number" value={totalPoints} onChange={(e) => setTotalPoints(e.target.value)} className="mt-2" /></div>
              <div><Label>Difficulty</Label><Select value={difficulty} onValueChange={setDifficulty}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="EASY">Easy</SelectItem><SelectItem value="MEDIUM">Medium</SelectItem><SelectItem value="HARD">Hard</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div><Label>Topic</Label><Input value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-2" /></div>
              <div><Label>Available From</Label><Input type="datetime-local" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} className="mt-2" /></div>
              <div><Label>Available Until</Label><Input type="datetime-local" value={availableUntil} onChange={(e) => setAvailableUntil(e.target.value)} className="mt-2" /></div>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => <Badge key={tag.id} variant={selectedTagIds.includes(tag.id) ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => setSelectedTagIds((prev) => prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id])}>{tag.name}</Badge>)}
              </div>
            </div>
            <div className="border-t pt-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Attempt Mode</Label><Select value={attemptMode} onValueChange={setAttemptMode}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SINGLE">Single attempt</SelectItem><SelectItem value="MULTIPLE">Multiple attempts</SelectItem></SelectContent></Select></div>
                {attemptMode === 'MULTIPLE' && <div><Label>Retry Score Mode</Label><Select value={retryScoreMode} onValueChange={setRetryScoreMode}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="FULL">Full points on retry</SelectItem><SelectItem value="REDUCED">Reduced points on retry</SelectItem><SelectItem value="ZERO">Zero points on retry</SelectItem></SelectContent></Select></div>}
              </div>
              {attemptMode === 'MULTIPLE' && retryScoreMode === 'REDUCED' && (
                <div>
                  <Label>Retry Penalty Percent</Label>
                  <Input type="number" min="0" max="100" value={retryPenaltyPercent} onChange={(e) => setRetryPenaltyPercent(e.target.value)} className="mt-2" />
                </div>
              )}
              {attemptMode === 'MULTIPLE' && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="count-once">Count quiz points only once</Label>
                    <p className="text-sm text-gray-500 mt-1">Leaderboard/profile points will only count once for this quiz.</p>
                  </div>
                  <Switch id="count-once" checked={countPointsOnce} onCheckedChange={setCountPointsOnce} />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-4 border-t"><div><Label htmlFor="reward">Reward Quiz</Label></div><Switch id="reward" checked={hasReward} onCheckedChange={setHasReward} /></div>
            {hasReward && <div><Label htmlFor="rewardDesc">Reward Description</Label><Input id="rewardDesc" value={rewardDescription} onChange={(e) => setRewardDescription(e.target.value)} className="mt-2" /></div>}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6"><h3 className="font-semibold text-lg">Questions ({questions.length})</h3><Button onClick={addQuestion} variant="outline"><Plus className="w-4 h-4 mr-2" />Add Question</Button></div>
            <div className="space-y-6">
              {questions.map((question, qIndex) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4"><h4 className="font-semibold">Question {qIndex + 1}</h4><Button variant="ghost" size="sm" onClick={() => setQuestions((prev) => prev.filter((item) => item.id !== question.id))}><X className="w-4 h-4 text-red-500" /></Button></div>
                  <div className="space-y-4">
                    <div><Label>Question Text</Label><Textarea value={question.question_text} onChange={(e) => updateQuestion(question.id, { question_text: e.target.value })} className="mt-2" rows={3} /></div>
                    <div><Label>Explanation</Label><Textarea value={question.explanation} onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })} className="mt-2" rows={2} /></div>
                    <div>
                      <Label>Question Image</Label>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 ${uploadingQuestionId === question.id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <Upload className="w-4 h-4" />
                          {uploadingQuestionId === question.id ? 'Uploading...' : 'Upload Image'}
                          <input type="file" accept="image/*" className="hidden" disabled={uploadingQuestionId === question.id} onChange={(e) => uploadQuestionImage(question.id, e.target.files?.[0] || null)} />
                        </label>
                        {question.question_image_url && (
                          <Button variant="outline" size="sm" onClick={() => updateQuestion(question.id, { question_image_url: '' })}>
                            <X className="w-4 h-4 mr-2" />
                            Remove Image
                          </Button>
                        )}
                      </div>
                      {question.question_image_url && (
                        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
                          <img src={question.question_image_url} alt={`Question ${qIndex + 1}`} className="max-h-64 w-full object-contain bg-gray-50" />
                        </div>
                      )}
                      {!question.question_image_url && <div className="mt-3 flex items-center gap-2 text-sm text-gray-500"><ImageIcon className="w-4 h-4" />No image uploaded</div>}
                    </div>
                    <RadioGroup value={String(question.options.findIndex((item) => item.is_correct))} onValueChange={(value) => setCorrectOption(question.id, Number(value))} className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={option.id} className="flex items-center gap-3">
                          <RadioGroupItem value={String(optIndex)} id={`${question.id}-${optIndex}`} />
                          <Input value={option.option_text} onChange={(e) => updateOption(question.id, optIndex, e.target.value)} className="flex-1" />
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
            <h3 className="font-semibold mb-4">Publishing</h3>
            <div className="space-y-3">
              <Button onClick={() => submit(true)} className="w-full">Publish Quiz</Button>
              <Button variant="outline" className="w-full" onClick={() => submit(false)}>Save as Draft</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
