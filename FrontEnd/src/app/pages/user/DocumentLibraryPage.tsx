import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Eye, Download, Star } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { documentsService } from '../../../services/documents';
import { tagsService } from '../../../services/tags';
import { adaptDocument } from '../../../lib/adapters';
import { toast } from 'sonner';

export default function DocumentLibraryPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    tagsService.getTags().then((res) => {
      setTags(res.data.data || []);
    }).catch(() => {});
  }, []);

  const fetchDocuments = useCallback(() => {
    setLoading(true);
    documentsService.getDocuments({
      search: searchQuery || undefined,
      tag_ids: selectedTagIds.length > 0 ? selectedTagIds.join(',') : undefined,
      page,
      limit: 12,
    })
      .then((res) => {
        setDocuments((res.data.data || []).map(adaptDocument));
        setTotalPages(res.data.pagination?.pages ?? 1);
      })
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  }, [searchQuery, selectedTagIds, page]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const toggleTag = (tagId: string) => {
    setPage(1);
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleDownload = async (docId: string) => {
    try {
      const res = await documentsService.getDownloadUrl(docId);
      window.open(res.data.download_url, '_blank');
    } catch {
      toast.error('Không thể tải tài liệu');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">{t('docs.libraryTitle')}</h1>
          <p className="text-gray-600">{t('docs.librarySubtitle')}</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder={t('docs.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
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
                <Button variant="ghost" size="sm" onClick={() => { setSelectedTagIds([]); setPage(1); }} className="ml-auto text-xs">
                  Xóa Tất Cả
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
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
          <p className="text-gray-600">Tìm thấy {documents.length} tài liệu</p>
        </div>

        {/* Document Grid */}
        {loading ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy tài liệu</h3>
            <p className="text-gray-500">Thử điều chỉnh tìm kiếm hoặc bộ lọc</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                className="flex-shrink-0"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group h-full">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={doc.thumbnail}
                      alt={doc.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {doc.featured && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-orange-500 text-white text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          {t('featuredDocs.featured')}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold mb-2 line-clamp-2">{doc.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{doc.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {doc.views.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {doc.downloads.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/documents/${doc.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          {t('docs.preview')}
                        </Button>
                      </Link>
                      {doc.allowDownload !== false && (
                        <Button size="sm" className="flex-1 text-xs" onClick={() => handleDownload(doc.id)}>
                          <Download className="w-3 h-3 mr-1" />
                          {t('docs.download')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Trước
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-600">
              Trang {page} / {totalPages}
            </span>
            <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              Tiếp
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
