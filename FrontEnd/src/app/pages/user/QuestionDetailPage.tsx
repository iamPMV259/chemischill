import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, ThumbsUp, MessageSquare, Send } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { motion } from 'motion/react';
import { communityQuestions } from '../../data/mockData';
import { toast } from 'sonner';

export default function QuestionDetailPage() {
  const { id } = useParams();
  const question = communityQuestions.find((q) => q.id === id);
  const [newAnswer, setNewAnswer] = useState('');

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold">Question not found</h1>
        <Link to="/community">
          <Button className="mt-4">Back to Community</Button>
        </Link>
      </div>
    );
  }

  const mockAnswers = [
    {
      id: '1',
      userId: '10',
      userName: 'Dr. Nguyễn Văn Khoa',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=expert1',
      content:
        'To calculate the cell potential, you need to use the Nernst equation. First, identify your half-reactions:\n\nAnode (oxidation): Zn → Zn²⁺ + 2e⁻ (E° = -0.76V)\nCathode (reduction): Cu²⁺ + 2e⁻ → Cu (E° = +0.34V)\n\nThe standard cell potential is: E°cell = E°cathode - E°anode = 0.34 - (-0.76) = 1.10V',
      upvotes: 12,
      postedDate: '2026-04-08',
      isUpvoted: false,
    },
    {
      id: '2',
      userId: '11',
      userName: 'Lê Thị Hương',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=expert2',
      content:
        'I had the same problem! Here\'s what helped me:\n\n1. Write out both half-reactions separately\n2. Balance electrons by finding the LCD\n3. Make sure to account for the concentration if it\'s not 1M\n4. Use the Nernst equation: E = E° - (RT/nF)ln(Q)\n\nHope this helps!',
      upvotes: 8,
      postedDate: '2026-04-09',
      isUpvoted: true,
    },
  ];

  const handleSubmitAnswer = () => {
    if (newAnswer.trim()) {
      toast.success('Answer submitted!');
      setNewAnswer('');
    }
  };

  const handleUpvote = (answerId: string) => {
    toast.success('Upvoted!');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link to="/community" className="inline-flex items-center gap-2 text-gray-600 mb-8 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Back to Community
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Question */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <img
              src={question.userAvatar}
              alt={question.userName}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{question.userName}</h3>
                <span className="text-sm text-gray-500">
                  •{' '}
                  {new Date(question.postedDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{question.title}</h1>
              <p className="text-gray-700 text-lg whitespace-pre-line mb-6">{question.description}</p>

              {question.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {question.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Question image ${index + 1}`}
                      className="rounded-lg w-full"
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold">{mockAnswers.length} Answers</h2>
          </div>

          <div className="space-y-6">
            {mockAnswers.map((answer, index) => (
              <motion.div
                key={answer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
              >
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      variant={answer.isUpvoted ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-full w-10 h-10 p-0"
                      onClick={() => handleUpvote(answer.id)}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-semibold">{answer.upvotes}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src={answer.userAvatar}
                        alt={answer.userName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold">{answer.userName}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(answer.postedDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">{answer.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Submit Answer */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold mb-4">Your Answer</h3>
          <Textarea
            placeholder="Share your knowledge and help the community..."
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            rows={6}
            className="mb-4"
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmitAnswer} disabled={!newAnswer.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Submit Answer
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
