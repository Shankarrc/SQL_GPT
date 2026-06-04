import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Database,
  TerminalSquare,
  Activity,
  Check,
  ChevronRight,
  ChevronLeft,
  Copy,
  ExternalLink,
  AlertCircle,
  Play,
  Sparkles,
  CheckCircle2,
  Info,
  Server,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    databases: 0,
    queries: 0,
  });
  const [systemStatus, setSystemStatus] = useState<'checking' | 'operational' | 'offline'>('checking');

  // Interactive wizard states
  const [currentStep, setCurrentStep] = useState(1);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [openTroubleshooting, setOpenTroubleshooting] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setSystemStatus('checking');
      try {
        const [dbRes, sqlRes] = await Promise.all([
          api.get('/database/list'),
          api.get('/sql/history')
        ]);
        setStats({
          databases: dbRes.data.length,
          queries: sqlRes.data.length,
        });
        setSystemStatus('operational');
      } catch (error) {
        console.error('Failed to fetch stats', error);
        setSystemStatus('offline');
      }
    };
    fetchStats();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const steps = [
    { id: 1, title: 'Verify Service', desc: 'Ensure database is running' },
    { id: 2, title: 'Add Connection', desc: 'Enter host & credentials' },
    { id: 3, title: 'Activate DB', desc: 'Set active connection' },
    { id: 4, title: 'Execute SQL', desc: 'Run AI-generated queries' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">Overview of your SQL GPT usage.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected DB Connections</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.databases}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queries Executed</CardTitle>
            <TerminalSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.queries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className={`h-4 w-4 ${systemStatus === 'operational'
              ? 'text-emerald-500 animate-pulse'
              : systemStatus === 'checking'
                ? 'text-blue-400 animate-spin'
                : 'text-red-500'
              }`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${systemStatus === 'operational'
              ? 'text-emerald-500'
              : systemStatus === 'checking'
                ? 'text-blue-400'
                : 'text-red-500'
              }`}>
              {systemStatus === 'checking' ? 'Checking...' : systemStatus === 'operational' ? 'Operational' : 'Offline'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Setup Guide */}
      <Card className="border border-violet-500/20 bg-gradient-to-br from-card to-violet-950/5 relative overflow-hidden shadow-lg">
        <CardHeader className="border-b border-border/40 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                Getting Started: Connect & Execute SQL on Cloud Host
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                Follow this step-by-step interactive guide to link your cloud database and perform AI-powered query execution.
              </CardDescription>
            </div>
            <div className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1.5 rounded-full font-semibold self-start md:self-center">
              Setup Progress: Step {currentStep} of {steps.length} ({Math.round((currentStep / steps.length) * 100)}%)
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Progress Timeline Tracker */}
          <div className="mb-8 hidden md:block">
            <div className="flex items-center justify-between relative px-8">
              {/* Progress Line Background */}
              <div className="absolute top-5 left-12 right-12 h-[2px] bg-secondary z-0" />
              {/* Active Progress Line */}
              <div
                className="absolute top-5 left-12 h-[2px] bg-primary z-0 transition-all duration-500 ease-in-out"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 82}%` }}
              />

              {steps.map((step) => {
                const isCompleted = step.id < currentStep;
                const isActive = step.id === currentStep;
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className="z-10 flex flex-col items-center group focus:outline-none"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                      ? 'bg-primary border-primary text-primary-foreground'
                      : isActive
                        ? 'bg-background border-primary text-primary scale-110 ring-4 ring-primary/20'
                        : 'bg-background border-muted text-muted-foreground group-hover:border-muted-foreground'
                      }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                    </div>
                    <span className={`text-xs font-semibold mt-2 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                      }`}>
                      {step.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground hidden lg:block mt-0.5 max-w-[120px] text-center">
                      {step.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Steps Content Area */}
          <div className="min-h-[280px] bg-secondary/10 p-6 rounded-xl border border-border/30">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary" /> Step 1: Verify Database Service
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ensure that your database service is active and open to connections.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Aiven Cloud Configuration</h4>
                    <div className="bg-secondary/40 p-4 rounded-lg border text-sm space-y-2 font-mono">
                      <div><span className="text-muted-foreground">Host:</span> mysql-15cc4cc3-shankar7750739-4ea9.i.aivencloud.com</div>
                      <div><span className="text-muted-foreground">Port:</span> 25249</div>
                      <div><span className="text-muted-foreground">Username:</span> avnadmin</div>
                    </div>
                    <div className="text-red-500 font-semibold text-xs animate-pulse">
                      ⚠️ Don't change host, port, username, password
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Service Status Commands</h4>
                    <p className="text-xs text-muted-foreground">Check or start your database service using terminal:</p>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="text-[10px] text-muted-foreground uppercase font-mono">Windows (PowerShell)</div>
                        <div className="flex items-center justify-between bg-background border p-2.5 rounded-lg text-xs font-mono">
                          <span className="truncate">Get-Service -Name MySQL*</span>
                          <button
                            onClick={() => handleCopy('Get-Service -Name MySQL*', 'win-mysql')}
                            className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
                            title="Copy command"
                          >
                            {copiedText === 'win-mysql' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] text-muted-foreground uppercase font-mono">macOS (Homebrew)</div>
                        <div className="flex items-center justify-between bg-background border p-2.5 rounded-lg text-xs font-mono">
                          <span className="truncate">brew services status mysql</span>
                          <button
                            onClick={() => handleCopy('brew services status mysql', 'mac-mysql')}
                            className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
                            title="Copy command"
                          >
                            {copiedText === 'mac-mysql' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" /> Step 2: Add Database Connection
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure your connection. The platform runs in the cloud, allowing it to communicate with your database server.
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-lg text-sm flex gap-3 shadow-inner">
                      <Info className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block mb-0.5">Host and Connection Rules:</span>
                        For cloud database engines, ensure the Host input is set to your database provider's public host URL. This instructs SQL GPT to connect directly to your database server.
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Tips for filling out the Connection form:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Connection Name:</strong> Write a custom identifier, e.g. <code className="font-mono bg-secondary px-1 rounded">Dev_MySQL</code>.</li>
                        <li><strong>Database Name:</strong> Specify the exact database name you want to query. If it does not exist yet, select the <em>"Create database if it does not exist"</em> checkbox.</li>
                      </ul>
                    </div>

                    <div>
                      <Link
                        to="/db-connection"
                        className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-md shadow-primary/10"
                      >
                        Go to DB Connection <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Form Mockup Preview */}
                  <div className="border rounded-xl bg-background/50 p-5 space-y-4 relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-[10px] uppercase font-mono tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/25">
                      Visual Form Guide
                    </div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Example Settings</h4>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block mb-1">Connection Name</span>
                        <div className="bg-background border p-2 rounded font-mono text-foreground">MySQL_Connector</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-1">Type</span>
                        <div className="bg-background border p-2 rounded font-mono text-foreground capitalize">mysql</div>
                      </div>
                      <div className="col-span-2 border-2 border-primary/80 rounded-lg p-2.5 bg-primary/5">
                        <span className="text-primary font-semibold block mb-0.5 text-[11px]">Host (Crucial Step)</span>
                        <div className="font-mono text-foreground text-xs break-all font-bold">mysql-15cc4cc3-shankar7750739-4ea9.i.aivencloud.com</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-1">Port</span>
                        <div className="bg-background border p-2 rounded font-mono text-foreground">25249</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-1">Username</span>
                        <div className="bg-background border p-2 rounded font-mono text-foreground">avnadmin</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground block mb-1">Database Name</span>
                        <div className="bg-background border p-2 rounded font-mono text-foreground italic">defaultdb</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> Step 3: Activate Connection
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select your connection from the list to make it the active database target.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You can add multiple database credentials in SQL GPT, but the AI SQL Generator only communicates with the active connection.
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
                      <li>Locate the <strong>Saved Connections</strong> section.</li>
                      <li>Click on your database connection card.</li>
                      <li>Observe the border transition to purple and the emergence of the green checkmark icon.</li>
                      <li>Your Dashboard statistic card for "Connected DB Connections" will increment.</li>
                    </ol>
                    <div>
                      <Link
                        to="/db-connection"
                        className="inline-flex items-center gap-1.5 border border-border hover:bg-accent text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                      >
                        Select Active Connection <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center items-center p-6 border rounded-xl bg-background/30 space-y-4">
                    {/* Mock Active Connection Representation */}
                    <div className="w-full max-w-xs border-2 border-primary bg-primary/5 p-4 rounded-xl flex items-center justify-between shadow-md animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <Database size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">Aiven MySQL</h4>
                          <p className="text-[10px] text-muted-foreground uppercase">MYSQL • mysql-15cc4cc3-shankar7750739-4ea9.i.aivencloud.com:25249</p>
                        </div>
                      </div>
                      <CheckCircle2 className="text-primary h-5 w-5 fill-primary/10" />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Connection active indicator: card lights up with a check icon.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Play className="w-5 h-5 text-primary" /> Step 4: Write & Run SQL Queries
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate production-ready queries using conversational natural language and test them instantly.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                        <Sparkles className="w-4 h-4" /> Prompt-to-SQL Conversion
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Input details of the table or data you want to retrieve. The generator scans your schemas automatically.
                      </p>
                      <div className="bg-background border p-2.5 rounded font-mono text-xs text-foreground italic">
                        "Find all accounts registered after January 1st ordered by user status"
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Running a Query:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Generate SQL:</strong> Submits the prompt to GPT, outputting fully styled SQL in the Monaco editor.</li>
                        <li><strong>Run Query:</strong> Executes the query directly, showing output tables below the editor.</li>
                      </ul>
                    </div>

                    <div>
                      <Link
                        to="/editor"
                        className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-md shadow-primary/10"
                      >
                        Open SQL Editor <Sparkles className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="border rounded-xl bg-background/50 p-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Execution Pipeline</span>

                      <div className="space-y-3 text-xs">
                        <div className="bg-background p-2.5 rounded border flex items-center justify-between">
                          <span className="text-muted-foreground">Prompt:</span>
                          <span className="font-semibold text-foreground">"List all tables"</span>
                        </div>
                        <div className="flex justify-center text-muted-foreground">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                        <div className="bg-background p-2.5 rounded border flex items-center justify-between font-mono text-violet-400">
                          <span>SHOW TABLES;</span>
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex justify-center text-muted-foreground">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded text-emerald-500 flex items-center gap-2 font-semibold">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Executed successfully. Output rendered below.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
              disabled={currentStep === steps.length}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Troubleshooting Section */}
          <div className="mt-8 border-t border-border/40 pt-6">
            <button
              onClick={() => setOpenTroubleshooting(!openTroubleshooting)}
              className="flex items-center justify-between w-full text-left font-semibold text-foreground hover:text-primary transition-colors focus:outline-none"
            >
              <span className="flex items-center gap-2 text-sm">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                Stuck? View Troubleshooting & FAQ for Connections
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openTroubleshooting ? 'transform rotate-180' : ''}`} />
            </button>

            {openTroubleshooting && (
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-xs animate-in fade-in duration-200">
                <div className="border p-4 rounded-xl bg-background/30 space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" /> Connection Refused
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Cause:</strong> Your database server is not running, or it's listening on a custom port instead of the default.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Fix:</strong> Execute the status command in Step 1 to verify execution. Ensure the port value on the connection configuration form is correct (MySQL: 3306).
                  </p>
                </div>

                <div className="border p-4 rounded-xl bg-background/30 space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" /> Access Denied / Authentication Failed
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Cause:</strong> The credentials (username or password) supplied are incorrect or lack access rights.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Fix:</strong> Confirm that you can sign into your database via command line or terminal. Verify you typed the username/password exactly without typo.
                  </p>
                </div>

                <div className="border p-4 rounded-xl bg-background/30 space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" /> Unknown Database
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Cause:</strong> The database name specified does not exist on your SQL host.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Fix:</strong> Tick the <em>"Create database if it does not exist"</em> checkbox in the connection form. The server will run the create script on your behalf.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
