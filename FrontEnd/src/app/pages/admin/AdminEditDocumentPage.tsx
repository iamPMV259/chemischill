import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';
import { categoriesService } from '../../../services/categories';
import { documentsService } from '../../../services/documents';
import { adaptDocument } from '../../../lib/adapters';

type CategoryNode = {
  id: string;
  name_vi: string;
  name_en: string;
  slug: string;
  parent_id?: string | null;
  children?: CategoryNode[];
};

const flattenTree = (nodes: CategoryNode[], depth = 0): Array<CategoryNode & { depth: number }> =>
  nodes.flatMap((node) => [{ ...node, depth }, ...flattenTree(node.children || [], depth + 1)]);

export default function AdminEditDocumentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [allowDownload, setAllowDownload] = useState(false);
  const [status, setStatus] = useState('PUBLIC');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [doc, setDoc] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      documentsService.getAdminDocument(id),
      categoriesService.getCategories(),
    ])
      .then(([docRes, categoriesRes]) => {
        const adapted = adaptDocument(docRes.data);
        setDoc(adapted);
        setTitle(adapted.title);
        setDescription(adapted.description);
        setFeatured(Boolean(docRes.data.featured));
        setAllowDownload(Boolean(docRes.data.allow_download));
        setStatus(docRes.data.status || 'PUBLIC');
        setCategoryId(docRes.data.category?.id || '');
        setCategories(categoriesRes.data.data || []);
      })
      .catch(() => setDoc(null))
      .finally(() => setLoading(false));
  }, [id]);

  const flattenedCategories = useMemo(() => flattenTree(categories), [categories]);

  const handleSave = async () => {
    if (!id || !title || !description || !categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('tag_ids', JSON.stringify([]));
      formData.append('featured', String(featured));
      formData.append('allow_download', String(allowDownload));
      formData.append('status', status);
      formData.append('category_id', categoryId);
      if (file) formData.append('file', file);
      if (thumbnail) formData.append('thumbnail', thumbnail);
      await documentsService.updateDocument(id, formData);
      toast.success('Document updated successfully');
      navigate('/admin/documents');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to update document');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm('Bạn có chắc muốn xóa tài liệu này? Hành động này không thể hoàn tác.');
    if (!confirmed) return;

    try {
      await documentsService.deleteDocument(id);
      toast.success('Đã xóa tài liệu');
      navigate('/admin/documents');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Không thể xóa tài liệu');
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (!doc) return <div className="text-center py-20">Document not found</div>;

  return (
    <div>
      <Link to="/admin/documents" className="inline-flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Back to Documents
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Document</h1>
        <p className="text-gray-600">Update document information and settings</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div>
              <Label htmlFor="title">Document Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2" />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="mt-2" />
            </div>

            <div>
              <Label>Document Tag *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Select a tag in the tree" /></SelectTrigger>
                <SelectContent>
                  {flattenedCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {'— '.repeat(category.depth)}{category.name_vi || category.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Replace File</Label>
              <Input type="file" className="mt-2" accept=".pdf,.doc,.docx,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">Publishing Options</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><Label htmlFor="featured">Featured</Label><Switch id="featured" checked={featured} onCheckedChange={setFeatured} /></div>
              <div className="flex items-center justify-between"><Label htmlFor="allowDownload">Allow Download</Label><Switch id="allowDownload" checked={allowDownload} onCheckedChange={setAllowDownload} /></div>
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">Thumbnail</h3>
            {doc.thumbnail && <img src={doc.thumbnail} alt="Thumbnail" className="w-full h-32 object-cover rounded-lg mb-3" />}
            <Input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files?.[0] || null)} />
          </div>

          <div className="space-y-3">
            <Button onClick={handleSave} className="w-full">Save Changes</Button>
            <Button onClick={handleDelete} variant="destructive" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Document
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
