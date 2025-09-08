import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <h1 className="text-xl font-bold">LyricGenius</h1>
            </Link>
            <nav className="flex gap-2">
              <Button variant={location.pathname === '/' ? 'default' : 'ghost'} asChild>
                <Link to="/">生成</Link>
              </Button>
              <Button variant={location.pathname === '/history' ? 'default' : 'ghost'} asChild>
                <Link to="/history">履歴</Link>
              </Button>
              <Button variant={location.pathname === '/settings' ? 'default' : 'ghost'} asChild>
                <Link to="/settings">設定</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};
