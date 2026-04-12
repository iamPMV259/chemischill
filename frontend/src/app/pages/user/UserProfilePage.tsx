import { Link } from 'react-router';
import { Trophy, BookOpen, Brain, MessageCircle, Download, Calendar, Star, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { motion } from 'motion/react';
import { leaderboardUsers, documents, quizzes, communityQuestions } from '../../data/mockData';

export default function UserProfilePage() {
  const currentUser = leaderboardUsers[0];

  const downloadHistory = documents.slice(0, 4);
  const joinedQuizzes = quizzes.slice(0, 3);
  const userQuestions = communityQuestions.filter((q) => q.userId === '1');

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600" />
          <div className="px-8 pb-8">
            <div className="flex items-end gap-6 -mt-16 mb-6">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              <div className="flex-1 pt-20">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-bold mb-1">{currentUser.name}</h1>
                    <p className="text-gray-600">{currentUser.phone}</p>
                  </div>
                  <Link to="/profile/edit">
                    <Button variant="outline">Edit Profile</Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Rank</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">#{currentUser.rank}</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Points</span>
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {currentUser.points.toLocaleString()}
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Quizzes</span>
                </div>
                <div className="text-3xl font-bold text-green-600">{currentUser.quizzesJoined}</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MessageCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-600">Questions</span>
                </div>
                <div className="text-3xl font-bold text-orange-600">
                  {currentUser.questionsPosted}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Tabs */}
        <Tabs defaultValue="downloads" className="bg-white rounded-2xl shadow-lg p-8">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="downloads">
              <Download className="w-4 h-4 mr-2" />
              Downloads
            </TabsTrigger>
            <TabsTrigger value="quizzes">
              <Brain className="w-4 h-4 mr-2" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="questions">
              <MessageCircle className="w-4 h-4 mr-2" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="saved">
              <Star className="w-4 h-4 mr-2" />
              Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="downloads" className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Download History</h3>
            {downloadHistory.map((doc) => (
              <Link key={doc.id} to={`/documents/${doc.id}`}>
                <div className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
                  <img src={doc.thumbnail} alt={doc.title} className="w-20 h-20 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{doc.title}</h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">{doc.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {doc.fileType}
                      </Badge>
                    </div>
                  </div>
                  {doc.allowDownload !== false ? (
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  )}
                </div>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Quiz History</h3>
            {joinedQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{quiz.title}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>{quiz.questionCount} questions</span>
                    <span>•</span>
                    <span>{quiz.timeLimit} min</span>
                    <span>•</span>
                    <Badge
                      variant={
                        quiz.difficulty === 'easy'
                          ? 'secondary'
                          : quiz.difficulty === 'medium'
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {quiz.difficulty}
                    </Badge>
                  </div>
                </div>
                <div className="text-right mr-4">
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <div className="text-xs text-gray-500">Last score</div>
                </div>
                <Link to={`/quizzes/${quiz.id}/take`}>
                  <Button variant="outline" size="sm">
                    Retake
                  </Button>
                </Link>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <h3 className="text-xl font-bold mb-4">My Questions</h3>
            {userQuestions.map((question) => (
              <Link key={question.id} to={`/community/${question.id}`}>
                <div className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold flex-1">{question.title}</h4>
                    <Badge variant={question.status === 'approved' ? 'secondary' : 'default'}>
                      {question.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{question.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex gap-2">
                      {question.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {question.answerCount} answers
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="saved">
            <div className="text-center py-16">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No saved items yet</h3>
              <p className="text-gray-500 mb-6">
                Start saving documents and quizzes to access them quickly later
              </p>
              <Link to="/documents">
                <Button>Browse Documents</Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
