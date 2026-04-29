import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const data = await login(email, password);
      // Let routing in App.jsx handle the redirect since data-theme gets updated
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-theme-accent text-white rounded-2xl flex items-center justify-center shadow-lg shadow-theme-accent/30">
            <BookOpen className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-8 text-center text-3xl font-extrabold text-theme-text tracking-tight">Welcome back</h2>
        <p className="mt-2 text-center text-sm text-theme-text-muted">
          Sign in to access your platform portal
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-10 px-4 shadow-hover rounded-3xl sm:px-10 border border-theme-border/50 relative overflow-hidden">
          {/* Subtle gradient accent map */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-theme-accent to-transparent opacity-50"></div>
          
          {error && <div className="mb-6 text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">{error}</div>}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-theme-text mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full py-3 px-4 border border-theme-border/70 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all text-theme-text bg-theme-bg/50"
                placeholder="Ex. faculty@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-theme-text mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full py-3 px-4 border border-theme-border/70 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all text-theme-text bg-theme-bg/50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-theme-accent hover:bg-theme-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-accent transition-colors"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </motion.button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-theme-text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-theme-accent hover:text-theme-accent-hover transition-colors">
                Apply for access
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
