import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DatabaseConfig from './pages/DatabaseConfig';
import Databases from './pages/Databases';
import SqlEditor from './pages/SqlEditor';
import About from './pages/About';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AboutRoute = () => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  
  if (user) {
    return (
      <Layout>
        <About />
      </Layout>
    );
  }
  return (
    <div className={`min-h-screen bg-background text-foreground overflow-y-auto ${theme}`}>
      <About />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="databases" element={<Databases />} />
          <Route path="db-connection" element={<DatabaseConfig />} />
          <Route path="editor" element={<SqlEditor />} />
        </Route>

        <Route path="/about" element={<AboutRoute />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
