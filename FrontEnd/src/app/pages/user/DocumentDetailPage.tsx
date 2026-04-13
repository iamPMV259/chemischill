import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router';
import { Download, Eye, Calendar, FileText, ArrowLeft, Star, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { documentsService } from '../../../services/documents';
import { useAuth } from '../../contexts/AuthContext';
import { adaptDocument } from '../../../lib/adapters';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
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
      toast.error('Download failed. Please try again.');
    }
  };

  const scrollToPreview = () => {
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const saveDocument = async () => {
    if (!id) return;
    if (!isAuthenticated) {
      toast.error('Bạn cần đăng nhập để lưu tài liệu');
      return;
    }
    try {
      await documentsService.saveDocument(id);
      toast.success('Đã lưu tài liệu');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Không thể lưu tài liệu');
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
      ? rawPreviewUrl
      : previewMode === 'office'
        ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodedPreviewUrl}`
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
        <h1 className="text-2xl font-bold">Document not found</h1>
        <Link to="/documents">
          <Button className="mt-4">Back to Library</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Link to="/documents" className="inline-flex items-center gap-2 text-gray-600 mb-8 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Quay Lại Thư Viện
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2"
        >
          {/* Document Header */}
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
                      Featured
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-3">{doc.title}</h1>
                <p className="text-gray-600 text-lg">{doc.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {doc.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600 mb-6 pb-6 border-b">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tải lên {new Date(doc.uploadDate).toLocaleDateString('vi-VN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {doc.views.toLocaleString()} lượt xem
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                {doc.downloads.toLocaleString()} lượt tải
              </div>
            </div>

            <div className="flex gap-3">
              {doc.allowDownload ? (
                <Button size="lg" className="flex-1" onClick={handleDownload}>
                  <Download className="w-5 h-5 mr-2" />
                  Tải Xuống Tài Liệu
                </Button>
              ) : (
                <Button size="lg" className="flex-1" variant="outline" onClick={scrollToPreview}>
                  <Eye className="w-5 h-5 mr-2" />
                  Chỉ Xem Trước
                </Button>
              )}
              <Button size="lg" variant="outline" onClick={saveDocument}>
                  <Star className="w-5 h-5 mr-2" />
                  Lưu
              </Button>
            </div>
          </div>

          {/* Document Preview */}
          <div ref={previewRef} className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Xem Trước Tài Liệu</h2>
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
                  <Button variant="outline" asChild>
                    <a href={rawPreviewUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Mở Bản Xem Trước
                    </a>
                  </Button>
                  {doc.allowDownload && (
                    <Button onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Tải Xuống
                    </Button>
                  )}
                </div>
                {previewMode === 'office' && (
                  <p className="text-sm text-gray-500">
                    File Word được nhúng qua Office Web Viewer. Nếu preview lỗi, hãy mở ở tab mới hoặc tải xuống.
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-xl aspect-[8.5/11] flex items-center justify-center">
                <div className="text-center text-gray-500 max-w-md px-6">
                  <FileText className="w-16 h-16 mx-auto mb-3" />
                  <p>Định dạng này hiện chưa hỗ trợ xem trước trực tiếp.</p>
                  <p className="text-sm mt-2">Bạn có thể mở file ở tab mới hoặc tải xuống để xem đầy đủ.</p>
                  {rawPreviewUrl && (
                    <Button variant="outline" className="mt-4" asChild>
                      <a href={rawPreviewUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Mở File
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">Thông Tin Tài Liệu</h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-gray-500 mb-1">Loại File</div>
                <div className="font-semibold">{doc.fileType}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Trạng Thái</div>
                <Badge variant="secondary">{doc.status === 'public' ? 'Công khai' : doc.status === 'private' ? 'Riêng tư' : 'Nháp'}</Badge>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Ngày Tải Lên</div>
                <div className="font-semibold">
                  {new Date(doc.uploadDate).toLocaleDateString('vi-VN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Tổng Lượt Xem</div>
                <div className="font-semibold">{doc.views.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Tổng Lượt Tải</div>
                <div className="font-semibold">{doc.downloads.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
