import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import API from '../services/api';
import { motion } from 'framer-motion';
import {
  Mail, Shield, BookOpen, Layers, LogOut, CheckCircle, Clock,
  AlertTriangle, Building, Briefcase, GraduationCap, MapPin,
  Hash, User, Calendar, Users, FileText, Award, Key
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── helpers ─── */
const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
};

const statusConfig = {
  active:    { label: 'Active',    icon: CheckCircle,   bg: '#ecfdf5', color: '#059669', border: '#a7f3d0', dot: '#10b981' },
  on_leave:  { label: 'On Leave',  icon: Clock,         bg: '#fffbeb', color: '#d97706', border: '#fde68a', dot: '#f59e0b' },
  suspended: { label: 'Suspended', icon: AlertTriangle,  bg: '#fef2f2', color: '#dc2626', border: '#fecaca', dot: '#ef4444' },
  inactive:  { label: 'Inactive',  icon: Clock,         bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb', dot: '#9ca3af' },
};

const roleAccent = {
  student: { gradient: 'linear-gradient(135deg, #C07A52 0%, #e8a87c 100%)', light: 'rgba(192,122,82,0.08)', mid: 'rgba(192,122,82,0.15)', text: '#C07A52' },
  faculty: { gradient: 'linear-gradient(135deg, #E8636A 0%, #f7a8ab 100%)', light: 'rgba(232,99,106,0.08)', mid: 'rgba(232,99,106,0.15)', text: '#E8636A' },
  admin:   { gradient: 'linear-gradient(135deg, #C9A96E 0%, #e8d5a8 100%)', light: 'rgba(201,169,110,0.08)', mid: 'rgba(201,169,110,0.15)', text: '#C9A96E' },
};

/* ─────────────── Component ─────────────── */
const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/users/profile-stats');
        if (data.success) setStats(data.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) return null;

  const accent = roleAccent[user.role] || roleAccent.student;
  const status = statusConfig[user.status] || statusConfig.active;
  const StatusIcon = status.icon;

  /* Build identity fields based on role */
  const identityFields = [];
  if (user.role === 'student') {
    if (user.studentId)  identityFields.push({ icon: Hash,          label: 'Student ID',  value: user.studentId });
    if (user.department)  identityFields.push({ icon: BookOpen,      label: 'Department',  value: user.department });
    if (user.year)        identityFields.push({ icon: Calendar,      label: 'Year',        value: user.year });
    if (user.section)     identityFields.push({ icon: Users,         label: 'Section',     value: user.section });
    if (user.college)     identityFields.push({ icon: Building,      label: 'College',     value: user.college });
  }
  if (user.role === 'faculty') {
    if (user.facultyId)   identityFields.push({ icon: Hash,          label: 'Faculty ID',   value: user.facultyId });
    if (user.department)   identityFields.push({ icon: BookOpen,      label: 'Department',   value: user.department });
    if (user.designation)  identityFields.push({ icon: Briefcase,     label: 'Designation',  value: user.designation });
    if (user.organization) identityFields.push({ icon: Building,      label: 'Organization', value: user.organization });
  }
  if (user.role === 'admin') {
    if (user.adminId)      identityFields.push({ icon: Key,           label: 'Admin ID',      value: user.adminId });
    if (user.organization) identityFields.push({ icon: Building,      label: 'Organization',  value: user.organization });
    if (user.roleLevel)    identityFields.push({ icon: Shield,        label: 'Role Level',    value: user.roleLevel.replace('_', ' ') });
  }

  /* Build stat items */
  const statItems = [];
  if (!loading && stats) {
    if (user.role === 'student') {
      statItems.push({ icon: BookOpen,    label: 'Doubts Posted',    value: stats.doubtsPosted ?? 0,    color: accent.text });
      statItems.push({ icon: CheckCircle, label: 'Solved',           value: stats.doubtsResolved ?? 0,  color: '#059669' });
    }
    if (user.role === 'faculty') {
      statItems.push({ icon: CheckCircle, label: 'Answers Given',    value: stats.doubtsAnswered ?? 0,  color: accent.text });
    }
    if (user.role === 'admin') {
      statItems.push({ icon: Users,       label: 'System Users',     value: stats.systemUsers ?? 0,     color: accent.text });
      statItems.push({ icon: FileText,    label: 'Platform Doubts',  value: stats.totalDoubts ?? 0,     color: '#3b82f6' });
    }
  }

  const roleLabel = { student: 'Student', faculty: 'Faculty', admin: 'Administrator' }[user.role] || 'User';

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px', fontFamily: "'Inter', sans-serif" }}>

      {/* ════════ PROFILE HEADER CARD ════════ */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          background: '#fff',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 4px 24px -4px rgba(0,0,0,0.06)',
          border: '1px solid #e5e7eb',
          marginBottom: 24,
        }}
      >
        {/* Cover strip */}
        <div style={{
          height: 140,
          background: accent.gradient,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: -60, right: -40 }} />
          <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: -30, left: 60 }} />
          <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: 20, left: '40%' }} />
        </div>

        {/* Profile info section */}
        <div style={{ padding: '0 32px 32px', position: 'relative' }}>

          {/* Avatar */}
          <div style={{
            marginTop: -52,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 20,
          }}>
            <div style={{
              width: 104, height: 104, borderRadius: '50%',
              background: accent.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, fontWeight: 800, color: '#fff',
              border: '4px solid #fff',
              boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)',
              letterSpacing: 1,
              userSelect: 'none',
            }}>
              {getInitials(user.name)}
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 10,
                background: '#fef2f2', color: '#dc2626',
                border: '1px solid #fecaca',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: 4,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(220,38,38,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>

          {/* Name + badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: '#111827', letterSpacing: '-0.02em' }}>
              {user.name}
            </h1>

            {/* Role badge */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 14px', borderRadius: 8,
              background: accent.mid, color: accent.text,
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              <Shield size={13} /> {roleLabel}
            </span>

            {/* Status badge */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 14px', borderRadius: 8,
              background: status.bg, color: status.color,
              border: `1px solid ${status.border}`,
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              <StatusIcon size={13} /> {status.label}
            </span>
          </div>

          {/* Email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 14 }}>
            <Mail size={15} style={{ opacity: 0.7 }} />
            {user.email}
          </div>
        </div>
      </motion.div>

      {/* ════════ BODY GRID ════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

        {/* ──── IDENTITY CARD ──── */}
        {identityFields.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.45 }}
            style={{
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 12px -2px rgba(0,0,0,0.04)',
              overflow: 'hidden',
            }}
          >
            {/* Card header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#fafafa',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: accent.light, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Award size={16} style={{ color: accent.text }} />
              </div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#111827', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Institutional Identity
              </h3>
            </div>

            {/* Fields list */}
            <div style={{ padding: 0 }}>
              {identityFields.map((field, idx) => {
                const Icon = field.icon;
                return (
                  <motion.div
                    key={field.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.06 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '16px 24px',
                      borderBottom: idx < identityFields.length - 1 ? '1px solid #f3f4f6' : 'none',
                      transition: 'background 0.15s',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = accent.light}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: accent.light,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={18} style={{ color: accent.text }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0, fontSize: 11, fontWeight: 700,
                        color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em',
                        marginBottom: 2,
                      }}>
                        {field.label}
                      </p>
                      <p style={{
                        margin: 0, fontSize: 15, fontWeight: 700, color: '#111827',
                        textTransform: field.label === 'Role Level' ? 'capitalize' : 'none',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {field.value}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ──── ACCOUNT ANALYTICS CARD ──── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45 }}
          style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 12px -2px rgba(0,0,0,0.04)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Card header */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#fafafa',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: accent.light, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Layers size={16} style={{ color: accent.text }} />
            </div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#111827', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Account Analytics
            </h3>
          </div>

          {/* Stats content */}
          <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[1,2].map(i => (
                  <div key={i} style={{
                    height: 20, borderRadius: 6,
                    background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                  }} />
                ))}
              </div>
            ) : statItems.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {statItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.08 }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderRadius: 12,
                        background: '#fafafa',
                        border: '1px solid #f3f4f6',
                        transition: 'all 0.2s',
                        cursor: 'default',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = accent.light; e.currentTarget.style.borderColor = accent.mid; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.borderColor = '#f3f4f6'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon size={18} style={{ color: item.color }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{item.label}</span>
                      </div>
                      <span style={{
                        fontSize: 22, fontWeight: 900, color: '#111827',
                        background: '#fff', padding: '2px 14px', borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        minWidth: 40, textAlign: 'center',
                      }}>
                        {item.value}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', margin: 0 }}>No analytics available yet.</p>
            )}
          </div>

          {/* Status footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #f3f4f6',
            background: '#fafafa',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Current Status
            </span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 20,
              background: status.bg, border: `1px solid ${status.border}`,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: status.dot,
                boxShadow: `0 0 6px ${status.dot}`,
                animation: user.status === 'active' ? 'pulse-dot 2s infinite' : 'none',
              }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: status.color }}>
                {status.label}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ════════ ACCOUNT META FOOTER ════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          marginTop: 24,
          padding: '16px 24px',
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: 12 }}>
          <User size={14} />
          <span>Account ID: <strong style={{ color: '#6b7280' }}>{user.id || user._id || '—'}</strong></span>
        </div>
        {user.createdAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: 12 }}>
            <Calendar size={14} />
            <span>Joined: <strong style={{ color: '#6b7280' }}>{new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
          </div>
        )}
      </motion.div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.4); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
