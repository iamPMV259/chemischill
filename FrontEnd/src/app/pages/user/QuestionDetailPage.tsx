import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, ThumbsUp, MessageSquare, Send, Upload, X, CornerDownRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { communityService } from '../../../services/community';
import { adaptCommunityQuestion, adaptAnswer } from '../../../lib/adapters';
import { useAuth } from '../../contexts/AuthContext';

type ReplyDraft = {
  text: string;
  images: File[];
  previews: string[];
  submitting: boolean;
};

const emptyReplyDraft = (): ReplyDraft => ({
  text: '',
  images: [],
  previews: [],
  submitting: false,
});

const insertReplyIntoTree = (items: any[], targetId: string, reply: any): any[] =>
  items.map((item) => {
    if (item.id === targetId) {
      return { ...item, replies: [...(item.replies || []), reply] };
    }
    if (item.replies?.length) {
      return { ...item, replies: insertReplyIntoTree(item.replies, targetId, reply) };
    }
    return item;
  });

const updateAnswerInTree = (items: any[], targetId: string, updater: (item: any) => any): any[] =>
  items.map((item) => {
    if (item.id === targetId) {
      return updater(item);
    }
    if (item.replies?.length) {
      return { ...item, replies: updateAnswerInTree(item.replies, targetId, updater) };
    }
    return item;
  });

const flattenAnswers = (items: any[]): any[] =>
  items.flatMap((item) => [item, ...(item.replies?.length ? flattenAnswers(item.replies) : [])]);

const findAnswerById = (items: any[], targetId: string): any | null => {
  for (const item of items) {
    if (item.id === targetId) return item;
    if (item.replies?.length) {
      const found = findAnswerById(item.replies, targetId);
      if (found) return found;
    }
  }
  return null;
};

