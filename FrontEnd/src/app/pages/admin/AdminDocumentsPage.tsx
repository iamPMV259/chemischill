import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Plus, Search, Eye, Download, Edit, Trash2, FileText, Check, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { documents as initialDocuments } from '../../data/mockData';
import { toast } from 'sonner';

export default function AdminDocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState(initialDocuments);

  const toggleDownloadPermission = (docId: string) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc.id === docId ? { ...doc, allowDownload: !doc.allowDownload } : doc
      )
    );
    const doc = documents.find((d) => d.id === docId);
    toast.success(
      doc?.allowDownload
        ? 'Download disabled for this document'
        : 'Download enabled for this document'
    );
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Document Management</h1>
          <p className="text-gray-600">Manage all chemistry learning materials</p>
        </div>
        <Link to="/admin/documents/upload">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search documents..." className="pl-10" />
          </div>
          <Button variant="outline">Filter</Button>
        </div>
      </div>

      {/* Documents Table */}
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
              <TableHead className="text-center">Allow Download</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
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
                    {doc.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {doc.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{doc.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{doc.fileType}</TableCell>
                <TableCell>{doc.views.toLocaleString()}</TableCell>
                <TableCell>{doc.downloads.toLocaleString()}</TableCell>
                <TableCell>
                  {new Date(doc.uploadDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      doc.status === 'public'
                        ? 'default'
                        : doc.status === 'private'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <button
                      onClick={() => toggleDownloadPermission(doc.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        doc.allowDownload ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform flex items-center justify-center ${
                          doc.allowDownload ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      >
                        {doc.allowDownload ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <X className="w-3 h-3 text-gray-600" />
                        )}
                      </div>
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/documents/${doc.id}/edit`)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
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
