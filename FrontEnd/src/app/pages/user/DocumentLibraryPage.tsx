import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Eye, Download, Star, ChevronDown, ChevronRight, FolderTree } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { documentsService } from '../../../services/documents';
import { tagsService } from '../../../services/tags';
import { categoriesService } from '../../../services/categories';
import { adaptDocument } from '../../../lib/adapters';
import { toast } from 'sonner';

type ApiTag = {
  id: string;
  name: string;
  name_vi?: string;
  name_en?: string;
  category: string;
};

type ApiCategory = {
  id: string;
  name_vi: string;
  name_en: string;
  slug: string;
  parent_id?: string | null;
  children?: ApiCategory[];
};

type TreeNode = {
  key: string;
  id?: string;
  slug?: string;
  labelKey?: string;
  name_vi?: string;
  name_en?: string;
  children: TreeNode[];
};

const STATIC_GRADE_NODES = [
  { key: 'grade-6', labelKey: 'docs.grade6' },
  { key: 'grade-7', labelKey: 'docs.grade7' },
  { key: 'grade-8', labelKey: 'docs.grade8' },
  { key: 'grade-9', labelKey: 'docs.grade9' },
  { key: 'grade-10', labelKey: 'docs.grade10' },
  { key: 'grade-11', labelKey: 'docs.grade11' },
  { key: 'grade-12', labelKey: 'docs.grade12' },
] as const;

const STATIC_ADVANCED_NODES = [
  { key: 'inorganic', labelKey: 'docs.inorganicChemistry' },
  { key: 'organic', labelKey: 'docs.organicChemistry' },
] as const;

const normalize = (value?: string | null) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const isGradeCategory = (category: ApiCategory, grade: string) => {
  const haystack = [category.slug, category.name_vi, category.name_en].map(normalize).join(' ');
  return haystack.includes(`lop ${grade}`) || haystack.includes(`lop-${grade}`) || haystack.includes(`grade ${grade}`) || haystack.includes(`grade-${grade}`);
};

const isOrganicCategory = (category: ApiCategory) => {
  const haystack = [category.slug, category.name_vi, category.name_en].map(normalize).join(' ');
  return haystack.includes('huu co') || haystack.includes('organic');
};

const isInorganicCategory = (category: ApiCategory) => {
  const haystack = [category.slug, category.name_vi, category.name_en].map(normalize).join(' ');
  return haystack.includes('vo co') || haystack.includes('inorganic');
};

const isGeneralRootCategory = (category: ApiCategory) => {
  const haystack = [category.slug, category.name_vi, category.name_en].map(normalize).join(' ');
  return haystack.includes('pho thong') || haystack.includes('general chemistry');
};

const isAdvancedRootCategory = (category: ApiCategory) => {
  const haystack = [category.slug, category.name_vi, category.name_en].map(normalize).join(' ');
  return haystack.includes('hoa chuyen') || haystack.includes('advanced chemistry') || haystack.includes('specialized');
};

const localizeTag = (tag: ApiTag, language: 'vi' | 'en') =>
  language === 'vi' ? (tag.name_vi || tag.name) : (tag.name_en || tag.name);

const localizeCategory = (category: Pick<ApiCategory, 'name_vi' | 'name_en'>, language: 'vi' | 'en') =>
  language === 'vi' ? category.name_vi : category.name_en;

const toDynamicTreeNode = (category: ApiCategory): TreeNode => ({
  key: category.id,
  id: category.id,
  slug: category.slug,
  name_vi: category.name_vi,
  name_en: category.name_en,
  children: (category.children || []).map(toDynamicTreeNode),
});

const collectNodeKeys = (nodes: TreeNode[]): string[] =>
  nodes.flatMap((node) => [node.key, ...collectNodeKeys(node.children)]);

