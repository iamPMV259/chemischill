import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { tags, quizzes, sampleQuestions } from '../../data/mockData';
import { toast } from 'sonner';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function AdminEditQuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const existing = quizzes.find((q) => q.id === id);

  // Pre-populate with existing quiz data
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [selectedTags, setSelectedTags] = useState<string[]>(existing?.tags ?? []);
  const [hasReward, setHasReward] = useState(existing?.reward ?? false);
  const [rewardDescription, setRewardDescription] = useState(existing?.rewardDescription ?? '');
  const [timeLimit, setTimeLimit] = useState(String(existing?.timeLimit ?? 20));
  const [difficulty, setDifficulty] = useState(existing?.difficulty ?? 'medium');
  // For demo, pre-populate with sample questions
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    sampleQuestions.slice(0, existing?.questionCount ?? 0).map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    }))
  );

  if (!existing) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Quiz not found</p>
        <Link to="/admin/quizzes">
          <Button variant="outline">Back to Quizzes</Button>
        </Link>
      </div>
    );
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
      },
    ]);
  };

  const removeQuestion = (qId: string) => {
    setQuestions(questions.filter((q) => q.id !== qId));
  };

  const updateQuestion = (qId: string, field: string, value: any) => {
    setQuestions(questions.map((q) => (q.id === qId ? { ...q, [field]: value } : q)));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.map((opt, i) => (i === optionIndex ? value : opt)) }
          : q
      )
    );
  };

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleSave = (publish: boolean) => {
    if (!title || !description || selectedTags.length === 0 || questions.length === 0) {
      toast.error('Please fill in all required fields and add at least one question');
      return;
    }
    toast.success(publish ? 'Quiz saved and published!' : 'Quiz saved as draft!');
    setTimeout(() => navigate('/admin/quizzes'), 1000);
  };

  return (
    <div>
      <Link to="/admin/quizzes" className="inline-flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Back to Quizzes
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Quiz</h1>
        <p className="text-gray-600">Update quiz details and questions</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Quiz Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-4">Quiz Information</h3>

            <div>
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Time Limit (minutes)</Label>
                <Input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Topic</Label>
                <Select defaultValue={existing.topic}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.filter((t) => t.category === 'topic').map((tag) => (
                      <SelectItem key={tag.id} value={tag.name}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="mt-2 p-4 border border-gray-200 rounded-lg">
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} className="px-3 py-1">
                      {tag}
                      <button type="button" onClick={() => toggleTag(tag)} className="ml-2">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.name) ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag.name)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label htmlFor="reward">Reward Quiz</Label>
                <p className="text-xs text-gray-500">Offer prizes for top performers</p>
              </div>
              <Switch id="reward" checked={hasReward} onCheckedChange={setHasReward} />
            </div>

            {hasReward && (
              <div>
                <Label htmlFor="rewardDesc">Reward Description</Label>
                <Input
                  id="rewardDesc"
                  value={rewardDescription}
                  onChange={(e) => setRewardDescription(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}
          </div>

          {/* Questions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Questions ({questions.length})</h3>
              <Button onClick={addQuestion} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            <div className="space-y-6">
              {questions.map((question, qIndex) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Question {qIndex + 1}</h4>
                    <Button variant="ghost" size="sm" onClick={() => removeQuestion(question.id)}>
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Question Text</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                        className="mt-2"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Answer Options</Label>
                      <RadioGroup
                        value={question.correctAnswer.toString()}
                        onValueChange={(value) =>
                          updateQuestion(question.id, 'correctAnswer', parseInt(value))
                        }
                        className="mt-2 space-y-2"
                      >
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-3">
                            <RadioGroupItem
                              value={optIndex.toString()}
                              id={`q${question.id}-opt${optIndex}`}
                            />
                            <Input
                              value={option}
                              onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                              className="flex-1"
                            />
                            <Label
                              htmlFor={`q${question.id}-opt${optIndex}`}
                              className="text-xs text-green-600 w-16"
                            >
                              {question.correctAnswer === optIndex && '✓ Correct'}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>Explanation</Label>
                      <Textarea
                        value={question.explanation}
                        onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                        className="mt-2"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-4">No questions yet</p>
                  <Button onClick={addQuestion}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Question
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              <Button onClick={() => handleSave(true)} className="w-full">
                Save & Publish
              </Button>
              <Button onClick={() => handleSave(false)} variant="outline" className="w-full">
                Save as Draft
              </Button>
              <Link to="/admin/quizzes">
                <Button variant="ghost" className="w-full text-red-600 hover:text-red-700">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">Quiz Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Questions</span>
                <span className="font-semibold">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold">
                  {questions.filter((q) => q.question && q.explanation).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time Limit</span>
                <span className="font-semibold">{timeLimit} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Difficulty</span>
                <span className="font-semibold capitalize">{difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Has Reward</span>
                <span className="font-semibold">{hasReward ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-900 border border-blue-200">
            <p className="font-semibold mb-1">Current Status</p>
            <p>
              This quiz is currently{' '}
              <span className={existing.status === 'published' ? 'text-green-700 font-semibold' : 'text-gray-600 font-semibold'}>
                {existing.status}
              </span>
              .
            </p>
            <p className="mt-1 text-xs">
              {existing.participants.toLocaleString()} participants have taken this quiz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
