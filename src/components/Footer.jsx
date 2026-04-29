import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#111111] border-t border-[#2B1D12] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="flex items-center gap-4 mb-8 opacity-50">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#C9A227]"></div>
          <div className="w-1.5 h-1.5 rotate-45 border border-[#C9A227]"></div>
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#C9A227]"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-8 mb-8 text-sm font-cinzel tracking-wider text-[#D7D3C8]/70">
          <Link to="#" className="hover:text-[#C9A227] transition-colors">About the Realm</Link>
          <Link to="#" className="hover:text-[#C9A227] transition-colors">Send Ravens (Contact)</Link>
          <Link to="#" className="hover:text-[#C9A227] transition-colors">Laws (Terms)</Link>
          <Link to="#" className="hover:text-[#C9A227] transition-colors">Secrets (Privacy)</Link>
        </div>

        <p className="font-cormorant italic text-[#D7D3C8]/50 text-center">
          &copy; {new Date().getFullYear()} SmartDoubt. All scholarly rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