function CategoryTree({
  nodes,
  expandedKeys,
  onToggleExpand,
  onSelect,
  selectedCategoryId,
  t,
  language,
}: {
  nodes: TreeNode[];
  expandedKeys: Set<string>;
  onToggleExpand: (key: string) => void;
  onSelect: (node: TreeNode) => void;
  selectedCategoryId: string | null;
  t: (key: string) => string;
  language: 'vi' | 'en';
}) {
  return (
    <div className="space-y-2">
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const isExpanded = expandedKeys.has(node.key);
        const label = node.labelKey ? t(node.labelKey) : localizeCategory(node as ApiCategory, language);
        const isSelected = Boolean(node.id && node.id === selectedCategoryId);

        return (
          <div key={node.key}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => hasChildren && onToggleExpand(node.key)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                disabled={!hasChildren}
              >
                {hasChildren ? (
                  isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                ) : (
                  <span className="h-4 w-4 rounded-full bg-gray-200" />
                )}
              </button>
              <button
                type="button"
                onClick={() => onSelect(node)}
                className={`flex-1 rounded-lg px-3 py-2 text-left text-sm transition ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {label}
              </button>
            </div>
            {hasChildren && isExpanded && (
              <div className="ml-5 mt-2 border-l border-gray-200 pl-3">
                <CategoryTree
                  nodes={node.children}
                  expandedKeys={expandedKeys}
                  onToggleExpand={onToggleExpand}
                  onSelect={onSelect}
                  selectedCategoryId={selectedCategoryId}
                  t={t}
                  language={language}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DocumentLibraryPage() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [tags, setTags] = useState<ApiTag[]>([]);
  const [categoryTree, setCategoryTree] = useState<TreeNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(['general-root', 'advanced-root']));
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadCategoryBranch = useCallback(async (parentId: string): Promise<ApiCategory[]> => {
    const res = await categoriesService.getCategories({ parent_id: parentId });
    const items = (res.data.data || []) as ApiCategory[];

    return Promise.all(
      items.map(async (item) => ({
        ...item,
        children: await loadCategoryBranch(item.id),
      })),
    );
  }, []);

  const buildTree = useCallback((categories: ApiCategory[]) => {
    const generalRoot = categories.find(isGeneralRootCategory);
    const advancedRoot = categories.find(isAdvancedRootCategory);

    const generalChildrenPool = generalRoot?.children?.length ? generalRoot.children : categories.filter((item) => isGradeCategory(item, '6') || isGradeCategory(item, '7') || isGradeCategory(item, '8') || isGradeCategory(item, '9') || isGradeCategory(item, '10') || isGradeCategory(item, '11') || isGradeCategory(item, '12'));
    const advancedChildrenPool = advancedRoot?.children?.length ? advancedRoot.children : categories.filter((item) => isOrganicCategory(item) || isInorganicCategory(item));

    const matchedGeneralIds = new Set<string>();
    const matchedAdvancedIds = new Set<string>();

    const generalChildren = STATIC_GRADE_NODES.map(({ key, labelKey }) => {
      const grade = key.replace('grade-', '');
      const match = generalChildrenPool.find((item) => isGradeCategory(item, grade));
      if (match) matchedGeneralIds.add(match.id);

      return {
        key,
        id: match?.id,
        slug: match?.slug,
        labelKey,
        children: match?.children?.map(toDynamicTreeNode) || [],
      } satisfies TreeNode;
    });

    const advancedChildren = STATIC_ADVANCED_NODES.map(({ key, labelKey }) => {
      const match = advancedChildrenPool.find((item) => (key === 'organic' ? isOrganicCategory(item) : isInorganicCategory(item)));
      if (match) matchedAdvancedIds.add(match.id);

      return {
        key,
        id: match?.id,
        slug: match?.slug,
        labelKey,
        children: match?.children?.map(toDynamicTreeNode) || [],
      } satisfies TreeNode;
    });

    const extraGeneralChildren = (generalRoot?.children || []).filter((item) => !matchedGeneralIds.has(item.id)).map(toDynamicTreeNode);
    const extraAdvancedChildren = (advancedRoot?.children || []).filter((item) => !matchedAdvancedIds.has(item.id)).map(toDynamicTreeNode);

    const tree: TreeNode[] = [
      {
        key: 'general-root',
        id: generalRoot?.id,
        slug: generalRoot?.slug,
        labelKey: 'docs.generalChemistry',
        children: [...generalChildren, ...extraGeneralChildren],
      },
      {
        key: 'advanced-root',
        id: advancedRoot?.id,
        slug: advancedRoot?.slug,
        labelKey: 'docs.advancedChemistry',
        children: [...advancedChildren, ...extraAdvancedChildren],
      },
    ];

    setExpandedKeys(new Set(collectNodeKeys(tree).filter((key) => key === 'general-root' || key === 'advanced-root')));
    setCategoryTree(tree);
  }, []);

  useEffect(() => {
    Promise.all([
      tagsService.getTags(),
      categoriesService.getCategories(),
    ])
      .then(async ([tagsRes, categoriesRes]) => {
        setTags((tagsRes.data.data || []) as ApiTag[]);
        const topCategories = (categoriesRes.data.data || []) as ApiCategory[];
        const fullCategories = await Promise.all(
          topCategories.map(async (category) => ({
            ...category,
            children: await loadCategoryBranch(category.id),
          })),
        );
        buildTree(fullCategories);
      })
      .catch(() => {
        setTags([]);
        setCategoryTree([
          {
            key: 'general-root',
            labelKey: 'docs.generalChemistry',
            children: STATIC_GRADE_NODES.map((node) => ({ key: node.key, labelKey: node.labelKey, children: [] })),
          },
          {
            key: 'advanced-root',
            labelKey: 'docs.advancedChemistry',
            children: STATIC_ADVANCED_NODES.map((node) => ({ key: node.key, labelKey: node.labelKey, children: [] })),
          },
        ]);
      });
  }, [buildTree, loadCategoryBranch]);

  const fetchDocuments = useCallback(() => {
    setLoading(true);
    documentsService.getDocuments({
      search: searchQuery || undefined,
      tag_ids: selectedTagIds.length > 0 ? selectedTagIds.join(',') : undefined,
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
  }, [page, searchQuery, selectedCategoryId, selectedTagIds]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const toggleTag = (tagId: string) => {
    setPage(1);
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectCategory = (node: TreeNode) => {
    setPage(1);
    setSelectedCategoryId((prev) => (prev === node.id ? null : (node.id || null)));
    if (node.children.length > 0) {
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        next.add(node.key);
        return next;
      });
    }
  };

  const handleDownload = async (docId: string) => {
    try {
      const res = await documentsService.getDownloadUrl(docId);
      window.open(res.data.download_url, '_blank');
    } catch {
      toast.error(t('docs.downloadFailed'));
    }
  };

  const sortedTags = useMemo(
    () => [...tags].sort((a, b) => localizeTag(a, language).localeCompare(localizeTag(b, language))),
    [language, tags],
  );

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

        <div className="mb-8 grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <FolderTree className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">{t('docs.filterTreeTitle')}</h3>
                {(selectedCategoryId || selectedTagIds.length > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategoryId(null);
                      setSelectedTagIds([]);
                      setPage(1);
                    }}
                    className="ml-auto text-xs"
                  >
                    {t('docs.clearAll')}
                  </Button>
                )}
              </div>
              <CategoryTree
                nodes={categoryTree}
                expandedKeys={expandedKeys}
                onToggleExpand={toggleExpand}
                onSelect={selectCategory}
                selectedCategoryId={selectedCategoryId}
                t={t}
                language={language}
              />
            </div>

            {sortedTags.length > 0 && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-semibold">{t('docs.filterByTag')}</h3>
                <div className="flex flex-wrap gap-2">
                  {sortedTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTagIds.includes(tag.id) ? 'default' : 'secondary'}
                      className="cursor-pointer px-4 py-2 hover:bg-blue-100"
                      onClick={() => toggleTag(tag.id)}
                    >
                      {localizeTag(tag, language)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
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
          </div>
        </div>
      </motion.div>
    </div>
  );
}