export default function QuestionDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [answerPage, setAnswerPage] = useState(1);
  const [answerTotalPages, setAnswerTotalPages] = useState(1);
  const [newAnswer, setNewAnswer] = useState('');
  const [answerImages, setAnswerImages] = useState<File[]>([]);
  const [answerImagePreviews, setAnswerImagePreviews] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, ReplyDraft>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAnswers = (page = answerPage) => {
    if (!id) return Promise.resolve();
    return communityService.getAnswers(id, { page, limit: 10 })
      .then((res) => {
        setAnswers((res.data.data || []).map(adaptAnswer));
        setAnswerTotalPages(res.data.pagination?.pages ?? 1);
        setAnswerPage(page);
      });
  };

  useEffect(() => {
    if (!id) return;
    Promise.all([
      communityService.getQuestion(id),
      communityService.getAnswers(id, { page: 1, limit: 10 }),
    ])
      .then(([qRes, aRes]) => {
        setQuestion(adaptCommunityQuestion(qRes.data));
        setAnswers((aRes.data.data || []).map(adaptAnswer));
        setAnswerTotalPages(aRes.data.pagination?.pages ?? 1);
        setAnswerPage(1);
      })
      .catch(() => setQuestion(null))
      .finally(() => setLoading(false));
  }, [id]);

  const updateReplyDraft = (answerId: string, updater: (draft: ReplyDraft) => ReplyDraft) => {
    setReplyDrafts((prev) => ({
      ...prev,
      [answerId]: updater(prev[answerId] || emptyReplyDraft()),
    }));
  };

  const handleImageSelection = (
    files: FileList | null,
    currentImages: File[],
    setImages: React.Dispatch<React.SetStateAction<File[]>>,
    setPreviews: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    const selected = Array.from(files || []);
    const remaining = 3 - currentImages.length;
    const toAdd = selected.slice(0, remaining);

    setImages((prev) => [...prev, ...toAdd]);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAnswerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageSelection(e.target.files, answerImages, setAnswerImages, setAnswerImagePreviews);
    e.target.value = '';
  };

  const handleReplyImageChange = (answerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const draft = replyDrafts[answerId] || emptyReplyDraft();
    const selected = Array.from(e.target.files || []);
    const remaining = 3 - draft.images.length;
    const toAdd = selected.slice(0, remaining);

    updateReplyDraft(answerId, (current) => ({
      ...current,
      images: [...current.images, ...toAdd],
    }));

    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateReplyDraft(answerId, (current) => ({
          ...current,
          previews: [...current.previews, ev.target?.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeAnswerImage = (index: number) => {
    setAnswerImages((prev) => prev.filter((_, i) => i !== index));
    setAnswerImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeReplyImage = (answerId: string, index: number) => {
    updateReplyDraft(answerId, (current) => ({
      ...current,
      images: current.images.filter((_, i) => i !== index),
      previews: current.previews.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitAnswer = async () => {
    if (!newAnswer.trim() || !id) return;
    if (!isAuthenticated) {
      toast.error('Bạn cần đăng nhập để trả lời');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', newAnswer);
      answerImages.forEach((file) => formData.append('images', file));
      await communityService.createAnswer(id, formData);
      setNewAnswer('');
      setAnswerImages([]);
      setAnswerImagePreviews([]);
      await fetchAnswers(1);
      toast.success('Câu trả lời đã được gửi!');
    } catch {
      toast.error('Không thể gửi câu trả lời');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (answerId: string) => {
    if (!id) return;
    if (!isAuthenticated) {
      toast.error('Bạn cần đăng nhập để phản hồi');
      return;
    }

    const draft = replyDrafts[answerId] || emptyReplyDraft();
    if (!draft.text.trim()) return;

    updateReplyDraft(answerId, (current) => ({ ...current, submitting: true }));
    try {
      const formData = new FormData();
      formData.append('content', draft.text);
      formData.append('reply_to_answer_id', answerId);
      draft.images.forEach((file) => formData.append('images', file));

      await communityService.createAnswer(id, formData);
      await fetchAnswers(answerPage);
      setReplyDrafts((prev) => ({ ...prev, [answerId]: emptyReplyDraft() }));
      setReplyingTo(null);
      toast.success('Đã gửi phản hồi');
    } catch {
      toast.error('Không thể gửi phản hồi');
      updateReplyDraft(answerId, (current) => ({ ...current, submitting: false }));
    }
  };

  const handleUpvote = async (answerId: string, isUpvoted: boolean, parentId?: string) => {
    if (!isAuthenticated) {
      toast.error('Bạn cần đăng nhập để upvote');
      return;
    }
    try {
      let res;
      if (isUpvoted) {
        res = await communityService.removeUpvote(answerId);
      } else {
        res = await communityService.upvoteAnswer(answerId);
      }

      setAnswers((prev) =>
        updateAnswerInTree(prev, answerId, (answer) => ({
          ...answer,
          upvotes: res.data.upvotes,
          isUpvoted: res.data.is_upvoted_by_me ?? !isUpvoted,
        }))
      );
    } catch {
      toast.error('Không thể upvote');
    }
  };

  const renderImageUploader = (
    previews: string[],
    imageCount: number,
    onRemove: (index: number) => void,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    helperText: string,
  ) => (
    <div className="mb-4">
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img src={preview} alt={`Upload ${index + 1}`} className="h-28 w-full rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
      <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 ${imageCount >= 3 ? 'cursor-not-allowed opacity-50' : ''}`}>
        <Upload className="w-4 h-4" />
        Tải ảnh lên {imageCount > 0 && `(${imageCount}/3)`}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onChange}
          disabled={imageCount >= 3}
        />
      </label>
      <p className="mt-1 text-xs text-gray-500">{helperText}</p>
    </div>
  );

  const displayAnswers = flattenAnswers(answers);
  const answerLookup = new Map(displayAnswers.map((answer) => [answer.id, answer]));
  const paginationPages = Array.from({ length: answerTotalPages }, (_, index) => index + 1);

  const renderAnswerItem = (answer: any) => {
    const draft = replyDrafts[answer.id] || emptyReplyDraft();
    const showReplyBox = replyingTo === answer.id;
    const repliedAnswer = answer.replyToAnswerId ? answerLookup.get(answer.replyToAnswerId) : null;

    return (
      <div className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <Button
              variant={answer.isUpvoted ? 'default' : 'outline'}
              size="sm"
              className="rounded-full w-10 h-10 p-0"
              onClick={() => handleUpvote(answer.id, answer.isUpvoted)}
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold">{answer.upvotes}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <img src={answer.userAvatar} alt={answer.userName} className="w-10 h-10 rounded-full" />
              <div>
                <h4 className="font-semibold">{answer.userName}</h4>
                <p className="text-xs text-gray-500">
                  {new Date(answer.postedDate).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    timeZone: 'Asia/Ho_Chi_Minh',
                  })}{' '}
                  {new Date(answer.postedDate).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: 'Asia/Ho_Chi_Minh',
                  })}
                </p>
              </div>
            </div>
            {repliedAnswer && (
              <div className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm">
                <div className="font-medium text-blue-700">
                  Trả lời @{repliedAnswer.userName}
                </div>
                <div className="mt-1 line-clamp-2 text-blue-900">
                  {repliedAnswer.content}
                </div>
              </div>
            )}
            <p className="text-gray-700 whitespace-pre-line">{answer.content}</p>
            {answer.images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {answer.images.map((img: string, i: number) => (
                  <img key={i} src={img} alt={`Answer image ${i + 1}`} className="rounded-lg w-full" />
                ))}
              </div>
            )}

            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo((prev) => (prev === answer.id ? null : answer.id))}
              >
                <CornerDownRight className="w-4 h-4 mr-2" />
                Reply
              </Button>
            </div>

            {showReplyBox && (
              <div className="mt-4 rounded-xl border border-gray-200 p-4">
                <Textarea
                  placeholder="Viết phản hồi cho câu trả lời này..."
                  value={draft.text}
                  onChange={(e) => updateReplyDraft(answer.id, (current) => ({ ...current, text: e.target.value }))}
                  rows={4}
                  className="mb-4"
                />
                {renderImageUploader(
                  draft.previews,
                  draft.images.length,
                  (index) => removeReplyImage(answer.id, index),
                  (e) => handleReplyImageChange(answer.id, e),
                  'Bạn có thể đính kèm tối đa 3 ảnh cho phản hồi.'
                )}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setReplyingTo(null)}>
                    Hủy
                  </Button>
                  <Button onClick={() => handleSubmitReply(answer.id)} disabled={!draft.text.trim() || draft.submitting}>
                    <Send className="w-4 h-4 mr-2" />
                    {draft.submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

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

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link to="/community" className="inline-flex items-center gap-2 text-gray-600 mb-8 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Back to Community
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <img src={question.userAvatar} alt={question.userName} className="w-12 h-12 rounded-full" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{question.userName}</h3>
                <span className="text-sm text-gray-500">
                  • {new Date(question.postedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{question.title}</h1>
              <p className="text-gray-700 text-lg whitespace-pre-line mb-6">{question.description}</p>

              {question.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {question.images.map((img: string, index: number) => (
                    <img key={index} src={img} alt={`Question image ${index + 1}`} className="rounded-lg w-full" />
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold">{question.answerCount} Answers</h2>
          </div>

          <div className="space-y-6">
            {displayAnswers.map((answer, index) => (
              <motion.div
                key={answer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                {renderAnswerItem(answer)}
              </motion.div>
            ))}

            {answers.length === 0 && (
              <p className="text-gray-500 text-center py-8">Chưa có câu trả lời nào. Hãy là người đầu tiên!</p>
            )}
          </div>

          {answerTotalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={answerPage === 1} onClick={() => fetchAnswers(answerPage - 1)}>
                Trước
              </Button>
              {paginationPages.map((page) => (
                <Button
                  key={page}
                  variant={page === answerPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => fetchAnswers(page)}
                >
                  {page}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={answerPage === answerTotalPages} onClick={() => fetchAnswers(answerPage + 1)}>
                Tiếp
              </Button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold mb-4">Your Answer</h3>
          <Textarea
            placeholder="Share your knowledge and help the community..."
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            rows={6}
            className="mb-4"
          />
          {renderImageUploader(
            answerImagePreviews,
            answerImages.length,
            removeAnswerImage,
            handleAnswerImageChange,
            'Bạn có thể đính kèm tối đa 3 ảnh cho câu trả lời.'
          )}
          <div className="flex justify-end">
            <Button onClick={handleSubmitAnswer} disabled={!newAnswer.trim() || submitting}>
              <Send className="w-4 h-4 mr-2" />
              {submitting ? 'Đang gửi...' : 'Submit Answer'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
