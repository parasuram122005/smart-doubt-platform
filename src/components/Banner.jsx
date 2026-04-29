import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle, Users, Zap, Shield, BookOpen, Clock } from 'lucide-react';

const iconMap = {
  '500+ Doubts Solved': BookOpen,
  'Verified Faculty': Shield,
  'Instant AI Answers': Zap,
  'Users': Users,
  'Check': CheckCircle,
  'Clock': Clock
};

const Banner = ({ title, subtitle, buttons = [], role = 'default', stats = [] }) => {
  const navigate = useNavigate();

  // Determine theme-specific gradient classes based on role
  const getGradientClasses = () => {
    switch (role) {
      case 'student':
        return 'from-[#556B2F]/20 to-[#556B2F]/5 border-[#556B2F]/30 text-[#192519]';
      case 'faculty':
        return 'from-[#E8636A]/20 to-[#E8636A]/5 border-[#E8636A]/30 text-[#1C1C1E]';
      case 'admin':
        return 'from-[#0B3D91]/30 to-[#0B3D91]/10 border-[#0B3D91]/40 text-[#F5EDE8] bg-[#111827]';
      default:
        // Default / Homepage / Unauthenticated
        return 'from-slate-900 to-slate-800 text-white border-slate-700';
    }
  };

  const gradientClasses = getGradientClasses();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`w-full rounded-2xl shadow-soft overflow-hidden mb-8 border bg-gradient-to-br relative ${gradientClasses}`}
    >
      {/* Abstract decorative shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

      <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Main Content */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className={`text-lg md:text-xl max-w-2xl opacity-90 ${role === 'default' ? 'text-slate-300' : ''}`}>
              {subtitle}
            </p>
          )}

          {/* Buttons */}
          {buttons.length > 0 && (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
              {buttons.map((btn, index) => {
                const isPrimary = index === 0;
                
                const baseStyles = "px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 group";
                
                // Style based on role & primary status
                let btnStyles = "";
                if (role === 'default') {
                  btnStyles = isPrimary 
                    ? "bg-white text-slate-900 hover:bg-slate-100 shadow-hover" 
                    : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md";
                } else if (role === 'admin') {
                  btnStyles = isPrimary 
                    ? "bg-[#0B3D91] text-white hover:bg-[#1e55b3] shadow-hover" 
                    : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md";
                } else if (role === 'faculty') {
                  btnStyles = isPrimary 
                    ? "bg-[#E8636A] text-white hover:bg-[#d3545b] shadow-hover" 
                    : "bg-white/50 text-[#1C1C1E] hover:bg-white/70 backdrop-blur-md";
                } else if (role === 'student') {
                  btnStyles = isPrimary 
                    ? "bg-[#556B2F] text-white hover:bg-[#455a22] shadow-hover" 
                    : "bg-white/60 text-[#192519] hover:bg-white/80 backdrop-blur-md";
                }

                const buttonContent = (
                  <>
                    {btn.label}
                    {isPrimary && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </>
                );

                if (btn.to) {
                  return (
                    <Link key={index} to={btn.to} className={`${baseStyles} ${btnStyles}`}>
                      {buttonContent}
                    </Link>
                  );
                }

                return (
                  <button key={index} onClick={btn.onClick} className={`${baseStyles} ${btnStyles}`}>
                    {buttonContent}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats / Side Content */}
        {stats && stats.length > 0 && (
          <div className="flex flex-col gap-4 mt-6 md:mt-0 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            {stats.map((stat, idx) => {
              const Icon = iconMap[stat] || CheckCircle;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Icon className="w-5 h-5 text-current opacity-90" />
                  </div>
                  <span className="font-medium opacity-90">{stat}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Banner;
