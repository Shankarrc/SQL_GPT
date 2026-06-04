import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import api from '../services/api';
import { useDbStore } from '../store/useDbStore';
import { Database, CheckCircle2 } from 'lucide-react';
import { toast } from '../store/useToastStore';

const DatabaseConfig = () => {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { activeConnection, setActiveConnection } = useDbStore();

  const [formData, setFormData] = useState({
    name: 'Aiven MySQL',
    type: 'mysql',
    host: window.atob('bXlzcWwtMTVjYzRjYzMtc2hhbmthcjc3NTA3MzktNGVhOS5pLmFpdmVuY2xvdWQuY29t'),
    port: '25249',
    username: 'avnadmin',
    password: window.atob('QVZOU19TNWJYampDMGZIaDJ4UDExRzd2'),
    database: 'defaultdb',
    createIfNotExists: false
  });

  const fetchConnections = async () => {
    try {
      const res = await api.get('/database/list');
      setConnections(res.data);
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    fetchConnections();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/database/connect', formData);
      setFormData({ ...formData, password: '' });
      fetchConnections();
      toast.success('Connection successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">DB Connection</h2>
        <p className="text-muted-foreground mt-2">Manage your external database connections.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Add Connection Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Connection</CardTitle>
            <CardDescription>Connect to a new MySQL or PostgreSQL database.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Connection Name</label>
                  <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Production DB" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.type}
                    onChange={e => {
                      const type = e.target.value;
                      setFormData({ ...formData, type, port: type === 'mysql' ? '3306' : '5432' })
                    }}
                  >
                    <option value="mysql">MySQL</option>
                    <option value="postgres">PostgreSQL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Host</label>
                  <Input required value={formData.host} onChange={e => setFormData({ ...formData, host: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Port</label>
                  <Input required type="number" value={formData.port} onChange={e => setFormData({ ...formData, port: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Database Name</label>
                <Input required value={formData.database} onChange={e => setFormData({ ...formData, database: e.target.value })} />
              </div>

              <div className="flex items-center space-x-2 pt-1 pb-2">
                <input
                  type="checkbox"
                  id="createIfNotExists"
                  className="w-4 h-4 rounded text-primary focus:ring-primary bg-background border-input cursor-pointer"
                  checked={formData.createIfNotExists}
                  onChange={e => setFormData({ ...formData, createIfNotExists: e.target.checked })}
                />
                <label htmlFor="createIfNotExists" className="text-xs font-medium text-muted-foreground select-none cursor-pointer">
                  Create database if it does not exist on the server
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Connecting...' : 'Connect & Save'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Saved Connections */}
        <Card>
          <CardHeader>
            <CardTitle>Saved Connections</CardTitle>
            <CardDescription>Select a database to make it active for querying.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {connections.length === 0 ? (
              <p className="text-muted-foreground text-sm">No connections saved yet.</p>
            ) : (
              connections.map(conn => (
                <div
                  key={conn._id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${activeConnection?._id === conn._id ? 'border-primary bg-primary/5' : 'hover:border-primary/50 cursor-pointer'}`}
                  onClick={() => setActiveConnection(conn)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${conn.type === 'mysql' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      <Database size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{conn.name}</h4>
                      <p className="text-xs text-muted-foreground">{conn.type.toUpperCase()} • {conn.host}:{conn.port}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {activeConnection?._id === conn._id && (
                      <CheckCircle2 className="text-primary h-5 w-5" />
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseConfig;
