import { useParams, useLocation, Link } from 'react-router';
import { Trophy, CheckCircle, XCircle, TrendingUp, Share2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export default function QuizResultPage() {
  const { id } = useParams();
  const location = useLocation();

  // State from QuizTakingPage: { quiz, submission, selectedAnswers }
  const { quiz, submission, selectedAnswers = {} } = location.state || {};

  const score = submission?.score ?? 0;
  const awardedPoints = submission?.awarded_points ?? 0;
  const totalPoints = submission?.total_points ?? quiz?.totalPoints ?? 0;
  const totalQuestions = submission?.total_questions ?? 1;
  const scorePercent = Math.round((score / totalQuestions) * 100);
  const passed = scorePercent >= 60;

  // Build a map of question_id → is_correct from submission answers
  const submissionAnswerMap: Record<string, boolean> = {};
  (submission?.answers ?? []).forEach((a: any) => {
    submissionAnswerMap[a.question_id] = a.is_correct;
  });

  useEffect(() => {
    if (passed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [passed]);

  if (!quiz || !submission) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-gray-500 mb-4">Kết quả không khả dụng</p>
        <Link to="/quizzes">
          <Button>Quay Lại Quiz</Button>
        </Link>
      </div>
    );
  }

  const questions = quiz.questions || [];

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
              <div className="text-4xl font-bold text-blue-600 mb-1">{scorePercent}%</div>
              <div className="text-sm text-gray-600">Tỉ Lệ Đúng</div>
            </div>
            <div className="p-6 bg-green-50 rounded-xl">
              <div className="text-4xl font-bold text-green-600 mb-1">{score}</div>
              <div className="text-sm text-gray-600">Câu Đúng</div>
            </div>
            <div className="p-6 bg-orange-50 rounded-xl">
              <div className="text-4xl font-bold text-orange-600 mb-1">{awardedPoints}</div>
              <div className="text-sm text-gray-600">Điểm Nhận Được{totalPoints ? ` / ${totalPoints}` : ''}</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link to="/leaderboard">
              <Button variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Xem Bảng Xếp Hạng
              </Button>
            </Link>
            {quiz?.attemptMode === 'MULTIPLE' && (
              <Link to={`/quizzes/${id}/take`}>
                <Button>Làm Lại</Button>
              </Link>
            )}
            <Link to={`/quizzes/${id}/share`} state={{ quiz, submission, selectedAnswers }}>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Chia Sẻ Kết Quả
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Answer Review */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">Xem Lại Đáp Án</h2>
          {questions.map((question: any, index: number) => {
            const isCorrect = submissionAnswerMap[question.id] ?? false;
            const userOptionId = selectedAnswers[question.id];
            const userOption = (question.options || []).find((o: any) => o.id === userOptionId);

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-500">Câu hỏi {index + 1}</span>
                      {isCorrect ? (
                        <Badge className="bg-green-500">Đúng</Badge>
                      ) : (
                        <Badge variant="destructive">Sai</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-4">{question.question_text}</h3>

                    <div className="space-y-2 mb-4">
                      {(question.options || []).map((option: any) => {
                        const isUserAnswer = option.id === userOptionId;
                        return (
                          <div
                            key={option.id}
                            className={`p-3 rounded-lg border-2 ${
                              isUserAnswer && isCorrect
                                ? 'border-green-500 bg-green-50'
                                : isUserAnswer && !isCorrect
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isUserAnswer && isCorrect && <CheckCircle className="w-4 h-4 text-green-600" />}
                              {isUserAnswer && !isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                              <span>{option.option_text}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {!isCorrect && question.explanation && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm font-semibold text-blue-900 mb-1">Giải thích:</div>
                        <div className="text-sm text-blue-700">{question.explanation}</div>
                      </div>
                    )}

                    {!isCorrect && !userOption && (
                      <p className="text-sm text-gray-500 italic">Bạn chưa trả lời câu này</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link to="/quizzes">
            <Button variant="outline" size="lg">Quay Lại Quiz</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
