import { Outlet } from 'react-router';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import { Toaster } from '../components/ui/sonner';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Outlet />
        <Toaster />
      </AuthProvider>
    </LanguageProvider>
  );
}
