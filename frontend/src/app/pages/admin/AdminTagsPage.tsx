import { useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { tags as initialTags } from '../../data/mockData';
import { toast } from 'sonner';

export default function AdminTagsPage() {
  const [tags, setTags] = useState(initialTags);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategory, setNewTagCategory] = useState<'topic' | 'grade' | 'difficulty'>('topic');

  const handleCreateTag = () => {
    if (!newTagName) {
      toast.error('Please enter a tag name');
      return;
    }

    setTags([
      ...tags,
      {
        id: Date.now().toString(),
        name: newTagName,
        category: newTagCategory,
      },
    ]);

    toast.success('Tag created successfully');
    setNewTagName('');
    setIsCreateDialogOpen(false);
  };

  const handleDeleteTag = (id: string) => {
    setTags(tags.filter((tag) => tag.id !== id));
    toast.success('Tag deleted');
  };

  const groupedTags = {
    topic: tags.filter((t) => t.category === 'topic'),
    grade: tags.filter((t) => t.category === 'grade'),
    difficulty: tags.filter((t) => t.category === 'difficulty'),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tag Management</h1>
          <p className="text-gray-600">Organize chemistry topics, grades, and difficulty levels</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="tagName">Tag Name</Label>
                <Input
                  id="tagName"
                  placeholder="e.g., Organic Chemistry"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={newTagCategory}
                  onValueChange={(value: any) => setNewTagCategory(value)}
                >
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
              <Button onClick={handleCreateTag} className="w-full">
                Create Tag
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="w-6 h-6 text-blue-600" />
            <span className="font-semibold">Topic Tags</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{groupedTags.topic.length}</div>
        </div>

        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="w-6 h-6 text-purple-600" />
            <span className="font-semibold">Grade Tags</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">{groupedTags.grade.length}</div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="w-6 h-6 text-green-600" />
            <span className="font-semibold">Difficulty Tags</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{groupedTags.difficulty.length}</div>
        </div>
      </div>

      {/* Tag Groups */}
      <div className="space-y-6">
        {/* Topic Tags */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">Topic Tags</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {groupedTags.topic.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <Badge variant="secondary" className="text-sm">
                  {tag.name}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTag(tag.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grade Tags */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">Grade Tags</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {groupedTags.grade.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <Badge variant="secondary" className="text-sm">
                  {tag.name}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTag(tag.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Tags */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">Difficulty Tags</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {groupedTags.difficulty.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <Badge variant="secondary" className="text-sm">
                  {tag.name}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTag(tag.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
