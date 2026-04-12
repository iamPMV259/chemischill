import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { tags, documents } from '../../data/mockData';
import { toast } from 'sonner';

export default function AdminEditDocumentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Pre-populate with existing document data
  const existing = documents.find((d) => d.id === id);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [selectedTags, setSelectedTags] = useState<string[]>(existing?.tags ?? []);
  const [featured, setFeatured] = useState(existing?.featured ?? false);
  const [allowDownload, setAllowDownload] = useState(existing?.allowDownload ?? false);
  const [status, setStatus] = useState(existing?.status ?? 'public');

  if (!existing) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Document not found</p>
        <Link to="/admin/documents">
          <Button variant="outline">Back to Documents</Button>
        </Link>
      </div>
    );
  }

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleSave = () => {
    if (!title || !description || selectedTags.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Document updated successfully!');
    setTimeout(() => navigate('/admin/documents'), 1000);
  };

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
          {/* Current File Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <Label>Current File</Label>
            <div className="mt-2 flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex-1">
                <p className="font-medium">{existing.title}</p>
                <p className="text-sm text-gray-500">{existing.fileType} • Uploaded {new Date(existing.uploadDate).toLocaleDateString()}</p>
              </div>
              <Badge variant="secondary">{existing.fileType}</Badge>
            </div>
            <div className="mt-3 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium">Replace file (optional)</p>
              <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 50MB</p>
            </div>
          </div>

          {/* Document Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div>
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="mt-2"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Grade Level</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">Grade 10</SelectItem>
                    <SelectItem value="11">Grade 11</SelectItem>
                    <SelectItem value="12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Difficulty</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Tags *</Label>
              <div className="mt-2 p-4 border border-gray-200 rounded-lg">
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} className="px-3 py-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className="ml-2 hover:text-red-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedTags.length === 0 && (
                    <p className="text-sm text-gray-500">No tags selected</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.name) ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag.name)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">Publishing Options</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured Document</Label>
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="allowDownload">Allow Download</Label>
                <Switch
                  id="allowDownload"
                  checked={allowDownload}
                  onCheckedChange={setAllowDownload}
                />
              </div>

              <div>
                <Label>Visibility</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">Thumbnail</h3>
            {existing.thumbnail && (
              <img
                src={existing.thumbnail}
                alt="Thumbnail"
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Replace thumbnail</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
            <Link to="/admin/documents">
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
