import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, Sparkles, ArrowRight, ArrowDown, 
  ShieldCheck, Zap, Menu, X, Mail, CheckCircle2 
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Monitor scroll for header background styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50 font-jakarta selection:bg-violet-500/20 selection:text-violet-600 transition-colors duration-300">
      
      {/* Premium Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-zinc-800/50 py-3 shadow-sm' 
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-violet-500/20 shrink-0 border border-slate-200/50 dark:border-zinc-800/50">
              <img src={logoImg} alt="SQLGPT Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold font-outfit tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 dark:from-violet-400 dark:via-indigo-300 dark:to-emerald-400 bg-clip-text text-transparent">
              SQLGPT
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 font-medium text-sm text-slate-600 dark:text-zinc-400">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Home</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Features</button>
            <button onClick={() => scrollToSection('showcase')} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Showcase</button>
            <button onClick={() => scrollToSection('about-dev')} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Developer</button>
            <button onClick={() => scrollToSection('guide')} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Quick Guide</button>
          </nav>

          {/* Action Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-semibold hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="relative px-6 py-2.5 rounded-full text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 transition-all shadow-md flex items-center gap-1.5 hover:scale-[1.03] active:scale-95"
            >
              Let's chat 👏
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 p-6 flex flex-col space-y-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200 md:hidden">
            <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); }} className="text-left py-2 font-medium border-b border-slate-100 dark:border-zinc-800">Home</button>
            <button onClick={() => scrollToSection('features')} className="text-left py-2 font-medium border-b border-slate-100 dark:border-zinc-800">Features</button>
            <button onClick={() => scrollToSection('showcase')} className="text-left py-2 font-medium border-b border-slate-100 dark:border-zinc-800">Showcase</button>
            <button onClick={() => scrollToSection('about-dev')} className="text-left py-2 font-medium border-b border-slate-100 dark:border-zinc-800">Developer</button>
            <button onClick={() => scrollToSection('guide')} className="text-left py-2 font-medium border-b border-slate-100 dark:border-zinc-800">Quick Guide</button>
            <div className="pt-2 flex flex-col space-y-3">
              <button 
                onClick={() => navigate('/login')}
                className="w-full text-center py-2.5 rounded-full text-sm font-semibold border border-slate-300 dark:border-zinc-700"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="w-full text-center py-2.5 rounded-full text-sm font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
              >
                Let's chat 👏
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-between pt-32 pb-16 overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-80 h-80 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
        
        <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 text-center z-10">
          
          {/* Badge */}
          <div className="mb-6 px-4 py-1.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/40 text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-POWERED DATABASE COMPANION</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-outfit tracking-tight text-zinc-900 dark:text-white leading-[1.1] max-w-4xl">
            Strategy-led creative partner for scaling{' '}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 dark:from-violet-400 dark:via-fuchsia-300 dark:to-emerald-400 bg-clip-text text-transparent">
              database workflows
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-8 text-lg sm:text-xl text-slate-600 dark:text-zinc-400 max-w-2xl font-light leading-relaxed">
            We help developers and data analysts shape the database presence that drives the next stage of growth. Connect external servers, generate SQL using natural language, and run safety-checked transactions.
          </p>

          {/* Action buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-full text-base font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-500 dark:text-zinc-950 dark:hover:bg-violet-400 transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2 hover:scale-[1.03] active:scale-95 group"
            >
              Get started for free ⚡
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="px-8 py-4 rounded-full text-base font-semibold border border-slate-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 hover:scale-[1.03] active:scale-95"
            >
              Explore features
            </button>
          </div>

          {/* Circular Scroll Down indicator */}
          <button 
            onClick={() => scrollToSection('features')}
            className="mt-16 w-12 h-12 rounded-full bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-lg group"
            aria-label="Scroll down to content"
          >
            <ArrowDown className="w-5 h-5 transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>


      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-24 border-b border-slate-200/50 dark:border-zinc-800/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-zinc-900 dark:text-white">
              Supercharge your query capabilities
            </h2>
            <p className="mt-4 text-slate-600 dark:text-zinc-400">
              By removing the gap between raw data storage and generative insights, SQLGPT delivers a premium workbench interface.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="p-8 rounded-2xl border border-slate-200 bg-white/60 dark:border-zinc-800 dark:bg-zinc-900/40 backdrop-blur-sm shadow-sm hover:border-violet-500/30 dark:hover:border-violet-500/20 transition-all duration-300 group hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/5 dark:text-violet-400 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                Natural Language Prompting
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Describe the details you need in plain English. The integrated Gemini AI automatically maps queries to your configuration's table structures.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-2xl border border-slate-200 bg-white/60 dark:border-zinc-800 dark:bg-zinc-900/40 backdrop-blur-sm shadow-sm hover:border-indigo-500/30 dark:hover:border-indigo-500/20 transition-all duration-300 group hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/5 dark:text-indigo-400 flex items-center justify-center mb-6">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Multi-Database Linkage
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Seamlessly configure connections to local and remote databases. Maintain dedicated setups for production testing and sandbox schemas.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-2xl border border-slate-200 bg-white/60 dark:border-zinc-800 dark:bg-zinc-900/40 backdrop-blur-sm shadow-sm hover:border-emerald-500/30 dark:hover:border-emerald-500/20 transition-all duration-300 group hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-400 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Safety & Validation First
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Every query goes through a strict safety parser to ensure structural integrity and protect against malicious commands or unintended database locks.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Showcase Section */}
      <section id="showcase" className="py-24 bg-slate-100/55 dark:bg-zinc-900/10 border-b border-slate-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase text-violet-600 dark:text-violet-400 tracking-wider">
                LIVE INTERACTIVE GRAPHIC
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-zinc-900 dark:text-white">
                Connect and Query in under 60 seconds
              </h2>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                Connect external schemas and browse columns, tables, and views dynamically in a visual explorer panel. Review previous execution streams in a sidebar timeline to replay critical queries instantly.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Fast visual schema explorer trees</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Live query executor & grid results formatter</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Safe, read-only options & full transaction control</span>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 rounded-full text-sm font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center gap-1.5 hover:scale-[1.03]"
                >
                  Start Querying Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Showcase Visual Mock */}
            <div className="lg:col-span-7">
              <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden hover:border-violet-500/20 transition-all duration-500">
                
                {/* Visual Window Header */}
                <div className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800/80 px-4 py-3 flex items-center justify-between shrink-0">
                  <div className="flex space-x-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-slate-500 dark:text-zinc-500">SQL_GPT_Workbench.tsx</span>
                  <div className="w-4" />
                </div>

                {/* Visual Workbench Content */}
                <div className="p-6 space-y-4 font-mono text-xs">
                  
                  {/* Database Input */}
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40">
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2 font-sans font-bold">
                      Active User Prompt
                    </div>
                    <span className="text-slate-700 dark:text-zinc-300">
                      "Find total orders and customer names for orders matching status 'Completed' after 2026."
                    </span>
                  </div>

                  {/* AI Generating Animation block */}
                  <div className="flex items-center gap-2.5 text-violet-600 dark:text-violet-400 font-sans font-bold text-xs py-1">
                    <Zap className="w-4 h-4 animate-pulse shrink-0" />
                    <span>Gemini AI Generating SQL Structure...</span>
                  </div>

                  {/* Output Code Panel */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-900 text-slate-200 overflow-x-auto shadow-inner">
                    <pre className="text-left font-mono leading-relaxed">
{`SELECT c.customer_name, COUNT(o.order_id) AS total_orders
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.status = 'Completed' AND o.order_date > '2026-01-01'
GROUP BY c.customer_name
ORDER BY total_orders DESC;`}
                    </pre>
                  </div>

                  {/* Results preview */}
                  <div className="border border-slate-200 dark:border-zinc-800/80 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-[11px] font-sans border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-500 font-bold border-b border-slate-200 dark:border-zinc-800">
                          <th className="px-4 py-2 border-r border-slate-200 dark:border-zinc-800">customer_name</th>
                          <th className="px-4 py-2">total_orders</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100 dark:border-zinc-800/40 text-slate-700 dark:text-zinc-300">
                          <td className="px-4 py-2 border-r border-slate-200 dark:border-zinc-800 font-medium">Shankar S</td>
                          <td className="px-4 py-2 font-mono">142</td>
                        </tr>
                        <tr className="text-slate-700 dark:text-zinc-300">
                          <td className="px-4 py-2 border-r border-slate-200 dark:border-zinc-800 font-medium">Eloqwnt Corp</td>
                          <td className="px-4 py-2 font-mono">98</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* About Developer Section */}
      <section id="about-dev" className="py-24 border-b border-slate-200/50 dark:border-zinc-800/50 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-violet-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 flex justify-center lg:justify-start">
              <div className="relative group shrink-0">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300" />
                <div className="relative rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl flex flex-col items-center text-center max-w-sm">
                  
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 dark:border-zinc-800 bg-slate-200 relative mb-4 shrink-0 shadow-md">
                    <img 
                      src="https://github.com/Shankarrc.png" 
                      alt="SHANKAR S" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80";
                      }}
                    />
                  </div>

                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">SHANKAR S</h3>
                  <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold uppercase tracking-wider mt-1">
                    Full Stack Developer
                  </p>
                  
                  <p className="mt-4 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Passionate software engineer building modern, secure, and AI-integrated web applications. Architect of SQL GPT workspace.
                  </p>

                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800 w-full flex flex-wrap justify-center gap-1.5">
                    {['React', 'TypeScript', 'Java', 'Spring Boot', 'MySQL', 'Generative AI'].map((skill) => (
                      <span key={skill} className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded font-semibold border border-slate-200/50 dark:border-zinc-700/50">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <a 
                    href="mailto:shankar7750739@gmail.com"
                    className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium text-xs border border-slate-200 dark:border-zinc-800 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>shankar7750739@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                STRATEGY & DEVELOPMENT
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-zinc-900 dark:text-white">
                Meet the engineering behind SQLGPT
              </h2>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                SQLGPT was developed to solve a critical business bottleneck: giving non-technical stakeholders or busy programmers instant access to write structured analytical database queries safely, without constant human oversight.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 font-outfit">10X</div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Workflow Speedup</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-500 leading-relaxed">
                    Convert descriptions directly to formatted SQL scripts in seconds, bypassing manual drafting cycles.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 font-outfit">100%</div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Secure Sandboxing</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-500 leading-relaxed">
                    Safety validations block dangerous DROP, TRUNCATE, or schema mutation actions unless explicitly override-authorized.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Guide Section */}
      <section id="guide" className="py-24 bg-slate-100/50 dark:bg-zinc-900/10 border-b border-slate-200/50 dark:border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-zinc-900 dark:text-white">
            Quick setup guide
          </h2>
          <p className="text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Ready to integrate your schemas? Follow our streamlined configuration process to query databases in no time.
          </p>

          <div className="grid sm:grid-cols-3 gap-8 text-left pt-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h4 className="font-bold text-zinc-900 dark:text-white">Sign-In & Verify</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-500 leading-relaxed">
                Connect securely with your Google profile to initialize a dedicated user history partition.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h4 className="font-bold text-zinc-900 dark:text-white">Add Connection</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-500 leading-relaxed">
                Enter your connection credentials in the configuration panel to let SQLGPT index table columns.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h4 className="font-bold text-zinc-900 dark:text-white">Prompt & Execute</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-500 leading-relaxed">
                Type natural language prompts, check the generated SQL scripts, and run safety-checked transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden text-center max-w-5xl mx-auto px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[100px] pointer-events-none" />
        <div className="relative space-y-8 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-bold font-outfit text-zinc-900 dark:text-white">
            Unlock AI-powered analytics today
          </h2>
          <p className="text-slate-600 dark:text-zinc-400 text-lg leading-relaxed font-light max-w-xl mx-auto">
            Get started for free. No credit card required. Experience premium SQL autocomplete, visual database navigation, and immediate results formatting.
          </p>
          <div className="pt-2 flex justify-center">
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-full text-base font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-lg flex items-center gap-2 hover:scale-[1.03] active:scale-95"
            >
              Get started for free
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="border-t border-slate-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 py-12 text-center text-xs text-slate-500 dark:text-zinc-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md overflow-hidden shadow-md shrink-0 border border-slate-200/50 dark:border-zinc-800/50">
              <img src={logoImg} alt="SQLGPT Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-slate-800 dark:text-zinc-200 font-outfit">SQLGPT</span>
          </div>
          <p>© 2026 SQLGPT Project. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="https://github.com/Shankarrc" target="_blank" rel="noreferrer" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">GitHub</a>
            <a href="https://www.linkedin.com/in/shankar-s-abb640299/" target="_blank" rel="noreferrer" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">LinkedIn</a>
            <a href="mailto:shankar7750739@gmail.com" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Email</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
