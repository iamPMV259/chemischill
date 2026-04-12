import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { tags } from '../../data/mockData';
import { toast } from 'sonner';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function AdminCreateQuizPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hasReward, setHasReward] = useState(false);
  const [rewardDescription, setRewardDescription] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

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

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
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

  const handlePublish = () => {
    if (!title || !description || selectedTags.length === 0 || questions.length === 0) {
      toast.error('Please fill in all required fields and add at least one question');
      return;
    }
    toast.success('Quiz published successfully!');
    setTimeout(() => navigate('/admin/quizzes'), 1000);
  };

  return (
    <div>
      <Link to="/admin/quizzes" className="inline-flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Back to Quizzes
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Quiz</h1>
        <p className="text-gray-600">Build a new chemistry quiz for the community</p>
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
                placeholder="e.g., 15-Question Quiz: Basic Ester Theory"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what this quiz covers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Time Limit (minutes)</Label>
                <Input type="number" placeholder="20" className="mt-2" />
              </div>

              <div>
                <Label>Difficulty</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select" />
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
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select" />
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

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label htmlFor="reward">Reward Quiz</Label>
                <p className="text-xs text-gray-500">Offer prizes for top performers</p>
              </div>
              <Switch
                id="reward"
                checked={hasReward}
                onCheckedChange={setHasReward}
              />
            </div>

            {hasReward && (
              <div>
                <Label htmlFor="rewardDesc">Reward Description</Label>
                <Input
                  id="rewardDesc"
                  placeholder="e.g., Top 3 winners receive exclusive study materials"
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Question Text</Label>
                      <Textarea
                        placeholder="Enter your question..."
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
                            <RadioGroupItem value={optIndex.toString()} id={`q${question.id}-opt${optIndex}`} />
                            <Input
                              placeholder={`Option ${optIndex + 1}`}
                              value={option}
                              onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                              className="flex-1"
                            />
                            <Label htmlFor={`q${question.id}-opt${optIndex}`} className="text-xs text-gray-500">
                              {question.correctAnswer === optIndex && '✓ Correct'}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>Explanation</Label>
                      <Textarea
                        placeholder="Explain the correct answer..."
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
                  <p className="mb-4">No questions added yet</p>
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
            <h3 className="font-semibold mb-4">Publishing</h3>
            <div className="space-y-3">
              <Button onClick={handlePublish} className="w-full">
                Publish Quiz
              </Button>
              <Button variant="outline" className="w-full">
                Save as Draft
              </Button>
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
                <span className="text-gray-600">Has Reward</span>
                <span className="font-semibold">{hasReward ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
