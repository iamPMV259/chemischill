import { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { ArrowLeft, Share2, Copy } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

export default function QuizSharePage() {
  const { id } = useParams();
  const location = useLocation();
  const shareUrl = useMemo(() => `${window.location.origin}/quizzes/${id}/result`, [id]);
  const state = location.state as any;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Đã copy link chia sẻ');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link to={`/quizzes/${id}/result`} className="inline-flex items-center gap-2 text-gray-600 mb-8 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Quay lại kết quả
      </Link>

      <Card className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <Share2 className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Chia sẻ kết quả quiz</h1>
        </div>
        <p className="text-gray-600 mb-6">
          Màn hình này hoàn thiện nút chia sẻ. Hiện backend chưa có API tạo share token, ảnh chia sẻ, hoặc trang public cho kết quả quiz.
        </p>

        <div className="rounded-xl border p-4 mb-6">
          <div className="text-sm text-gray-500 mb-2">Quiz</div>
          <div className="font-semibold">{state?.quiz?.title || `Quiz #${id}`}</div>
          {state?.submission && (
            <div className="text-sm text-gray-600 mt-2">
              Điểm: {state.submission.score}/{state.submission.total_questions}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-gray-50 p-4 text-sm break-all mb-4">{shareUrl}</div>
        <Button onClick={copyLink}>
          <Copy className="w-4 h-4 mr-2" />
          Copy link
        </Button>
      </Card>
    </div>
  );
}
