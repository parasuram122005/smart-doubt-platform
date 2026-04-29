import React from 'react';
import { cn } from '../../utils/cn';
import { Clock, User, CheckCircle } from 'lucide-react';

export const StatusBadge = ({ status, className }) => {
  const config = {
    OPEN: {
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <Clock className="w-3.5 h-3.5 mr-1.5" />,
    },
    PENDING: {
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <Clock className="w-3.5 h-3.5 mr-1.5" />,
    },
    AI_ANSWERED: {
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: <Clock className="w-3.5 h-3.5 mr-1.5" />,
    },
    CLAIMED: {
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <User className="w-3.5 h-3.5 mr-1.5" />,
    },
    SOLVED: {
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: <CheckCircle className="w-3.5 h-3.5 mr-1.5" />,
    },
    RESOLVED: {
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: <CheckCircle className="w-3.5 h-3.5 mr-1.5" />,
    },
  };

  const current = config[status] || config['PENDING'];

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm",
      current.bg, current.color, current.border,
      className
    )}>
      {current.icon}
      {status}
    </span>
  );
};
