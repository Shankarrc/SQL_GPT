import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Database, LayoutDashboard, TerminalSquare, LogOut, Server, Sun, Moon, Info, X, Mail } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import { Toaster } from './ui/toaster';

const Layout = () => {
  const { logout, user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const [aboutOpen, setAboutOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Databases', path: '/databases', icon: Database },
    { name: 'DB Connection', path: '/db-connection', icon: Server },
    { name: 'SQL Editor', path: '/editor', icon: TerminalSquare },
  ];

  return (
    <div className={`flex flex-col h-screen bg-background text-foreground ${theme}`}>
      {/* Upper Layout: Sidebar + Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card flex flex-col">
          <div className="p-6 border-b">
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
        <main className="flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>

      {/* Full Width Footer */}
      <footer className="py-4 px-8 border-t bg-card text-center flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs text-muted-foreground shrink-0 z-40">
        <div>
         Copyright © {new Date().getFullYear()} | SQLGPT | Developed by <span className="font-semibold text-foreground">SHANKAR S</span>.
        </div>
        <button 
          onClick={() => setAboutOpen(true)}
          className="flex items-center gap-1 hover:text-primary transition-colors px-2.5 py-1 rounded bg-secondary/30 hover:bg-secondary/60 font-medium"
        >
          <Info size={14} /> About Developer
        </button>
      </footer>

      {/* About Developer Modal */}
      {aboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setAboutOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Profile Image */}
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg bg-muted">
                <img 
                  src="https://github.com/Shankarrc.png" 
                  alt="SHANKAR S" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80";
                  }}
                />
              </div>

              {/* Name & Title */}
              <div>
                <h3 className="text-xl font-bold text-foreground">SHANKAR S</h3>
                <p className="text-sm text-muted-foreground font-medium mt-0.5">Full Stack Developer</p>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed px-2">
                Passionate software engineer building modern, secure, and AI-integrated web applications. Developer of SQL GPT.
              </p>

              {/* Divider */}
              <div className="w-full h-px bg-border/60 my-2" />

              {/* Contact Details */}
              <div className="w-full space-y-3 text-sm">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <Mail size={16} className="text-primary" />
                  <span className="text-muted-foreground select-all">shankar7750739@gmail.com</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 w-full pt-2">
                <a 
                  href="https://github.com/Shankarrc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </a>
                <a 
                  href="https://linkedin.com/in/shankarrc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default Layout;
