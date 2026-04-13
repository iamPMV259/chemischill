import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { motion } from 'motion/react';
import { quizzesService } from '../../../services/quizzes';
import { adaptQuiz } from '../../../lib/adapters';
import { toast } from 'sonner';

export default function QuizTakingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // { [questionId]: optionId }
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!id) return;
    quizzesService.getQuiz(id)
      .then((res) => {
        const adapted = adaptQuiz(res.data);
        setQuiz(adapted);
        setTimeRemaining(res.data.time_limit); // seconds
        startTimeRef.current = Date.now();
      })
      .catch(() => toast.error('Failed to load quiz'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!quiz) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quiz]);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-6 py-12 text-center animate-pulse">Đang tải quiz...</div>;
  }

  if (!quiz) {
    return <div className="max-w-4xl mx-auto px-6 py-12 text-center">Quiz not found</div>;
  }

  const questions = quiz.questions || [];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionId: string) => {
    const q = questions[currentQuestion];
    setSelectedAnswers({ ...selectedAnswers, [q.id]: optionId });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    const answers = questions.map((q: any) => ({
      question_id: q.id,
      selected_option_id: selectedAnswers[q.id] ?? null,
    }));

    try {
      const res = await quizzesService.submitQuiz(id, { answers, time_taken_secs: timeTaken });
      navigate(`/quizzes/${id}/result`, {
        state: { quiz, submission: res.data, selectedAnswers },
      });
    } catch {
      toast.error('Failed to submit quiz');
    }
  };

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Quiz Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{quiz.title}</h2>
              <p className="text-gray-600">
                Câu {currentQuestion + 1} / {questions.length}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-2xl font-bold text-blue-600">
                <Clock className="w-6 h-6" />
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-gray-500">Thời Gian Còn Lại</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        {question && (
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-6"
          >
            <div className="mb-8">
              <div className="text-sm text-gray-500 mb-3">Câu hỏi {currentQuestion + 1}</div>
              <h3 className="text-xl font-semibold mb-6">{question.question_text}</h3>
              {question.question_image_url && (
                <img src={question.question_image_url} alt="Question" className="mb-4 rounded-lg max-h-64 object-contain" />
              )}
            </div>

            <div className="space-y-3">
              {(question.options || []).map((option: any) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectAnswer(option.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAnswers[question.id] === option.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswers[question.id] === option.id
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedAnswers[question.id] === option.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="flex-1">{option.option_text}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Trước
          </Button>

          <div className="flex gap-2">
            {currentQuestion === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                Nộp Bài
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Tiếp
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigation Grid */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h4 className="font-semibold mb-4">Điều Hướng Câu Hỏi</h4>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((q: any, index: number) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(index)}
                className={`aspect-square rounded-lg text-sm font-semibold ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : selectedAnswers[q.id] !== undefined
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded" />
              <span>Đã trả lời</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded" />
              <span>Chưa trả lời</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded" />
              <span>Hiện tại</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
