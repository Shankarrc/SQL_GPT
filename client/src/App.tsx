import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Landing from './pages/Landing';
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

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/app" replace /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/app" replace /> : <Login />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/about" element={<About />} />

        {/* Protected App Workspace Routes */}
        <Route path="/app" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="databases" element={<Databases />} />
          <Route path="db-connection" element={<DatabaseConfig />} />
          <Route path="editor" element={<SqlEditor />} />
        </Route>

        {/* Fallback Catch All */}
        <Route path="*" element={<Navigate to={user ? "/app" : "/"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
