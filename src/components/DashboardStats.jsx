import React from 'react';
import { motion } from 'framer-motion';
import { Users, FileQuestion, BookOpen, CheckCircle } from 'lucide-react';

const DashboardStats = ({ stats }) => {
  if (!stats) return null;

  const statCards = [
    { name: 'Total Users', value: stats.users.total, icon: <Users size={24} /> },
    { name: 'Total Doubts', value: stats.doubts.total, icon: <FileQuestion size={24} /> },
    { name: 'Open Doubts', value: stats.doubts.open, icon: <BookOpen size={24} /> },
    { name: 'Resolved', value: stats.doubts.resolved, icon: <CheckCircle size={24} /> },
  ];

  return (
    <div className="mb-10">
      <h3 className="text-xl font-bold text-theme-text mb-6">Platform Overview</h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item, idx) => (
          <motion.div 
            key={item.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative bg-theme-card pt-6 px-6 pb-6 shadow-soft rounded-2xl border border-theme-border/50 hover:shadow-hover transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-theme-text-muted mb-1">{item.name}</p>
                <p className="text-3xl font-extrabold text-theme-text tracking-tight">{item.value}</p>
              </div>
              <div className="p-3 bg-theme-accent/10 rounded-xl text-theme-accent">
                {item.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
