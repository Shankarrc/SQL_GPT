import { Mail, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import devBanner from '../assets/dev_banner.png';
import step1Verify from '../assets/step1_verify.png';
import step2Config from '../assets/step2_config.png';
import step3Activate from '../assets/step3_activate.png';
import step4Execute from '../assets/step4_execute.png';
import loginScreen from '../assets/login.png';

const About = () => {
  const navigate = useNavigate();
  const skills = [
    'React', 'TypeScript', 'Java', 'Spring Boot', 'MySQL', 
    'Tailwind CSS', 'REST APIs', 'Generative AI', 'Zustand'
  ];

  const steps = [
    {
      num: '01',
      title: 'User Authentication',
      badge: 'Step 1: Sign-In',
      desc: 'Access the SQL GPT workspace securely by signing in with your Google account. This initializes your user profile, active settings, and query execution history logs.',
      bullets: [
        'Click the "Sign in with Google" button on the portal login screen.',
        'Choose your Google account profile to grant OAuth authentication.',
        'Upon successful verification, you will be redirected to the Dashboard.'
      ],
      img: loginScreen,
    },
    {
      num: '02',
      title: 'Verify Database Service',
      badge: 'Step 2: Service Status Check',
      desc: 'Ensure that your database service is active and open to connections. You can check the status of your databases using local terminal commands or cloud credentials.',
      bullets: [
        'Windows (PowerShell) command: Get-Service -Name MySQL*',
        'macOS (Homebrew) command: brew services status mysql',
        'Default cloud host: mysql-15cc4cc3-shankar7750739-4ea9.i.aivencloud.com (port 25249).'
      ],
      img: step1Verify,
    },
    {
      num: '03',
      title: 'Add DB Connection',
      badge: 'Step 3: Database Configuration',
      desc: 'Configure connection details for your target database server. Keep the default host, port, username, and password parameters.',
      bullets: [
        'Connection Name: Enter your connection tag, e.g. "Shankar".',
        'Database Name: Specify target DB (e.g. sample_tb) and check "Create database if it does not exist".',
        'Click "Connect & Save" to verify credentials and save connection.'
      ],
      img: step2Config,
    },
    {
      num: '04',
      title: 'Database Explorer',
      badge: 'Step 4: Manage Configurations',
      desc: 'Inspect schemas, browse columns, and review saved database connections. Connecting a server enables schema indexing.',
      bullets: [
        'Browse all configured servers and active connection listings.',
        'Check connection schemas and expand databases inside explorer sidebar trees.',
        'Click "Connect Server" in Database Manager if no configurations are linked.'
      ],
      img: step3Activate,
    },
    {
      num: '05',
      title: 'SQL Editor Execution',
      badge: 'Step 5: Prompt and Execute',
      desc: 'Ask the AI to generate queries using conversational natural language or write standard SQL directly in the editor, then run transactions.',
      bullets: [
        'Type prompts in prompt field (e.g. "Find all tables") and click "Generate SQL".',
        'Execute transactions against the active connection via the "Execute" button.',
        'Inspect structured records inside the Results panel.'
      ],
      img: step4Execute,
    }
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto overflow-y-auto h-full">
      {/* Page Header */}
      <div className="flex items-start space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground transition-all border border-border/80 bg-card/50 shadow-sm active:scale-95 shrink-0"
          aria-label="Go back to previous page"
        >
          <ArrowLeft size={20} className="stroke-[2.5]" />
        </button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            About & Guide
          </h2>
          <p className="text-muted-foreground mt-2">Discover developer details and learn step-by-step how to configure and query databases.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Developer Profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="relative overflow-hidden rounded-2xl border bg-card shadow-lg flex flex-col group transition-all duration-300 hover:border-violet-500/20">
            {/* Banner Illustration */}
            <div className="h-32 w-full relative overflow-hidden bg-muted shrink-0">
              <img 
                src={devBanner} 
                alt="Tech Banner" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>

            {/* Profile Avatar overlay */}
            <div className="relative flex justify-center -mt-12 shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-card shadow-md bg-muted relative">
                <img 
                  src="https://github.com/Shankarrc.png" 
                  alt="SHANKAR S" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80";
                  }}
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-6 text-center space-y-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">SHANKAR S</h3>
                <p className="text-sm text-muted-foreground font-medium mt-0.5">Full Stack Developer</p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Passionate software engineer building modern, secure, and AI-integrated web applications. Architect of SQL GPT.
              </p>

              {/* Skills matrix */}
              <div className="pt-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left mb-2.5">Skills & Expertise</h4>
                <div className="flex flex-wrap gap-1.5 justify-start">
                  {skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="text-[10px] bg-secondary/80 text-foreground font-semibold px-2 py-0.5 rounded border transition-colors hover:border-violet-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact badge links */}
              <div className="pt-4 border-t space-y-2.5 text-xs text-left">
                <a 
                  href="mailto:shankar7750739@gmail.com"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/35 hover:bg-secondary/70 transition-colors"
                >
                  <Mail size={14} className="text-primary shrink-0" />
                  <span className="text-muted-foreground truncate select-all">shankar7750739@gmail.com</span>
                </a>
                
                <div className="flex gap-2">
                  <a 
                    href="https://github.com/Shankarrc" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border hover:bg-accent hover:text-foreground transition-colors font-medium text-xs"
                  >
                    <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    <span>GitHub</span>
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/shankar-s-abb640299/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-colors font-medium text-xs"
                  >
                    <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Step-by-Step Usage Guide */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border bg-card rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <h3 className="text-lg font-bold text-foreground">Project Usage Guide</h3>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed -mt-3">
              SQL GPT links conversational Gemini AI prompting directly with external databases. Here is how to complete database connection setup, activate resources, and run your queries.
            </p>

            {/* Accordion/Flow List */}
            <div className="space-y-8 pt-2">
              {steps.map((step, idx) => (
                <div key={idx} className="grid gap-6 md:grid-cols-12 items-start relative border-l-2 border-primary/20 pl-6 pb-2 last:pb-0">
                  {/* Step Number Dot indicator */}
                  <div className="absolute -left-[13px] top-0.5 bg-primary text-primary-foreground font-bold font-mono text-xs w-6 h-6 rounded-full flex items-center justify-center border border-card shadow-sm">
                    {idx + 1}
                  </div>

                  {/* Text Details */}
                  <div className="md:col-span-7 space-y-3">
                    <div>
                      <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mb-1">
                        {step.badge}
                      </span>
                      <h4 className="text-base font-bold text-foreground flex items-center gap-1.5">
                        {step.title}
                      </h4>
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>

                    <ul className="space-y-1.5">
                      {step.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="text-[11px] text-muted-foreground flex items-start gap-2 leading-relaxed">
                          <span className="text-emerald-500 font-bold shrink-0">✔</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Illustration Image */}
                  <div className="md:col-span-5 relative rounded-xl overflow-hidden border border-border/80 shadow-md aspect-video bg-muted shrink-0">
                    <img 
                      src={step.img} 
                      alt={step.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
