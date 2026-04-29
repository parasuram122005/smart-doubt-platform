import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex items-center space-x-1 bg-theme-bg/50 p-1 rounded-xl border border-theme-border/50 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative w-full sm:w-auto px-5 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap",
              isActive ? "text-theme-text" : "text-theme-text-muted hover:text-theme-text hover:bg-theme-border/30"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-white shadow-sm border border-theme-border/50 rounded-lg"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
