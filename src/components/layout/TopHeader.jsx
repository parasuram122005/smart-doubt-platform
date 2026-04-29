import React, { useContext, useState, useEffect, useRef } from 'react';
import { Bell, Search, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';
import API from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TopHeader = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (user) {
      fetchNotifications();
      interval = setInterval(fetchNotifications, 30000); // 30 sec polling
    }
    return () => clearInterval(interval);
  }, [user]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) return null;

  return (
    <div className="sticky top-0 z-40 bg-theme-bg/80 backdrop-blur-xl border-b border-theme-border/50 shadow-sm h-16 flex items-center justify-between px-4 sm:px-8">
      {/* Search Bar - Global */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-theme-text-muted" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-theme-border/60 rounded-lg text-sm bg-white/70 placeholder-theme-text-muted focus:outline-none focus:ring-1 focus:ring-theme-accent focus:border-theme-accent transition-colors"
            placeholder="Search commands, doubts, or users... (Ctrl+K)"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center space-x-6 relative">
        
        {/* Notifications */}
        <div ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`relative transition-colors ${showDropdown ? 'text-theme-accent' : 'text-theme-text-muted hover:text-theme-text'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-400 text-[8px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-4 w-80 bg-white border border-theme-border rounded-2xl shadow-hover overflow-hidden z-50 origin-top-right"
              >
                <div className="px-4 py-3 border-b border-theme-border/50 bg-theme-bg/30 flex justify-between items-center">
                  <h3 className="font-bold text-theme-text text-sm">Notifications</h3>
                  {unreadCount > 0 && <span className="text-xs bg-theme-accent text-white px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                </div>
                
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-theme-text-muted text-sm">No notifications yet.</div>
                  ) : (
                    <div className="divide-y divide-theme-border/40">
                      {notifications.map(notif => (
                        <div 
                          key={notif._id} 
                          onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                          className={`p-4 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-theme-accent/5 hover:bg-theme-accent/10' : 'bg-white hover:bg-theme-bg/50'}`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.read ? 'bg-theme-accent' : 'bg-transparent'}`} />
                          <div className="flex-1">
                            <p className={`text-sm ${!notif.read ? 'text-theme-text font-medium' : 'text-theme-text-muted'}`}>
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-theme-text-muted mt-1 uppercase tracking-wider">
                              {new Date(notif.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Profile */}
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center space-x-3 border-l border-theme-border/60 pl-6 cursor-pointer group hover:bg-theme-bg/30 p-2 -my-2 rounded-lg transition-colors"
        >
          <div className="relative">
            <Avatar name={user.name} role={user.role} className="w-8 h-8 text-xs shadow-sm group-hover:ring-2 ring-theme-accent/30 transition-all" />
            {/* Live status dot */}
            <span 
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                user.status === 'active' ? 'bg-emerald-500' : 
                user.status === 'on_leave' ? 'bg-amber-500' : 
                user.status === 'suspended' ? 'bg-red-500' : 'bg-gray-400'
              }`}
              title={user.status || 'active'}
            />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-theme-text leading-none group-hover:text-theme-accent transition-colors">{user.name}</p>
            <p className="text-xs text-theme-text-muted mt-1 leading-none">
              {user.studentId || user.facultyId || user.adminId || `${user.role} Workspace`}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TopHeader;
