import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Database, LayoutDashboard, TerminalSquare, LogOut, Server, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import { Toaster } from './ui/toaster';

const Layout = () => {
  const { logout, user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Databases', path: '/databases', icon: Database },
    { name: 'DB Connection', path: '/db-connection', icon: Server },
    { name: 'SQL Editor', path: '/editor', icon: TerminalSquare },
  ];

  return (
    <div className={`flex h-screen bg-background text-foreground ${theme}`}>
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
            SQL GPT
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-sm font-medium text-muted-foreground truncate">{user?.name}</span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-300 flex items-center justify-center relative overflow-hidden group shadow-sm active:scale-95 border border-transparent hover:border-border/40"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                <Moon 
                  size={18} 
                  className={`absolute transition-all duration-500 transform ${
                    theme === 'dark' 
                      ? 'rotate-0 scale-100 text-indigo-400' 
                      : 'rotate-90 scale-0 opacity-0'
                  }`} 
                />
                <Sun 
                  size={18} 
                  className={`absolute transition-all duration-500 transform ${
                    theme === 'light' 
                      ? 'rotate-0 scale-100 text-amber-500' 
                      : '-rotate-90 scale-0 opacity-0'
                  }`} 
                />
              </div>
            </button>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-3 py-2 w-full text-left rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

export default Layout;
