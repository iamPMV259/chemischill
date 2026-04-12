import { useParams, Link } from 'react-router';
import { Download, Eye, Calendar, FileText, ArrowLeft, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { motion } from 'motion/react';
import { documents } from '../../data/mockData';
import { toast } from 'sonner';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const doc = documents.find((d) => d.id === id);

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

  const relatedDocs = documents.filter(
    (d) => d.id !== doc.id && d.tags.some((tag) => doc.tags.includes(tag))
  ).slice(0, 3);

  const handleDownload = () => {
    toast.success('Download started!');
  };

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
              {doc.tags.map((tag) => (
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
                <Button size="lg" className="flex-1" variant="outline">
                  <Eye className="w-5 h-5 mr-2" />
                  Chỉ Xem Trước
                </Button>
              )}
              <Button size="lg" variant="outline">
                <Star className="w-5 h-5 mr-2" />
                Lưu
              </Button>
            </div>
          </div>

          {/* Document Preview */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Xem Trước Tài Liệu</h2>
            <div className="bg-gray-100 rounded-xl aspect-[8.5/11] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-3" />
                <p>Khu Vực Xem Trước PDF</p>
                <p className="text-sm mt-2">Tải xuống để xem tài liệu đầy đủ</p>
              </div>
            </div>
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

          {/* Related Documents */}
          {relatedDocs.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Tài Liệu Liên Quan</h3>
              <div className="space-y-4">
                {relatedDocs.map((relDoc) => (
                  <Link key={relDoc.id} to={`/documents/${relDoc.id}`}>
                    <div className="group cursor-pointer">
                      <div className="flex gap-3">
                        <img
                          src={relDoc.thumbnail}
                          alt={relDoc.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-blue-600">
                            {relDoc.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{relDoc.downloads.toLocaleString()} downloads</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
