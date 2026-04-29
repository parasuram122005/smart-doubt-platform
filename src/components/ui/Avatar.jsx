import React from 'react';
import { cn } from '../../utils/cn';

export const Avatar = ({ name, role, className }) => {
  const getInitials = (n) => {
    if (!n) return 'U';
    return n.split(' ').map(part => part[0]).join('').substring(0, 2).toUpperCase();
  };

  const getRoleColor = (r) => {
    switch (r) {
      case 'faculty': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'admin': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'student': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-center font-bold border rounded-full shrink-0",
        getRoleColor(role),
        className || "w-10 h-10 text-sm"
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};
