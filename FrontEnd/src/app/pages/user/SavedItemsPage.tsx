import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Bookmark, Download, Eye } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { documentsService } from '../../../services/documents';
import { usersService } from '../../../services/users';
import { adaptDocument } from '../../../lib/adapters';
import { toast } from 'sonner';

export default function SavedItemsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersService.getSavedDocuments()
      .then((res) => setDocuments((res.data.data || []).map(adaptDocument)))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  }, []);

  const removeSaved = async (id: string) => {
    try {
      await documentsService.unsaveDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      toast.success('Đã bỏ lưu tài liệu');
    } catch {
      toast.error('Không thể bỏ lưu tài liệu');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <Link to="/documents" className="inline-flex items-center gap-2 text-gray-600 mb-8 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Quay lại tài liệu
      </Link>

      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Tài liệu đã lưu</h1>
        </div>

        {loading ? (
          <div>Đang tải...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 mb-6">Bạn chưa lưu tài liệu nào.</p>
            <Link to="/documents">
              <Button>Xem thư viện tài liệu</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border rounded-xl p-4 flex items-center gap-4">
                <img src={doc.thumbnail} alt={doc.title} className="w-24 h-24 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{doc.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{doc.description}</p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/documents/${doc.id}`}>
                    <Button variant="outline"><Eye className="w-4 h-4 mr-2" />Xem</Button>
                  </Link>
                  <Button variant="outline" onClick={() => removeSaved(doc.id)}><Bookmark className="w-4 h-4 mr-2" />Bỏ lưu</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
