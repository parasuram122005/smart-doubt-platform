import React, { useState, useEffect, useMemo } from 'react';
import API from '../services/api';
import DashboardStats from '../components/DashboardStats';
import { Table } from '../components/ui/Table';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Avatar } from '../components/ui/Avatar';
import Banner from '../components/Banner';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Trash2, ShieldAlert, ShieldCheck, ShieldX, UserCheck, Clock, Eye, X, FileText, ExternalLink } from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000';

const VerificationBadge = ({ status }) => {
  const config = {
    pending: { label: 'Pending', bg: 'bg-amber-50', color: 'text-amber-700', border: 'border-amber-200', icon: <Clock className="w-3 h-3 mr-1" /> },
    verified: { label: 'Verified', bg: 'bg-emerald-50', color: 'text-emerald-700', border: 'border-emerald-200', icon: <ShieldCheck className="w-3 h-3 mr-1" /> },
    rejected: { label: 'Rejected', bg: 'bg-red-50', color: 'text-red-700', border: 'border-red-200', icon: <ShieldX className="w-3 h-3 mr-1" /> },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${c.bg} ${c.color} ${c.border}`}>
      {c.icon}{c.label}
    </span>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: { total: 0, students: 0, faculty: 0, admins: 0, pendingVerification: 0 }, doubts: { total: 0, open: 0, claimed: 0, resolved: 0 }, subjects: 0 });
  const [subjects, setSubjects] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  const [newSubject, setNewSubject] = useState({ subjectName: '', description: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, subjectsRes, doubtsRes] = await Promise.all([
        API.get('/admin/stats').catch(() => ({ data: { data: stats } })),
        API.get('/subjects').catch(() => ({ data: { data: [] } })),
        API.get('/doubts/all').catch(() => ({ data: { data: [] } }))
      ]);
      setStats(statsRes.data.data);
      setSubjects(subjectsRes.data.data || []);
      setDoubts(doubtsRes.data.data || []);
    } catch (err) {
       setError('Some data could not be fetched.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const { data } = await API.get('/verification');
      setPendingUsers(data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchAllUsers = async () => {
    try {
      const { data } = await API.get('/users');
      setAllUsers(data.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
    fetchPendingUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchAllUsers();
  }, [activeTab]);

  const handleVerify = async (userId) => {
    setActionLoading(userId);
    try {
      await API.put(`/verification/${userId}`, { status: 'verified' });
      fetchPendingUsers();
      fetchAllUsers();
      fetchData();
      setSelectedUser(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify user');
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async (userId) => {
    setActionLoading(userId);
    try {
      await API.put(`/verification/${userId}`, { status: 'rejected', reason: rejectReason || 'ID proof could not be verified.' });
      fetchPendingUsers();
      fetchAllUsers();
      fetchData();
      setSelectedUser(null);
      setRejectReason('');
    } finally {
      setActionLoading('');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete ${userName}? Their doubts will be preserved but orphaned.`)) return;
    try {
      await API.delete(`/users/${userId}`);
      fetchAllUsers();
      fetchPendingUsers();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.subjectName) return;
    try {
      await API.post('/subjects', newSubject);
      setNewSubject({ subjectName: '', description: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create subject');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await API.delete(`/subjects/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete subject');
    }
  };

  const handleDeleteDoubt = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this doubt permanently?')) return;
    try {
      await API.delete(`/doubts/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete doubt');
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full p-4">
        <div className="h-40 bg-theme-border/30 animate-pulse rounded-2xl mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
           <div className="h-80 bg-theme-border/30 animate-pulse rounded-2xl"></div>
           <div className="h-80 bg-theme-border/30 animate-pulse rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const roleChartData = [
    { name: 'Students', count: stats.users.students },
    { name: 'Faculty', count: stats.users.faculty },
    { name: 'Admins', count: stats.users.admins },
  ];
  
  const statusPieData = [
    { name: 'Open', value: stats.doubts.open, color: '#f59e0b' },
    { name: 'Claimed', value: stats.doubts.claimed, color: '#3b82f6' },
    { name: 'Resolved', value: stats.doubts.resolved, color: '#10b981' },
  ];

  const doubtTableCols = [
    { header: 'Title', accessor: 'title' },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Student', cell: (row) => row.studentId?.name || 'Unknown' },
    { header: 'Faculty', cell: (row) => row.facultyId?.name || '--' },
    { header: 'Subject', cell: (row) => row.subjectId?.subjectName || 'Unknown' },
    { header: 'Actions', cell: (row) => (
       <button onClick={() => handleDeleteDoubt(row._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-all" title="Delete Doubt">
         <Trash2 className="w-4 h-4" />
       </button>
    ) },
  ];

  return (
    <div className="w-full">
      <Banner 
        title="Guard and govern the realm."
        role="admin"
        buttons={[
          { label: 'Manage Users', onClick: () => setActiveTab('users') },
          { label: 'View Analytics', onClick: () => setActiveTab('overview') }
        ]}
      />
      {/* Tab Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-theme-text">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-theme-text-muted">Platform analytics, verification, and management.</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-theme-border/20 rounded-xl">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'verification', label: 'Verification', badge: pendingUsers.length },
            { id: 'users', label: 'All Users' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === tab.id ? 'bg-theme-card text-theme-text shadow-sm' : 'text-theme-text-muted hover:text-theme-text'
              }`}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-6 text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 flex items-center"><ShieldAlert className="w-4 h-4 mr-2"/> {error}</div>}

      {/* ═══════ OVERVIEW TAB ═══════ */}
      {activeTab === 'overview' && (
        <>
          {/* Pending banner */}
          {pendingUsers.length > 0 && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-800">{pendingUsers.length} user{pendingUsers.length > 1 ? 's' : ''} awaiting verification</p>
                  <p className="text-xs text-amber-600">Review and approve institutional ID proofs</p>
                </div>
              </div>
              <button onClick={() => setActiveTab('verification')} className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors">
                Review Now
              </button>
            </div>
          )}

          <DashboardStats stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-theme-card p-6 rounded-2xl shadow-soft border border-theme-border/50">
              <h3 className="text-sm font-bold text-theme-text-muted uppercase tracking-wider mb-6">User Demographics</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roleChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                    <Bar dataKey="count" fill="var(--color-theme-accent)" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ transition: { delay: 0.1 }, opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-soft border border-theme-border/50">
              <h3 className="text-sm font-bold text-theme-text-muted uppercase tracking-wider mb-6">Doubt Resolution Flow</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {statusPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
             <div className="xl:col-span-2 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-lg font-bold text-theme-text">Recent Global Doubts</h2>
                </div>
                <Table columns={doubtTableCols} data={doubts} />
             </div>
             <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-lg font-bold text-theme-text">System Subjects</h2>
                </div>
                <motion.div className="bg-white shadow-soft rounded-2xl border border-theme-border/50 overflow-hidden flex flex-col flex-1">
                   <div className="p-5 border-b border-theme-border/50 bg-theme-bg/30">
                      <form onSubmit={handleCreateSubject} className="space-y-4">
                         <input type="text" required className="w-full border border-theme-border/70 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-theme-accent/50 outline-none" placeholder="New Subject Name" value={newSubject.subjectName} onChange={(e) => setNewSubject({ ...newSubject, subjectName: e.target.value })} />
                         <button type="submit" className="w-full py-2 bg-theme-accent hover:bg-theme-accent-hover text-white text-sm font-bold rounded-lg transition-colors flex justify-center items-center">
                            <Plus className="w-4 h-4 mr-1" /> Create Subject
                         </button>
                      </form>
                   </div>
                   <div className="flex-1 overflow-y-auto max-h-96">
                      <ul className="divide-y divide-theme-border/40">
                         {subjects.map((sub) => (
                            <li key={sub._id} className="p-4 hover:bg-theme-bg/30 flex justify-between items-center group">
                               <div>
                                  <p className="text-sm font-bold text-theme-text">{sub.subjectName}</p>
                                  <p className="text-xs text-theme-text-muted mt-0.5 line-clamp-1">{sub.description || 'No description'}</p>
                               </div>
                               <button onClick={() => handleDeleteSubject(sub._id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-all">
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </li>
                         ))}
                      </ul>
                   </div>
                </motion.div>
             </div>
          </div>
        </>
      )}

      {/* ═══════ VERIFICATION TAB ═══════ */}
      {activeTab === 'verification' && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Pending Users List */}
          <div className="w-full lg:w-1/2 xl:w-2/5">
            <div className="bg-white rounded-2xl border border-theme-border/50 shadow-soft overflow-hidden">
              <div className="p-5 border-b border-theme-border/50 bg-theme-bg/30 flex items-center justify-between">
                <h2 className="font-extrabold text-theme-text">Pending Verification</h2>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                  {pendingUsers.length} pending
                </span>
              </div>
              <div className="divide-y divide-theme-border/40 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {pendingUsers.length === 0 ? (
                  <div className="p-10 text-center text-theme-text-muted text-sm italic font-cormorant">
                    <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-theme-accent" />
                    No quests await you... yet.
                  </div>
                ) : (
                  pendingUsers.map(u => (
                    <div
                      key={u._id}
                      onClick={() => setSelectedUser(u)}
                      className={`p-4 cursor-pointer transition-colors ${selectedUser?._id === u._id ? 'bg-theme-bg/80 border-l-4 border-theme-accent pl-3' : 'hover:bg-theme-bg/50 border-l-4 border-transparent pl-3'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} role={u.role} className="w-10 h-10 text-sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-theme-text text-sm truncate">{u.name}</p>
                          <p className="text-xs text-theme-text-muted truncate">{u.email}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${u.role === 'student' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                            {u.role}
                          </span>
                          <span className="text-[10px] text-theme-text-muted">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* User Detail / Action Panel */}
          <div className="flex-1">
            {!selectedUser ? (
              <div className="bg-white rounded-2xl border border-theme-border/50 shadow-soft p-10 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <UserCheck className="w-12 h-12 text-theme-text-muted mb-4" />
                <h3 className="text-lg font-bold text-theme-text">Select a User</h3>
                <p className="text-sm text-theme-text-muted mt-2">Choose a user from the left to review their institutional identity.</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-theme-border/50 shadow-soft overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-theme-border/50 bg-theme-bg/30 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar name={selectedUser.name} role={selectedUser.role} className="w-14 h-14 text-lg shadow-sm" />
                    <div>
                      <h3 className="text-xl font-extrabold text-theme-text">{selectedUser.name}</h3>
                      <p className="text-sm text-theme-text-muted">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="p-2 rounded-lg hover:bg-theme-border/30 text-theme-text-muted">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Identity Details */}
                  <div>
                    <h4 className="text-xs font-bold text-theme-text-muted uppercase tracking-wider mb-3">Institutional Identity</h4>
                    <div className="bg-theme-bg/50 rounded-xl border border-theme-border/50 p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <span className="text-theme-text-muted">Role:</span>
                        <span className="font-bold text-theme-text capitalize">{selectedUser.role}</span>
                        
                        <span className="text-theme-text-muted">Institution:</span>
                        <span className="font-bold text-theme-text">{selectedUser.institutionName || '--'}</span>
                        
                        <span className="text-theme-text-muted">{selectedUser.role === 'student' ? 'Student ID' : 'Faculty ID'}:</span>
                        <span className="font-bold text-theme-text font-mono">{selectedUser.institutionId || selectedUser.studentId || selectedUser.facultyId || '--'}</span>
                        
                        <span className="text-theme-text-muted">Department:</span>
                        <span className="font-bold text-theme-text">{selectedUser.department || '--'}</span>

                        {selectedUser.role === 'student' && (
                          <>
                            <span className="text-theme-text-muted">Year:</span>
                            <span className="font-bold text-theme-text">{selectedUser.year || '--'}</span>
                            <span className="text-theme-text-muted">Section:</span>
                            <span className="font-bold text-theme-text">{selectedUser.section || '--'}</span>
                          </>
                        )}
                        {selectedUser.role === 'faculty' && (
                          <>
                            <span className="text-theme-text-muted">Designation:</span>
                            <span className="font-bold text-theme-text">{selectedUser.designation || '--'}</span>
                          </>
                        )}

                        {selectedUser.institutionEmail && (
                          <>
                            <span className="text-theme-text-muted">Inst. Email:</span>
                            <span className="font-bold text-theme-text">{selectedUser.institutionEmail}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ID Proof */}
                  <div>
                    <h4 className="text-xs font-bold text-theme-text-muted uppercase tracking-wider mb-3">ID Proof Document</h4>
                    {selectedUser.idProofUrl ? (
                      <div className="rounded-xl border border-theme-border/50 overflow-hidden">
                        {selectedUser.idProofUrl.endsWith('.pdf') ? (
                          <div className="bg-theme-bg/50 p-6 text-center">
                            <FileText className="w-12 h-12 mx-auto text-red-400 mb-3" />
                            <p className="text-sm font-bold text-theme-text">PDF Document Uploaded</p>
                            <a href={`${BACKEND_URL}${selectedUser.idProofUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-theme-accent hover:underline">
                              <ExternalLink className="w-3 h-3" /> Open in new tab
                            </a>
                          </div>
                        ) : (
                          <div>
                            <img src={`${BACKEND_URL}${selectedUser.idProofUrl}`} alt="ID Proof" className="w-full max-h-64 object-contain bg-theme-bg/50" />
                            <div className="p-3 bg-theme-bg/30 border-t border-theme-border/50 flex justify-end">
                              <a href={`${BACKEND_URL}${selectedUser.idProofUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-theme-accent hover:underline">
                                <Eye className="w-3 h-3" /> Full Size
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center text-sm text-amber-700">
                        ⚠️ No ID proof uploaded
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-theme-border/50 space-y-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleVerify(selectedUser._id)}
                        disabled={actionLoading === selectedUser._id}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <ShieldCheck className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(selectedUser._id)}
                        disabled={actionLoading === selectedUser._id}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <ShieldX className="w-4 h-4" /> Reject
                      </button>
                    </div>
                    <div>
                      <input
                        type="text"
                        className="w-full border border-theme-border/70 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-theme-accent/50 outline-none"
                        placeholder="Rejection reason (optional)..."
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ ALL USERS TAB ═══════ */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-theme-border/50 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-theme-border/50 bg-theme-bg/30">
            <h2 className="font-extrabold text-theme-text">All Registered Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-theme-border/50 bg-theme-bg/20">
                  <th className="text-left p-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">User</th>
                  <th className="text-left p-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">Role</th>
                  <th className="text-left p-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">Institution</th>
                  <th className="text-left p-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">ID</th>
                  <th className="text-left p-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">Dept</th>
                  <th className="text-left p-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border/40">
                {allUsers.map(u => (
                  <tr key={u._id} className="hover:bg-theme-bg/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} role={u.role} className="w-8 h-8 text-xs" />
                        <div>
                          <p className="font-bold text-theme-text">{u.name}</p>
                          <p className="text-xs text-theme-text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 capitalize font-medium text-theme-text">{u.role}</td>
                    <td className="p-4 text-theme-text">{u.institutionName || '--'}</td>
                    <td className="p-4 font-mono text-xs text-theme-text">{u.institutionId || u.studentId || u.facultyId || '--'}</td>
                    <td className="p-4 text-theme-text">{u.department || '--'}</td>
                    <td className="p-4"><VerificationBadge status={u.verificationStatus} /></td>
                    <td className="p-4">
                      {u.verificationStatus === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleVerify(u._id)} className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700">✓</button>
                          <button onClick={() => handleReject(u._id)} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700">✗</button>
                        </div>
                      )}
                      {u.verificationStatus === 'rejected' && (
                        <button onClick={() => handleVerify(u._id)} className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700">Approve</button>
                      )}
                      {u.verificationStatus === 'verified' && (
                        <button onClick={() => handleDeleteUser(u._id, u.name)} className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-all ml-2" title="Delete User">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
