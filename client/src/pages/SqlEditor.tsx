import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useDbStore } from '../store/useDbStore';
import { useThemeStore } from '../store/useThemeStore';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Play, Sparkles, AlertCircle, Copy, Check, Table2, Database, Folder, Scroll, Loader2, History, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from '../store/useToastStore';

const SqlEditor = () => {
  const { theme } = useThemeStore();
  const { activeConnection, setActiveConnection } = useDbStore();
  const [sql, setSql] = useState('-- Write your SQL here or ask the AI to generate it for you\n\n');
  const [prompt, setPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [execLoading, setExecLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Database Explorer states
  const [connections, setConnections] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ai' | 'schema' | 'history'>('ai');
  const [selectedTable, setSelectedTable] = useState('');
  const [columns, setColumns] = useState<any[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [columnsLoading, setColumnsLoading] = useState(false);

  // SQL Query History states
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedHistoryConns, setExpandedHistoryConns] = useState<Record<string, boolean>>({});
  const [mobileActiveTab, setMobileActiveTab] = useState<'sidebar' | 'editor' | 'results'>('sidebar');

  useEffect(() => {
    if (mobileActiveTab === 'editor') {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mobileActiveTab]);

  // Toggle history connection expansion
  const toggleHistoryConn = (connId: string) => {
    setExpandedHistoryConns(prev => ({
      ...prev,
      [connId]: !prev[connId]
    }));
  };

  // Auto-expand active connection in history tree when switching active connection
  useEffect(() => {
    if (activeConnection) {
      setExpandedHistoryConns(prev => ({ ...prev, [activeConnection._id]: true }));
    }
  }, [activeConnection]);

  // Fetch connections and history on load
  useEffect(() => {
    api.get('/database/list')
      .then(res => setConnections(res.data))
      .catch(console.error);
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/sql/history');
      setHistory(res.data);
      if (activeConnection) {
        setExpandedHistoryConns(prev => ({ ...prev, [activeConnection._id]: true }));
      }
    } catch (error) {
      console.error('Failed to fetch SQL query history', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this query history item?')) {
      try {
        await api.delete(`/sql/history/${id}`);
        fetchHistory();
        toast.success('Query history item deleted successfully');
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Failed to delete query history item');
      }
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your entire query history? This cannot be undone.')) {
      try {
        await api.delete('/sql/history');
        fetchHistory();
        toast.success('Query history cleared successfully');
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Failed to clear query history');
      }
    }
  };

  const handleClearConnectionHistory = async (connId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete all query history for this database?')) {
      try {
        await api.delete(`/sql/history/connection/${connId}`);
        fetchHistory();
        toast.success('Database query history cleared successfully');
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Failed to clear database query history');
      }
    }
  };

  // Sync tables, columns and selectedTable with active connection changes
  useEffect(() => {
    if (activeConnection) {
      setTablesLoading(true);
      api.get(`/database/${activeConnection._id}/tables`)
        .then(res => setTables(res.data))
        .catch(console.error)
        .finally(() => setTablesLoading(false));
    } else {
      setTables([]);
    }
    setSelectedTable('');
    setColumns([]);
  }, [activeConnection]);

  // Prepopulate prompt when selectedTable changes
  useEffect(() => {
    if (selectedTable) {
      setPrompt(prev => {
        // If the prompt is empty or just the starter boilerplate for another table, update it
        if (!prev.trim() || prev.startsWith('Query the table')) {
          return `Query the table "${selectedTable}" to `;
        }
        return prev;
      });
    }
  }, [selectedTable]);

  const handleShowTables = async () => {
    if (!activeConnection) return;
    setTablesLoading(true);
    try {
      const res = await api.get(`/database/${activeConnection._id}/tables`);
      setTables(res.data);
      toast.success('Tables loaded successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to load tables');
    } finally {
      setTablesLoading(false);
    }
  };

  const handleShowColumns = async () => {
    if (!activeConnection || !selectedTable.trim()) return;
    setColumnsLoading(true);
    try {
      const res = await api.get(`/database/${activeConnection._id}/tables/${selectedTable}/columns`);
      setColumns(res.data);
      toast.success('Columns loaded successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to load columns');
    } finally {
      setColumnsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt || !activeConnection) return;
    setAiLoading(true);
    setAiResponse(null);
    setAiError(null);
    try {
      // Pass table names, and if a table is selected, include its exact columns/types for precise AI generation
      const tableSchemaPayload = selectedTable && columns.length > 0
        ? [{ table: selectedTable, columns: columns }, ...tables.filter(t => t !== selectedTable)]
        : tables;

      const res = await api.post('/ai/generate-sql', {
        prompt,
        connectionId: activeConnection._id,
        tableSchema: tableSchemaPayload
      });
      setSql(res.data.sql);
      setAiResponse(res.data);
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'AI Generation failed';
      setAiError(errMsg);
    } finally {
      setAiLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!sql.trim() || !activeConnection) return;
    setExecLoading(true);
    try {
      const res = await api.post('/sql/execute', {
        connectionId: activeConnection._id,
        sql,
        prompt: prompt || 'Manual query',
        explanation: aiResponse?.explanation || ''
      });
      setQueryResults(res.data.results);
      toast.success('Query executed successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Execution failed');
    } finally {
      setExecLoading(false);
      fetchHistory();
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group history items by connection ID
  const groupedHistory = history.reduce((groups: Record<string, { name: string; items: any[] }>, item) => {
    const connId = item.connectionId?._id || 'unknown';
    const connName = item.connectionId?.name || 'Unknown Database';
    if (!groups[connId]) {
      groups[connId] = { name: connName, items: [] };
    }
    groups[connId].items.push(item);
    return groups;
  }, {});

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* Mobile view sub-tabs */}
      <div className="md:hidden flex border-b bg-card shrink-0">
        <button
          onClick={() => setMobileActiveTab('sidebar')}
          className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all ${
            mobileActiveTab === 'sidebar'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          Assistant & DB
        </button>
        <button
          onClick={() => setMobileActiveTab('editor')}
          className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all ${
            mobileActiveTab === 'editor'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setMobileActiveTab('results')}
          className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all ${
            mobileActiveTab === 'results'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          Results ({queryResults.length})
        </button>
      </div>

      {/* Tabbed Sidebar */}
      <div className={`w-80 border-r bg-card flex-col h-full shrink-0 ${
        mobileActiveTab === 'sidebar' ? 'flex w-full md:w-80' : 'hidden md:flex'
      }`}>
        {/* Tab Headers */}
        <div className="flex border-b bg-muted/10">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition-all ${activeTab === 'ai'
              ? 'border-primary text-foreground bg-background/40'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/5'
              }`}
          >
            <Sparkles size={13} className="text-primary shrink-0" />
            <span>AI</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition-all ${activeTab === 'schema'
              ? 'border-primary text-foreground bg-background/40'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/5'
              }`}
          >
            <Database size={13} className="text-primary shrink-0" />
            <span>Explorer</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition-all ${activeTab === 'history'
              ? 'border-primary text-foreground bg-background/40'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/5'
              }`}
          >
            <History size={13} className="text-primary shrink-0" />
            <span>History</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {activeTab === 'ai' ? (
            // AI Assistant Tab
            !activeConnection ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-muted-foreground">
                <AlertCircle className="w-12 h-12" />
                <p>Please select a database connection first.</p>
              </div>
            ) : (
              <>
                {selectedTable && (
                  <div className="bg-primary/5 border border-primary/20 rounded-md p-2 flex items-center justify-between text-xs transition-all animate-fadeIn">
                    <div className="flex items-center space-x-1.5 truncate">
                      <Table2 size={14} className="text-primary shrink-0" />
                      <span className="text-muted-foreground">Active Table:</span>
                      <strong className="text-foreground truncate font-mono">{selectedTable}</strong>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTable('');
                        setColumns([]);
                        setPrompt('');
                      }}
                      className="text-red-400 hover:text-red-300 font-medium text-[10px] uppercase tracking-wider pl-2 shrink-0 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">What do you want to query?</label>
                  <textarea
                    className="w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    placeholder="e.g. Find all users who registered in the last 30 days and spent more than $100..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={aiLoading || !prompt}
                  >
                    {aiLoading ? 'Generating...' : 'Generate SQL'}
                  </Button>
                </div>

                {aiError && (
                  <Card className="bg-red-500/10 border-red-500/20 text-red-200 shadow-sm transition-all animate-fadeIn">
                    <CardContent className="p-4 space-y-3 text-xs">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-red-400 block mb-1">AI Assistant Error</span>
                          <p className="text-red-300 leading-relaxed">{aiError}</p>
                          {(aiError.toLowerCase().includes('quota') || aiError.toLowerCase().includes('key') || aiError.toLowerCase().includes('api')) && (
                            <div className="mt-3 pt-3 border-t border-red-500/10 space-y-2">
                              <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">How to resolve this:</p>
                              <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-red-300/80">
                                <li>
                                  Go to the <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-white transition-colors">Google AI Studio</a>.
                                </li>
                                <li>
                                  Make sure you have created an API key and check your project billing or free tier limits in Google Cloud/AI Studio.
                                </li>
                                <li>
                                  Open <code className="bg-black/30 px-1 py-0.5 rounded font-mono text-[10px] text-red-400">.env</code> in the project root folder and add or replace the <code className="bg-black/30 px-1 py-0.5 rounded font-mono text-[10px] text-red-400">GEMINI_API_KEY</code>.
                                </li>
                                <li>
                                  Restart your backend development server to apply the new environment variables.
                                </li>
                              </ol>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(prompt || aiResponse) && (
                  <div className="space-y-4 pt-2 border-t border-border/50 animate-fadeIn">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-1">
                      Query Details
                    </div>

                    {/* User Prompt Capsule */}
                    {prompt && (
                      <div className="flex justify-end">
                        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3.5 py-2 max-w-[90%] text-xs shadow-sm font-medium leading-relaxed">
                          {prompt}
                        </div>
                      </div>
                    )}

                    {/* AI Bot Response Capsule */}
                    {aiResponse && (
                      <div className="flex flex-col space-y-3 bg-muted/40 rounded-2xl rounded-tl-sm p-3.5 border border-border/50 text-xs">
                        <div className="text-foreground leading-relaxed whitespace-pre-line">
                          {aiResponse.explanation}
                        </div>

                        {/* SQL Block */}
                        <div className="rounded-xl overflow-hidden border border-border/80 bg-black/40 shadow-inner">
                          <div className="flex items-center justify-between px-3 py-2 bg-black/20 border-b border-border/20 text-[10px] font-mono text-zinc-400">
                            <span className="flex items-center space-x-1.5 font-semibold">
                              <span>&lt;/&gt;</span>
                              <span>SQL</span>
                            </span>
                            <button
                              onClick={copySql}
                              className="text-zinc-400 hover:text-zinc-200 hover:bg-white/10 p-1 rounded transition-colors"
                              title="Copy SQL"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                          <pre className="p-3 font-mono text-[10px] text-white overflow-x-auto whitespace-pre-wrap leading-relaxed">
                            {sql}
                          </pre>
                        </div>

                        {/* Recommendations */}
                        {aiResponse.recommendations && (
                          <div className="pt-2 border-t border-border/20 text-[11px]">
                            <span className="font-semibold text-primary block mb-0.5">Recommendations</span>
                            <p className="text-muted-foreground/90 leading-relaxed">{aiResponse.recommendations}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )
          ) : activeTab === 'schema' ? (
            // Database Schema Explorer Tab
            <div className="space-y-5">
              {/* Database Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Select Database:
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={activeConnection?._id || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const conn = connections.find(c => c._id === selectedId);
                    setActiveConnection(conn || null);
                  }}
                >
                  <option value="" disabled>Select Database</option>
                  {connections.map((conn) => (
                    <option key={conn._id} value={conn._id}>
                      {conn.database}
                    </option>
                  ))}
                </select>
              </div>

              {/* Show Tables Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleShowTables}
                  disabled={!activeConnection || tablesLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#ffffff] hover:bg-[#f3f4f6] text-[#0f172a] hover:text-black border border-gray-200 hover:border-gray-300 transition-all font-medium py-2 px-3 rounded-md shadow-sm text-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                  {tablesLoading ? (
                    <Loader2 size={16} className="animate-spin text-amber-500" />
                  ) : (
                    <Folder size={16} className="text-amber-500 fill-amber-500/20" />
                  )}
                  <span>Show Tables</span>
                </button>
              </div>

              {/* List of Tables (Click to select) */}
              {tables.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto border border-dashed rounded-md p-2 bg-muted/20">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase px-1 pb-1 border-b">
                    Available Tables ({tables.length})
                  </div>
                  <div className="space-y-0.5 pt-1">
                    {tables.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTable(t)}
                        className={`w-full text-left text-xs px-2 py-1 rounded transition-colors flex items-center gap-1.5 truncate ${selectedTable === t
                          ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        <Table2 size={12} className="shrink-0" />
                        <span className="truncate">{t}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Enter Table Name */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Enter Table Name:
                </label>
                <div className="relative">
                  <Input
                    placeholder="e.g. users"
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    list="explorer-tables-list"
                    className="pr-8"
                  />
                  <datalist id="explorer-tables-list">
                    {tables.map(t => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Show Columns Button */}
              <div className="space-y-4 pt-1">
                <button
                  type="button"
                  onClick={handleShowColumns}
                  disabled={!activeConnection || !selectedTable.trim() || columnsLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#ffffff] hover:bg-[#f3f4f6] text-[#0f172a] hover:text-black border border-gray-200 hover:border-gray-300 transition-all font-medium py-2 px-3 rounded-md shadow-sm text-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                  {columnsLoading ? (
                    <Loader2 size={16} className="animate-spin text-orange-500" />
                  ) : (
                    <Scroll size={16} className="text-orange-500 fill-orange-500/20" />
                  )}
                  <span>Show Columns</span>
                </button>

                {/* Columns Listing */}
                {columns.length > 0 && (
                  <>
                    <div className="border rounded-md bg-card/50 overflow-hidden shadow-sm">
                      <div className="bg-muted/40 px-3 py-1.5 border-b text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                        <span>Columns inside `{selectedTable}`</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-mono">{columns.length}</span>
                      </div>
                      <div className="divide-y divide-border/40 max-h-48 overflow-y-auto">
                        {columns.map((col, idx) => (
                          <div key={idx} className="px-3 py-2 flex justify-between items-center text-xs hover:bg-muted/20 transition-colors">
                            <span className="font-mono text-foreground/90 font-medium">{col.name}</span>
                            <span className="text-[10px] bg-muted/80 text-muted-foreground px-1.5 py-0.5 rounded font-mono uppercase tracking-wide border border-border/50">
                              {col.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('ai');
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-3 rounded-md shadow-md text-sm transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                    >
                      <Sparkles size={14} className="text-white fill-white/20 animate-pulse" />
                      <span>Query Table with AI</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            // History Tab
            <div className="space-y-4 flex flex-col h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Recent Activity
                </span>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wide hover:underline text-right"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {historyLoading && history.length === 0 ? (
                <div className="flex items-center justify-center py-10 space-x-2 text-muted-foreground">
                  <Loader2 size={16} className="animate-spin text-primary" />
                  <span className="text-xs">Loading history...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground border border-dashed rounded-lg p-6 bg-muted/5">
                  <History className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2 stroke-[1.5]" />
                  <p>No queries executed yet.</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">Queries you run will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-210px)] pr-1 select-none">
                  {Object.entries(groupedHistory).map(([connId, group]: [string, any]) => {
                    const isExpanded = !!expandedHistoryConns[connId];
                    return (
                      <div key={connId} className="space-y-1">
                        {/* Database Connection Node */}
                        <div
                          onClick={() => toggleHistoryConn(connId)}
                          className="group/conn flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-all border border-transparent hover:border-border/30"
                        >
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <span className="text-muted-foreground shrink-0">
                              {isExpanded ? <ChevronDown size={14} className="stroke-[2.5]" /> : <ChevronRight size={14} className="stroke-[2.5]" />}
                            </span>
                            <Database size={13} className="text-primary shrink-0 stroke-[2]" />
                            <span className="text-xs font-semibold text-foreground truncate flex-1">
                              {group.name}
                            </span>
                            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                              {group.items.length}
                            </span>
                          </div>

                          <button
                            onClick={(e) => handleClearConnectionHistory(connId, e)}
                            className="opacity-0 group-hover/conn:opacity-100 p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-all shrink-0 ml-1"
                            title="Clear Database Query History"
                          >
                            <Trash2 size={12} className="stroke-[2]" />
                          </button>
                        </div>

                        {/* Collapsible history items under this connection */}
                        {isExpanded && (
                          <div className="pl-4 pr-1 py-1 space-y-0.5 border-l border-border ml-3.5">
                            {group.items.map((item: any) => {
                              const isSuccess = item.status === 'success';
                              return (
                                <div
                                  key={item._id}
                                  onClick={() => {
                                    setSql(item.generatedSql);
                                    if (item.prompt && item.prompt !== 'Manual query' && item.prompt !== 'Manual Execution') {
                                      setPrompt(item.prompt);
                                    } else {
                                      setPrompt('');
                                    }
                                    if (item.explanation) {
                                      setAiResponse({ explanation: item.explanation });
                                    } else {
                                      setAiResponse(null);
                                    }
                                    setActiveTab('ai');
                                  }}
                                  className="group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent/60 cursor-pointer transition-all min-w-0"
                                  title={item.prompt && item.prompt !== 'Manual query' && item.prompt !== 'Manual Execution' ? item.prompt : item.generatedSql}
                                >
                                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`}
                                      title={isSuccess ? 'Success' : `Error: ${item.errorMessage || ''}`}
                                    />
                                    <span className="text-xs text-muted-foreground group-hover:text-foreground truncate font-medium flex-1">
                                      {item.prompt && item.prompt !== 'Manual query' && item.prompt !== 'Manual Execution'
                                        ? item.prompt
                                        : item.generatedSql.trim().replace(/\s+/g, ' ')}
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => handleDeleteHistoryItem(item._id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-all shrink-0 ml-2"
                                    title="Delete Query Log"
                                  >
                                    <Trash2 size={12} className="stroke-[2]" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className={`flex-1 flex-col min-w-0 ${
        mobileActiveTab !== 'sidebar' ? 'flex' : 'hidden md:flex'
      }`}>
        <div className={`flex-col border-b ${
          mobileActiveTab === 'editor' ? 'flex-1 flex' : 'h-1/2 flex'
        } ${mobileActiveTab === 'results' ? 'hidden md:flex' : ''}`}>
          <div className="flex items-center justify-between p-2 bg-muted/30 border-b shrink-0">
            <div className="flex items-center space-x-4 px-2">
              <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px]">
                {activeConnection ? `Connected: ${activeConnection.database}` : 'No connection'}
              </span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={copySql} aria-label="Copy SQL code">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleExecute}
                disabled={execLoading || !activeConnection}
              >
                <Play size={16} className="mr-2" />
                {execLoading ? 'Running...' : 'Execute'}
              </Button>
            </div>
          </div>
          <div className={`flex-1 min-h-0 ${theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
            <Editor
              height="100%"
              language="sql"
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              value={sql}
              onChange={(value) => setSql(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>

        {/* Results Area */}
        <div className={`flex-col bg-background ${
          mobileActiveTab === 'results' ? 'flex-1 flex' : 'h-1/2 flex'
        } ${mobileActiveTab === 'editor' ? 'hidden md:flex' : ''}`}>
          <div className="p-2 border-b flex items-center space-x-2 bg-muted/30 shrink-0">
            <Table2 size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">Results</span>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {queryResults.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No results to display
              </div>
            ) : (
              <div className="border rounded-md overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b whitespace-nowrap">
                    <tr>
                      {Object.keys(queryResults[0] || {}).map(key => (
                        <th key={key} className="px-4 py-3 whitespace-nowrap">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResults.map((row, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                        {Object.values(row).map((val: any, j) => (
                          <td key={j} className="px-4 py-3 whitespace-nowrap">
                            {val !== null ? String(val) : <span className="text-muted-foreground italic">null</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SqlEditor;
