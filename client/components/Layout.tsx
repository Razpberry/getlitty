import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import { Type, LogOut, BookOpen, Sparkles } from 'lucide-react';

const Layout: React.FC = () => {
  const { toggleFontSize } = useAccessibility();
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 px-4 py-2 bg-green-600 text-white rounded">
        Skip to main content
      </a>

      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
            <BookOpen className="text-green-600" />
            <span className="text-slate-900">getlitty</span>
          </Link>

          <nav className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 border-r pr-4 border-gray-300">
              <button
                onClick={toggleFontSize}
                className="p-2 rounded hover:bg-opacity-20 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-600"
                aria-label="Toggle font size"
                title="Toggle Font Size"
              >
                <Type size={20} />
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="font-medium hover:underline text-brand-700">Dashboard</Link>
                <Link to="/questionnaire" className="hidden sm:flex items-center gap-1 font-medium hover:underline text-brand-700">
                   <Sparkles size={16} /> Personalize
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              !isAuthPage && !isLanding && (
                <Link to="/login" className="font-medium text-green-600 hover:text-green-800">Login</Link>
              )
            )}
            {!user && isLanding && (
               <Link to="/login" className="font-medium text-green-600 hover:text-green-800">Login</Link>
            )}
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <footer className="py-6 text-center text-sm text-gray-500 border-t bg-green-50">
        <p>&copy; {new Date().getFullYear()} getlitty. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;