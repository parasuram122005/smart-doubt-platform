import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, Search, LogOut, User as UserIcon, MessageSquarePlus, Home, LayoutDashboard } from 'lucide-react';
import { cn } from '../utils/cn';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { title: 'Dashboard', path: `/${user?.role}`, icon: <LayoutDashboard size={20} />, roles: ['student', 'faculty', 'admin'] },
    { title: 'Knowledge Base', path: '/knowledge-base', icon: <Search size={20} />, roles: ['faculty', 'admin'] },
    { title: 'Post Doubt', path: '/post-doubt', icon: <MessageSquarePlus size={20} />, roles: ['student'] },
  ];

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="hidden md:flex flex-col w-64 bg-theme-sidebar text-[#F8F6F0] shadow-xl h-screen z-10 border-r border-[#2B1D12]"
    >
      <div className="flex items-center justify-center h-24 border-b border-[#2B1D12]">
        <div className="relative flex items-center justify-center w-10 h-10 mr-3 rounded-full border border-[#C9A227]/40 shadow-[0_0_10px_rgba(201,162,39,0.2)]">
          <BookOpen className="h-5 w-5 text-[#C9A227]" />
          <div className="absolute inset-1 rounded-full border border-[#C9A227]/20"></div>
        </div>
        <span className="font-cinzel text-xl font-bold tracking-widest text-[#F8F6F0]">SmartDoubt</span>
      </div>

      <div className="flex-1 px-4 py-8 space-y-2">
        {menuItems
          .filter(item => item.roles.includes(user?.role))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-4 py-3 rounded-xl transition-all duration-300 group font-cinzel font-bold text-sm tracking-wide",
                  isActive
                    ? "bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227] shadow-[inset_0_0_10px_rgba(201,162,39,0.1)]"
                    : "text-[#D7D3C8]/70 hover:bg-[#F8F6F0]/5 hover:text-[#F8F6F0]"
                )
              }
            >
              <div className="mr-3 transition-transform group-hover:scale-110">
                {item.icon}
              </div>
              <span className="font-medium text-sm">{item.title}</span>
            </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-[#2B1D12]">
        <div className="flex items-center px-4 py-3 mb-2 rounded-xl bg-[#111111]/50 border border-[#2B1D12]">
          <UserIcon size={20} className="text-[#C9A227]" />
          <div className="ml-3">
            <p className="text-sm font-bold text-[#F8F6F0] truncate max-w-[120px]">{user?.name}</p>
            <p className="text-xs text-[#D7D3C8]/70 capitalize">{user?.role}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 rounded-xl text-[#D7D3C8]/70 hover:bg-[#F8F6F0]/5 hover:text-[#F8F6F0] transition-all duration-300 group font-cinzel font-bold text-sm tracking-wide"
        >
          <LogOut size={20} className="mr-3 group-hover:text-red-400" />
          <span className="group-hover:text-red-400">Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
