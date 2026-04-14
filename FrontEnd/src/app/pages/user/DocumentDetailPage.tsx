import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router';
import { Download, Eye, Calendar, FileText, ArrowLeft, Star, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { documentsService } from '../../../services/documents';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { adaptDocument } from '../../../lib/adapters';
import { apiBaseUrl } from '../../../lib/api';
import { appEnv } from '../../../lib/env';

const getStatusLabel = (status: string, t: (key: string) => string) => {
  if (status === 'public') return t('docs.public');
  if (status === 'private') return t('docs.private');
  return t('docs.draft');
};

export default function DocumentDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      documentsService.getDocument(id),
      documentsService.incrementView(id).catch(() => {}),
    ])
      .then(([res]) => {
        setDoc(adaptDocument(res.data));
      })
      .catch(() => setDoc(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    if (!id) return;
    try {
      const res = await documentsService.getDownloadUrl(id);
      window.open(res.data.download_url, '_blank');
    } catch {
      toast.error(t('docs.downloadFailed'));
    }
  };

  const scrollToPreview = () => {
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const saveDocument = async () => {
    if (!id) return;
    if (!isAuthenticated) {
      toast.error(t('docs.loginToSave'));
      return;
    }
    try {
      await documentsService.saveDocument(id);
      toast.success(t('docs.savedSuccess'));
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || t('docs.saveFailed'));
    }
  };

  const fileType = doc?.fileType?.toUpperCase?.() ?? '';
  const rawPreviewUrl = doc?.previewUrl || doc?.fileUrl || '';
  const encodedPreviewUrl = rawPreviewUrl ? encodeURIComponent(rawPreviewUrl) : '';
  const previewMode =
    fileType === 'PDF'
      ? 'pdf'
      : fileType === 'DOC' || fileType === 'DOCX'
        ? 'office'
        : 'unsupported';
  const embeddedPreviewUrl =
    previewMode === 'pdf'
      ? `${apiBaseUrl}/documents/${id}/preview#toolbar=0&navpanes=0&scrollbar=0&view=FitH`
      : previewMode === 'office'
        ? `${appEnv.officeViewerUrl}?src=${encodedPreviewUrl}`
        : '';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold">{t('docs.documentNotFound')}</h1>
        <Link to="/documents">
          <Button className="mt-4">{t('docs.backToLibrary')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Link to="/documents" className="inline-flex items-center gap-2 text-gray-600 mb-8 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        {t('docs.backToLibrary')}
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="secondary">
                    <FileText className="w-3 h-3 mr-1" />
                    {doc.fileType}
                  </Badge>
                  {doc.featured && (
                    <Badge className="bg-orange-500">
                      <Star className="w-3 h-3 mr-1" />
                      {t('featuredDocs.featured')}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-3">{doc.title}</h1>
                <p className="text-gray-600 text-lg">{doc.description}</p>
              </div>
            </div>

            {doc.category && (
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary">
                  {language === 'vi' ? (doc.category.name_vi || doc.category.name_en) : (doc.category.name_en || doc.category.name_vi)}
                </Badge>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-6 border-b pb-6 mb-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('docs.uploadedOn')} {new Date(doc.uploadDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {doc.views.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')} {t('docs.viewsLabel')}
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                {doc.downloads.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')} {t('docs.downloadsLabel')}
              </div>
            </div>

            <div className="flex gap-3">
              {doc.allowDownload ? (
                <Button size="lg" className="flex-1" onClick={handleDownload}>
                  <Download className="w-5 h-5 mr-2" />
                  {t('docs.download')}
                </Button>
              ) : (
                <Button size="lg" className="flex-1" variant="outline" onClick={scrollToPreview}>
                  <Eye className="w-5 h-5 mr-2" />
                  {t('docs.previewOnly')}
                </Button>
              )}
              <Button size="lg" variant="outline" onClick={saveDocument}>
                <Star className="w-5 h-5 mr-2" />
                {t('docs.save')}
              </Button>
            </div>
          </div>

          <div ref={previewRef} className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">{t('docs.previewTitle')}</h2>
            {embeddedPreviewUrl ? (
              <div className="space-y-4">
                <div className="h-[900px] overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  <iframe
                    src={embeddedPreviewUrl}
                    title={`preview-${doc.title}`}
                    className="h-full w-full"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  {previewMode !== 'pdf' && rawPreviewUrl && (
                    <Button variant="outline" asChild>
                      <a href={rawPreviewUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {t('docs.openPreview')}
                      </a>
                    </Button>
                  )}
                  {doc.allowDownload && (
                    <Button onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      {t('docs.download')}
                    </Button>
                  )}
                </div>
                {previewMode === 'office' && (
                  <p className="text-sm text-gray-500">{t('docs.officePreviewHint')}</p>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-xl aspect-[8.5/11] flex items-center justify-center">
                <div className="text-center text-gray-500 max-w-md px-6">
                  <FileText className="w-16 h-16 mx-auto mb-3" />
                  <p>{t('docs.previewUnavailable')}</p>
                  <p className="text-sm mt-2">{t('docs.previewUnavailableHint')}</p>
                  {rawPreviewUrl && doc.allowDownload && (
                    <Button variant="outline" className="mt-4" asChild>
                      <a href={rawPreviewUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {t('docs.openFile')}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">{t('docs.infoTitle')}</h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-gray-500 mb-1">{t('docs.fileType')}</div>
                <div className="font-semibold">{doc.fileType}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">{t('docs.status')}</div>
                <Badge variant="secondary">{getStatusLabel(doc.status, t)}</Badge>
              </div>
              <div>
                <div className="text-gray-500 mb-1">{t('docs.uploadDate')}</div>
                <div className="font-semibold">
                  {new Date(doc.uploadDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">{t('docs.totalViews')}</div>
                <div className="font-semibold">{doc.views.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">{t('featuredDocs.downloads')}</div>
                <div className="font-semibold">{doc.downloads.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
