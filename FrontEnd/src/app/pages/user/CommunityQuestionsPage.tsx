import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { MessageCircle, Search, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { motion } from 'motion/react';
import { communityService } from '../../../services/community';
import { tagsService } from '../../../services/tags';
import { adaptCommunityQuestion } from '../../../lib/adapters';

export default function CommunityQuestionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tagsService.getTags().then((res) => setTags(res.data.data || [])).catch(() => {});
  }, []);

  const fetchQuestions = useCallback(() => {
    setLoading(true);
    communityService.getQuestions({
      search: searchQuery || undefined,
      tag_ids: selectedTagIds.length > 0 ? selectedTagIds.join(',') : undefined,
      limit: 20,
    })
      .then((res) => setQuestions((res.data.data || []).map(adaptCommunityQuestion)))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [searchQuery, selectedTagIds]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-3">Câu Hỏi Cộng Đồng</h1>
            <p className="text-gray-600">Nhận trợ giúp từ chuyên gia và học viên hóa học</p>
          </div>
          <Link to="/community/ask">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <Plus className="w-5 h-5 mr-2" />
              Đặt Câu Hỏi
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Tìm kiếm câu hỏi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6"
            />
          </div>
        </div>

        {/* Tag Filters */}
        {tags.length > 0 && (
          <div className="mb-8 p-6 bg-white rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-semibold">Lọc Theo Chủ Đề</h3>
              {selectedTagIds.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedTagIds([])} className="ml-auto text-xs">
                  Xóa Tất Cả
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 8).map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTagIds.includes(tag.id) ? 'default' : 'secondary'}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">Tìm thấy {questions.length} câu hỏi</p>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link to={`/community/${question.id}`}>
                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 group">
                    <div className="flex gap-6">
                      {question.images.length > 0 && (
                        <div className="flex-shrink-0">
                          <img src={question.images[0]} alt="Question" className="w-32 h-32 rounded-lg object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                            {question.title}
                          </h3>
                          {question.answerCount > 0 && (
                            <Badge variant="secondary" className="flex-shrink-0 ml-3">
                              {question.answerCount} answers
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">{question.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {question.tags.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <img src={question.userAvatar} alt={question.userName} className="w-6 h-6 rounded-full" />
                              <span>{question.userName}</span>
                            </div>
                            <span>•</span>
                            <span>{new Date(question.postedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && questions.length === 0 && (
          <div className="text-center py-16">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy câu hỏi</h3>
            <p className="text-gray-500 mb-6">Thử điều chỉnh tìm kiếm hoặc bộ lọc</p>
            <Link to="/community/ask">
              <Button>Đặt Câu Hỏi Đầu Tiên</Button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
