import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Database, LayoutDashboard, TerminalSquare, LogOut, Server, Sun, Moon, Menu, X } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import { Toaster } from './ui/toaster';
import Footer from './Footer';
import logoImg from '../assets/logo.png';

const Layout = () => {
  const { logout, user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { name: 'Databases', path: '/app/databases', icon: Database },
    { name: 'DB Connection', path: '/app/db-connection', icon: Server },
    { name: 'SQL Editor', path: '/app/editor', icon: TerminalSquare },
  ];

  return (
    <div className={`flex flex-col h-screen h-[100dvh] bg-background text-foreground ${theme}`}>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 border-b bg-card z-30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md overflow-hidden shrink-0 border border-slate-200/50 dark:border-zinc-800/50">
            <img src={logoImg} alt="SQLGPT Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
            SQLGPT
          </h1>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMenuOpen(false)}
          />
          {/* Drawer Content */}
          <aside className="relative w-64 bg-card border-r flex flex-col h-full z-50 animate-in slide-in-from-left duration-200">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md overflow-hidden shrink-0 border border-slate-200/50 dark:border-zinc-800/50">
                  <img src={logoImg} alt="SQLGPT Logo" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
                  SQLGPT
                </h1>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
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
                <span className="text-sm font-medium text-muted-foreground truncate max-w-[140px]">{user?.name}</span>
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
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="flex items-center space-x-3 px-3 py-2 w-full text-left rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Upper Layout: Sidebar + Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 border-r bg-card flex-col">
          <div className="p-6 border-b flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md overflow-hidden shrink-0 border border-slate-200/50 dark:border-zinc-800/50">
              <img src={logoImg} alt="SQLGPT Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
              SQLGPT
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

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-background flex flex-col h-full min-h-0">
          <Outlet />
        </main>
      </div>

      {/* Full Width Footer */}
      <Footer />
      <Toaster />
    </div>
  );
};

export default Layout;
