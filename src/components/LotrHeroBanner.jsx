import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Key, ScrollText } from 'lucide-react';

const LotrHeroBanner = () => {
  return (
    <div className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#111111]">
      {/* Cinematic Background Layers */}
      <div className="absolute inset-0 z-0">
         {/* Deep dark forest / night sky base */}
         <div className="absolute inset-0 bg-[#0F2E1D] opacity-40 mix-blend-multiply"></div>
         
         {/* Mist / Fog overlay at bottom */}
         <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-[#111111] via-[#111111]/80 to-transparent z-10"></div>
         
         {/* Abstract mountain / arch shapes */}
         <div className="absolute top-1/4 left-0 w-1/3 h-[150%] bg-[#081a10] rounded-t-full blur-3xl opacity-60 -rotate-12 transform origin-bottom-left"></div>
         <div className="absolute top-1/3 right-0 w-1/2 h-[120%] bg-[#1a1410] rounded-t-full blur-3xl opacity-50 rotate-12 transform origin-bottom-right"></div>
         
         {/* Warm torch light glow from center */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#C9A227] rounded-full blur-[120px] opacity-15"></div>
      </div>

      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Decorative Rune/Separator */}
          <div className="flex items-center justify-center gap-4 opacity-70">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#C9A227]"></div>
            <div className="w-2 h-2 rotate-45 border border-[#C9A227]"></div>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#C9A227]"></div>
          </div>

          <h1 className="text-5xl md:text-7xl font-cinzel font-bold text-[#F8F6F0] tracking-wide leading-tight drop-shadow-2xl">
            Wisdom Awaits <br />
            <span className="text-[#C9A227] font-normal italic font-cormorant text-6xl md:text-8xl">Those Who Seek It</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl font-cormorant text-[#D7D3C8] leading-relaxed drop-shadow-md">
            Receive AI guidance, trusted faculty mentorship, and explore an ever-growing archive of solved academic challenges.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Link 
              to="/register" 
              className="group relative flex items-center gap-3 px-8 py-4 bg-[#0F2E1D] border border-[#C9A227] text-[#F8F6F0] font-cinzel font-bold tracking-widest text-sm hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(201,162,39,0.3)] transition-all duration-300"
            >
              <Compass className="w-5 h-5 text-[#C9A227] group-hover:rotate-45 transition-transform duration-500" />
              Begin Journey
            </Link>

            <Link 
              to="/login" 
              className="group relative flex items-center gap-3 px-8 py-4 bg-transparent border border-[#C9A227]/40 text-[#D7D3C8] font-cinzel font-bold tracking-widest text-sm hover:border-[#C9A227] hover:bg-[#C9A227]/5 transition-all duration-300"
            >
              <Key className="w-4 h-4 text-[#C9A227]/70 group-hover:text-[#C9A227]" />
              Enter the Hall
            </Link>

            <Link 
              to="/knowledge-base" 
              className="group relative flex items-center gap-3 px-8 py-4 bg-transparent text-[#D7D3C8] font-cormorant italic text-xl hover:text-[#C9A227] transition-all duration-300"
            >
              <ScrollText className="w-5 h-5 opacity-70" />
              <span className="border-b border-transparent group-hover:border-[#C9A227]/50 pb-0.5">Explore the Archives</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#111111] to-transparent z-20 pointer-events-none"></div>
    </div>
  );
};

export default LotrHeroBanner;
