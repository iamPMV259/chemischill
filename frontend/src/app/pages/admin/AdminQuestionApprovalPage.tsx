import { useState } from 'react';
import { Check, X, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { communityQuestions } from '../../data/mockData';
import { toast } from 'sonner';

export default function AdminQuestionApprovalPage() {
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});

  const pendingQuestions = communityQuestions.filter((q) => q.status === 'pending');
  const approvedQuestions = communityQuestions.filter((q) => q.status === 'approved');
  const rejectedQuestions = communityQuestions.filter((q) => q.status === 'rejected');

  const handleApprove = (id: string) => {
    toast.success('Question approved!');
  };

  const handleReject = (id: string) => {
    toast.success('Question rejected');
  };

  const handleRequestRevision = (id: string) => {
    toast.success('Revision requested');
  };

  const QuestionCard = ({ question }: { question: any }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
      <div className="flex items-start gap-4 mb-4">
        <img
          src={question.userAvatar}
          alt={question.userName}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{question.userName}</h4>
            <span className="text-sm text-gray-500">
              •{' '}
              {new Date(question.postedDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-2">{question.title}</h3>
          <p className="text-gray-700 mb-4">{question.description}</p>

          {question.images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {question.images.map((img: string, index: number) => (
                <img
                  key={index}
                  src={img}
                  alt={`Question image ${index + 1}`}
                  className="rounded-lg w-full"
                />
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          {question.status === 'pending' && (
            <>
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Admin Notes (Optional)</label>
                <Textarea
                  placeholder="Add internal notes or feedback..."
                  value={adminNotes[question.id] || ''}
                  onChange={(e) =>
                    setAdminNotes({ ...adminNotes, [question.id]: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleApprove(question.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReject(question.id)}
                  variant="destructive"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleRequestRevision(question.id)}
                  variant="outline"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Request Revision
                </Button>
              </div>
            </>
          )}

          {question.status !== 'pending' && (
            <Badge
              variant={question.status === 'approved' ? 'default' : 'destructive'}
              className="mt-2"
            >
              {question.status}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Question Approval</h1>
        <p className="text-gray-600">Review and approve community questions</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-6 h-6 text-orange-600" />
            <span className="font-semibold">Pending Review</span>
          </div>
          <div className="text-3xl font-bold text-orange-600">{pendingQuestions.length}</div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <Check className="w-6 h-6 text-green-600" />
            <span className="font-semibold">Approved</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{approvedQuestions.length}</div>
        </div>

        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <X className="w-6 h-6 text-red-600" />
            <span className="font-semibold">Rejected</span>
          </div>
          <div className="text-3xl font-bold text-red-600">{rejectedQuestions.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Pending ({pendingQuestions.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedQuestions.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedQuestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingQuestions.length > 0 ? (
            pendingQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-xl">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No pending questions
              </h3>
              <p className="text-gray-500">All questions have been reviewed</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approvedQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </TabsContent>

        <TabsContent value="rejected">
          {rejectedQuestions.length > 0 ? (
            rejectedQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-xl">
              <X className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No rejected questions
              </h3>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
