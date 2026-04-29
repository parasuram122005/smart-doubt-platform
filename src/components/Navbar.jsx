import React from 'react';
import { Link } from 'react-router-dom';
import { BookMarked } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-0 w-full z-50 bg-gradient-to-b from-[#111111]/90 to-transparent border-b border-[#C9A227]/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="relative flex items-center justify-center w-12 h-12 mr-3 rounded-full border border-[#C9A227]/40 group-hover:border-[#C9A227] group-hover:shadow-[0_0_15px_rgba(201,162,39,0.3)] transition-all duration-500">
               <BookMarked className="h-6 w-6 text-[#C9A227]" />
               {/* Inner decorative ring */}
               <div className="absolute inset-1 rounded-full border border-[#C9A227]/20"></div>
            </div>
            <span className="font-cinzel text-2xl font-bold tracking-widest text-[#F8F6F0] group-hover:text-[#C9A227] transition-colors">
              SmartDoubt
            </span>
          </Link>
          
          {/* Actions */}
          <div className="flex items-center space-x-6">
            <Link 
              to="/login" 
              className="hidden sm:inline-flex items-center font-cormorant text-lg italic text-[#D7D3C8] hover:text-[#C9A227] transition-colors"
            >
              Enter the Realm
            </Link>
            <Link 
              to="/register" 
              className="inline-flex items-center px-6 py-2.5 border border-[#C9A227] text-sm font-cinzel font-bold tracking-wider text-[#F8F6F0] bg-[#0F2E1D]/80 hover:bg-[#0F2E1D] hover:shadow-[0_0_20px_rgba(201,162,39,0.2)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Begin Journey
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
