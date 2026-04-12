import { useParams, useLocation, Link } from 'react-router';
import { Trophy, CheckCircle, XCircle, TrendingUp, Share2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { motion } from 'motion/react';
import { quizzes } from '../../data/mockData';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export default function QuizResultPage() {
  const { id } = useParams();
  const location = useLocation();
  const quiz = quizzes.find((q) => q.id === id);

  const { answers = {}, questions = [] } = location.state || {};

  const correctCount = Object.entries(answers).filter(
    ([index, answer]) => questions[parseInt(index)]?.correctAnswer === answer
  ).length;

  const totalQuestions = questions.length || 1;
  const score = Math.round((correctCount / totalQuestions) * 100);
  const passed = score >= 60;

  useEffect(() => {
    if (passed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [passed]);

  if (!quiz) {
    return <div className="max-w-4xl mx-auto px-6 py-12 text-center">Quiz not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Result Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Hoàn Thành Quiz!</h1>
          <p className="text-gray-600 mb-6">{quiz.title}</p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-blue-50 rounded-xl">
              <div className="text-4xl font-bold text-blue-600 mb-1">{score}%</div>
              <div className="text-sm text-gray-600">Điểm Của Bạn</div>
            </div>
            <div className="p-6 bg-green-50 rounded-xl">
              <div className="text-4xl font-bold text-green-600 mb-1">{correctCount}</div>
              <div className="text-sm text-gray-600">Câu Đúng</div>
            </div>
            <div className="p-6 bg-orange-50 rounded-xl">
              <div className="text-4xl font-bold text-orange-600 mb-1">
                {totalQuestions - correctCount}
              </div>
              <div className="text-sm text-gray-600">Câu Sai</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link to="/leaderboard">
              <Button variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Xem Bảng Xếp Hạng
              </Button>
            </Link>
            <Link to={`/quizzes/${id}/take`}>
              <Button>Làm Lại</Button>
            </Link>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Chia Sẻ Kết Quả
            </Button>
          </div>
        </motion.div>

        {/* Answer Explanations */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">Xem Lại Đáp Án</h2>
          {questions.map((question: any, index: number) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isCorrect ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-500">
                        Câu hỏi {index + 1}
                      </span>
                      {isCorrect ? (
                        <Badge className="bg-green-500">Đúng</Badge>
                      ) : (
                        <Badge variant="destructive">Sai</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-4">{question.question}</h3>

                    <div className="space-y-2 mb-4">
                      {question.options.map((option: string, optIndex: number) => {
                        const isUserAnswer = userAnswer === optIndex;
                        const isCorrectAnswer = question.correctAnswer === optIndex;

                        return (
                          <div
                            key={optIndex}
                            className={`p-3 rounded-lg border-2 ${
                              isCorrectAnswer
                                ? 'border-green-500 bg-green-50'
                                : isUserAnswer
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isCorrectAnswer && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span>{option}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {!isCorrect && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm font-semibold text-blue-900 mb-1">
                          Giải thích:
                        </div>
                        <div className="text-sm text-blue-700">{question.explanation}</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link to="/quizzes">
            <Button variant="outline" size="lg">
              Quay Lại Quiz
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
