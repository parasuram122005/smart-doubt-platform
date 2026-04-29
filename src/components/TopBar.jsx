import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const TopBar = () => {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/80 backdrop-blur-md border-b border-theme-border/50 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/knowledge-base" className="flex items-center group">
            <div className="w-10 h-10 bg-theme-accent/10 rounded-xl flex items-center justify-center mr-3 group-hover:bg-theme-accent/20 transition-colors">
               <BookOpen className="h-5 w-5 text-theme-accent" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-theme-text">SmartDoubt</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-theme-text-muted hover:text-theme-text transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-theme-accent hover:bg-theme-accent-hover shadow-sm transition-all hover:shadow-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default TopBar;
