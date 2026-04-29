import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ShieldCheck, Clock, ShieldX } from 'lucide-react';
import { motion } from 'framer-motion';

const VerificationBanner = () => {
  const { user } = useContext(AuthContext);
  
  if (!user || user.role === 'admin' || user.verificationStatus === 'verified') {
    return null;
  }

  const config = {
    pending: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      title: 'Account Verification Pending',
      message: 'Your institutional identity is under review. You won\'t be able to post or answer doubts until an admin approves your ID proof.',
      icon: Clock,
    },
    rejected: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      title: 'Verification Rejected',
      message: user?.rejectionReason 
        ? `Your ID verification was rejected: "${user.rejectionReason}". Please contact the admin for further assistance.`
        : 'Your ID verification was rejected. Please contact the admin to resolve this issue.',
      icon: ShieldX,
    },
  };

  const c = config[user.verificationStatus] || config.pending;
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 ${c.bg} ${c.border} border rounded-xl p-4 flex items-center gap-4`}
    >
      <div className={`w-10 h-10 ${c.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${c.iconColor}`} />
      </div>
      <div>
        <p className="text-sm font-bold text-theme-text">{c.title}</p>
        <p className="text-xs text-theme-text-muted mt-0.5 leading-relaxed">{c.message}</p>
      </div>
    </motion.div>
  );
};

export default VerificationBanner;
