import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { communityService } from '../../../services/community';
import { tagsService } from '../../../services/tags';

export default function PostQuestionPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    tagsService.getTags().then((res) => setTags(res.data.data || [])).catch(() => {});
  }, []);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    } else if (selectedTagIds.length < 5) {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - imageFiles.length;
    const toAdd = files.slice(0, remaining);
    setImageFiles([...imageFiles, ...toAdd]);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || selectedTagIds.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', description);
      formData.append('tag_ids', JSON.stringify(selectedTagIds));
      imageFiles.forEach((file) => formData.append('images', file));

      await communityService.createQuestion(formData);
      toast.success('Question submitted for review!');
      setTimeout(() => navigate('/community'), 1000);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to submit question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link to="/community" className="inline-flex items-center gap-2 text-gray-600 mb-8 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Quay Lại Cộng Đồng
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Đặt Câu Hỏi</h1>
          <p className="text-gray-600">Nhận trợ giúp từ cộng đồng hóa học</p>
        </div>

        {/* Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Your question will be reviewed before publishing</p>
            <p>An admin will review your question to ensure it meets our community guidelines. This usually takes less than 24 hours.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Question Title *</Label>
            <Input
              id="title"
              placeholder="e.g., How do I balance this redox equation?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide all the details about your chemistry problem..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              className="mt-2"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label>Attach Images (Optional)</Label>
            <div className="mt-2">
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Upload ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 ${imageFiles.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload className="w-4 h-4" />
                Upload Image {imageFiles.length > 0 && `(${imageFiles.length}/3)`}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={imageFiles.length >= 3}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">Upload images of your problem (max 3 images)</p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Select Topics * (Max 5)</Label>
            <div className="mt-2 p-4 border border-gray-200 rounded-lg">
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTagIds.map((tagId) => {
                  const tag = tags.find((t) => t.id === tagId);
                  return tag ? (
                    <Badge key={tagId} className="px-3 py-1">
                      {tag.name}
                      <button type="button" onClick={() => toggleTag(tagId)} className="ml-2 hover:text-red-200">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
                {selectedTagIds.length === 0 && <p className="text-sm text-gray-500">No topics selected</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTagIds.includes(tag.id) ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Link to="/community" className="flex-1">
              <Button type="button" variant="outline" className="w-full">Cancel</Button>
            </Link>
            <Button type="submit" className="flex-1" disabled={!title || !description || selectedTagIds.length === 0 || submitting}>
              {submitting ? 'Đang gửi...' : 'Submit Question'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
