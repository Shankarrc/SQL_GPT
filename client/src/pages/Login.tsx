import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Sparkles, TerminalSquare, AlertCircle } from 'lucide-react';
import Footer from '../components/Footer';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/google', {
        credential: credentialResponse.credential,
      });
      setUser(response.data);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was cancelled or failed to initialize.');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-zinc-950 to-black dark text-foreground overflow-hidden relative">
      {/* Decorative ambient glowing background circles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

      {/* Main card wrapper (centered vertically in flex-1) */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-blue-500/20">
          {/* Glow accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
        
        <CardHeader className="space-y-4 text-center pt-8">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <TerminalSquare className="w-6 h-6 text-white" />
          </div>
          
          <div className="space-y-1">
            <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              SQL GPT
            </CardTitle>
            <CardDescription className="text-zinc-400 font-medium">
              AI-Powered SQL Query Generator & Executor
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pb-8 pt-2">
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 border border-red-900/30 p-3 rounded-lg animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-xl border border-white/5 bg-zinc-900/30 p-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-zinc-300 text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Instant Dashboard Access</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
              Connect external databases, generate structured SQL queries in plain English, and run safety-checked transactions.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-2 relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-4">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                <span className="text-sm text-zinc-400 font-medium">Authenticating your profile...</span>
              </div>
            ) : (
              <div className="w-full flex justify-center scale-105 transition-all hover:scale-[1.07]">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  size="large"
                  text="signin_with"
                  shape="pill"
                  width="280"
                />
              </div>
            )}
          </div>
        </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Login;
