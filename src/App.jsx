import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import TopHeader from './components/layout/TopHeader';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PostDoubtPage from './pages/PostDoubtPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider, AuthContext } from './contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-theme-bg">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-theme-border h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-theme-border rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-theme-border rounded"></div>
              <div className="h-4 bg-theme-border rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Page transition wrapper component
const PageTransition = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

const AppLayout = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    // Set theme based on role
    if (user && user.role) {
      document.documentElement.setAttribute('data-theme', user.role);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [user]);

  if (isLanding && !user) {
    return (
      <PageTransition>
        <Routes>
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </PageTransition>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex overflow-hidden">
      {user && <Sidebar />}
      
      <main className="flex-1 overflow-x-hidden overflow-y-auto relative flex flex-col">
        {!user ? <Navbar /> : <TopHeader />}
        <div className={`flex-1 ${!user ? 'pt-24' : 'p-4 md:p-8'}`}>
          <PageTransition>
            <Routes>
              <Route path="/" element={<Navigate to={user ? `/${user.role}` : '/'} replace />} />
              <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={user ? `/${user.role}` : '/'} replace />} />
              <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to={user ? `/${user.role}` : '/'} replace />} />
            
            <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
            
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/post-doubt" element={
              <ProtectedRoute allowedRoles={['student']}>
                <PostDoubtPage />
              </ProtectedRoute>
            } />
            
            <Route path="/faculty" element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;
