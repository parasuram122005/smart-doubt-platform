import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, User, CheckCircle } from 'lucide-react';

export const ActivityTimeline = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="p-6 text-center text-theme-text-muted text-sm border border-dashed border-theme-border rounded-xl bg-theme-bg/50">
        No recent activity
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'OPEN': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'AI_ANSWERED': return <Clock className="w-4 h-4 text-purple-600" />;
      case 'CLAIMED': return <User className="w-4 h-4 text-blue-600" />;
      case 'RESOLVED': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'SOLVED': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'OPEN': return 'bg-amber-100 border-amber-200';
      case 'PENDING': return 'bg-amber-100 border-amber-200';
      case 'AI_ANSWERED': return 'bg-purple-100 border-purple-200';
      case 'CLAIMED': return 'bg-blue-100 border-blue-200';
      case 'RESOLVED': return 'bg-emerald-100 border-emerald-200';
      case 'SOLVED': return 'bg-emerald-100 border-emerald-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-8 before:w-0.5 before:bg-theme-border/70">
      {activities.map((item, idx) => (
        <motion.div 
          key={item.id} 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: idx * 0.1 }}
          className="relative flex items-start group"
        >
          <div className="flex-shrink-0 flex items-center justify-center">
             <div className={`w-8 h-8 rounded-full border shadow-sm flex items-center justify-center z-10 ${getBg(item.type)}`}>
                {getIcon(item.type)}
             </div>
          </div>
          <div className="ml-4 min-w-0 flex-1">
            <div className="text-sm font-semibold text-theme-text truncate group-hover:text-theme-accent transition-colors">
              {item.title}
            </div>
            <div className="mt-1 flex items-center text-xs text-theme-text-muted">
              <span className="font-medium mr-1">{item.user}</span> 
              <span className="opacity-50 mx-1">•</span> 
              <span>{item.type.toLowerCase()}</span>
              <span className="opacity-50 mx-1">•</span> 
              <span>{new Date(item.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
