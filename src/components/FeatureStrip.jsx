import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Zap } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Ancient Knowledge',
    description: 'Search trusted solved doubts within the grand archives.',
  },
  {
    icon: Users,
    title: 'Wise Mentors',
    description: 'Verified faculty guidance from masters of their craft.',
  },
  {
    icon: Zap,
    title: 'Swift Insight',
    description: 'AI-powered instant support to illuminate the dark.',
  }
];

const FeatureStrip = () => {
  return (
    <div className="bg-[#111111] relative z-20 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="group relative p-8 rounded-2xl bg-gradient-to-b from-[#1a1410] to-[#111111] border border-[#2B1D12] hover:border-[#C9A227]/40 transition-colors duration-500 text-center"
              >
                <div className="absolute inset-0 bg-[#C9A227]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border border-[#C9A227]/30 flex items-center justify-center mb-6 group-hover:border-[#C9A227] group-hover:shadow-[0_0_15px_rgba(201,162,39,0.2)] transition-all duration-500">
                    <Icon className="w-8 h-8 text-[#C9A227] opacity-80 group-hover:opacity-100" />
                  </div>
                  <h3 className="font-cinzel text-xl font-bold text-[#F8F6F0] tracking-wide mb-3">{feature.title}</h3>
                  <p className="font-cormorant text-lg text-[#D7D3C8] leading-relaxed max-w-xs">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeatureStrip;
