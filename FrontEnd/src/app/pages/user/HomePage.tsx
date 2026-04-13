import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, BookOpen, Brain, MessageCircle, Trophy, TrendingUp, Star, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { documentsService } from '../../../services/documents';
import { quizzesService } from '../../../services/quizzes';
import { tagsService } from '../../../services/tags';
import { usersService } from '../../../services/users';
import { adaptDocument, adaptQuiz, adaptLeaderboardEntry } from '../../../lib/adapters';

export default function HomePage() {
  const { t } = useLanguage();
  const [featuredDocs, setFeaturedDocs] = useState<any[]>([]);
  const [trendingQuizzes, setTrendingQuizzes] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [popularTags, setPopularTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      documentsService.getFeaturedDocuments(),
      quizzesService.getFeaturedQuizzes(),
      tagsService.getTags(),
      usersService.getLeaderboard({ limit: 3 }),
    ])
      .then(([docsRes, quizzesRes, tagsRes, lbRes]) => {
        setFeaturedDocs((docsRes.data.data || []).slice(0, 3).map(adaptDocument));
        setTrendingQuizzes((quizzesRes.data.data || []).slice(0, 3).map(adaptQuiz));
        setPopularTags((tagsRes.data.data || []).slice(0, 6));
        setTopUsers((lbRes.data.data || []).map(adaptLeaderboardEntry));
      })
      .catch(() => {
        // silently fail — show empty state
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="molecules" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="3" fill="white" />
                <circle cx="20" cy="30" r="2" fill="white" />
                <circle cx="80" cy="70" r="2" fill="white" />
                <line x1="50" y1="50" x2="20" y2="30" stroke="white" strokeWidth="1" />
                <line x1="50" y1="50" x2="80" y2="70" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#molecules)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {t('hero.title')}<br />{t('hero.subtitle')}
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              {t('hero.description')}
            </p>

            <div className="flex gap-4 mb-12">
              <Link to="/documents">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                  <BookOpen className="w-5 h-5 mr-2" />
                  {t('hero.exploreDocuments')}
                </Button>
              </Link>
              <Link to="/quizzes">
                <Button size="lg" className="bg-white/10 text-white border-2 border-white hover:bg-white hover:text-blue-700 backdrop-blur">
                  <Brain className="w-5 h-5 mr-2" />
                  {t('hero.takeQuizzes')}
                </Button>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder={t('hero.searchPlaceholder')}
                  className="pl-12 pr-4 py-6 text-lg bg-white/95 backdrop-blur border-0"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Popular Tags */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-lg">{t('popularTags.title')}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="px-4 py-2 cursor-pointer hover:bg-blue-100">
                {tag.name}
              </Badge>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Featured Documents */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">{t('featuredDocs.title')}</h2>
            <p className="text-gray-600">{t('featuredDocs.subtitle')}</p>
          </div>
          <Link to="/documents">
            <Button variant="outline">{t('featuredDocs.viewAll')}</Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {featuredDocs.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/documents/${doc.id}`}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={doc.thumbnail}
                        alt={doc.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-orange-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          {t('featuredDocs.featured')}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{doc.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{doc.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {doc.tags.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{doc.views.toLocaleString()} {t('featuredDocs.views')}</span>
                        <span>{doc.downloads.toLocaleString()} {t('featuredDocs.downloads')}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Trending Quizzes */}
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t('quizzes.title')}</h2>
              <p className="text-gray-600">{t('quizzes.subtitle')}</p>
            </div>
            <Link to="/quizzes">
              <Button variant="outline">{t('featuredDocs.viewAll')}</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {trendingQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
                  {quiz.reward && (
                    <Badge className="bg-green-500 text-white mb-3">
                      <Trophy className="w-3 h-3 mr-1" />
                      {t('quizzes.reward')}
                    </Badge>
                  )}
                  <h3 className="font-semibold text-lg mb-3">{quiz.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{quiz.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span>{quiz.questionCount} {t('quizzes.questions')}</span>
                    <span>•</span>
                    <span>{Math.round(quiz.timeLimit / 60)} {t('quizzes.minutes')}</span>
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      {quiz.participants.toLocaleString()} {t('quizzes.participants')}
                    </div>
                    <Link to={`/quizzes/${quiz.id}/take`}>
                      <Button size="sm">{t('quizzes.joinNow')}</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Leaderboard Preview */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">{t('leaderboard.title')}</h2>
            <p className="text-gray-600">{t('leaderboard.subtitle')}</p>
          </div>
          <Link to="/leaderboard">
            <Button variant="outline">{t('leaderboard.viewFull')}</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {topUsers.map((user, index) => (
            <Link key={user.id} to={`/users/${user.id}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all text-center relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-bl-full" />
                <div className="relative">
                  <div className="text-3xl font-bold text-blue-600 mb-2">#{user.rank}</div>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full mx-auto mb-3"
                  />
                  <h3 className="font-semibold text-lg mb-1">{user.name}</h3>
                  <p className="text-2xl font-bold text-purple-600 mb-3">{user.points.toLocaleString()} {t('leaderboard.points')}</p>
                  <div className="flex justify-center gap-4 text-sm text-gray-600">
                    <div>
                      <div className="font-semibold text-blue-600">{user.quizzesJoined}</div>
                      <div>{t('leaderboard.quiz')}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-purple-600">{user.questionsPosted}</div>
                      <div>{t('leaderboard.questions')}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Community Support CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <MessageCircle className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">{t('community.title')}</h2>
            <p className="text-xl text-blue-100 mb-8">
              {t('community.description')}
            </p>
            <Link to="/community/ask">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                {t('community.askQuestion')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
