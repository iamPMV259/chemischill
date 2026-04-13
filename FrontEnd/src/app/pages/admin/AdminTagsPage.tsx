import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Plus, Edit, Trash2, Tag as TagIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';
import { tagsService } from '../../../services/tags';

type TagCategory = 'topic' | 'grade' | 'difficulty';

type TagFormState = {
  name: string;
  nameVi: string;
  category: TagCategory;
};

const defaultForm: TagFormState = {
  name: '',
  nameVi: '',
  category: 'topic',
};

export default function AdminTagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<TagFormState>(defaultForm);
  const [editForm, setEditForm] = useState<TagFormState>(defaultForm);
  const [selectedTag, setSelectedTag] = useState<any>(null);

  const fetchTags = () => {
    tagsService.getTags().then((res) => setTags(res.data.data || [])).catch(() => setTags([]));
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreateTag = async () => {
    if (!createForm.name.trim() || !createForm.nameVi.trim()) {
      return toast.error('Vui lòng nhập tên tiếng Anh và tiếng Việt');
    }
    try {
      await tagsService.createTag({
        name: createForm.name.trim(),
        name_vi: createForm.nameVi.trim(),
        category: createForm.category.toUpperCase(),
      });
      toast.success('Tạo thẻ thành công');
      setCreateForm(defaultForm);
      setIsCreateDialogOpen(false);
      fetchTags();
    } catch {
      toast.error('Không thể tạo thẻ');
    }
  };

  const handleDeleteTag = async (id: string) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa thẻ này?');
    if (!confirmed) return;

    try {
      await tagsService.deleteTag(id);
      toast.success('Đã xóa thẻ');
      fetchTags();
    } catch {
      toast.error('Không thể xóa thẻ');
    }
  };

  const openEditDialog = (tag: any) => {
    setSelectedTag(tag);
    setEditForm({
      name: tag.name_en || tag.name || '',
      nameVi: tag.name_vi || tag.name || '',
      category: tag.category.toLowerCase(),
    });
    setIsEditDialogOpen(true);
  };

  const handleEditTag = async () => {
    if (!selectedTag) return;
    if (!editForm.name.trim() || !editForm.nameVi.trim()) {
      return toast.error('Vui lòng nhập tên tiếng Anh và tiếng Việt');
    }
    try {
      await tagsService.updateTag(selectedTag.id, {
        name: editForm.name.trim(),
        name_vi: editForm.nameVi.trim(),
        category: editForm.category.toUpperCase(),
      });
      toast.success('Cập nhật thẻ thành công');
      setIsEditDialogOpen(false);
      setSelectedTag(null);
      fetchTags();
    } catch {
      toast.error('Không thể cập nhật thẻ');
    }
  };

  const groupedTags = {
    topic: tags.filter((t) => t.category.toLowerCase() === 'topic'),
    grade: tags.filter((t) => t.category.toLowerCase() === 'grade'),
    difficulty: tags.filter((t) => t.category.toLowerCase() === 'difficulty'),
  };

  const renderForm = (
    form: TagFormState,
    setForm: Dispatch<SetStateAction<TagFormState>>,
    submitLabel: string,
    onSubmit: () => void,
  ) => (
    <div className="space-y-4 pt-4">
      <div>
        <Label htmlFor="tag-name-en">Tên tiếng Anh</Label>
        <Input
          id="tag-name-en"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="tag-name-vi">Tên tiếng Việt</Label>
        <Input
          id="tag-name-vi"
          value={form.nameVi}
          onChange={(e) => setForm((prev) => ({ ...prev, nameVi: e.target.value }))}
          className="mt-2"
        />
      </div>
      <div>
        <Label>Nhóm thẻ</Label>
        <Select value={form.category} onValueChange={(value: TagCategory) => setForm((prev) => ({ ...prev, category: value }))}>
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="topic">Topic</SelectItem>
            <SelectItem value="grade">Grade</SelectItem>
            <SelectItem value="difficulty">Difficulty</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onSubmit} className="w-full">{submitLabel}</Button>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tag Management</h1>
          <p className="text-gray-600">Quản lý thẻ với cả tên tiếng Anh và tiếng Việt</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Create Tag</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
            </DialogHeader>
            {renderForm(createForm, setCreateForm, 'Create Tag', handleCreateTag)}
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          {renderForm(editForm, setEditForm, 'Save Changes', handleEditTag)}
        </DialogContent>
      </Dialog>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-2"><TagIcon className="w-6 h-6 text-blue-600" /><span className="font-semibold">Topic Tags</span></div>
          <div className="text-3xl font-bold text-blue-600">{groupedTags.topic.length}</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-2"><TagIcon className="w-6 h-6 text-purple-600" /><span className="font-semibold">Grade Tags</span></div>
          <div className="text-3xl font-bold text-purple-600">{groupedTags.grade.length}</div>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-2"><TagIcon className="w-6 h-6 text-green-600" /><span className="font-semibold">Difficulty Tags</span></div>
          <div className="text-3xl font-bold text-green-600">{groupedTags.difficulty.length}</div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTags).map(([group, items]) => (
          <div key={group} className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-lg mb-4 capitalize">{group} Tags</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {(items as any[]).map((tag) => (
                <div key={tag.id} className="flex items-start justify-between gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="min-w-0">
                    <Badge variant="secondary" className="text-sm mb-3">{tag.name_vi || tag.name}</Badge>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">VI:</span> {tag.name_vi || '-'}</p>
                      <p><span className="font-medium">EN:</span> {tag.name_en || tag.name || '-'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(tag)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTag(tag.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
