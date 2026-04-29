import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const timerRef = useRef(null);
  const onSearchRef = useRef(onSearch);

  // Keep the ref current without triggering effects
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Debounced search — only depends on searchTerm, not onSearch
  useEffect(() => {
    // Don't fire on initial mount with empty string
    if (searchTerm === '' && timerRef.current === null) {
      timerRef.current = 'initialized';
      return;
    }

    const timer = setTimeout(() => {
      onSearchRef.current(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative max-w-2xl mx-auto mb-12"
    >
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-theme-text-muted/70" />
      </div>
      <input
        type="text"
        className="block w-full pl-12 pr-4 py-4 border border-theme-border/60 rounded-2xl text-base bg-white/70 backdrop-blur-md placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all shadow-soft hover:shadow-hover"
        placeholder="Search for questions, keywords, or topics..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </motion.div>
  );
};

export default React.memo(SearchBar);
