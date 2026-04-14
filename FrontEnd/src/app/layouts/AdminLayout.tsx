import { Outlet, Link, useLocation, Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Brain,
  MessageSquare,
  Tags,
  Users,
  Beaker,
  LogOut,
  Globe,
  House,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

export default function AdminLayout() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/login" />;
  }

  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const sidebarItems = [
    { path: '/admin', label: t('admin.dashboard'), icon: LayoutDashboard },
    { path: '/admin/documents', label: t('admin.documents'), icon: FileText },
    { path: '/admin/quizzes', label: t('admin.quizzes'), icon: Brain },
    { path: '/admin/questions', label: t('admin.questionApproval'), icon: MessageSquare },
    { path: '/admin/tags', label: t('admin.tags'), icon: Tags },
    { path: '/admin/users', label: t('admin.users'), icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Beaker className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{t('nav.appName')}</h1>
              <p className="text-xs text-gray-500">{t('admin.adminPanel')}</p>
            </div>
          </Link>
        </div>

        <div className="px-4 py-3 border-b border-gray-200">
          <Link to="/" className="mb-3 block">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <House className="w-4 h-4 mr-2" />
              {t('nav.userView')}
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Globe className="w-4 h-4 mr-2" />
                {language === 'vi' ? 'Tiếng Việt' : 'English'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLanguage('vi')}>
                {language === 'vi' && '✓ '}Tiếng Việt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                {language === 'en' && '✓ '}English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start ${isActive ? 'bg-blue-600' : ''}`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <Link to="/">
            <Button variant="outline" className="w-full justify-start">
              <LogOut className="w-4 h-4 mr-3" />
              {t('admin.backToSite')}
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
