import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Database, TerminalSquare, Activity } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    databases: 0,
    queries: 0,
  });
  const [systemStatus, setSystemStatus] = useState<'checking' | 'operational' | 'offline'>('checking');

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

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">Overview of your SQL GPT usage.</p>
      </div>

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
            <Activity className={`h-4 w-4 ${
              systemStatus === 'operational' 
                ? 'text-emerald-500 animate-pulse' 
                : systemStatus === 'checking' 
                ? 'text-blue-400 animate-spin' 
                : 'text-red-500'
            }`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              systemStatus === 'operational' 
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
    </div>
  );
};

export default Dashboard;
