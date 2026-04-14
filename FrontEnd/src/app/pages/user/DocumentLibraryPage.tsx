import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Eye, Download, Star, ChevronRight } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { documentsService } from '../../../services/documents';
import { categoriesService } from '../../../services/categories';
import { adaptDocument } from '../../../lib/adapters';
import { toast } from 'sonner';

type ApiCategory = {
  id: string;
  name_vi: string;
  name_en: string;
  slug: string;
  parent_id?: string | null;
  children?: ApiCategory[];
};

const normalize = (value?: string | null) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const localizeCategory = (category: Pick<ApiCategory, 'name_vi' | 'name_en'>, language: 'vi' | 'en') =>
  language === 'vi' ? category.name_vi : category.name_en;

const isGeneralRootCategory = (category: ApiCategory) => {
  const haystack = [category.slug, category.name_vi, category.name_en].map(normalize).join(' ');
  return haystack.includes('hoa thuong') || haystack.includes('general chemistry');
};

const isAdvancedRootCategory = (category: ApiCategory) => {
  const haystack = [category.slug, category.name_vi, category.name_en].map(normalize).join(' ');
  return haystack.includes('hoa chuyen') || haystack.includes('specialized chemistry');
};

export default function DocumentLibraryPage() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [roots, setRoots] = useState<{ general: ApiCategory | null; advanced: ApiCategory | null }>({ general: null, advanced: null });
  const [selectedPath, setSelectedPath] = useState<ApiCategory[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    categoriesService.getCategories()
      .then((res) => {
        const categories = (res.data.data || []) as ApiCategory[];
        setRoots({
          general: categories.find(isGeneralRootCategory) || null,
          advanced: categories.find(isAdvancedRootCategory) || null,
        });
      })
      .catch(() => setRoots({ general: null, advanced: null }));
  }, []);

  const selectedCategoryId = selectedPath[selectedPath.length - 1]?.id || null;

  const fetchDocuments = useCallback(() => {
    setLoading(true);
    documentsService.getDocuments({
      search: searchQuery || undefined,
      category_id: selectedCategoryId || undefined,
      page,
      limit: 12,
    })
      .then((res) => {
        setDocuments((res.data.data || []).map(adaptDocument));
        setTotalPages(res.data.pagination?.pages ?? 1);
      })
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  }, [page, searchQuery, selectedCategoryId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDownload = async (docId: string) => {
    try {
      const res = await documentsService.getDownloadUrl(docId);
      window.open(res.data.download_url, '_blank');
    } catch {
      toast.error(t('docs.downloadFailed'));
    }
  };

  const currentChildren = useMemo(() => {
    if (selectedPath.length === 0) return [];
    return selectedPath[selectedPath.length - 1].children || [];
  }, [selectedPath]);

  const selectRoot = (root: ApiCategory | null) => {
    setPage(1);
    setSelectedPath(root ? [root] : []);
  };

  const selectChild = (category: ApiCategory, level: number) => {
    setPage(1);
    setSelectedPath((prev) => [...prev.slice(0, level), category]);
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

        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder={t('docs.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-12 pr-4 py-6"
            />
          </div>
        </div>

        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant={selectedPath[0]?.id === roots.general?.id ? 'default' : 'outline'}
              onClick={() => selectRoot(roots.general)}
              disabled={!roots.general}
            >
              {t('docs.generalChemistry')}
            </Button>
            <Button
              variant={selectedPath[0]?.id === roots.advanced?.id ? 'default' : 'outline'}
              onClick={() => selectRoot(roots.advanced)}
              disabled={!roots.advanced}
            >
              {t('docs.advancedChemistry')}
            </Button>
            {selectedPath.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => { setSelectedPath([]); setPage(1); }} className="ml-auto">
                {t('docs.clearAll')}
              </Button>
            )}
          </div>

          {selectedPath.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              {selectedPath.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 ${index === selectedPath.length - 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => {
                      setPage(1);
                      setSelectedPath((prev) => prev.slice(0, index + 1));
                    }}
                  >
                    {localizeCategory(item, language)}
                  </button>
                  {index < selectedPath.length - 1 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                </div>
              ))}
            </div>
          )}

          {currentChildren.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentChildren.map((child) => (
                <Badge
                  key={child.id}
                  variant={selectedCategoryId === child.id ? 'default' : 'secondary'}
                  className="cursor-pointer px-4 py-2 hover:bg-blue-100"
                  onClick={() => selectChild(child, selectedPath.length)}
                >
                  {localizeCategory(child, language)}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            {t('docs.found')} {documents.length} {t('docs.documents')}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-xl bg-white py-16 text-center shadow-sm">
            <h3 className="mb-2 text-xl font-semibold text-gray-700">{t('docs.noDocumentsFound')}</h3>
            <p className="text-gray-500">{t('docs.tryAdjustFilters')}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {documents.map((doc: any, index: number) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                className="flex-shrink-0"
              >
                <div className="group h-full overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={doc.thumbnail}
                      alt={doc.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
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
                    <h4 className="mb-2 line-clamp-2 font-semibold">{doc.title}</h4>
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600">{doc.description}</p>
                    <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
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

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              {t('docs.previous')}
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-600">
              {t('docs.page')} {page} / {totalPages}
            </span>
            <Button variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              {t('docs.next')}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
