import { useState } from 'react';
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { documentCategories, Category } from '../../data/categoryData';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AdminCategoriesPage() {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>(documentCategories);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    nameVi: '',
    nameEn: '',
    parentId: '',
  });

  const resetForm = () => {
    setFormData({ nameVi: '', nameEn: '', parentId: '' });
  };

  const handleAdd = () => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      nameVi: formData.nameVi,
      nameEn: formData.nameEn,
      parentId: formData.parentId || undefined,
    };
    setCategories([...categories, newCategory]);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = () => {
    if (!selectedCategory) return;

    const updatedCategories = categories.map(cat =>
      cat.id === selectedCategory.id
        ? { ...cat, nameVi: formData.nameVi, nameEn: formData.nameEn, parentId: formData.parentId || undefined }
        : cat
    );
    setCategories(updatedCategories);
    resetForm();
    setSelectedCategory(null);
    setIsEditDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(language === 'vi' ? 'Bạn có chắc muốn xóa thể loại này?' : 'Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== id && cat.parentId !== id));
    }
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      nameVi: category.nameVi,
      nameEn: category.nameEn,
      parentId: category.parentId || '',
    });
    setIsEditDialogOpen(true);
  };

  const parentCategories = categories.filter(cat => !cat.parentId);
  const getParentName = (parentId?: string) => {
    if (!parentId) return '-';
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? (language === 'vi' ? parent.nameVi : parent.nameEn) : '-';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {language === 'vi' ? 'Quản Lý Thể Loại Tài Liệu' : 'Document Categories Management'}
          </h1>
          <p className="text-gray-600">
            {language === 'vi'
              ? 'Tạo và quản lý các thể loại cho tài liệu học tập'
              : 'Create and manage categories for learning materials'}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'vi' ? 'Thêm Thể Loại' : 'Add Category'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {language === 'vi' ? 'Thêm Thể Loại Mới' : 'Add New Category'}
              </DialogTitle>
              <DialogDescription>
                {language === 'vi'
                  ? 'Tạo thể loại mới cho tài liệu. Bạn có thể tạo thể loại chính hoặc thể loại con.'
                  : 'Create a new category for documents. You can create main or sub categories.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nameVi">
                  {language === 'vi' ? 'Tên Tiếng Việt' : 'Vietnamese Name'}
                </Label>
                <Input
                  id="nameVi"
                  value={formData.nameVi}
                  onChange={(e) => setFormData({ ...formData, nameVi: e.target.value })}
                  placeholder={language === 'vi' ? 'Nhập tên tiếng Việt' : 'Enter Vietnamese name'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">
                  {language === 'vi' ? 'Tên Tiếng Anh' : 'English Name'}
                </Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder={language === 'vi' ? 'Nhập tên tiếng Anh' : 'Enter English name'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentId">
                  {language === 'vi' ? 'Thể Loại Cha (Tùy chọn)' : 'Parent Category (Optional)'}
                </Label>
                <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'vi' ? 'Chọn thể loại cha' : 'Select parent category'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      {language === 'vi' ? 'Không có (Thể loại chính)' : 'None (Main category)'}
                    </SelectItem>
                    {parentCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {language === 'vi' ? cat.nameVi : cat.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </Button>
              <Button onClick={handleAdd}>
                {language === 'vi' ? 'Thêm' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderTree className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{categories.length}</div>
              <div className="text-sm text-gray-600">
                {language === 'vi' ? 'Tổng Thể Loại' : 'Total Categories'}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FolderTree className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{parentCategories.length}</div>
              <div className="text-sm text-gray-600">
                {language === 'vi' ? 'Thể Loại Chính' : 'Main Categories'}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FolderTree className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {categories.filter(cat => cat.parentId).length}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'vi' ? 'Thể Loại Con' : 'Sub Categories'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{language === 'vi' ? 'Tên Tiếng Việt' : 'Vietnamese Name'}</TableHead>
              <TableHead>{language === 'vi' ? 'Tên Tiếng Anh' : 'English Name'}</TableHead>
              <TableHead>{language === 'vi' ? 'Thể Loại Cha' : 'Parent Category'}</TableHead>
              <TableHead>{language === 'vi' ? 'Loại' : 'Type'}</TableHead>
              <TableHead className="text-right">{language === 'vi' ? 'Hành Động' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.nameVi}</TableCell>
                <TableCell>{category.nameEn}</TableCell>
                <TableCell>{getParentName(category.parentId)}</TableCell>
                <TableCell>
                  <Badge variant={category.parentId ? 'secondary' : 'default'}>
                    {category.parentId
                      ? language === 'vi' ? 'Thể loại con' : 'Subcategory'
                      : language === 'vi' ? 'Thể loại chính' : 'Main'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'vi' ? 'Chỉnh Sửa Thể Loại' : 'Edit Category'}
            </DialogTitle>
            <DialogDescription>
              {language === 'vi'
                ? 'Cập nhật thông tin thể loại'
                : 'Update category information'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nameVi">
                {language === 'vi' ? 'Tên Tiếng Việt' : 'Vietnamese Name'}
              </Label>
              <Input
                id="edit-nameVi"
                value={formData.nameVi}
                onChange={(e) => setFormData({ ...formData, nameVi: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nameEn">
                {language === 'vi' ? 'Tên Tiếng Anh' : 'English Name'}
              </Label>
              <Input
                id="edit-nameEn"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-parentId">
                {language === 'vi' ? 'Thể Loại Cha' : 'Parent Category'}
              </Label>
              <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    {language === 'vi' ? 'Không có' : 'None'}
                  </SelectItem>
                  {parentCategories.filter(cat => cat.id !== selectedCategory?.id).map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {language === 'vi' ? cat.nameVi : cat.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button onClick={handleEdit}>
              {language === 'vi' ? 'Lưu' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
