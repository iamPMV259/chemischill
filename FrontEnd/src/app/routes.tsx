import { createBrowserRouter } from 'react-router';
import RootLayout from './layouts/RootLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/user/HomePage';
import LoginPage from './pages/user/LoginPage';
import RegisterPage from './pages/user/RegisterPage';
import ProfileSetupPage from './pages/user/ProfileSetupPage';
import DocumentLibraryPage from './pages/user/DocumentLibraryPage';
import DocumentDetailPage from './pages/user/DocumentDetailPage';
import QuizListingPage from './pages/user/QuizListingPage';
import QuizTakingPage from './pages/user/QuizTakingPage';
import QuizResultPage from './pages/user/QuizResultPage';
import LeaderboardPage from './pages/user/LeaderboardPage';
import CommunityQuestionsPage from './pages/user/CommunityQuestionsPage';
import PostQuestionPage from './pages/user/PostQuestionPage';
import QuestionDetailPage from './pages/user/QuestionDetailPage';
import UserProfilePage from './pages/user/UserProfilePage';
import EditProfilePage from './pages/user/EditProfilePage';
import PublicProfilePage from './pages/user/PublicProfilePage';
import TeacherProfilePage from './pages/user/TeacherProfilePage';
import AboutPage from './pages/user/AboutPage';
import ForgotPasswordPage from './pages/user/ForgotPasswordPage';
import ChangePasswordPage from './pages/user/ChangePasswordPage';
import TeacherContactPage from './pages/user/TeacherContactPage';
import SavedItemsPage from './pages/user/SavedItemsPage';
import QuizSharePage from './pages/user/QuizSharePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDocumentsPage from './pages/admin/AdminDocumentsPage';
import AdminUploadDocumentPage from './pages/admin/AdminUploadDocumentPage';
import AdminEditDocumentPage from './pages/admin/AdminEditDocumentPage';
import AdminQuizzesPage from './pages/admin/AdminQuizzesPage';
import AdminCreateQuizPage from './pages/admin/AdminCreateQuizPage';
import AdminEditQuizPage from './pages/admin/AdminEditQuizPage';
import AdminQuestionApprovalPage from './pages/admin/AdminQuestionApprovalPage';
import AdminTagsPage from './pages/admin/AdminTagsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminLeaderboardPage from './pages/admin/AdminLeaderboardPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        path: '/',
        Component: UserLayout,
        children: [
          { index: true, Component: HomePage },
          { path: 'documents', Component: DocumentLibraryPage },
          { path: 'documents/:id', Component: DocumentDetailPage },
          { path: 'quizzes', Component: QuizListingPage },
          { path: 'quizzes/:id/take', Component: QuizTakingPage },
          { path: 'quizzes/:id/result', Component: QuizResultPage },
          { path: 'quizzes/:id/share', Component: QuizSharePage },
          { path: 'leaderboard', Component: LeaderboardPage },
          { path: 'community', Component: CommunityQuestionsPage },
          { path: 'community/ask', Component: PostQuestionPage },
          { path: 'community/:id', Component: QuestionDetailPage },
          { path: 'about', Component: AboutPage },
          { path: 'saved', Component: SavedItemsPage },
          { path: 'profile', Component: UserProfilePage },
          { path: 'profile/edit', Component: EditProfilePage },
          { path: 'change-password', Component: ChangePasswordPage },
          { path: 'users/:id', Component: PublicProfilePage },
          { path: 'teachers/:id', Component: TeacherProfilePage },
          { path: 'teachers/:id/contact', Component: TeacherContactPage },
        ],
      },
      {
        path: 'login',
        Component: LoginPage,
      },
      {
        path: 'register',
        Component: RegisterPage,
      },
      {
        path: 'forgot-password',
        Component: ForgotPasswordPage,
      },
      {
        path: 'profile-setup',
        Component: ProfileSetupPage,
      },
      {
        path: 'admin',
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: 'documents', Component: AdminDocumentsPage },
          { path: 'documents/upload', Component: AdminUploadDocumentPage },
          { path: 'documents/:id/edit', Component: AdminEditDocumentPage },
          { path: 'quizzes', Component: AdminQuizzesPage },
          { path: 'quizzes/create', Component: AdminCreateQuizPage },
          { path: 'quizzes/:id/edit', Component: AdminEditQuizPage },
          { path: 'questions', Component: AdminQuestionApprovalPage },
          { path: 'tags', Component: AdminTagsPage },
          { path: 'categories', Component: AdminCategoriesPage },
          { path: 'users', Component: AdminUsersPage },
          { path: 'leaderboard', Component: AdminLeaderboardPage },
        ],
      },
    ],
  },
]);
