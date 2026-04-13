import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Plus, Search, Edit, Trash2, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { toast } from 'sonner';
import { documentsService } from '../../../services/documents';
import { adaptDocument } from '../../../lib/adapters';

export default function AdminDocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDocuments = () => {
    setLoading(true);
    documentsService.getAdminDocuments({ search: search || undefined, limit: 100 })
      .then((res) => setDocuments((res.data.data || []).map(adaptDocument)))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocuments();
  }, [search]);

  const toggleDownloadPermission = async (docId: string) => {
    try {
      const res = await documentsService.toggleDownload(docId);
      setDocuments((prev) => prev.map((doc) => doc.id === docId ? { ...doc, allowDownload: res.data.allow_download } : doc));
      toast.success(res.data.allow_download ? 'Đã bật download' : 'Đã tắt download');
    } catch {
      toast.error('Không thể cập nhật quyền tải');
    }
  };

  const handleDelete = async (docId: string) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa tài liệu này? Hành động này không thể hoàn tác.');
    if (!confirmed) return;

    try {
      await documentsService.deleteDocument(docId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      toast.success('Đã xóa tài liệu');
    } catch {
      toast.error('Không thể xóa tài liệu');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Document Management</h1>
          <p className="text-gray-600">Manage all chemistry learning materials</p>
        </div>
        <Link to="/admin/documents/upload">
          <Button><Plus className="w-4 h-4 mr-2" />Upload Document</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search documents..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Downloads</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Allow Download</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={9}>Đang tải...</TableCell></TableRow>}
            {!loading && documents.length === 0 && <TableRow><TableCell colSpan={9}>Không có tài liệu</TableCell></TableRow>}
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium max-w-xs">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="line-clamp-1">{doc.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.slice(0, 2).map((tag: string) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                  </div>
                </TableCell>
                <TableCell>{doc.fileType}</TableCell>
                <TableCell>{doc.views.toLocaleString()}</TableCell>
                <TableCell>{doc.downloads.toLocaleString()}</TableCell>
                <TableCell>{new Date(doc.uploadDate).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell><Badge variant={doc.status === 'public' ? 'default' : 'secondary'}>{doc.status}</Badge></TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => toggleDownloadPermission(doc.id)}>
                    {doc.allowDownload ? 'On' : 'Off'}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/documents/${doc.id}/edit`)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
