import { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, FolderTree, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { categoriesService } from '../../../services/categories';
import { toast } from 'sonner';

type CategoryNode = {
  id: string;
  name_vi: string;
  name_en: string;
  slug: string;
  parent_id?: string | null;
  children?: CategoryNode[];
};

const normalize = (value?: string | null) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const localizeCategory = (category: Pick<CategoryNode, 'name_vi' | 'name_en'>, language: 'vi' | 'en') =>
  language === 'vi' ? category.name_vi : category.name_en;

const isGeneralRootCategory = (category: CategoryNode) => {
  const haystack = [category.slug, category.name_vi, category.name_en].map(normalize).join(' ');
  return haystack.includes('hoa thuong') || haystack.includes('general chemistry');
};

const isAdvancedRootCategory = (category: CategoryNode) => {
  const haystack = [category.slug, category.name_vi, category.name_en].map(normalize).join(' ');
  return haystack.includes('hoa chuyen') || haystack.includes('specialized chemistry');
};

const flattenTree = (nodes: CategoryNode[], depth = 0): Array<CategoryNode & { depth: number }> =>
  nodes.flatMap((node) => [
    { ...node, depth },
    ...flattenTree(node.children || [], depth + 1),
  ]);

const collectDescendantIds = (node: CategoryNode): Set<string> => {
  const ids = new Set<string>([node.id]);
  for (const child of node.children || []) {
    for (const id of collectDescendantIds(child)) {
      ids.add(id);
    }
  }
  return ids;
};

export default function AdminTagsPage() {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [roots, setRoots] = useState<{ general: CategoryNode | null; advanced: CategoryNode | null }>({ general: null, advanced: null });
  const [selectedPath, setSelectedPath] = useState<CategoryNode[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null);
  const [formData, setFormData] = useState({ nameVi: '', nameEn: '', slug: '', parentId: '' });

  const fetchCategories = () => {
    categoriesService.getCategories()
      .then((res) => {
        const tree = (res.data.data || []) as CategoryNode[];
        setCategories(tree);
        setRoots({
          general: tree.find(isGeneralRootCategory) || null,
          advanced: tree.find(isAdvancedRootCategory) || null,
        });
      })
      .catch(() => {
        setCategories([]);
        setRoots({ general: null, advanced: null });
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const flattenedCategories = useMemo(() => flattenTree(categories), [categories]);

  useEffect(() => {
    if (selectedPath.length === 0) return;

    const rebuiltPath: CategoryNode[] = [];
    let currentLevel = categories;

    for (const item of selectedPath) {
      const matched = currentLevel.find((node) => node.id === item.id);
      if (!matched) break;
      rebuiltPath.push(matched);
      currentLevel = matched.children || [];
    }

    if (rebuiltPath.length !== selectedPath.length || rebuiltPath.some((item, index) => item !== selectedPath[index])) {
      setSelectedPath(rebuiltPath);
    }
  }, [categories, selectedPath]);

  const currentNode = selectedPath[selectedPath.length - 1] || null;
  const currentChildren = currentNode?.children || [];
  const currentParentId = currentNode?.id || '';
  const selectedNodeDepth = selectedPath.length === 0 ? 0 : selectedPath.length - 1;
  const selectedNodeDescendantIds = useMemo(
    () => (selectedCategory ? collectDescendantIds(selectedCategory) : new Set<string>()),
    [selectedCategory]
  );
  const selectableParents = flattenedCategories.filter((item) => !selectedNodeDescendantIds.has(item.id));

  const resetForm = (parentId = currentParentId) => {
    setFormData({ nameVi: '', nameEn: '', slug: '', parentId });
  };

  const openEditDialog = (category: CategoryNode) => {
    setSelectedCategory(category);
    setFormData({
      nameVi: category.name_vi,
      nameEn: category.name_en,
      slug: category.slug,
      parentId: category.parent_id || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleAdd = async () => {
    try {
      await categoriesService.createCategory({
        name_vi: formData.nameVi,
        name_en: formData.nameEn,
        parent_id: formData.parentId || undefined,
      });
      toast.success(language === 'vi' ? 'Tạo thẻ thành công' : 'Tag created');
      setIsAddDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch {
      toast.error(language === 'vi' ? 'Không thể tạo thẻ' : 'Failed to create tag');
    }
  };

  const handleEdit = async () => {
    if (!selectedCategory) return;
    try {
      await categoriesService.updateCategory(selectedCategory.id, {
        name_vi: formData.nameVi,
        name_en: formData.nameEn,
        slug: formData.slug,
        parent_id: formData.parentId || undefined,
      });
      toast.success(language === 'vi' ? 'Cập nhật thẻ thành công' : 'Tag updated');
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      resetForm();
      fetchCategories();
    } catch {
      toast.error(language === 'vi' ? 'Không thể cập nhật thẻ' : 'Failed to update tag');
    }
  };

  const handleDelete = async (category: CategoryNode) => {
    if (isGeneralRootCategory(category) || isAdvancedRootCategory(category)) {
      toast.error(language === 'vi' ? 'Không thể xóa thẻ gốc' : 'Root tags cannot be deleted');
      return;
    }

    const confirmed = window.confirm(language === 'vi' ? 'Bạn có chắc muốn xóa thẻ này?' : 'Are you sure you want to delete this tag?');
    if (!confirmed) return;

    try {
      await categoriesService.deleteCategory(category.id);
      toast.success(language === 'vi' ? 'Đã xóa thẻ' : 'Tag deleted');
      fetchCategories();
    } catch {
      toast.error(language === 'vi' ? 'Không thể xóa thẻ' : 'Failed to delete tag');
    }
  };

  const selectRoot = (root: CategoryNode | null) => {
    setSelectedPath(root ? [root] : []);
  };

  const selectChild = (category: CategoryNode, level: number) => {
    setSelectedPath((prev) => [...prev.slice(0, level), category]);
  };

  const renderForm = (submitLabel: string, onSubmit: () => void, showSlugField: boolean) => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="nameVi">{language === 'vi' ? 'Tên tiếng Việt' : 'Vietnamese name'}</Label>
        <Input id="nameVi" value={formData.nameVi} onChange={(e) => setFormData((prev) => ({ ...prev, nameVi: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nameEn">{language === 'vi' ? 'Tên tiếng Anh' : 'English name'}</Label>
        <Input id="nameEn" value={formData.nameEn} onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))} />
      </div>
      {showSlugField ? (
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={formData.slug} onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))} />
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
          {language === 'vi'
            ? 'Slug sẽ tự động tạo từ tên tiếng Anh.'
            : 'Slug will be generated automatically from the English name.'}
        </div>
      )}
      <div className="space-y-2">
        <Label>{language === 'vi' ? 'Thẻ cha' : 'Parent tag'}</Label>
        <Select value={formData.parentId || '__none__'} onValueChange={(value) => setFormData((prev) => ({ ...prev, parentId: value === '__none__' ? '' : value }))}>
          <SelectTrigger>
            <SelectValue placeholder={language === 'vi' ? 'Không có thẻ cha' : 'No parent tag'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">{language === 'vi' ? 'Không có thẻ cha' : 'No parent tag'}</SelectItem>
            {selectableParents.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {'— '.repeat(item.depth)}{localizeCategory(item, language)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onSubmit} className="w-full">{submitLabel}</Button>
    </div>
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold">{language === 'vi' ? 'Quản Lý Thẻ Tài Liệu' : 'Document Tag Management'}</h1>
          <p className="text-gray-600">
            {language === 'vi'
              ? 'Quản lý thẻ theo đúng cấu trúc hiển thị ở trang tài liệu.'
              : 'Manage tags with the same drill-down structure used on the document page.'}
          </p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              {language === 'vi' ? 'Thêm Thẻ Con' : 'Add Child Tag'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{language === 'vi' ? 'Tạo Thẻ Mới' : 'Create Tag'}</DialogTitle>
              <DialogDescription>
                {language === 'vi'
                  ? 'Tạo một thẻ mới dưới nhánh đang chọn hoặc chọn thẻ cha khác.'
                  : 'Create a new tag under the current branch or choose another parent.'}
              </DialogDescription>
            </DialogHeader>
            {renderForm(language === 'vi' ? 'Tạo thẻ' : 'Create tag', handleAdd, false)}
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedCategory(null);
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'vi' ? 'Chỉnh Sửa Thẻ' : 'Edit Tag'}</DialogTitle>
            <DialogDescription>
              {language === 'vi'
                ? 'Cập nhật tên, slug hoặc vị trí của thẻ trong cây.'
                : 'Update the tag name, slug, or position in the tree.'}
            </DialogDescription>
          </DialogHeader>
          {renderForm(language === 'vi' ? 'Lưu thay đổi' : 'Save changes', handleEdit, true)}
        </DialogContent>
      </Dialog>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <FolderTree className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{flattenedCategories.length}</div>
              <div className="text-sm text-gray-600">{language === 'vi' ? 'Tổng số thẻ' : 'Total tags'}</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-600">{language === 'vi' ? 'Thẻ hiện tại' : 'Current tag'}</div>
          <div className="mt-2 text-lg font-semibold">
            {currentNode ? localizeCategory(currentNode, language) : language === 'vi' ? 'Chưa chọn' : 'None selected'}
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-600">{language === 'vi' ? 'Số thẻ con trực tiếp' : 'Direct child tags'}</div>
          <div className="mt-2 text-2xl font-bold">{currentChildren.length}</div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={selectedPath[0]?.id === roots.general?.id ? 'default' : 'outline'}
            onClick={() => selectRoot(roots.general)}
            disabled={!roots.general}
          >
            {language === 'vi' ? 'Hóa thường' : 'General Chemistry'}
          </Button>
          <Button
            variant={selectedPath[0]?.id === roots.advanced?.id ? 'default' : 'outline'}
            onClick={() => selectRoot(roots.advanced)}
            disabled={!roots.advanced}
          >
            {language === 'vi' ? 'Hóa chuyên' : 'Advanced Chemistry'}
          </Button>
          {selectedPath.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedPath([])} className="ml-auto">
              {language === 'vi' ? 'Xóa Chọn' : 'Clear Selection'}
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
                  onClick={() => setSelectedPath((prev) => prev.slice(0, index + 1))}
                >
                  {localizeCategory(item, language)}
                </button>
                {index < selectedPath.length - 1 && <ChevronRight className="h-4 w-4 text-gray-400" />}
              </div>
            ))}
          </div>
        )}

        {selectedPath.length > 0 ? (
          currentChildren.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currentChildren.map((item) => (
                <div key={item.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => selectChild(item, selectedPath.length)}
                      className="min-w-0 text-left"
                    >
                      <Badge variant="secondary" className="mb-2 cursor-pointer">
                        {localizeCategory(item, language)}
                      </Badge>
                      <div className="text-sm text-gray-700">
                        {language === 'vi' ? 'Mở nhánh này để xem các thẻ con.' : 'Open this branch to view child tags.'}
                      </div>
                    </button>
                    <div className="flex shrink-0 gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">VI:</span> {item.name_vi}</p>
                    <p><span className="font-medium">EN:</span> {item.name_en}</p>
                    <p><span className="font-medium">Slug:</span> {item.slug}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 px-6 py-10 text-center text-gray-500">
              {language === 'vi'
                ? 'Nhánh này chưa có thẻ con. Bạn có thể thêm thẻ mới tại cấp hiện tại.'
                : 'This branch has no child tags yet. You can add a new tag at this level.'}
            </div>
          )
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 px-6 py-10 text-center text-gray-500">
            {language === 'vi'
              ? 'Chọn Hóa thường hoặc Hóa chuyên để bắt đầu quản lý theo từng nhánh.'
              : 'Choose General Chemistry or Advanced Chemistry to start managing each branch.'}
          </div>
        )}

        {currentNode && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-gray-600">{language === 'vi' ? 'Đang quản lý nhánh' : 'Managing branch'}</div>
                <div className="text-lg font-semibold">{localizeCategory(currentNode, language)}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(currentNode)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {language === 'vi' ? 'Sửa Nhánh' : 'Edit Branch'}
                </Button>
                {selectedNodeDepth > 0 && (
                  <Button variant="outline" size="sm" onClick={() => handleDelete(currentNode)}>
                    <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                    {language === 'vi' ? 'Xóa Nhánh' : 'Delete Branch'}
                  </Button>
                )}
              </div>
            </div>
            <div className="grid gap-2 text-sm md:grid-cols-3">
              <p><span className="font-medium">VI:</span> {currentNode.name_vi}</p>
              <p><span className="font-medium">EN:</span> {currentNode.name_en}</p>
              <p><span className="font-medium">Slug:</span> {currentNode.slug}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
