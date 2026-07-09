import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Zap, LayoutDashboard, LogOut, Moon, Sun,
  Menu, X, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export default function DashboardLayout({ children, noPadding }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'My Boards' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-600 rounded-xl flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 dark:text-white">TaskFlow</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Project Management</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={`sidebar-item ${location.pathname === to ? 'sidebar-item-active' : ''}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
            {location.pathname === to && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
          </Link>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <button onClick={toggleTheme} className="sidebar-item w-full">
          {theme === 'dark'
            ? <><Sun className="w-4 h-4" /> <span>Light mode</span></>
            : <><Moon className="w-4 h-4" /> <span>Dark mode</span></>
          }
        </button>
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-surface-dark-200 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(user?.name || 'U')}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-surface-dark-100 rounded-xl shadow-modal border border-slate-100 dark:border-slate-800 py-1 animate-scale-in">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-dark">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-white dark:bg-surface-dark-100 border-r border-slate-100 dark:border-slate-800">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-72 bg-white dark:bg-surface-dark-100 z-50">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 btn-icon btn-ghost"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-surface-dark-100 border-b border-slate-100 dark:border-slate-800">
          <button onClick={() => setSidebarOpen(true)} className="btn-icon btn-ghost">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-600" />
            <span className="font-bold text-slate-900 dark:text-white">TaskFlow</span>
          </div>
          <button onClick={toggleTheme} className="btn-icon btn-ghost">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        {/* Page Content */}
        <main className={`flex-1 flex flex-col overflow-hidden ${noPadding ? '' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
