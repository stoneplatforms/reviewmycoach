'use client';

import { useAuth } from '../lib/hooks/useAuth';
import AuthGuard from '../components/AuthGuard';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthGuard will handle redirect
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        {children}
      </div>
    </AuthGuard>
  );
} 